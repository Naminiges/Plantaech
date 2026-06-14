import os
import io
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.concurrency import run_in_threadpool

gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(f"Memory growth configuration failed: {e}")
        
@tf.keras.utils.register_keras_serializable()
class ChannelAttention(layers.Layer):
    def __init__(self, reduction_ratio=16, **kwargs):
        super(ChannelAttention, self).__init__(**kwargs)
        self.reduction_ratio = reduction_ratio

    def build(self, input_shape):
        channels = input_shape[-1]
        reduced = max(1, channels // self.reduction_ratio)

        self.gap = layers.GlobalAveragePooling2D()
        self.dense1 = layers.Dense(reduced, activation='relu')
        self.dense2 = layers.Dense(channels, activation='sigmoid')
        self.reshape = layers.Reshape((1, 1, channels))

        super(ChannelAttention, self).build(input_shape)

    def call(self, inputs, training=None):
        x = self.gap(inputs)

        x = self.dense1(x)
        x = self.dense2(x)

        x = self.reshape(x)

        return inputs * x

    def get_config(self):
        config = super(ChannelAttention, self).get_config()
        config.update({'reduction_ratio': self.reduction_ratio})
        return config

@tf.keras.utils.register_keras_serializable()
class FocalLoss(keras.losses.Loss):
    def __init__(self, gamma=2.0, alpha=0.25, label_smoothing=0.1,
                 name='focal_loss', **kwargs):
        super(FocalLoss, self).__init__(name=name, **kwargs)
        self.gamma = gamma
        self.alpha = alpha
        self.label_smoothing = label_smoothing

    def call(self, y_true, y_pred):
        """Hitung focal loss.

        Args:
            y_true: one-hot encoded labels, shape (batch, num_classes)
            y_pred: predicted probabilities, shape (batch, num_classes)
        """
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)

        num_classes = tf.cast(tf.shape(y_true)[-1], tf.float32)
        y_true = y_true * (1.0 - self.label_smoothing) + \
                 (self.label_smoothing / num_classes)

        ce = -y_true * tf.math.log(y_pred)

        focal_weight = tf.pow(1.0 - y_pred, self.gamma)

        focal_loss = self.alpha * focal_weight * ce

        return tf.reduce_mean(tf.reduce_sum(focal_loss, axis=-1))

    def get_config(self):
        config = super(FocalLoss, self).get_config()
        config.update({
            'gamma': self.gamma,
            'alpha': self.alpha,
            'label_smoothing': self.label_smoothing
        })
        return config

class FastPlantDiseasePredictor:
    def __init__(self, model_path: str, class_indices_path: str, img_size=(224, 224)):
        self.model = keras.models.load_model(
            model_path,
            custom_objects={
                'ChannelAttention': ChannelAttention,
                'FocalLoss': FocalLoss
            },
            compile=False
        )
        
        if os.path.exists(class_indices_path):
            with open(class_indices_path, 'r') as f:
                self.idx_to_class = {int(k): v for k, v in json.load(f).items()}
        else:
            print(f"⚠️ WARNING: '{class_indices_path}' not found! Falling back to hardcoded classes.")
            class_list = [
                'Non_tomato', 'Tomato_Bacterial_spot', 'Tomato_Early_blight', 'Tomato_Late_blight',
                'Tomato_Leaf_Mold', 'Tomato_Septoria_leaf_spot', 
                'Tomato_Spider_mites_Two_spotted_spider_mite', 'Tomato_Target_Spot', 
                'Tomato_Tomato_YellowLeaf__Curl_Virus', 'Tomato_Tomato_mosaic_virus', 
                'Tomato_healthy'
            ]
            self.idx_to_class = {i: cls for i, cls in enumerate(class_list)}
            
        self.img_size = img_size

    def predict_from_bytes(self, image_bytes: bytes, filename: str,top_k=3):
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize(self.img_size)
        img_array = np.expand_dims(np.array(img), axis=0)

        predictions_tensor = self.model(img_array, training=False)
        probabilities = predictions_tensor.numpy()[0]

        top_indices = np.argsort(probabilities)[::-1][:top_k]
        
        top_predictions = [
            {
                'rank': rank + 1,
                'filename': filename,
                'class_name': self.idx_to_class[idx],
                'confidence': float(probabilities[idx]),
                'class_index': int(idx)
            }
            for rank, idx in enumerate(top_indices)
        ]

        top_class = top_predictions[0]['class_name'].lower()
        is_healthy = 'healthy' in top_class

        return {
            'prediction': top_predictions[0]['class_name'],
            'confidence': top_predictions[0]['confidence'],
            'health_status': 'Healthy' if is_healthy else 'Disease Detected',
            'top_k': top_predictions
        }
        
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    MODEL_PATH = "best_model_finetuned_v2.keras"
    CLASSES_PATH = "class_indices_v2.json"
    
    print("Loading TensorFlow model into memory...")
    try:
        ml_models["predictor"] = FastPlantDiseasePredictor(
            model_path=MODEL_PATH, 
            class_indices_path=CLASSES_PATH
        )
    except Exception as e:
        print(f"Failed to load model: {e}")
    
    yield
    ml_models.clear()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Send JPEG or PNG.")
    
    predictor = ml_models.get("predictor")
    if not predictor:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    try:
        image_bytes = await file.read()
        
        result = await run_in_threadpool(predictor.predict_from_bytes, image_bytes, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)