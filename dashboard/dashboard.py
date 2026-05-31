"""
Dashboard Interaktif Plantaech
Analisis Dataset Penyakit Tanaman Tomat

Jalankan dengan: streamlit run dashboard/dashboard.py
"""

import os
import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# KONFIGURASI
st.set_page_config(
    page_title="Plantaech Dashboard - Analisis Penyakit Tanaman Tomat",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# LOAD DATA
@st.cache_data
def load_data():
    """Memuat data dari file CSV."""
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'main_data.csv')
    if not os.path.exists(csv_path):
        st.error(f"File data tidak ditemukan: {csv_path}")
        st.info("Jalankan terlebih dahulu: python dashboard/prepare_data.py")
        st.stop()
    df = pd.read_csv(csv_path)
    return df

df = load_data()

# SIDEBAR
st.sidebar.title("🌿 Plantaech Dashboard")
st.sidebar.markdown("---")

# Filter kondisi tanaman
condition_filter = st.sidebar.multiselect(
    "Filter Kondisi Tanaman:",
    options=df['condition'].unique().tolist(),
    default=df['condition'].unique().tolist()
)

# Filter kelas penyakit
disease_options = sorted(df['disease_name'].unique().tolist())
disease_filter = st.sidebar.multiselect(
    "Filter Jenis Penyakit:",
    options=disease_options,
    default=disease_options
)

# Filter ukuran file
if 'file_size_category' in df.columns:
    size_options = df['file_size_category'].dropna().unique().tolist()
    size_filter = st.sidebar.multiselect(
        "Filter Ukuran File:",
        options=size_options,
        default=size_options
    )
else:
    size_filter = None

# Terapkan filter
filtered_df = df[
    (df['condition'].isin(condition_filter)) &
    (df['disease_name'].isin(disease_filter))
]

if size_filter is not None and 'file_size_category' in df.columns:
    filtered_df = filtered_df[filtered_df['file_size_category'].isin(size_filter)]

st.sidebar.markdown("---")
st.sidebar.markdown(f"**Data terfilter:** {len(filtered_df):,} dari {len(df):,} gambar")
st.sidebar.markdown("---")
st.sidebar.markdown("**Tim:** CC26-PSU258")
st.sidebar.markdown("**Tema:** Sustainable Living")

# HEADER
st.title("🌿 Plantaech - Dashboard Analisis Penyakit Tanaman Tomat")
st.markdown("""
Dashboard interaktif ini menampilkan hasil analisis dataset penyakit tanaman tomat 
yang digunakan dalam proyek **Plantaech** - solusi berbasis AI untuk membantu petani 
mengidentifikasi penyakit tanaman secara dini.
""")

# METRIC CARDS
st.markdown("### 📊 Ringkasan Dataset")
col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    st.metric("Total Gambar", f"{len(filtered_df):,}")
with col2:
    st.metric("Jumlah Kelas", f"{filtered_df['class_name'].nunique()}")
with col3:
    healthy_count = len(filtered_df[filtered_df['is_healthy'] == True])
    st.metric("Gambar Sehat", f"{healthy_count:,}")
with col4:
    diseased_count = len(filtered_df[filtered_df['is_healthy'] == False])
    st.metric("Gambar Sakit", f"{diseased_count:,}")
with col5:
    avg_size = filtered_df['file_size_kb'].mean()
    st.metric("Rata-rata Ukuran", f"{avg_size:.1f} KB")

st.markdown("---")

# TAB LAYOUT
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📈 Distribusi Kelas", 
    "🔍 Analisis Gambar",
    "📊 Perbandingan Sehat vs Sakit",
    "🧪 A/B Testing",
    "📝 Kesimpulan & Rekomendasi"
])

