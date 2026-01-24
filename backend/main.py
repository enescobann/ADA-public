from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from analysis import analyze_csv_data, generate_ai_report, chat_with_ai

app = FastAPI()

# Frontend ile iletişim için CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    history: List[Dict[str, str]]
    user_input: str

@app.post("/analyze")
async def analyze_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Sadece CSV dosyaları kabul edilir.")
    
    try:
        content = await file.read()
        stats = analyze_csv_data(content)
        report_json = generate_ai_report(stats)
        
        return {
            "report": report_json,
            "stats": stats["scores"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        messages = req.history + [{"role": "user", "content": req.user_input}]
        
        response = chat_with_ai(messages)
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)