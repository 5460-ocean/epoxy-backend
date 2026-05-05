from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return {"message": "API running"}

@app.route("/app")
def app_page():
    return "THIS IS A TEST PAGE"

if __name__ == "__main__":
    app.run()