# TAB 1: DISTRIBUSI KELAS
with tab1:
    st.markdown("### Pertanyaan Bisnis 1")
    st.info("""
    **Bagaimana distribusi dan proporsi jenis penyakit tanaman tomat yang teridentifikasi 
    dalam dataset Plantaech, dan penyakit mana yang paling dominan serta paling jarang 
    ditemukan selama periode pengumpulan data tahun 2026?**
    """)
    
    col_left, col_right = st.columns(2)
    
    with col_left:
        # Bar chart distribusi kelas - Menggunakan highlight color
        fig, ax = plt.subplots(figsize=(10, 6))
        class_counts = filtered_df['disease_name'].value_counts()
        base_color = 'lightgray'
        highlight_color = '#e74c3c'
        colors = [highlight_color if i == 0 else base_color for i in range(len(class_counts))]
        bars = ax.barh(class_counts.index, class_counts.values, color=colors)
        ax.set_xlabel('Jumlah Sampel', fontsize=12)
        ax.set_ylabel('Jenis Penyakit', fontsize=12)
        ax.set_title('Distribusi Jumlah Sampel per Kelas Penyakit', fontsize=14, fontweight='bold')
        for bar, val in zip(bars, class_counts.values):
            ax.text(val + 20, bar.get_y() + bar.get_height()/2, 
                    f'{val:,}', va='center', fontsize=10)
        plt.tight_layout()
        st.pyplot(fig)
    
    with col_right:
        # Donut chart untuk top 5 + Others
        fig_pie, ax_pie = plt.subplots(figsize=(8, 6))
        top_n = 5
        if len(class_counts) > top_n:
            top_classes = class_counts.head(top_n)
            others_sum = class_counts.iloc[top_n:].sum()
            pie_data = pd.concat([top_classes, pd.Series({'Others': others_sum})])
        else:
            pie_data = class_counts
        
        # Harmonious colors
        colors_pie = sns.color_palette("pastel", len(pie_data))
        wedges, texts, autotexts = ax_pie.pie(
            pie_data.values, 
            labels=pie_data.index, 
            autopct='%1.1f%%', 
            startangle=90, 
            colors=colors_pie,
            textprops=dict(color="black", fontsize=9),
            pctdistance=0.75
        )
        # Donut hole
        centre_circle = plt.Circle((0,0), 0.55, fc='white')
        ax_pie.add_artist(centre_circle)
        ax_pie.set_title('Proporsi Top 5 Kelas & Others', fontsize=14, fontweight='bold')
        plt.tight_layout()
        st.pyplot(fig_pie)
        plt.close(fig_pie)
    
    # Tabel distribusi
    st.markdown("#### Tabel Distribusi Kelas")
    dist_table = pd.DataFrame({
        'Jenis Penyakit': class_counts.index,
        'Jumlah Sampel': class_counts.values,
        'Proporsi (%)': [f"{v/len(filtered_df)*100:.2f}%" for v in class_counts.values]
    }).reset_index(drop=True)
    st.dataframe(dist_table, use_container_width=True)
    
    st.markdown("""
    **Analisis:**
    - Kelas dengan sampel terbanyak menunjukkan penyakit yang paling sering ditemukan di lapangan
    - Ketidakseimbangan kelas (class imbalance) perlu diperhatikan saat melatih model AI
    - Kelas dengan sampel sedikit memerlukan teknik augmentasi data untuk meningkatkan performa model
    """)

