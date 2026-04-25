const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;

// dynamic settings
let colors = ["#1CA7EC", "#023E8A"];
let flowIntensity = 0.02;
let glow = 0.2;

// simple smooth noise
function noise(x, y) {
    return Math.sin(x * 0.01 + y * 0.01 + t) * Math.cos(y * 0.01 + t);
}

// generate button
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

    // tweak realism per style
    if (prompt.includes("ocean")) {
        flowIntensity = 0.02;
        glow = 0.15;
    } else if (prompt.includes("galaxy")) {
        flowIntensity = 0.03;
        glow = 0.25;
    } else if (prompt.includes("fire")) {
        flowIntensity = 0.05;
        glow = 0.4;
    }
}

// 🔥 REAL epoxy renderer
function draw() {
    const w = canvas.width;
    const h = canvas.height;

    let image = ctx.createImageData(w, h);

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {

            let n = noise(x, y);

            // fluid distortion
            let nx = x + n * 20;
            let ny = y + n * 20;

            let mix = (Math.sin(nx * flowIntensity + t) + 1) / 2;

            // color blend
            let r = parseInt(colors[0].substring(1,3),16) * mix +
                    parseInt(colors[1].substring(1,3),16) * (1-mix);

            let g = parseInt(colors[0].substring(3,5),16) * mix +
                    parseInt(colors[1].substring(3,5),16) * (1-mix);

            let b = parseInt(colors[0].substring(5,7),16) * mix +
                    parseInt(colors[1].substring(5,7),16) * (1-mix);

            // gloss highlight
            let highlight = Math.pow(Math.max(0, Math.sin(nx * 0.02 + t)), 10);

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

    t += 0.02;
    requestAnimationFrame(draw);
}

draw();
