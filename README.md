# Plantaech
## Platform berbasis AI untuk identifikasi penyakit tanaman tomat melalui analisis citra daun yang dilengkapi fitur komunitas diskusi.

## Deskripsi

Proyek ini merupakan bagian dari Capstone Project **Coding Camp 2026 powered by DBS Foundation** dengan tema **Sustainable Living & Responsible Consumption**. Plantaech adalah solusi berbasis AI yang memungkinkan petani mengidentifikasi penyakit tanaman tomat melalui analisis gambar daun. Proyek ini fokus pada analisis data gambar penyakit tanaman tomat untuk memahami distribusi penyakit dan kualitas dataset yang akan digunakan untuk melatih model machine learning.

## Pertanyaan Bisnis

1. **Bagaimana distribusi dan proporsi jenis penyakit tanaman tomat yang teridentifikasi dalam dataset Plantaech, dan penyakit mana yang paling dominan serta paling jarang ditemukan selama periode pengumpulan data tahun 2026?**
2. **Apakah terdapat perbedaan signifikan dalam kualitas gambar (resolusi, ukuran file) antara kelas penyakit yang berbeda dalam dataset, yang dapat memengaruhi akurasi model deteksi penyakit Plantaech selama fase pengembangan Q2 2026?**

## Data Dictionary

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| filename | string | Nama file gambar |
| file_extension | string | Ekstensi file gambar (.jpg, .png, dll) |
| class_name | string | Nama kelas/kategori (nama folder dataset) |
| disease_name | string | Nama penyakit yang sudah diformat |
| is_healthy | boolean | True jika tanaman sehat, False jika sakit |
| condition | string | Kategori kondisi: 'Healthy', 'Diseased', atau 'Non Tomato' |
| width | integer | Lebar gambar dalam pixel |
| height | integer | Tinggi gambar dalam pixel |
| aspect_ratio | float | Rasio aspek gambar (width/height) |
| total_pixels | integer | Total pixel gambar (width × height) |
| file_size_bytes | integer | Ukuran file dalam bytes |
| file_size_kb | float | Ukuran file dalam kilobytes |
| color_mode | string | Mode warna gambar (RGB, L, dll.) |
| file_format | string | Format file gambar (JPEG, PNG, dll) |
| file_size_category | string | Kategori ukuran file (Very Small, Small, Medium, Large, Very Large) |
| resolution_category | string | Kategori resolusi gambar (Low, Medium, High) |
| file_hash | string | Hash MD5 untuk identifikasi file duplikat |
| is_valid_image_ext | boolean | True jika ekstensi file valid |
| is_corrupt | boolean | True jika file gambar corrupt/tidak bisa dibuka |

## Struktur Direktori

