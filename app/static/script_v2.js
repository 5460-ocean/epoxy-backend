alert("EPOXY V16 PRO");

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
let theme = "galaxy";
let direction = "flow";

// 🎨 themes
const themes = {
    ocean: [[0,80,200],[0,150,255],[180,230,255]],
    fire: [[180,20,0],[255,100,0],[255,200,0]],
    galaxy: [[20,0,50],[120,0,200],[255,0,180]],
    marble: [[240,240,240],[200,200,200],[100,100,100]]
};

function detectTheme(p){
    p = p.toLowerCase();
    if(p.includes("fire")) return "fire";
    if(p.includes("ocean")) return "ocean";
    if(p.includes("galaxy")) return "galaxy";
    if(p.includes("marble")) return "marble";
    return "galaxy";
}

// 🎯 direction control
function detectDirection(p){
    p = p.toLowerCase();
    if(p.includes("left")) return "left";
    if(p.includes("right")) return "right";
    if(p.includes("up")) return "up";
    if(p.includes("down")) return "down";
    if(p.includes("swirl")) return "swirl";
    return "flow";
}

// 🌊 base layer
function layer1(x,y,t){
    return Math.sin(x*0.08+t) + Math.cos(y*0.08-t);
}

// 🌊 secondary layer (adds depth)
function layer2(x,y,t){
    return Math.sin((x+y)*0.05 + t*0.7);
}

// 🌊 third layer (fine detail)
function layer3(x,y,t){
    return Math.cos(x*0.15 + y*0.15 + t*1.5);
}

// 🌪 direction warp
function applyDirection(x,y,t){

    if(direction === "left") return [x - t*10, y];
    if(direction === "right") return [x + t*10, y];
    if(direction === "up") return [x, y - t*10];
    if(direction === "down") return [x, y + t*10];

    if(direction === "swirl"){
        const dx = x - w/2;
        const dy = y - h/2;
        const angle = Math.atan2(dy,dx) + t*0.5;
        const dist = Math.sqrt(dx*dx+dy*dy);
        return [
            w/2 + Math.cos(angle)*dist,
            h/2 + Math.sin(angle)*dist
        ];
    }

    return [x,y];
}

// 🎨 combine layers
function field(x,y,t){
    let [wx,wy] = applyDirection(x,y,t);

    let v =
        layer1(wx,wy,t) +
        layer2(wx,wy,t) * 0.7 +
        layer3(wx,wy,t) * 0.4;

    return v;
}

// 🎨 color
function getColor(v){
    const p = themes[theme];

    let n = (v+2)/4;
    n = Math.max(0, Math.min(1,n));

    let c;

    if(n<0.5){
        let k=n*2;
        c = [
            p[0][0]+(p[1][0]-p[0][0])*k,
            p[0][1]+(p[1][1]-p[0][1])*k,
            p[0][2]+(p[1][2]-p[0][2])*k
        ];
    } else {
        let k=(n-0.5)*2;
        c = [
            p[1][0]+(p[2][0]-p[1][0])*k,
            p[1][1]+(p[2][1]-p[1][1])*k,
            p[1][2]+(p[2][2]-p[1][2])*k
        ];
    }

    return c;
}

// ✨ metallic shimmer (angle-based)
function metallic(x,y,t){
    return Math.sin((x+y)*0.2 + t*3);
}

// 💎 light
function light(x,y,t){
    const v1 = field(x,y,t);
    const v2 = field(x+1,y,t);
    const v3 = field(x,y+1,t);

    return Math.max(0,(v2-v1)+(v3-v1));
}

// 🎬 draw
function draw(){

    const img = bctx.createImageData(w,h);

    for(let x=0;x<w;x++){
        for(let y=0;y<h;y++){

            const i=(x+y*w)*4;

            let v = field(x,y,t);
            let c = getColor(v);

            // ✨ metallic
            let m = metallic(x,y,t);
            c[0] += m*40;
            c[1] += m*40;
            c[2] += m*40;

            // 💎 gloss
            let l = light(x,y,t);
            c[0] += l*120;
            c[1] += l*120;
            c[2] += l*120;

            // 🎯 depth
            c[0] *= 0.9 + v*0.1;
            c[1] *= 0.9 + v*0.1;
            c[2] *= 0.9 + v*0.1;

            img.data[i]   = Math.min(255,c[0]);
            img.data[i+1] = Math.min(255,c[1]);
            img.data[i+2] = Math.min(255,c[2]);
            img.data[i+3] = 255;
        }
    }

    bctx.putImageData(img,0,0);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buffer,0,0,canvas.width,canvas.height);

    t += 0.04;
    requestAnimationFrame(draw);
}

// 🎯 generate
document.getElementById("generateBtn").onclick = ()=>{
    const prompt = document.getElementById("promptInput").value;

    theme = detectTheme(prompt);
    direction = detectDirection(prompt);
};

draw();