# TAB 2: ANALISIS GAMBAR
with tab2:
    st.markdown("### Pertanyaan Bisnis 2")
    st.info("""
    **Apakah terdapat perbedaan signifikan dalam kualitas gambar (resolusi, ukuran file) 
    antara kelas penyakit yang berbeda dalam dataset, yang dapat memengaruhi akurasi model 
    deteksi penyakit Plantaech selama fase pengembangan Q2 2026?**
    """)
    
    col_a, col_b = st.columns(2)
    
    with col_a:
        # Distribusi ukuran file per kelas
        fig3, ax3 = plt.subplots(figsize=(10, 6))
        filtered_df.boxplot(column='file_size_kb', by='disease_name', ax=ax3, rot=45)
        ax3.set_title('Distribusi Ukuran File per Kelas Penyakit', fontsize=14, fontweight='bold')
        ax3.set_xlabel('Jenis Penyakit', fontsize=12)
        ax3.set_ylabel('Ukuran File (KB)', fontsize=12)
        plt.suptitle('')
        plt.tight_layout()
        st.pyplot(fig3)
        plt.close(fig3)
    
    with col_b:
        # Distribusi resolusi
        fig4, ax4 = plt.subplots(figsize=(10, 6))
        avg_pixels = filtered_df.groupby('disease_name')['total_pixels'].mean().sort_values()
        colors4 = ['#3498db'] * len(avg_pixels)
        ax4.barh(avg_pixels.index, avg_pixels.values / 1000, color=colors4)
        ax4.set_xlabel('Rata-rata Total Pixel (ribuan)', fontsize=12)
        ax4.set_ylabel('Jenis Penyakit', fontsize=12)
        ax4.set_title('Rata-rata Resolusi per Kelas', fontsize=14, fontweight='bold')
        plt.tight_layout()
        st.pyplot(fig4)
        plt.close(fig4)
    
    # Statistik deskriptif
    st.markdown("#### Statistik Deskriptif Kualitas Gambar")
    stats_df = filtered_df.groupby('disease_name').agg({
        'width': ['mean', 'std', 'min', 'max'],
        'height': ['mean', 'std', 'min', 'max'],
        'file_size_kb': ['mean', 'std', 'min', 'max']
    }).round(2)
    st.dataframe(stats_df, use_container_width=True)

# TAB 3: SEHAT VS SAKIT
with tab3:
    st.markdown("### Perbandingan Tanaman Sehat vs Sakit")
    
    col_x, col_y = st.columns(2)
    
    with col_x:
         # Perbandingan jumlah
        fig5, ax5 = plt.subplots(figsize=(8, 5))
        cond_counts = filtered_df['condition'].value_counts()
        color_map = {'Healthy': '#2ecc71', 'Diseased': '#e74c3c', 'Non Tomato': '#95a5a6'}
        colors5 = [color_map.get(cond, '#95a5a6') for cond in cond_counts.index]
        ax5.bar(cond_counts.index, cond_counts.values, color=colors5)
        ax5.set_title('Jumlah Gambar: Sehat vs Sakit vs Non Tomato', fontsize=14, fontweight='bold')
        ax5.set_ylabel('Jumlah', fontsize=12)
        for i, v in enumerate(cond_counts.values):
            ax5.text(i, v + 50, f'{v:,}', ha='center', fontsize=12, fontweight='bold')
        plt.tight_layout()
        st.pyplot(fig5)
        plt.close(fig5)
    
    with col_y:
        # Perbandingan ukuran file
        fig6, ax6 = plt.subplots(figsize=(8, 5))
        for cond in ['Healthy', 'Diseased', 'Non Tomato']:
            color = color_map[cond]
            subset = filtered_df[filtered_df['condition'] == cond]
            if not subset.empty:
                ax6.hist(subset['file_size_kb'], bins=30, alpha=0.6, 
                        label=cond, color=color, density=True)
        ax6.set_title('Distribusi Ukuran File: Sehat, Sakit & Non Tomato', fontsize=14, fontweight='bold')
        ax6.set_xlabel('Ukuran File (KB)', fontsize=12)
        ax6.set_ylabel('Densitas', fontsize=12)
        ax6.legend()
        plt.tight_layout()
        st.pyplot(fig6)
        plt.close(fig6)
    
    # Ringkasan statistik
    st.markdown("#### Perbandingan Statistik")
    comparison = filtered_df.groupby('condition').agg({
        'file_size_kb': ['count', 'mean', 'std', 'median'],
        'width': ['mean'],
        'height': ['mean']
    }).round(2)
    st.dataframe(comparison, use_container_width=True)

