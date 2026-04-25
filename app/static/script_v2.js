const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;

let colors = ["#00c6ff", "#003366"];
let amplitude = 20;
let speed = 0.05;

// 🔥 FIX: bind button properly
document.getElementById("generateBtn").addEventListener("click", generate);

async function generate() {
    const prompt = document.getElementById("prompt").value;

    const res = await fetch("/ai/generate-style", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    // 🔥 APPLY RESULT
    colors = data.colors || ["#00c6ff", "#003366"];
    amplitude = data.amplitude || 20;
    speed = data.speed || 0.05;
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

    // 🌊 Smooth waves (not sharp lines)
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.lineWidth = 2;

        for (let x = 0; x < w; x++) {
            let y = h/2 + Math.sin(x * 0.02 + t + i) * amplitude;
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();
    }

    t += speed;
    requestAnimationFrame(draw);
}

draw();

// 🟢 SAVE
async function saveProject() {
    await fetch("/project/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: "Project",
            description: "Generated",
            surface: "Floor",
            theme: document.getElementById("prompt").value
        })
    });

    alert("Saved!");
}

// 🟢 LOAD
async function loadProjects() {
    const res = await fetch("/project/");
    const data = await res.json();

    alert(JSON.stringify(data.items, null, 2));
}

// 🟢 DOWNLOAD
function downloadImage() {
    const link = document.createElement("a");
    link.download = "epoxy.png";
    link.href = canvas.toDataURL();
    link.click();
}
