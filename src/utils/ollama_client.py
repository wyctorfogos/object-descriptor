import requests

def ask_ollama(prompt, model="gemma3:4b-it-qat", host="localhost", port="11434"):
    url = f"http://localhost:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "[Sem resposta do modelo]")
    except Exception as e:
        return f"Erro ao consultar o modelo: {str(e)}"