# TAB 4: A/B TESTING
with tab4:
    st.markdown("### 🧪 A/B Testing: Perbandingan Kualitas Gambar")
    st.markdown("""
    **Hipotesis:** Apakah terdapat perbedaan signifikan dalam ukuran file gambar 
    antara tanaman sehat (Grup A) dan tanaman sakit (Grup B)?
    
    - **H₀ (Null Hypothesis):** Tidak ada perbedaan signifikan rata-rata ukuran file 
      antara gambar tanaman sehat dan sakit
    - **H₁ (Alternative Hypothesis):** Terdapat perbedaan signifikan rata-rata ukuran file 
      antara gambar tanaman sehat dan sakit
    - **Significance Level (α):** 0.05
    """)
    
healthy_data = filtered_df[filtered_df['condition'] == 'Healthy']['file_size_kb']
    diseased_data = filtered_df[filtered_df['condition'] == 'Diseased']['file_size_kb']
    
    if len(healthy_data) > 0 and len(diseased_data) > 0:
        # Lakukan t-test
        t_stat, p_value = stats.ttest_ind(healthy_data, diseased_data)
        
        # Hitung Cohen's d (effect size)
        pooled_std = np.sqrt(
            ((len(healthy_data)-1) * healthy_data.std()**2 + 
             (len(diseased_data)-1) * diseased_data.std()**2) / 
            (len(healthy_data) + len(diseased_data) - 2)
        )
        cohens_d = (healthy_data.mean() - diseased_data.mean()) / pooled_std if pooled_std > 0 else 0
        
        col_t1, col_t2, col_t3, col_t4 = st.columns(4)
        with col_t1:
            st.metric("T-Statistic", f"{t_stat:.4f}")
        with col_t2:
            st.metric("P-Value", f"{p_value:.6f}")
        with col_t3:
            st.metric("Cohen's d", f"{abs(cohens_d):.4f}")
        with col_t4:
            result = "Tolak H₀" if p_value < 0.05 else "Gagal Tolak H₀"
            st.metric("Keputusan", result)
        
        # Visualisasi
        fig7, (ax7a, ax7b) = plt.subplots(1, 2, figsize=(14, 5))
        
        ax7a.hist(healthy_data, bins=30, alpha=0.6, label=f'Sehat (n={len(healthy_data)})', color='#2ecc71')
        ax7a.hist(diseased_data, bins=30, alpha=0.6, label=f'Sakit (n={len(diseased_data)})', color='#e74c3c')
        ax7a.axvline(healthy_data.mean(), color='green', linestyle='--', label=f'Mean Sehat: {healthy_data.mean():.1f}')
        ax7a.axvline(diseased_data.mean(), color='red', linestyle='--', label=f'Mean Sakit: {diseased_data.mean():.1f}')
        ax7a.set_title('Distribusi Ukuran File', fontsize=13, fontweight='bold')
        ax7a.set_xlabel('Ukuran File (KB)')
        ax7a.legend(fontsize=8)
        
        ax7b.boxplot([healthy_data, diseased_data], labels=['Sehat', 'Sakit'])
        ax7b.set_title('Box Plot Perbandingan', fontsize=13, fontweight='bold')
        ax7b.set_ylabel('Ukuran File (KB)')
        
        plt.tight_layout()
        st.pyplot(fig7)
        plt.close(fig7)

        # Interpretasi
        st.markdown("#### Interpretasi Hasil")
        if p_value < 0.05:
            st.success(f"""
            ✅ **Hasil:** Dengan p-value = {p_value:.6f} (< 0.05), kita **menolak H₀**.
            
            Terdapat perbedaan signifikan secara statistik antara ukuran file gambar 
            tanaman sehat dan sakit. Effect size (Cohen's d = {abs(cohens_d):.4f}) menunjukkan 
            bahwa perbedaan ini {'besar' if abs(cohens_d) > 0.8 else 'sedang' if abs(cohens_d) > 0.5 else 'kecil'}.
            
            **Implikasi:** Perbedaan kualitas gambar ini perlu diperhatikan saat preprocessing 
            data untuk model AI, karena dapat memengaruhi performa klasifikasi.
            """)
        else:
            st.warning(f"""
            ⚠️ **Hasil:** Dengan p-value = {p_value:.6f} (≥ 0.05), kita **gagal menolak H₀**.
            
            Tidak terdapat perbedaan signifikan secara statistik antara ukuran file gambar 
            tanaman sehat dan sakit.
            
            **Implikasi:** Kualitas gambar relatif konsisten antara kedua kelompok, 
            sehingga preprocessing dapat dilakukan secara seragam.
            """)
    else:
        st.warning("Data tidak cukup untuk melakukan A/B Testing. Pastikan filter menyertakan kedua kondisi.")