```
Plantaech/
├── client/                         # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx          # Navigasi utama & menu admin
│   │   │   │   ├── Footer.jsx          # Footer global
│   │   │   │   └── AdminLayout.jsx     # Wrapper halaman admin
│   │   │   ├── ui/
│   │   │   │   ├── ReportModal.jsx     # Modal laporan konten
│   │   │   │   └── UploadArea.jsx      # Drag-and-drop upload gambar
│   │   │   └── ProtectedRoute.jsx      # Guard route: ProtectedRoute & AdminRoute
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # State autentikasi global
│   │   ├── pages/
│   │   │   ├── Landing.jsx             # Beranda
│   │   │   ├── Login.jsx               # Halaman masuk
│   │   │   ├── Register.jsx            # Daftar akun baru (+ verifikasi OTP)
│   │   │   ├── ForgotPassword.jsx      # Alur lupa password (minta, verifikasi OTP, reset)
│   │   │   ├── Diagnosis.jsx           # Upload & diagnosa AI
│   │   │   ├── History.jsx             # Riwayat diagnosa
│   │   │   ├── Community.jsx           # Daftar thread forum
│   │   │   ├── NewThread.jsx           # Form buat thread baru
│   │   │   ├── ThreadDetail.jsx        # Detail thread & komentar
│   │   │   ├── Profile.jsx             # Profil & feed aktivitas pengguna
│   │   │   ├── Terms.jsx               # Halaman syarat & ketentuan
│   │   │   ├── Privacy.jsx             # Halaman kebijakan privasi
│   │   │   ├── Contact.jsx             # Halaman kontak + form kirim pesan
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx       # Statistik admin
│   │   │       ├── Users.jsx           # Manajemen pengguna (ban, delete, role)
│   │   │       ├── Posts.jsx           # Manajemen postingan
│   │   │       ├── Reports.jsx         # Moderasi laporan
│   │   │       └── Diseases.jsx        # Manajemen data penyakit (CRUD)
│   │   ├── services/
│   │   │   ├── api.js                  # Fetch wrapper (base URL, token, error)
│   │   │   └── index.js                # Semua service (auth, user, forum, misc, dll)
│   │   ├── utils/
│   │   │   └── exportPdf.js            # Ekspor laporan diagnosis ke PDF
│   │   ├── App.jsx                     # Routing utama
│   │   └── index.css                   # Design system & kelas komponen global
│   ├── .env                            # VITE_API_URL
│   ├── vite.config.js
│   └── package.json
├── server/                         # Express.js backend
│   ├── seeds/
│   │   └── adminSeed.js                # Buat akun admin awal
│   ├── sql/
│   │   └── schema.sql                  # Skema database Supabase
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js             # Klien Supabase (Service Role Key)
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register (OTP), login, ganti password, reset password
│   │   │   ├── userController.js       # Profil, avatar, hapus akun
│   │   │   ├── diagnosisController.js  # Upload & analisa AI
│   │   │   ├── forumController.js      # Thread, komentar, aktivitas pengguna
│   │   │   ├── reportController.js     # Laporan konten
│   │   │   └── adminController.js      # Panel admin (user, post, penyakit)
│   │   ├── middleware/
│   │   │   ├── auth.js                 # Verifikasi JWT (requireAuth, optionalAuth)
│   │   │   ├── admin.js                # Cek role admin (requireAdmin)
│   │   │   ├── upload.js               # Multer (plant, avatar, thread image)
│   │   │   └── errorHandler.js         # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.js                 # Endpoint autentikasi & OTP
│   │   │   ├── users.js                # Endpoint profil pengguna
│   │   │   ├── diagnoses.js            # Endpoint diagnosa
│   │   │   ├── forum.js                # Endpoint forum
│   │   │   ├── reports.js              # Endpoint laporan
│   │   │   ├── admin.js                # Endpoint admin
│   │   │   └── misc.js                 # Endpoint publik (form kontak)
│   │   ├── services/
│   │   │   ├── aiService.js            # Integrasi endpoint model AI + disease cache
│   │   │   ├── emailService.js         # Kirim OTP & form kontak via Brevo API
│   │   │   └── storage.js              # Upload & hapus file di Supabase Storage
│   │   └── app.js                      # Entry point Express
│   ├── .env
│   ├── .env.example
│   ├── railway.toml
│   └── package.json
├── dashboard/
│   ├── main_data.csv               # Dataset metadata yang sudah diolah
│   ├── model_features.csv          # Fitur model yang sudah di-encode, tanpa kolom target/metadata
│   ├── model_labels.csv            # Label model (disease_name, is_healthy, condition)
│   └── dashboard.py                # Script dashboard Streamlit
├── dataset/
│   ├── Non_tomato/                # 1,666 gambar
│   ├── Tomato_Bacterial_spot/      # 2,127 gambar
│   ├── Tomato_Early_blight/        # 1,000 gambar
│   ├── Tomato_Late_blight/         # 1,909 gambar
│   ├── Tomato_Leaf_Mold/           #   952 gambar
│   ├── Tomato_Septoria_leaf_spot/  # 1,771 gambar
│   ├── Tomato_Spider_mites.../     # 1,676 gambar
│   ├── Tomato_Target_Spot/         # 1,404 gambar
│   ├── Tomato_Tomato_YellowLeaf.../ # 3,208 gambar
│   ├── Tomato_Tomato_mosaic_virus/ #   373 gambar
│   └── Tomato_healthy/             # 1,591 gambar
├── notebook.ipynb                  # Jupyter Notebook analisis data
├── README.md                       # Dokumentasi proyek ini
├── requirements.txt                # Library Python
└── url.txt                         # Link dashboard (jika di-deploy)
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

> **Catatan:** Pastikan untuk menjalankan seluruh cell di notebook terlebih dahulu agar file `dashboard/main_data.csv`, `dashboard/model_features.csv`, dan `dashboard/model_labels.csv` ter-generate.

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

---

## 🌐 Aplikasi Web — Setup Backend & Frontend

Plantaech memiliki aplikasi web full-stack yang dibangun dengan **Express.js** (backend) dan **React + Vite** (frontend).

### Prasyarat

- Node.js **v20** atau lebih baru (diwajibkan oleh `server/package.json`)
- Akun [Supabase](https://supabase.com) dengan project yang sudah dibuat
- Akun [Brevo](https://www.brevo.com) untuk layanan email OTP (gratis, 300 email/hari)

---

### 1. Setup Backend (`server/`)

#### a. Install dependensi

```bash
cd server
npm install
```

#### b. Konfigurasi environment

Salin file contoh:

```bash
cp .env.example .env
```

Isi file `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173  # Wajib diisi URL frontend di production

