alert("EPOXY V15 MATERIAL");

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

// 🌊 base field
function base(x,y,t){
    return Math.sin(x*0.08+t) + Math.cos(y*0.08-t);
}

// 🌪 warp
function warp(x,y,t){
    return [
        x + Math.sin(y*0.12+t)*3,
        y + Math.cos(x*0.12-t)*3
    ];
}

// 🎨 structure
function field(x,y,t){
    let [wx,wy] = warp(x,y,t);

    if(theme==="galaxy"){
        let dx=wx-w/2, dy=wy-h/2;
        let d=Math.sqrt(dx*dx+dy*dy);
        return Math.sin(d*0.12 - t) + base(wx,wy,t);
    }

    if(theme==="fire"){
        return base(wx,wy,t*2) + Math.sin((wx+wy)*0.1);
    }

    if(theme==="ocean"){
        return base(wx,wy,t);
    }

    if(theme==="marble"){
        return Math.sin(wx*0.15 + Math.sin(wy*0.1+t)*3);
    }

    return 0;
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

// 💎 specular light (based on gradient)
function light(x,y,t){
    const v1 = field(x,y,t);
    const v2 = field(x+1,y,t);
    const v3 = field(x,y+1,t);

    const dx = v2 - v1;
    const dy = v3 - v1;

    const intensity = Math.max(0, dx + dy);
    return intensity;
}

// 🎯 edge / pigment boundary
function edge(v){
    return Math.abs(Math.sin(v*3));
}

// 🎬 draw
function draw(){

    const img = bctx.createImageData(w,h);

    for(let x=0;x<w;x++){
        for(let y=0;y<h;y++){

            const i=(x+y*w)*4;

            let v = field(x,y,t);

            let c = getColor(v);

            // 🎯 pigment boundary
            let e = edge(v);
            c[0] *= (1 - e*0.3);
            c[1] *= (1 - e*0.3);
            c[2] *= (1 - e*0.3);

            // 💎 gloss
            let l = light(x,y,t);
            c[0] += l*120;
            c[1] += l*120;
            c[2] += l*120;

            // 🎯 depth shading
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

document.getElementById("generateBtn").onclick = ()=>{
    const prompt = document.getElementById("promptInput").value;
    theme = detectTheme(prompt);
};

draw();
