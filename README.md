# Proyek Analisis Data: Plantaech 🌿
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
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Navbar, Footer, AdminLayout, UI components
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Landing, Login, Register, Diagnosis, History, Community, Profile
│   │   │   └── admin/         # Dashboard, Users, Posts, Reports
│   │   └── services/          # Axios API layer
│   ├── .env                   # VITE_API_URL
│   └── package.json
├── server/                    # Express.js backend
│   ├── src/
│   │   ├── config/            # supabase.js
│   │   ├── controllers/       # auth, diagnosis, forum, report, admin, user
│   │   ├── middleware/        # auth, admin, upload, errorHandler
│   │   ├── routes/            # All API route files
│   │   └── services/          # aiService.js (mock AI inference)
│   │   └── app.js             # Express app entry point
│   ├── seeds/
│   │   └── adminSeed.js       # Seeds initial admin user
│   ├── sql/
│   │   └── schema.sql         # Database schema for Supabase
│   ├── .env.example           # Environment variables template
│   └── package.json
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

> **Catatan:** Pastikan untuk menjalankan seluruh cell di notebook terlebih dahulu agar file `dashboard/main_data.csv` ter-generate. Atau jalankan script berikut:

```bash
python dashboard/prepare_data.py
```

## Menjalankan Dashboard

Setelah file `dashboard/main_data.csv` tersedia, jalankan dashboard dengan perintah:

```bash
streamlit run dashboard/dashboard.py
```

Dashboard akan terbuka di browser pada `http://localhost:8501`.

### Fitur Dashboard

- 📊 **Metric Cards** – Ringkasan dataset (total gambar, jumlah kelas, gambar sehat/sakit, rata-rata ukuran)
- 📈 **Distribusi Kelas** – Bar chart dan pie chart distribusi jenis penyakit tanaman tomat
- 🔍 **Analisis Gambar** – Box plot dan bar chart kualitas gambar per kelas penyakit
- 📊 **Sehat vs Sakit** – Perbandingan visual dan statistik antara gambar tanaman sehat dan sakit
- 🧪 **A/B Testing** – Independent t-test untuk menguji perbedaan kualitas gambar antara kelompok
- 📝 **Kesimpulan & Rekomendasi** – Rangkuman insight dan action items
- 🔍 **Filter Interaktif** – Filter berdasarkan kondisi tanaman, jenis penyakit, dan ukuran file

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

---

## 🌐 Web Application — Backend & Frontend Setup

Plantaech includes a full-stack web application built with **Express.js** (backend) and **React + Vite** (frontend).

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com) account and project

---

### 1. Backend Setup (`server/`)

#### a. Install dependencies

```bash
cd server
npm install
```

#### b. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development

# Supabase — from your project's Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT — choose a long random secret
JWT_SECRET=your-super-secret-jwt-key

# AI Model — swap this URL once the real model is deployed
AI_MODEL_API_URL=http://localhost:8000/predict
```

#### c. Create the database schema

Open your Supabase project → **SQL Editor** → paste and run the contents of:

```
server/sql/schema.sql
```

This creates the `users`, `diagnoses`, `threads`, `comments`, and `reports` tables with indexes and triggers.

#### d. Seed the initial admin user

```bash
npm run seed
```

This creates the admin account:

| Field    | Value                 |
|----------|-----------------------|
| Email    | `admin@plantaech.com` |
| Password | `plantaech jaya`      |
| Role     | `admin`               |

#### e. Start the backend dev server

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.  
Health check: `GET http://localhost:5000/api/health`

---

### 2. Frontend Setup (`client/`)

#### a. Install dependencies

```bash
cd client
npm install
```

#### b. Configure environment variables

The file `client/.env` already points to the local backend:

```env
VITE_API_URL=http://localhost:5000/api
```

Update this URL if the backend is deployed elsewhere.

#### c. Start the frontend dev server

```bash
npm run dev
```

The app will open at `http://localhost:5173`.

---

### 3. API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/password` | ✅ | Change password |
| POST | `/api/diagnoses/upload` | Optional | Upload & analyze plant image |
| GET | `/api/diagnoses/history` | ✅ | Get user's diagnosis history |
| GET | `/api/diagnoses/:id` | ✅ | Get single diagnosis |
| GET | `/api/forum/threads` | — | List threads (filter by category/tag) |
| GET | `/api/forum/threads/:id` | — | Get thread + comments |
| POST | `/api/forum/threads` | ✅ | Create a new thread |
| POST | `/api/forum/threads/:id/comments` | ✅ | Post a comment |
| DELETE | `/api/forum/threads/:id` | ✅ | Delete own thread |
| POST | `/api/reports` | ✅ | Submit a report |
| GET | `/api/admin/stats` | 👑 Admin | Dashboard stats |
| GET | `/api/admin/users` | 👑 Admin | List users |
| PUT | `/api/admin/users/:id/ban` | 👑 Admin | Ban / unban user |
| PUT | `/api/admin/users/:id/role` | 👑 Admin | Change user role |
| GET | `/api/admin/posts` | 👑 Admin | List all posts |
| PUT | `/api/admin/posts/:id/pin` | 👑 Admin | Pin / unpin a post |
| DELETE | `/api/admin/posts/:id` | 👑 Admin | Remove a post |
| GET | `/api/reports` | 👑 Admin | View reports queue |
| PUT | `/api/reports/:id` | 👑 Admin | Resolve / dismiss report |

---

### 4. Connecting the Real AI Model

The backend currently uses a mock AI service (`server/src/services/aiService.js`).  
When the real model is ready, replace the `analyzeImage` function body with an HTTP call to the FastAPI inference endpoint:

```js
// server/src/services/aiService.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const analyzeImage = async (imagePath) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  const response = await axios.post(process.env.AI_MODEL_API_URL, form, {
    headers: form.getHeaders(),
  });
  return response.data;
};
```

Set `AI_MODEL_API_URL` in `.env` to the deployed model endpoint.

---

### 5. Deploy to Railway

1. Push the repo to GitHub
2. Create a new Railway project → **Deploy from GitHub**
3. Add a service → set **Root Directory** to `server`
4. Add all environment variables from `.env` in Railway's dashboard
5. For the frontend: update `VITE_API_URL` to the Railway backend URL, run `npm run build` inside `client/` — the static `dist/` folder is served automatically by the backend in production mode (`NODE_ENV=production`)