# KESIMPULAN 
with tab5:
    st.markdown("### 📝 Kesimpulan & Rekomendasi")
    
    st.markdown("#### Kesimpulan")
    
    # Hitung statistik untuk kesimpulan
    most_common = df['disease_name'].value_counts().idxmax()
    most_common_count = df['disease_name'].value_counts().max()
    least_common = df['disease_name'].value_counts().idxmin()
    least_common_count = df['disease_name'].value_counts().min()
    
    st.markdown(f"""
    **Kesimpulan Pertanyaan Bisnis 1:**
    - Dataset Plantaech terdiri dari **{len(df):,} gambar** yang terbagi ke dalam 
       **{df['class_name'].nunique()} kelas** (9 penyakit + 1 sehat + 1 Non Tomato)
    - Penyakit paling dominan adalah **{most_common}** dengan **{most_common_count:,} sampel** 
      ({most_common_count/len(df)*100:.1f}% dari total)
    - Penyakit paling jarang adalah **{least_common}** dengan **{least_common_count:,} sampel** 
      ({least_common_count/len(df)*100:.1f}% dari total)
    - Terdapat ketidakseimbangan kelas (class imbalance) yang signifikan, 
      dengan rasio terbesar:terkecil mencapai **{most_common_count/least_common_count:.1f}:1**
    
    **Kesimpulan Pertanyaan Bisnis 2:**
    - Analisis kualitas gambar menunjukkan variasi ukuran file dan resolusi antar kelas penyakit
    - Hasil A/B testing memberikan bukti statistik mengenai perbedaan karakteristik gambar 
      antara tanaman sehat dan sakit
    - Konsistensi atau inkonsistensi kualitas gambar berpengaruh langsung pada strategi 
      preprocessing data untuk model AI
    """)
    
    st.markdown("#### Rekomendasi (Action Items)")
    st.markdown("""
    1. **Data Augmentation:** Terapkan teknik augmentasi data (rotasi, flipping, zoom, 
       perubahan brightness) terutama untuk kelas dengan sampel sedikit guna mengatasi 
       class imbalance
    
    2. **Standardisasi Preprocessing:** Buat pipeline preprocessing yang konsisten untuk 
       semua gambar (resize ke ukuran seragam, normalisasi pixel values) agar model 
       dapat belajar secara optimal
    
    3. **Pengumpulan Data Tambahan:** Prioritaskan pengumpulan data untuk kelas yang 
       underrepresented, terutama melalui kolaborasi dengan petani lokal di Indonesia
    
    4. **Monitoring Kualitas:** Implementasikan sistem pengecekan kualitas gambar otomatis 
       pada aplikasi Plantaech untuk memastikan foto yang diunggah petani memenuhi 
       standar minimum untuk diagnosis yang akurat
    
    5. **Transfer Learning:** Gunakan model pre-trained (seperti ResNet atau EfficientNet) 
       dan lakukan fine-tuning pada dataset ini untuk mengoptimalkan akurasi dengan 
       jumlah data yang tersedia
    """)

# FOOTER
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: gray;'>
    <p>🌿 Plantaech Dashboard | Tim CC26-PSU258 | Coding Camp 2026 powered by DBS Foundation</p>
</div>
""", unsafe_allow_html=True)
