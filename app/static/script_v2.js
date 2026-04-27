alert("EPOXY V9 SURFACE FIX");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let particles = [];
let theme = "ocean";

// 🎨 themes with base color
const themes = {
    ocean: {
        base: "#0A1F44",
        colors: ["#0077BE", "#00AEEF", "#A7E0FF"]
    },
    fire: {
        base: "#2a0a00",
        colors: ["#8B0000", "#FF4500", "#FFD700"]
    },
    galaxy: {
        base: "#0b001a",
        colors: ["#6600cc", "#ff33cc", "#ffffff"]
    },
    marble: {
        base: "#eeeeee",
        colors: ["#cccccc", "#999999", "#666666"]
    }
};

function detectTheme(p){
    p = p.toLowerCase();
    if(p.includes("fire")) return "fire";
    if(p.includes("ocean")||p.includes("water")) return "ocean";
    if(p.includes("galaxy")) return "galaxy";
    if(p.includes("marble")) return "marble";
    return "ocean";
}

// 🌊 flow field
function flow(x, y, t) {
    return Math.sin(x * 0.01 + t) + Math.cos(y * 0.01 - t);
}

// 💧 particles (smaller + more)
function initParticles() {
    particles = [];

    for (let i = 0; i < 400; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 3 + Math.random() * 6,
            color: themes[theme].colors[Math.floor(Math.random()*3)]
        });
    }
}

initParticles();

let t = 0;

// 🎬 draw
function draw() {

    // 🎨 fill base surface (NO black)
    ctx.fillStyle = themes[theme].base;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ✨ blending mode (key for resin look)
    ctx.globalCompositeOperation = "screen";

    particles.forEach(p => {

        const angle = flow(p.x, p.y, t) * Math.PI;

        p.x += Math.cos(angle) * 1.2;
        p.y += Math.sin(angle) * 1.2;

        // wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // 💧 soft blob (not dot)
        const g = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.size
        );

        g.addColorStop(0, p.color);
        g.addColorStop(1, "transparent");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // reset blend mode
    ctx.globalCompositeOperation = "source-over";

    t += 0.01;
    requestAnimationFrame(draw);
}

// 🎯 generate
document.getElementById("generateBtn").onclick = () => {
    const prompt = document.getElementById("promptInput").value;
    theme = detectTheme(prompt);
    initParticles();
};

draw();
