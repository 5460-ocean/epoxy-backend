alert("EPOXY V12 FINAL");

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

// 🌊 structure
function getValue(x,y,t){
    if(theme === "ocean"){
        return Math.sin(x*0.08+t) + Math.cos(y*0.08-t);
    }
    if(theme === "fire"){
        return Math.sin((x+y)*0.12+t*2)*Math.cos(y*0.1-t);
    }
    if(theme === "galaxy"){
        const dx=x-w/2, dy=y-h/2;
        const d=Math.sqrt(dx*dx+dy*dy);
        return Math.sin(d*0.15-t)+Math.cos((dx+dy)*0.05);
    }
    if(theme === "marble"){
        return Math.sin(x*0.15 + Math.sin(y*0.1+t)*5);
    }
    return 0;
}

// 🧪 cellular effect
function cells(x,y,t){
    return Math.abs(Math.sin(x*0.3 + Math.cos(y*0.3+t)*2));
}

// 🎨 color
function getColor(v){
    const p = themes[theme];
    let n=(v+2)/4;
    n=Math.max(0,Math.min(1,n));

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

// 💎 gloss highlight
function gloss(x,y,t){
    return Math.sin(x*0.15 + t*2) > 0.95 ? 1 : 0;
}

// 🎯 edge depth
function edge(x,y){
    const d = Math.min(x,y,w-x,h-y);
    return Math.max(0, 1 - d/10);
}

// 🎬 draw
function draw(){

    const img = bctx.createImageData(w,h);

    for(let x=0;x<w;x++){
        for(let y=0;y<h;y++){

            const i=(x+y*w)*4;

            let v = getValue(x,y,t);

            // 🧪 apply cells
            v += cells(x,y,t)*0.8;

            const c = getColor(v);

            let r=c[0], g=c[1], b=c[2];

            // 💎 gloss
            if(gloss(x,y,t)){
                r=255; g=255; b=255;
            }

            // 🎯 edge darkening
            const e = edge(x,y);
            r *= (1 - e*0.3);
            g *= (1 - e*0.3);
            b *= (1 - e*0.3);

            img.data[i]=r;
            img.data[i+1]=g;
            img.data[i+2]=b;
            img.data[i+3]=255;
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
};

draw();
