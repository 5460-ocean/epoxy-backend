alert("EPOXY V7 PARTICLE ENGINE");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let theme = "ocean";

// 🎨 THEMES
const themes = {
    ocean: ["#0055ff", "#00ccff", "#aaffff"],
    fire: ["#ff2200", "#ff8800", "#ffee00"],
    galaxy: ["#220044", "#8800ff", "#ff00cc"],
    marble: ["#eeeeee", "#bbbbbb", "#666666"]
};

// 🧠 prompt → theme
function detectTheme(prompt){
    const p = prompt.toLowerCase();
    if(p.includes("fire")) return "fire";
    if(p.includes("ocean")||p.includes("water")) return "ocean";
    if(p.includes("galaxy")) return "galaxy";
    if(p.includes("marble")) return "marble";
    return "ocean";
}

// 💧 PARTICLES (resin blobs)
let particles = [];

function createParticles() {
    particles = [];
    for(let i=0;i<40;i++){
        particles.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            vx: (Math.random()-0.5)*1.5,
            vy: (Math.random()-0.5)*1.5,
            size: 50 + Math.random()*80,
            color: themes[theme][Math.floor(Math.random()*3)]
        });
    }
}

createParticles();

// 🎬 draw blobs
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.globalCompositeOperation = "lighter"; // blending

    particles.forEach(p => {

        // move
        p.x += p.vx;
        p.y += p.vy;

        // bounce
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // draw blob
        const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.size
        );

        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

// 🎯 generate button
document.getElementById("generateBtn").onclick = ()=>{
    const prompt = document.getElementById("promptInput").value;
    theme = detectTheme(prompt);
    createParticles();
};

draw();
