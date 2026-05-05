alert("NUCLEAR RESET");

// 🔥 REMOVE ALL CANVASES (not just one)
document.querySelectorAll("canvas").forEach(c => c.remove());

// 🔥 CREATE ONE CLEAN CANVAS
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = 300;

const ctx = canvas.getContext("2d");

// 🔴 FORCE FULL RED
ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);
