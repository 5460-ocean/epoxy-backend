alert("EPOXY REALISM V5");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let t = 0;
let theme = "ocean";

const themes = {
    ocean: [[0,80,200],[0,150,255],[180,230,255]],
    fire: [[180,20,0],[255,100,0],[255,200,0]],
    galaxy: [[20,0,50],[100,0,180],[255,0,180]],
    marble: [[240,240,240],[190,190,190],[100,100,100]]
};

function detectTheme(prompt) {
    const p = prompt.toLowerCase();
    if (p.includes("fire")) return "fire";
    if (p.includes("ocean") || p.includes("water")) return "ocean";
    if (p.includes("galaxy")) return "galaxy";
    if (p.includes("marble")) return "marble";
    return "ocean";
}

function noise(x,y,t){
    return Math.sin(x*0.03+t)+Math.cos(y*0.03-t)+Math.sin((x+y)*0.02+t);
}

function layered(x,y,t){
    return noise(x,y,t)*0.6 + noise(x*2,y*2,t*1.5)*0.4;
}

function distort(x,y,t){
    return {
        x:x+Math.sin(y*0.05+t*2)*40,
        y:y+Math.cos(x*0.05-t*2)*40
    };
}

function getBaseColor(v){
    const p = themes[theme];
    let n = (v+3)/6;
    n = Math.max(0,Math.min(1,n));

    if(n<0.5){
        const k=n*2;
        return [
            p[0][0]+(p[1][0]-p[0][0])*k,
            p[0][1]+(p[1][1]-p[0][1])*k,
            p[0][2]+(p[1][2]-p[0][2])*k
        ];
    } else {
        const k=(n-0.5)*2;
        return [
            p[1][0]+(p[2][0]-p[1][0])*k,
            p[1][1]+(p[2][1]-p[1][1])*k,
            p[1][2]+(p[2][2]-p[1][2])*k
        ];
    }
}

// 💎 glossy reflection
function reflection(x,y,t){
    return Math.max(0,
        Math.sin(x*0.02+t*3)*0.5 +
        Math.cos(y*0.03+t*2)*0.5
    );
}

// 🎯 edge pooling
function edgePool(x,y){
    const edgeDist = Math.min(
        x,
        y,
        canvas.width-x,
        canvas.height-y
    );

    return Math.max(0, 1 - edgeDist/80);
}

function draw(){
    const img = ctx.createImageData(canvas.width, canvas.height);

    for(let x=0;x<canvas.width;x++){
        for(let y=0;y<canvas.height;y++){

            const i=(x+y*canvas.width)*4;

            const d = distort(x,y,t);

            // 🌊 depth refraction
            const n1 = layered(d.x,d.y,t);
            const n2 = layered(d.x+20,d.y+20,t*0.7);

            const base = getBaseColor((n1+n2)*0.5);

            const shine = reflection(x,y,t);
            const pool = edgePool(x,y);

            let r = base[0];
            let g = base[1];
            let b = base[2];

            // 💎 shine
            r += shine*35;
            g += shine*35;
            b += shine*35;

            // 🎯 darker edge pooling
            r *= (1 - pool*0.15);
            g *= (1 - pool*0.15);
            b *= (1 - pool*0.15);

            img.data[i] = Math.min(255,r);
            img.data[i+1] = Math.min(255,g);
            img.data[i+2] = Math.min(255,b);
            img.data[i+3] = 255;
        }
    }

    ctx.putImageData(img,0,0);

    t += 0.04;
    requestAnimationFrame(draw);
}

document.getElementById("generateBtn").onclick = ()=>{
    const prompt = document.getElementById("promptInput").value;
    theme = detectTheme(prompt);
};

draw();
