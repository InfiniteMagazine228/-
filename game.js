const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let player={
x:100,
y:400,
w:40,
h:50,
vx:0,
vy:0,
ground:false
};

let gravity=0.6;
let coins=0;
let score=0;
let skin="Classic";

let keys={};

window.onkeydown=e=>keys[e.code]=true;
window.onkeyup=e=>keys[e.code]=false;

function startGame(){
coins=0;
score=0;
player.x=100;
player.y=300;
}

function update(){

player.vx=0;

if(keys["ArrowLeft"]) player.vx=-5;
if(keys["ArrowRight"]) player.vx=5;

if(keys["Space"]&&player.ground){
player.vy=-12;
player.ground=false;
}

player.x+=player.vx;
player.y+=player.vy;
player.vy+=gravity;

if(player.y>460){
player.y=460;
player.vy=0;
player.ground=true;
}

score++;
}

function draw(){

ctx.clearRect(0,0,960,540);

ctx.fillStyle="#16a34a";
ctx.fillRect(0,510,960,30);

if(skin=="Classic") ctx.fillStyle="red";
if(skin=="Mario") ctx.fillStyle="orange";
if(skin=="Entity") ctx.fillStyle="purple";
if(skin=="Ghost") ctx.fillStyle="white";

ctx.fillRect(player.x,player.y,player.w,player.h);

ctx.fillStyle="yellow";
ctx.beginPath();
ctx.arc(600,450,12,0,Math.PI*2);
ctx.fill();

if(Math.abs(player.x-600)<40 && Math.abs(player.y-450)<40){
coins++;
player.x=100;
document.getElementById("coinText").innerText=coins;
}
}

function loop(){
update();
draw();
requestAnimationFrame(loop);
}
loop();

function buySkin(name,price){
if(coins<price) return alert("Không đủ coins");

coins-=price;
skin=name;

document.getElementById("coinText").innerText=coins;
document.getElementById("skinText").innerText=skin;
}

async function saveCloud(){

const {data:{user}}=await supabase.auth.getUser();

if(!user) return alert("Login trước");

await supabase
.from("leaderboard")
.upsert({
email:user.email,
score:score,
coins:coins,
skin:skin
});

alert("Saved");
loadLeaderboard();
}

async function loadCloud(){

const {data:{user}}=await supabase.auth.getUser();

if(!user) return;

const {data}=await supabase
.from("leaderboard")
.select("*")
.eq("email",user.email)
.single();

if(data){
coins=data.coins||0;
skin=data.skin||"Classic";
document.getElementById("coinText").innerText=coins;
document.getElementById("skinText").innerText=skin;
}
}

async function loadLeaderboard(){

const {data}=await supabase
.from("leaderboard")
.select("*")
.order("score",{ascending:false})
.limit(10);

let html="";

data.forEach((x,i)=>{
html+=`<div>#${i+1} ${x.email} - ${x.score}</div>`;
});

document.getElementById("leaderboard").innerHTML=html;
}
