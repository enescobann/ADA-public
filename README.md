# ADA - Anket Değerlendirme Aracı

Anket verilerini analiz etmek ve değerlendirmek için geliştirilmiş web tabanlı bir araçtır.

## Kurulum ve Çalıştırma

Proje iki ana bölümden oluşur: Frontend ve Backend. İkisini de ayrı ayrı çalıştırmanız gerekir.

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
