alert("EPOXY V13 NO MORE WAVES");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const w = 120;
const h = 60;

const buffer = document.createElement("canvas");
buffer.width = w;
buffer.height = h;
const bctx = buffer.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let t = 0;
let theme = "ocean";

const themes = {
    ocean: [[0,80,200],[0,150,255],[180,230,255]],
    fire: [[180,20,0],[255,100,0],[255,200,0]],
    galaxy: [[20,0,50],[120,0,200],[255,0,180]],
    marble: [[240,240,240],[200,200,200],[100,100,100]]
};

function detectTheme(p){
    p = p.toLowerCase();
    if(p.includes("fire")) return "fire";
    if(p.includes("ocean")||p.includes("water")) return "ocean";
    if(p.includes("galaxy")) return "galaxy";
    if(p.includes("marble")) return "marble";
    return "ocean";
}

// 🔥 pseudo-random noise (breaks patterns)
function noise(x,y){
    return Math.sin(x*12.9898 + y*78.233) * 43758.5453 % 1;
}

// 🌪 domain warping (THIS kills waves)
function warp(x,y,t){
    let nx = x + Math.sin(y*0.3 + t)*5;
    let ny = y + Math.cos(x*0.3 - t)*5;

    nx += noise(nx,ny)*10;
    ny += noise(ny,nx)*10;

    return [nx, ny];
}

// 🎨 theme-specific structure
function getValue(x,y,t){

    let [wx, wy] = warp(x,y,t);

    if(theme === "ocean"){
        return Math.sin(wx*0.1 + t) + Math.cos(wy*0.1);
    }

    if(theme === "fire"){
        return Math.sin((wx+wy)*0.15 + t*2) * noise(wx,wy);
    }

    if(theme === "galaxy"){
        const dx = wx - w/2;
        const dy = wy - h/2;
        const d = Math.sqrt(dx*dx + dy*dy);
        return Math.sin(d*0.2 - t) + noise(dx,dy)*2;
    }

    if(theme === "marble"){
        return Math.sin(wx*0.2 + noise(wy,wx)*5);
    }

    return 0;
}

// 🎨 color
function getColor(v){
    const p = themes[theme];

    let n = (v+2)/4;
    n = Math.max(0, Math.min(1, n));

    if(n < 0.5){
        const k = n*2;
        return [
            p[0][0]+(p[1][0]-p[0][0])*k,
            p[0][1]+(p[1][1]-p[0][1])*k,
            p[0][2]+(p[1][2]-p[0][2])*k
        ];
    } else {
        const k = (n-0.5)*2;
        return [
            p[1][0]+(p[2][0]-p[1][0])*k,
            p[1][1]+(p[2][1]-p[1][1])*k,
            p[1][2]+(p[2][2]-p[1][2])*k
        ];
    }
}

// 🎬 draw
function draw(){

    const img = bctx.createImageData(w,h);

    for(let x=0;x<w;x++){
        for(let y=0;y<h;y++){

            const i=(x+y*w)*4;

            const v = getValue(x,y,t);
            const c = getColor(v);

            img.data[i]=c[0];
            img.data[i+1]=c[1];
            img.data[i+2]=c[2];
            img.data[i+3]=255;
        }
    }

    bctx.putImageData(img,0,0);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buffer,0,0,canvas.width,canvas.height);

    t += 0.05;
    requestAnimationFrame(draw);
}

// 🎯 generate
document.getElementById("generateBtn").onclick = ()=>{
    const prompt = document.getElementById("promptInput").value;
    theme = detectTheme(prompt);
};

draw();
