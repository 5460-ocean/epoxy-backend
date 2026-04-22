function applyColors(colors) {
  const el = document.getElementById("canvas");

  const c1 = colors[0];
  const c2 = colors[1];

  el.style.background = `
    radial-gradient(circle at 30% 30%, ${c1}, transparent 60%),
    radial-gradient(circle at 70% 70%, ${c2}, transparent 60%),
    linear-gradient(135deg, ${c1}, ${c2})
  `;

  el.style.backgroundBlendMode = "screen";
}
