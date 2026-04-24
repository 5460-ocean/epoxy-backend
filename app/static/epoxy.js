const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 🌊 Deep ocean gradient (depth)
    let gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#001a33");
    gradient.addColorStop(0.5, "#005f99");
    gradient.addColorStop(1, "#66ccff");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 🌊 MULTI-LAYER WAVES (depth illusion)
    for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();

        for (let x = 0; x < w; x++) {
            let y =
                h / 2 +
                Math.sin(x * 0.015 + t * (0.5 + layer * 0.3)) * (20 + layer * 10) +
                Math.cos(x * 0.01 + t * 0.3) * 10;

            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(255,255,255,${0.05 + layer * 0.05})`;
        ctx.lineWidth = 1 + layer;
        ctx.stroke();
    }

    // ✨ FOAM HIGHLIGHTS (makes it realistic)
    for (let i = 0; i < 200; i++) {
        let x = Math.random() * w;
        let y =
            h / 2 +
            Math.sin(x * 0.02 + t) * 25 +
            (Math.random() - 0.5) * 20;

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 🌪 subtle turbulence blur
    ctx.globalAlpha = 0.1;
    ctx.drawImage(canvas, Math.sin(t) * 2, Math.cos(t) * 2);
    ctx.globalAlpha = 1;

    t += 0.06;

    requestAnimationFrame(draw);
}

draw();
