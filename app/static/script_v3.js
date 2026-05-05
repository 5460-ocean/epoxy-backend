alert("ONLY SCRIPT ACTIVE");

// 🔥 REMOVE ANY EXISTING CANVAS
const oldCanvas = document.getElementById("canvas");
oldCanvas.remove();

// 🔥 CREATE NEW CLEAN CANVAS
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = 300;

const ctx = canvas.getContext("2d");

// 🔴 FORCE RED (nothing else can override now)
ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);
