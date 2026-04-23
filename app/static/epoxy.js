let animationId;

function applyColors(colors, theme = "") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  let time = 0;

  if (animationId) cancelAnimationFrame(animationId);

  theme = theme.toLowerCase();

  function draw() {
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // 🌊 OCEAN MODE
    if (theme.includes("ocean") || theme.includes("wave") || theme.includes("water")) {
      colors.forEach((color, i) => {
        for (let y = 0; y < h; y += 20) {
          const wave = Math.sin((y + time * 50) * 0.02 + i) * 20;

          ctx.fillStyle = color;
          ctx.globalAlpha = 0.2;

          ctx.beginPath();
          ctx.moveTo(0, y + wave);
          ctx.lineTo(w, y - wave);
          ctx.lineTo(w, y + 40);
          ctx.lineTo(0, y + 40);
          ctx.closePath();
          ctx.fill();
        }
      });
    }

    // 🌌 GALAXY MODE
    else if (theme.includes("space") || theme.includes("galaxy")) {
      colors.forEach((color, index) => {
        for (let i = 0; i < 4; i++) {
          const x = w / 2 + Math.sin(time + i + index) * 100;
          const y = h / 2 + Math.cos(time + i) * 100;

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

      // stars
      for (let i = 0; i < 60; i++) {
        const x = (i * 37) % w;
        const y = (i * 83) % h;

        ctx.globalAlpha = 0.5 + Math.sin(time + i) * 0.5;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    ctx.globalAlpha = 1;
    time += 0.02;
    animationId = requestAnimationFrame(draw);
  }

  draw();
}
