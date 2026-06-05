# Plantaech

Proyek Capstone **Coding Camp 2026 powered by DBS Foundation** — tema **Sustainable Living & Responsible Consumption**.

Plantaech adalah solusi berbasis AI yang membantu petani mengidentifikasi penyakit tanaman tomat melalui analisis gambar daun.

- **ID Tim:** CC26-PSU258
- **Repo:** [github.com/Naminiges/Plantaech](https://github.com/Naminiges/Plantaech)

---

## Part 1 — Data Science

### Deskripsi

Analisis dataset gambar penyakit tanaman tomat untuk memahami distribusi kelas dan kualitas gambar yang akan digunakan melatih model ML. Dilengkapi dashboard interaktif berbasis Streamlit.

### Setup Environment

```bash
# 1. Clone repository
git clone https://github.com/Naminiges/Plantaech.git
cd Plantaech

# 2. Buat virtual environment (disarankan)
python -m venv venv
source venv/bin/activate      # Linux/Mac
# venv\Scripts\activate       # Windows

# 3. Install dependencies
pip install -r data-science/requirements.txt
```

### Cara Menjalankan

**Notebook:**
```bash
jupyter notebook data-science/notebook.ipynb
```
Jalankan seluruh cell secara berurutan. Output CSV (`dashboard/main_data.csv`, dll.) akan ter-generate otomatis.

**Dashboard Streamlit:**
```bash
streamlit run dashboard/dashboard.py
```
Dashboard berjalan di `http://localhost:8501`.

> 🌐 **Live Dashboard:** https://plantaech.streamlit.app/

---

## Part 2 — Full-Stack Web

### Deskripsi

Aplikasi web full-stack: **Express.js** (backend) + **React + Vite** (frontend), terhubung ke **Supabase** (database & storage) dan model AI yang di-deploy terpisah.

### Prasyarat

- Node.js v20+
- Akun [Supabase](https://supabase.com) dengan project yang sudah dibuat
- Akun [Brevo](https://www.brevo.com) untuk layanan email OTP (gratis, 300 email/hari)

### Setup Environment

#### Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env
```

Isi `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
SUPABASE_PUBLIC_BUCKET=public-images
SUPABASE_DIAGNOSIS_BUCKET=diagnosis-images

JWT_SECRET=string_rahasia_panjang_anda
JWT_EXPIRES_IN=7d

AI_MODEL_API_URL=https://plantaech-ai-model-production.up.railway.app/predict

SMTP_USER=youremail@gmail.com
BREVO_API_KEY=xkeysib-...

MAX_FILE_SIZE=10485760
```

Setup database: buka **Supabase Dashboard → SQL Editor**, jalankan isi `server/sql/schema.sql`.

Buat akun admin awal:
```bash
npm run seed
```
> Kredensial default: `admin@plantaech.com` / `Plantaech1`
> Reset password admin: `npm run seed -- --update`

#### Frontend (`client/`)

```bash
cd client
npm install
```

Isi `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Cara Menjalankan

```bash
# Terminal 1 — Backend
cd server && npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd client && npm run dev
# → http://localhost:5173
```

> ⚠️ Jalankan backend **terlebih dahulu** sebelum frontend.

---

## Part 3 — Machine Learning

### Deskripsi

Model klasifikasi penyakit tanaman tomat berbasis gambar (Computer Vision) dengan arsitektur EfficientNetB0, dilatih menggunakan dataset 11 kelas (10 penyakit + healthy). Model di-serve via FastAPI dan di-deploy ke Railway.

### Tautan Model ML

Model hasil pelatihan disimpan terpisah dan dapat diunduh di sini:

🔗 **Download Model:** [Google Drive](https://drive.google.com/file/d/1u6ZLay6iZM0C6m2wt6vSS9gNkwUVwtGu/view?usp=sharing)

Letakkan file model di `ml/api/best_model_finetuned_v2.keras`, lalu muat dengan:

```python
import tensorflow as tf
model = tf.keras.models.load_model("best_model_finetuned_v2.keras")
```

### Notebook Pelatihan

```bash
jupyter notebook ml/notebooks/plantaech.ipynb
```

### Cara Menjalankan API Model

```bash
cd ml/api
uvicorn app:app --reload
# → http://localhost:8000
```

Endpoint prediksi: `POST /predict` — kirim gambar daun tomat, API mengembalikan nama penyakit dan confidence score.

> 🚀 **Live API Documentation:** [https://plantaech-ai-model-production.up.railway.app/docs](https://plantaech-ai-model-production.up.railway.app/docs)
