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

// 🔥 DEBUG ELEMENT
let debug = document.createElement("div");
debug.style.color = "white";
document.body.appendChild(debug);

async function generate() {
    const prompt = document.getElementById("prompt").value;

    debug.innerText = "Clicked Generate: " + prompt;

    try {
        const res = await fetch(API_URL + "/ai/generate-style", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        debug.innerText += "\nResponse: " + JSON.stringify(data);

        // 🔥 FORCE CHANGE (no condition)
        colors = data.colors;
        style = data.style;
        speed = data.speed;
        amplitude = data.amplitude;

    } catch (e) {
        debug.innerText += "\nERROR: " + e;
    }
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

// 🔥 MAKE SURE BUTTON WORKS
window.generate = generate;
