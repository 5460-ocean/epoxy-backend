alert("EPOXY V8 FLOW ENGINE");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let particles = [];
let theme = "fire";

// 🎨 better palettes (less neon)
const themes = {
    fire: ["#8B0000", "#FF4500", "#FFD700"],
    ocean: ["#0A1F44", "#0077BE", "#A7E0FF"],
    galaxy: ["#1a0033", "#6600cc", "#ff33cc"],
    marble: ["#f5f5f5", "#cccccc", "#666666"]
};

function detectTheme(p){
    p = p.toLowerCase();
    if(p.includes("fire")) return "fire";
    if(p.includes("ocean")) return "ocean";
    if(p.includes("galaxy")) return "galaxy";
    if(p.includes("marble")) return "marble";
    return "fire";
}

// 🌊 FLOW FIELD (this is key)
function flow(x, y, t) {
    return Math.sin(x * 0.01 + t) + Math.cos(y * 0.01 - t);
}

// 💧 particles (many small, not few big)
function initParticles() {
    particles = [];

    for (let i = 0; i < 250; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 2 + Math.random() * 4,
            color: themes[theme][Math.floor(Math.random()*3)]
        });
    }
}

initParticles();

let t = 0;

// 🎬 draw
function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.1)"; // fade trail
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {

        const angle = flow(p.x, p.y, t) * Math.PI;

        // move with flow
        p.x += Math.cos(angle) * 1.2;
        p.y += Math.sin(angle) * 1.2;

        // wrap around (continuous flow)
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // draw particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    t += 0.01;
    requestAnimationFrame(draw);
}

// 🎯 generate
document.getElementById("generateBtn").onclick = () => {
    const prompt = document.getElementById("promptInput").value;
    theme = detectTheme(prompt);
    initParticles();
    ctx.clearRect(0,0,canvas.width,canvas.height);
};

draw();
