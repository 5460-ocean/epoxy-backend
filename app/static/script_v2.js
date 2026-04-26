alert("SCRIPT V2 IS RUNNING");

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

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    let gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    t += 0.05;
    requestAnimationFrame(draw);
}

draw();
