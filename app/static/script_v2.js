const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;

let colors = ["#1CA7EC", "#023E8A"];
let flowIntensity = 0.03;
let glow = 0.2;

// stronger animated noise
function noise(x, y, t) {
    return Math.sin(x * 0.02 + t) + Math.cos(y * 0.02 + t);
}

document.getElementById("generateBtn").addEventListener("click", generate);

async function generate() {
    const prompt = document.getElementById("prompt").value.toLowerCase();

    const res = await fetch("/ai/generate-style", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    colors = data.colors || colors;

    if (prompt.includes("ocean")) {
        flowIntensity = 0.03;
        glow = 0.15;
    } else if (prompt.includes("galaxy")) {
        flowIntensity = 0.05;
        glow = 0.25;
    } else if (prompt.includes("fire")) {
        flowIntensity = 0.08;
        glow = 0.4;
    }
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    let image = ctx.createImageData(w, h);

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {

            // 🔥 animated flow
            let n = noise(x, y, t);

            let nx = x + n * 30;   // bigger distortion
            let ny = y + n * 30;

            let mix = (Math.sin(nx * flowIntensity + t * 2) + 1) / 2;

            let r1 = parseInt(colors[0].substring(1,3),16);
            let g1 = parseInt(colors[0].substring(3,5),16);
            let b1 = parseInt(colors[0].substring(5,7),16);

            let r2 = parseInt(colors[1].substring(1,3),16);
            let g2 = parseInt(colors[1].substring(3,5),16);
            let b2 = parseInt(colors[1].substring(5,7),16);

            let r = r1 * mix + r2 * (1-mix);
            let g = g1 * mix + g2 * (1-mix);
            let b = b1 * mix + b2 * (1-mix);

            // ✨ moving highlight
            let highlight = Math.pow(Math.max(0, Math.sin(nx * 0.05 + t * 3)), 8);

            r += highlight * 255 * glow;
            g += highlight * 255 * glow;
            b += highlight * 255 * glow;

            let i = (y * w + x) * 4;
            image.data[i] = r;
            image.data[i+1] = g;
            image.data[i+2] = b;
            image.data[i+3] = 255;
        }
    }

    ctx.putImageData(image, 0, 0);

    t += 0.08;  // 🔥 MUCH faster animation
    requestAnimationFrame(draw);
}

draw();
