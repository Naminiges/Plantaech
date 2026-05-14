# Plantaech
## Analisis Dataset Penyakit Tanaman Tomat

## Deskripsi

Proyek ini merupakan bagian dari Capstone Project **Coding Camp 2026 powered by DBS Foundation** dengan tema **Sustainable Living & Responsible Consumption**. Plantaech adalah solusi berbasis AI yang memungkinkan petani mengidentifikasi penyakit tanaman tomat melalui analisis gambar daun. Proyek ini fokus pada analisis data gambar penyakit tanaman tomat untuk memahami distribusi penyakit dan kualitas dataset yang akan digunakan untuk melatih model machine learning.

## Pertanyaan Bisnis

1. **Bagaimana distribusi dan proporsi jenis penyakit tanaman tomat yang teridentifikasi dalam dataset Plantaech, dan penyakit mana yang paling dominan serta paling jarang ditemukan selama periode pengumpulan data tahun 2026?**
2. **Apakah terdapat perbedaan signifikan dalam kualitas gambar (resolusi, ukuran file) antara kelas penyakit yang berbeda dalam dataset, yang dapat memengaruhi akurasi model deteksi penyakit Plantaech selama fase pengembangan Q2 2026?**

## Data Dictionary

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| filename | string | Nama file gambar |
| filepath | string | Path lengkap ke file gambar |
| class_name | string | Nama kelas/kategori (nama folder dataset) |
| disease_name | string | Nama penyakit yang sudah diformat |
| is_healthy | boolean | True jika tanaman sehat, False jika sakit |
| condition | string | Kategori kondisi: 'Healthy' atau 'Diseased' |
| width | integer | Lebar gambar dalam pixel |
| height | integer | Tinggi gambar dalam pixel |
| aspect_ratio | float | Rasio aspek gambar (width/height) |
| total_pixels | integer | Total pixel gambar (width × height) |
| file_size_bytes | integer | Ukuran file dalam bytes |
| file_size_kb | float | Ukuran file dalam kilobytes |
| color_mode | string | Mode warna gambar (RGB, L, dll.) |
| file_format | string | Format file gambar |
| class_proportion | float | Proporsi kelas terhadap total dataset (%) |
| file_size_category | string | Kategori ukuran file |
| resolution_category | string | Kategori resolusi gambar |

## Struktur Direktori

```
Plantaech/
├── dashboard/
│   ├── main_data.csv           # Dataset metadata yang sudah diolah untuk dashboard
│   ├── prepare_data.py         # Script untuk mempersiapkan data dashboard
│   └── dashboard.py            # Script dashboard Streamlit
├── dataset/
│   ├── Tomato_Bacterial_spot/          # 2,127 gambar
│   ├── Tomato_Early_blight/            # 1,000 gambar
│   ├── Tomato_Late_blight/             # 1,909 gambar
│   ├── Tomato_Leaf_Mold/               #   952 gambar
│   ├── Tomato_Septoria_leaf_spot/      # 1,771 gambar
│   ├── Tomato_Spider_mites.../         # 1,676 gambar
│   ├── Tomato_Target_Spot/             # 1,404 gambar
│   ├── Tomato_Tomato_YellowLeaf.../    # 3,208 gambar
│   ├── Tomato_Tomato_mosaic_virus/     #   373 gambar
│   └── Tomato_healthy/                 # 1,591 gambar
├── notebook.ipynb             # Jupyter Notebook analisis data
├── README.md                  # Dokumentasi proyek dan Data Dictionary
├── requirements.txt           # Daftar library yang digunakan
└── url.txt                    # Link dashboard (jika di-deploy)
```

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/Naminiges/Plantaech.git
cd Plantaech
```

### 2. Buat Virtual Environment (Opsional tapi Disarankan)

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## Menjalankan Notebook

Buka file `notebook.ipynb` menggunakan Jupyter Notebook atau Google Colab, lalu jalankan seluruh cell secara berurutan.

```bash
jupyter notebook notebook.ipynb
```

> **Catatan:** Pastikan untuk menjalankan seluruh cell di notebook terlebih dahulu agar file `dashboard/main_data.csv` ter-generate.

## Menjalankan Dashboard

Setelah file `dashboard/main_data.csv` tersedia, jalankan dashboard dengan perintah:

```bash
streamlit run dashboard/dashboard.py
```

Dashboard akan terbuka di browser pada `http://localhost:8501`.

### Fitur Dashboard

- **Metric Cards** – Ringkasan dataset (total gambar, jumlah kelas, gambar sehat/sakit, rata-rata ukuran)
- **Distribusi Kelas** – Bar chart dan pie chart distribusi jenis penyakit tanaman tomat
- **Analisis Gambar** – Box plot dan bar chart kualitas gambar per kelas penyakit
- **Sehat vs Sakit** – Perbandingan visual dan statistik antara gambar tanaman sehat dan sakit
- **A/B Testing** – Independent t-test untuk menguji perbedaan kualitas gambar antara kelompok
- **Kesimpulan & Rekomendasi** – Rangkuman insight dan action items
- **Filter Interaktif** – Filter berdasarkan kondisi tanaman, jenis penyakit, dan ukuran file

## Teknik Analisis Lanjutan

Proyek ini menerapkan:
- **Exploratory Data Analysis (EDA)** pada metadata gambar penyakit tanaman tomat
- **Analisis Statistik Deskriptif** untuk memahami karakteristik dataset
- **A/B Testing** menggunakan Independent T-Test (scipy.stats) untuk menguji hipotesis perbedaan kualitas gambar
- **Feature Engineering** berupa pembuatan fitur turunan dari metadata gambar (aspect ratio, kategori ukuran, kategori resolusi)
- **Visualisasi Data** menggunakan Matplotlib dan Seaborn untuk menjawab pertanyaan bisnis

## Informasi Pembuat

- **ID Tim CodingCamp:** CC26-PSU258
- **Tema Capstone:** Sustainable Living & Responsible Consumption
- **Nama Proyek:** Plantaech
