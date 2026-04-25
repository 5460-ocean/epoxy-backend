const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

let t = 0;

let colors = ["#00c6ff", "#003366"];
let style = "waves";
let speed = 0.05;
let amplitude = 20;

const API_URL = "https://epoxy-backend-106r.onrender.com";

// ✅ PROPER BUTTON BINDING
document.getElementById("generateBtn").addEventListener("click", generate);

async function generate() {
    const prompt = document.getElementById("prompt").value;

    console.log("CLICKED:", prompt);

    const res = await fetch(API_URL + "/ai/generate-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    console.log("RESPONSE:", data);

    // 🔥 FORCE UPDATE
    colors = data.colors;
    style = data.style;
    speed = data.speed;
    amplitude = data.amplitude;
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    let gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 🌊 WAVES
    if (style === "waves") {
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                let y = h / 2 + Math.sin(x * 0.02 + t + i) * amplitude;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = "white";
            ctx.stroke();
        }
    }

    // 🌌 SWIRL
    if (style === "swirl") {
        for (let i = 0; i < 200; i++) {
            let angle = i * 0.1 + t;
            let r = i * 0.5;
            let x = w / 2 + Math.cos(angle) * r;
            let y = h / 2 + Math.sin(angle) * r;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    t += speed;
    requestAnimationFrame(draw);
}

draw();
