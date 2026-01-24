import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Kütüphaneyi import ettik
import './App.css';

function App() {
  const [reportData, setReportData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Dosya Yükleme Referansı
  const fileInputRef = useRef(null);

  // Sohbet State'leri
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatLoading]);

  // Butona tıklanınca gizli input'u aç
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Analiz sunucu hatası");

      const data = await response.json();
      setReportData(data.report);
      setStats(data.stats);
      
      // Sohbeti sıfırla ve başlat
      setChatHistory([
        { role: "system", content: "Sen bu raporu analiz eden asistansın." },
        { role: "assistant", content: "Raporu inceledim. Yan taraftan sonuçları görebilirsiniz. Sorularınız varsa buradayım." }
      ]);

    } catch (error) {
      console.error("Hata Detayı:", error);
      alert("Hata oluştu: " + error.message);
    } finally {
      setLoading(false);
      // Input değerini temizle
      if (e.target) e.target.value = null;
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newHistory = [...chatHistory, { role: "user", content: userInput }];
    setChatHistory(newHistory);
    setUserInput("");
    setChatLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          user_input: userInput
        }),
      });

      if (!response.ok) throw new Error("Sohbet sunucu hatası");

      const data = await response.json();
      setChatHistory([...newHistory, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error(error);
      setChatHistory([...newHistory, { role: "assistant", content: "Bağlantı hatası veya sunucu yanıt vermiyor." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      {/* 1. ÜST NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          📊 Eğitim Analiz Asistanı
        </div>
        <div className="nav-actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{display: 'none'}} 
            accept=".csv" 
            onChange={handleFileUpload} 
          />
          
          <button className="btn btn-primary" onClick={triggerFileUpload} disabled={loading}>
            {loading ? 'Yükleniyor...' : '📂 Dosya Yükle (.csv)'}
          </button>
          
          {reportData && (
            <button className="btn btn-outline" onClick={handlePrint}>
              🖨️ İndir / Yazdır
            </button>
          )}
        </div>
      </nav>

      {/* 2. ANA İÇERİK */}
      <div className="main-content">
        
        {/* SOL PANEL: RAPOR */}
        <div className="report-panel">
          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <h3>Analiz Yapılıyor...</h3>
              <p>Yapay zeka verileri inceliyor, lütfen bekleyin.</p>
            </div>
          ) : !reportData ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>Henüz bir rapor yok</h3>
              <p>Analize başlamak için yukarıdaki <strong>"Dosya Yükle"</strong> butonunu kullanın.</p>
            </div>
          ) : (
            <div className="report-paper">
              <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem' }}>
                 <h1 style={{ margin: 0, color: '#1e293b' }}>Eğitim Değerlendirme Raporu</h1>
                 <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Otomatik oluşturulma tarihi: {new Date().toLocaleDateString('tr-TR')}</span>
              </div>

              <h3>1. Veri Analizi</h3>
              <table>
                <thead>
                  <tr>
                    <th>Kriter</th>
                    <th style={{width: '80px'}}>Puan</th>
                    <th>AI Değerlendirmesi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>İçerik</td>
                    <td>{stats?.[0]?.toFixed(2)}</td>
                    <td>{reportData.analiz_yorumlari.icerik_analizi}</td>
                  </tr>
                  <tr>
                    <td>Eğitmenler</td>
                    <td>{stats?.[1]?.toFixed(2)}</td>
                    <td>{reportData.analiz_yorumlari.egitmen_analizi}</td>
                  </tr>
                  <tr>
                    <td>Ortam / Süre</td>
                    <td>{stats?.[2]?.toFixed(2)} / {stats?.[3]?.toFixed(2)}</td>
                    <td>{reportData.analiz_yorumlari.ortam_ve_sure_analizi}</td>
                  </tr>
                </tbody>
              </table>

              <h3>2. Katılımcı Görüşleri</h3>
              <table>
                <thead>
                  <tr>
                    <th>Sorun</th>
                    <th>Yorum Özeti</th>
                    <th>Etki</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.katilimci_onerileri.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.sorun_basligi}</strong></td>
                      <td>{item.yorum_ozeti}</td>
                      <td>{item.potansiyel_etki}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>3. SWOT Analizi</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px'}}>
                  <h4 style={{marginTop:0, color:'#16a34a'}}>Güçlü Yönler</h4>
                  <ul style={{paddingLeft: '1.2rem', margin:0}}>
                    {reportData.swot_analizi.guclu_yonler.map((i, k) => <li key={k}>{i}</li>)}
                  </ul>
                </div>
                <div style={{border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px'}}>
                  <h4 style={{marginTop:0, color:'#dc2626'}}>Zayıf Yönler</h4>
                  <ul style={{paddingLeft: '1.2rem', margin:0}}>
                    {reportData.swot_analizi.zayif_yonler.map((i, k) => <li key={k}>{i}</li>)}
                  </ul>
                </div>
                <div style={{border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px'}}>
                  <h4 style={{marginTop:0, color:'#2563eb'}}>Fırsatlar</h4>
                  <ul style={{paddingLeft: '1.2rem', margin:0}}>
                    {reportData.swot_analizi.firsatlar.map((i, k) => <li key={k}>{i}</li>)}
                  </ul>
                </div>
                <div style={{border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px'}}>
                  <h4 style={{marginTop:0, color:'#d97706'}}>Tehditler</h4>
                  <ul style={{paddingLeft: '1.2rem', margin:0}}>
                    {reportData.swot_analizi.tehditler.map((i, k) => <li key={k}>{i}</li>)}
                  </ul>
                </div>
              </div>

              <h3>4. Aksiyon Planı</h3>
              {reportData.aksiyon_plani.map((item, idx) => (
                <div key={idx} style={{backgroundColor: '#f8fafc', padding: '1rem', borderLeft: '4px solid #2563eb', marginBottom: '1rem', borderRadius: '0 4px 4px 0'}}>
                  <div><strong>Sorun:</strong> {item.tespit_edilen_sorun}</div>
                  <div style={{marginTop: '0.5rem'}}><strong>Çözüm:</strong> <em>{item.cozum_onerisi}</em></div>
                </div>
              ))}

              <h3>5. Sonuç</h3>
              <p style={{lineHeight: '1.6'}}>{reportData.sonuc_ve_yonetici_ozeti}</p>
            </div>
          )}
        </div>

        {/* SAĞ PANEL: CHAT */}
        <div className="chat-panel">
          <div className="chat-header">
            💬 AI Asistan
          </div>
          <div className="chat-messages">
            {chatHistory.filter(m => m.role !== 'system').map((msg, idx) => (
              <div key={idx} className={`message ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
                <strong>{msg.role === 'user' ? 'Siz' : 'Asistan'}</strong>
                <div className="markdown-content">
                  {/* GÜVENLİK ÖNLEMİ: İçerik boşsa render etme */}
                  {msg.content && <ReactMarkdown>{String(msg.content)}</ReactMarkdown>}
                </div>
              </div>
            ))}
            {chatLoading && <div className="message msg-ai"><em>Yazıyor...</em></div>}
            <div ref={chatEndRef} />
          </div>
          
          <form className="chat-input-container" onSubmit={handleChatSubmit}>
            <div className="chat-input-wrapper">
              <input 
                type="text" 
                className="chat-input"
                placeholder="Sorunuzu yazın..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={chatLoading || !reportData} 
              />
              <button type="submit" className="btn btn-primary" disabled={chatLoading || !reportData}>
                ➤
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;