function applyColors(colors) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // dark background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  // draw soft blobs (nebula)
  colors.forEach(color => {
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const radius = 50 + Math.random() * 100;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "transparent");

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // stars
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const size = Math.random() * 2;

    ctx.globalAlpha = Math.random();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}