# Supabase — Settings > API di dashboard Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
SUPABASE_PUBLIC_BUCKET=public-images
SUPABASE_DIAGNOSIS_BUCKET=diagnosis-images

# JWT — buat string acak yang panjang
JWT_SECRET=string_rahasia_panjang_anda
JWT_EXPIRES_IN=7d

# AI Model
AI_MODEL_API_URL=https://plantaech-ai-model-production.up.railway.app/predict

# Email — Brevo API (menggantikan SMTP tradisional yang diblokir di Railway)
SMTP_USER=youremail@gmail.com    # Alamat pengirim yang terdaftar di Brevo
BREVO_API_KEY=xkeysib-...        # API Key dari dashboard Brevo (tab "API Keys")

# File Upload
MAX_FILE_SIZE=10485760           # Batas ukuran file diagnosis (bytes), default 10MB
```

**Supabase Storage buckets**
- `SUPABASE_PUBLIC_BUCKET` dipakai untuk avatar dan gambar thread — buat sebagai **public bucket** di Supabase Dashboard.
- `SUPABASE_DIAGNOSIS_BUCKET` dipakai untuk gambar diagnosis — buat sebagai **private bucket** jika ingin URL aman, atau public jika tidak.

> ⚠️ Pastikan kedua bucket dibuat terlebih dahulu di **Supabase Dashboard → Storage** sebelum menjalankan aplikasi.

#### c. Setup database

Buka **Supabase Dashboard → SQL Editor**, lalu jalankan isi file `server/sql/schema.sql`.
```

#### d. Buat akun admin awal

```bash
npm run seed
```

Kredensial admin yang dibuat:

| Field | Nilai |
|-------|-------|
| Email | `admin@plantaech.com` |
| Password | `Plantaech1` |
| Role | `admin` |

> Untuk mereset password admin yang sudah ada: `npm run seed -- --update`

#### e. Jalankan dev server

```bash
npm run dev
```

API berjalan di `http://localhost:5000`.

---

### 2. Setup Frontend (`client/`)

#### a. Install dependensi

```bash
cd client
npm install
```

#### b. Konfigurasi environment

File `client/.env` sudah mengarah ke backend lokal:

```env
VITE_API_URL=http://localhost:5000/api
```

Ganti URL ini jika backend di-deploy ke server lain.

#### c. Jalankan dev server

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

> ⚠️ Jalankan backend **terlebih dahulu** sebelum frontend.

---

### 3. Referensi Endpoint API

