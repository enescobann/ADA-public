import json
import pandas as pd
from openai import OpenAI
import os

with open("schema.json", "r", encoding="utf-8") as file:
    REPORT_SCHEMA = json.load(file)

client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

def analyze_csv_data(file_content):
    """Pandas ile CSV içeriğini okur ve analiz için hazırlar."""
    try:
        # Byte içeriğini DataFrame'e çevir
        from io import BytesIO
        df = pd.read_csv(BytesIO(file_content))
        
        r_content = df["Eğitimin İçeriği"].mean()
        r_educators = df["Eğiticilerin Yeterliliği"].mean()
        r_length = df["Eğitimin Süresi"].mean()
        r_env = df["Eğitim Ortamı"].mean()
        sugg = df["Öneriler"].dropna().tolist()

        return {
            "scores": [r_content, r_educators, r_env, r_length],
            "suggestions": sugg
        }
    except Exception as e:
        raise Exception(f"Veri okuma hatası: {str(e)}")

def generate_ai_report(stats):
    """LLM kullanarak rapor JSON'u oluşturur."""
    system_prompt = "Sen uzman bir veri analistisin. Verilen eğitim geri bildirimlerini analiz et. Eleştirel ol."
    
    user_msg = f"""
    Aşağıdaki anket verilerini analiz et:
    PUANLAR (5 üzerinden):
    - İçerik: {stats['scores'][0]}
    - Eğitmenler: {stats['scores'][1]}
    - Ortam: {stats['scores'][2]}
    - Süre: {stats['scores'][3]}
    
    KATILIMCI YORUMLARI:
    {json.dumps(stats['suggestions'], ensure_ascii=False)}
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_msg}
    ]

    completion = client.chat.completions.create(
        model="turkish-gemma-9b-t1",
        messages=messages,
        temperature=0.4,
        response_format=REPORT_SCHEMA 
    )

    response_content = completion.choices[0].message.content
    
    try:
        analyzed_data = json.loads(response_content)
    except json.JSONDecodeError:
        clean_content = response_content.split("</think>")[-1]
        analyzed_data = json.loads(clean_content)
    
    return analyzed_data

def chat_with_ai(messages):
    """Sohbet fonksiyonu."""
    completion = client.chat.completions.create(
        model="turkish-gemma-9b-t1",
        messages=messages,
        temperature=0.7
    )
    reply = completion.choices[0].message.content
    clean_reply = reply.split("</think>")[-1].strip()
    return clean_reply