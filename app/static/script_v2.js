const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;
let type = "ocean";

let colors = ["#1CA7EC", "#023E8A"];

document.getElementById("generateBtn").addEventListener("click", generate);

async function generate() {
    const prompt = document.getElementById("prompt").value.toLowerCase();

    const res = await fetch("/ai/generate-style", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    colors = data.colors;
    type = data.type;
}

// ===== DRAW =====
function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // ===== BASE GRADIENT =====
    let gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // ===== OCEAN =====
    if (type === "waves") {
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.lineWidth = 8 - i;

            for (let x = 0; x < w; x++) {
                let y =
                    h/2 +
                    Math.sin(x * 0.02 + t + i) * (20 + i * 5);

                ctx.lineTo(x, y);
            }

            ctx.strokeStyle = `rgba(255,255,255,${0.08 + i*0.05})`;
            ctx.stroke();
        }
    }

    // ===== FIRE =====
    if (type === "chaos") {
        for (let i = 0; i < 40; i++) {
            let x = Math.random() * w;
            let y = h - Math.random() * h;

            let size = Math.random() * 20;

            ctx.beginPath();
            ctx.arc(x, y - t * 50 % h, size, 0, Math.PI * 2);

            ctx.fillStyle = `rgba(255,100,0,0.2)`;
            ctx.fill();
        }
    }

    // ===== GALAXY =====
    if (type === "swirl") {
        for (let i = 0; i < 200; i++) {
            let angle = i * 0.1 + t * 0.5;
            let r = i * 0.8;

            let x = w/2 + Math.cos(angle) * r;
            let y = h/2 + Math.sin(angle) * r;

            ctx.fillStyle = "white";
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // ===== GLOSS OVERLAY =====
    let gloss = ctx.createLinearGradient(0, 0, w, h);
    gloss.addColorStop(0, "rgba(255,255,255,0.15)");
    gloss.addColorStop(0.5, "rgba(255,255,255,0)");
    gloss.addColorStop(1, "rgba(255,255,255,0.1)");

    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, w, h);

    t += 0.05;
    requestAnimationFrame(draw);
}

draw();
