let animationId;

function applyColors(colors) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  let time = 0;

  if (animationId) cancelAnimationFrame(animationId);

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // base
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // 🌌 flowing color layers
    colors.forEach((color, index) => {
      for (let i = 0; i < 5; i++) {
        const x = w / 2 + Math.sin(time + i + index) * 120;
        const y = h / 2 + Math.cos(time * 0.8 + i) * 120;

        const radius = 60 + Math.sin(time + i) * 40;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");

        ctx.globalAlpha = 0.3;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 🌫️ subtle fog (depth)
    const fog = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, 200);
    fog.addColorStop(0, "rgba(255,255,255,0.05)");
    fog.addColorStop(1, "transparent");

    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, w, h);

    // ⭐ stars (stable positions)
    for (let i = 0; i < 60; i++) {
      const x = (i * 37) % w;
      const y = (i * 83) % h;

      ctx.globalAlpha = 0.5 + Math.sin(time + i) * 0.5;
      ctx.fillStyle = "white";
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // ✨ epoxy shine (top gloss)
    const shine = ctx.createLinearGradient(0, 0, w, h);
    shine.addColorStop(0, "rgba(255,255,255,0.15)");
    shine.addColorStop(0.3, "transparent");
    shine.addColorStop(1, "transparent");

    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 1;

    time += 0.015;
    animationId = requestAnimationFrame(draw);
  }

  draw();
}
