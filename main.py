from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/")
def home():
    return {"message": "API running"}

@app.get("/app", response_class=HTMLResponse)
def app_page():
    return """
    <!DOCTYPE html>
    <html>
    <body style="margin:0;background:#0b0f1a;color:white;text-align:center;">

    <h1>Epoxy Generator</h1>

    <input placeholder="Describe epoxy style..." />

    <!-- 🔥 VISIBLE CANVAS -->
    <canvas id="canvas" style="
        width:100%;
        height:300px;
        display:block;
        background:black;
        margin-top:20px;
    "></canvas>

    <div style="margin-top:20px;">
        <button>Generate</button>
        <button>Download</button>
    </div>

    <script src="/app/static/script_v4.js"></script>

    </body>
    </html>
    """
