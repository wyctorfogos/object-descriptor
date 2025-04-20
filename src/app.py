from flask import Flask, request
import requests
import os
import sys
from dotenv import load_dotenv
# Caminho para o .env em ../coef/.env
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'conf', '.env'))
load_dotenv(dotenv_path=env_path)
from utils.ollama_client import ask_ollama

load_dotenv()
app = Flask(__name__)

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"
llm_model_name= os.getenv("llm_model_name")
api_server=os.getenv("api_server")
api_server_port=os.getenv("api_server_port")
ollama_api_server_ipaddress=os.getenv("ollama_api_server_ipaddress")
ollama_api_server_port=os.getenv("ollama_api_server_port")


def send_message(chat_id, text):
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    try:
        requests.post(url, json=payload)
    except Exception as e:
        print("Erro ao enviar mensagem:", e)


@app.route("/llm", methods=["POST"])
def webhook():
    data = request.get_json()
    response =""
    if "message" in data:
        chat_id = data["message"]["chat"]["id"]
        user_message = data["message"].get("text", "")

        if user_message:
            # Chama o modelo LLM com a mensagem do usuário
            response = ask_ollama(
                prompt=user_message,
                model=llm_model_name,
                host=ollama_api_server_ipaddress,
                port=ollama_api_server_port
            )

            # Envia de volta pro Telegram
            send_message(chat_id, response)

    return {"response": response, "status": 200}