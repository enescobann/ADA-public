# ADA - Anket Değerlendirme Aracı

Anket verilerini analiz etmek ve değerlendirmek için geliştirilmiş web tabanlı bir araçtır.

Yapay zeka ile veri değerlendirme ve raporlamanın yanı sıra asistan AI ile tartışma olanağı sunar.

Saysıal ve sayısal olmayan verilerin manuel olarak analiz edilip analiz sonuçlarının biçimlendirilmiş bir formatta LLM'e sunarak ile halisülasyon riski olmayan bir analiz asistan elde edilmiştir. Asistan, katılımcı

|Analiz Ekranı|
|![Analysis](output/screenshots/1.png)|

## Kurulum ve Çalıştırma

Proje iki ana bölümden oluşur: Frontend ve Backend. İkisini de ayrı ayrı çalıştırmanız gerekir.

Backend server içerisinden kullanılacak LLM için endpoint vermeniz gerekmektedir.

### 1. Backend (Sunucu)

Python yüklü olmalıdır.

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (Arayüz)

Node.js yüklü olmalıdır.

```bash
cd frontend
npm install
npm run dev
```

Uygulama localhost adresinde çalışır.
