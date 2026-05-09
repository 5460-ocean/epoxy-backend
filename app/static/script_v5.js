console.log("SCRIPT V5 LOADED");

const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

document.body.style.background = "red";

if(!gl){
    alert("WebGL failed");
}else{
    alert("WebGL works");
}
