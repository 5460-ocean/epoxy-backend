from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# 🔥 THIS LINE FIXES EVERYTHING
app.mount("/static", StaticFiles(directory="app/static"), name="static")

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

    <!-- ✅ FIXED PATH -->
    <script src="/static/script_v4.js"></script>

    </body>
    </html>
    """