#### Autentikasi

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/auth/register` | Tidak | Daftar akun — mengirimkan OTP ke email |
| POST | `/api/auth/verify-registration` | Tidak | Verifikasi OTP registrasi untuk aktivasi akun |
| POST | `/api/auth/resend-registration-otp` | Tidak | Kirim ulang OTP registrasi |
| POST | `/api/auth/login` | Tidak | Masuk, mengembalikan JWT |
| GET | `/api/auth/me` | Ya | Data pengguna yang sedang login |
| PUT | `/api/auth/password` | Ya | Ganti password (cek kesamaan password lama & baru) |
| POST | `/api/auth/forgot-password` | Tidak | Minta OTP untuk reset password |
| POST | `/api/auth/verify-otp` | Tidak | Verifikasi OTP reset password |
| POST | `/api/auth/reset-password` | Tidak | Reset password baru dengan OTP terverifikasi |

#### Pengguna

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/users/profile` | Ya | Ambil profil |
| PUT | `/api/users/profile` | Ya | Update profil (nama, nomor HP) |
| PUT | `/api/users/avatar` | Ya | Ganti foto profil |
| DELETE | `/api/users/avatar` | Ya | Hapus foto profil |
| DELETE | `/api/users/profile` | Ya | Hapus akun sendiri (CASCADE ke semua data terkait) |

#### Diagnosa

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/diagnoses/upload` | Opsional | Upload gambar & analisa AI |
| GET | `/api/diagnoses/history` | Ya | Riwayat diagnosa |
| GET | `/api/diagnoses/:id` | Ya | Detail satu diagnosa |
| DELETE | `/api/diagnoses/:id` | Ya | Hapus diagnosa dari riwayat |

#### Forum

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/forum/threads` | Tidak | Daftar thread (filter: category, search, user_id) |
| GET | `/api/forum/threads/:id` | Tidak | Detail thread + komentar |
| POST | `/api/forum/threads` | Ya | Buat thread baru (+ gambar opsional) |
| PUT | `/api/forum/threads/:id` | Ya | Edit thread (pemilik/admin) |
| DELETE | `/api/forum/threads/:id` | Ya | Hapus thread (pemilik/admin) |
| POST | `/api/forum/threads/:id/comments` | Ya | Tambah komentar |
| DELETE | `/api/forum/comments/:id` | Ya | Hapus komentar (pemilik/admin) |
| GET | `/api/forum/comments/by-user/:userId` | Tidak | Komentar publik seorang pengguna |
| GET | `/api/forum/my-threads` | Ya | Thread saya (termasuk yang dihapus) |
| GET | `/api/forum/my-comments` | Ya | Komentar saya (termasuk yang dihapus) |

#### Laporan

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/reports` | Ya | Laporkan konten |
| GET | `/api/reports` | Ya (Admin) | Daftar laporan |
| PUT | `/api/reports/:id` | Ya (Admin) | Update status laporan |

#### Admin

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/admin/stats` | Ya (Admin) | Statistik keseluruhan |
| GET | `/api/admin/users` | Ya (Admin) | Daftar pengguna |
| PUT | `/api/admin/users/:id/role` | Ya (Admin) | Ubah role pengguna |
| PUT | `/api/admin/users/:id/ban` | Ya (Admin) | Ban/unban pengguna |
| DELETE | `/api/admin/users/:id` | Ya (Admin) | Hapus akun pengguna (tidak bisa hapus diri sendiri) |
| GET | `/api/admin/posts` | Ya (Admin) | Daftar semua thread |
| PUT | `/api/admin/posts/:id/pin` | Ya (Admin) | Pin/unpin thread |
| DELETE | `/api/admin/posts/:id` | Ya (Admin) | Hapus thread |

#### Penyakit (Knowledge Base)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/admin/diseases` | Ya (Admin) | Daftar seluruh data penyakit |
| POST | `/api/admin/diseases` | Ya (Admin) | Tambah data penyakit baru |
| PUT | `/api/admin/diseases/:id` | Ya (Admin) | Edit data penyakit (juga membersihkan cache AI) |
| DELETE | `/api/admin/diseases/:id` | Ya (Admin) | Hapus data penyakit |

