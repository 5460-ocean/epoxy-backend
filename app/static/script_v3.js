alert("SCRIPT V3 ACTIVE");

// 🔴 CLEAR THE CANVAS COMPLETELY
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);