#### Lain-lain

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/misc/contact` | Tidak | Kirim pesan dari form kontak ke email admin via Brevo |

---

### 4. Menghubungkan Model AI

Backend saat ini sudah terintegrasi penuh dengan model AI FastAPI yang di-deploy terpisah.
Fungsi `analyzeImage` pada `server/src/services/aiService.js` menangani pengiriman gambar menggunakan objek `Blob` dan *native* `fetch` API Node.js.

```js
const fileBuffer = fs.readFileSync(imagePath);
const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
const formData = new FormData();
formData.append('file', blob, 'image.jpg');

const response = await fetch(process.env.AI_MODEL_API_URL, {
  method: 'POST',
  body: formData
});
const data = await response.json();
```

Pastikan `AI_MODEL_API_URL` di `.env` backend diatur mengarah ke URL public API model AI Anda (misalnya di Railway).

---

### 5. Deploy ke Railway

#### a. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
railway link   # pilih project kamu
```

#### b. Deploy Backend

```bash
cd server
railway up
```

#### c. Deploy Frontend

```bash
cd client
railway up
```

#### d. Environment Variables di Railway Dashboard

Tambahkan variabel berikut di **Railway Dashboard → service backend → Variables**:

| Variabel | Keterangan |
|----------|------------|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | URL public frontend Railway |
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key Supabase |
| `SUPABASE_PUBLIC_BUCKET` | `public-images` |
| `SUPABASE_DIAGNOSIS_BUCKET` | `diagnosis-images` |
| `JWT_SECRET` | String rahasia panjang |
| `JWT_EXPIRES_IN` | `7d` |
| `AI_MODEL_API_URL` | URL endpoint FastAPI model AI |
| `SMTP_USER` | Email pengirim yang terdaftar di Brevo |
| `BREVO_API_KEY` | API Key dari dashboard Brevo |
| `MAX_FILE_SIZE` | `10485760` |

Tambahkan variabel berikut di **Railway Dashboard → service frontend → Variables**:

| Variabel | Keterangan |
|----------|------------|
| `VITE_API_URL` | URL public backend Railway + `/api` (contoh: `https://backend.up.railway.app/api`) |

> ⚠️ Railway memblokir koneksi SMTP keluar (port 25/465/587) pada paket gratis. Pastikan menggunakan **Brevo REST API** (`BREVO_API_KEY`) — bukan SMTP Gmail — agar pengiriman email OTP berfungsi di production.


---

## 🤖 Model Machine Learning

Model machine learning Plantaech dikembangkan menggunakan TensorFlow/Keras dengan arsitektur EfficientNetB0 untuk klasifikasi penyakit tanaman tomat berdasarkan citra daun.

### Notebook Pelatihan Model

Notebook pelatihan model tersedia pada:

```text
ml/notebooks/plantaech.ipynb
```

### Unduh Model

Model hasil pelatihan disimpan secara terpisah dan dapat diunduh melalui tautan berikut:

🔗 **Model AI:** [Google Drive](https://drive.google.com/file/d/1u6ZLay6iZM0C6m2wt6vSS9gNkwUVwtGu/view?usp=sharing)

### Memuat Model

Setelah model diunduh, letakkan file model pada lokasi yang sesuai dengan konfigurasi layanan FastAPI AI.

Contoh:

```text
ml/
├── models/
│   └── best_model.keras
```

Model kemudian dimuat menggunakan TensorFlow:

```python
import tensorflow as tf

model = tf.keras.models.load_model(
    "models/best_model.keras"
)
```

### TensorBoard Logs

Log pelatihan model tersedia pada:

```text
ml/logs/
```

Untuk melihat hasil pelatihan menggunakan TensorBoard:

```bash
tensorboard --logdir ml/logs
```

TensorBoard akan berjalan pada:

```text
http://localhost:6006
```
