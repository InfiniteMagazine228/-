// game.js

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const levelEl = document.getElementById("level");
const skinEl = document.getElementById("skinName");

const W = canvas.width;
const H = canvas.height;
const GRAVITY = 0.55;

let keys = {};
let state = "menu";

let score = 0;
let coins = Number(localStorage.getItem("pqCoins") || 0);
let level = 1;
let skin = localStorage.getItem("pqSkin") || "Classic";

let player;
let grounds = [];
let coinsMap = [];
let enemies = [];
let flag = null;

/* =======================
   SAVE + UI
======================= */

function saveLocal(){
  localStorage.setItem("pqCoins", coins);
  localStorage.setItem("pqSkin", skin);
}

function updateUI(){
  scoreEl.textContent = score;
  coinsEl.textContent = coins;
  levelEl.textContent = level;
  skinEl.textContent = skin;
}

/* =======================
   MAP
======================= */

function resetWorld(){

  player = {
    x:80,
    y:300,
    w:34,
    h:44,
    vx:0,
    vy:0,
    onGround:false
  };

  grounds = [];
  coinsMap = [];
  enemies = [];

  grounds.push({x:0,y:470,w:2000,h:70});
  grounds.push({x:320,y:390,w:140,h:20});
  grounds.push({x:620,y:330,w:140,h:20});
  grounds.push({x:920,y:280,w:140,h:20});
  grounds.push({x:1240,y:350,w:140,h:20});

  for(let i=0;i<12;i++){
    coinsMap.push({
      x:180 + i*120,
      y:220 + Math.sin(i)*60,
      r:10,
      taken:false
    });
  }

  enemies.push({x:520,y:438,w:30,h:32,vx:-1});
  enemies.push({x:1120,y:248,w:30,h:32,vx:1});

  flag = {x:1780,y:300,w:20,h:170};
}

/* =======================
   COLLISION
======================= */

function hit(a,b){
  return a.x < b.x+b.w &&
         a.x+a.w > b.x &&
         a.y < b.y+b.h &&
         a.y+a.h > b.y;
}

/* =======================
   START
======================= */

function startGame(){
  score = 0;
  level = 1;
  state = "play";
  resetWorld();
  updateUI();
}

/* =======================
   INPUT
======================= */

window.addEventListener("keydown",e=>{
  keys[e.code]=true;
});

window.addEventListener("keyup",e=>{
  keys[e.code]=false;
});

/* MOBILE */
function bindHold(id,key){
  const btn = document.getElementById(id);

  btn.onpointerdown=()=>keys[key]=true;
  btn.onpointerup=()=>keys[key]=false;
  btn.onpointerleave=()=>keys[key]=false;
}

bindHold("leftBtn","ArrowLeft");
bindHold("rightBtn","ArrowRight");
bindHold("jumpBtn","Space");

/* =======================
   PLAYER
======================= */

function controlPlayer(){

  player.vx = 0;

  if(keys.ArrowLeft || keys.KeyA){
    player.vx = -4;
  }

  if(keys.ArrowRight || keys.KeyD){
    player.vx = 4;
  }

  if((keys.Space || keys.ArrowUp || keys.KeyW) && player.onGround){
    player.vy = -11;
    player.onGround = false;
  }

  player.vy += GRAVITY;

  player.x += player.vx;
  player.y += player.vy;

  player.onGround = false;

  for(const g of grounds){

    if(hit(player,g)){

      if(player.vy >= 0 && player.y + player.h - player.vy <= g.y + 10){
        player.y = g.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }

    }
  }

  if(player.y > H + 200){
    state = "dead";
  }
}

/* =======================
   COINS
======================= */

function updateCoins(){

  for(const c of coinsMap){

    if(c.taken) continue;

    const fake = {
      x:c.x-c.r,
      y:c.y-c.r,
      w:c.r*2,
      h:c.r*2
    };

    if(hit(player,fake)){
      c.taken = true;
      coins += 1;
      score += 25;
      saveLocal();
    }

  }

}

/* =======================
   ENEMY
======================= */

function updateEnemies(){

  for(const e of enemies){

    e.x += e.vx;

    if(e.x < 0 || e.x > 1800){
      e.vx *= -1;
    }

    if(hit(player,e)){

      if(player.vy > 0){
        e.dead = true;
        player.vy = -8;
        score += 100;
      }else{
        state = "dead";
      }

    }

  }

  enemies = enemies.filter(e=>!e.dead);
}

/* =======================
   WIN
======================= */

function checkWin(){

  if(hit(player,flag)){

    if(level < 5){
      level++;
      resetWorld();
    }else{
      state = "win";
    }

  }

}

/* =======================
   DRAW
======================= */

function drawBg(){

  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#38bdf8");
  g.addColorStop(1,"#dbeafe");

  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  ctx.fillStyle="rgba(255,255,255,.8)";
  ctx.beginPath();
  ctx.arc(120,90,35,0,Math.PI*2);
  ctx.arc(155,80,28,0,Math.PI*2);
  ctx.arc(185,92,24,0,Math.PI*2);
  ctx.fill();
}

function drawGround(){

  for(const g of grounds){
    ctx.fillStyle="#16a34a";
    ctx.fillRect(g.x,g.y,g.w,g.h);

    ctx.fillStyle="#14532d";
    ctx.fillRect(g.x,g.y,g.w,10);
  }

}

function drawCoins(){

  for(const c of coinsMap){

    if(c.taken) continue;

    ctx.beginPath();
    ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
    ctx.fillStyle="#facc15";
    ctx.fill();
  }

}

function drawEnemies(){

  for(const e of enemies){

    ctx.fillStyle="#7c2d12";
    ctx.fillRect(e.x,e.y,e.w,e.h);

    ctx.fillStyle="#fff";
    ctx.fillRect(e.x+6,e.y+8,5,5);
    ctx.fillRect(e.x+18,e.y+8,5,5);
  }

}

function drawFlag(){

  ctx.fillStyle="#713f12";
  ctx.fillRect(flag.x,flag.y,8,flag.h);

  ctx.fillStyle="#22c55e";
  ctx.fillRect(flag.x+8,flag.y+10,70,40);
}

function getSkinColor(){

  if(skin==="Gold") return "#facc15";
  if(skin==="Ninja") return "#111827";
  if(skin==="Frog") return "#22c55e";
  if(skin==="Galaxy") return "#8b5cf6";

  return "#ef4444";
}

function drawPlayer(){

  ctx.fillStyle = getSkinColor();
  ctx.fillRect(player.x,player.y,player.w,player.h);

  ctx.fillStyle="#fff";
  ctx.fillRect(player.x+6,player.y+8,6,6);
  ctx.fillRect(player.x+20,player.y+8,6,6);
}

function drawMessage(title,text){

  ctx.fillStyle="rgba(0,0,0,.6)";
  ctx.fillRect(220,180,520,160);

  ctx.fillStyle="#fff";
  ctx.font="bold 42px Arial";
  ctx.fillText(title,320,250);

  ctx.font="20px Arial";
  ctx.fillText(text,300,300);
}

/* =======================
   UPDATE
======================= */

function update(){

  if(state!=="play") return;

  controlPlayer();
  updateCoins();
  updateEnemies();
  checkWin();

  updateUI();
}

/* =======================
   RENDER
======================= */

function draw(){

  drawBg();
  drawGround();
  drawCoins();
  drawEnemies();
  drawFlag();
  drawPlayer();

  if(state==="menu"){
    drawMessage("Plumber Quest","Nhấn Chơi Ngay");
  }

  if(state==="dead"){
    drawMessage("Game Over","Nhấn Chơi Ngay để thử lại");
  }

  if(state==="win"){
    drawMessage("Chiến Thắng!","Bạn đã phá đảo");
  }

}

/* =======================
   LOOP
======================= */

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

/* =======================
   BUTTONS
======================= */

document.getElementById("startBtn").onclick = startGame;

document.getElementById("helpBtn").onclick = ()=>{
  alert("A/D hoặc ← → để đi. Space để nhảy. Ăn xu và chạm cờ để qua màn.");
};

document.querySelectorAll(".skinBtn").forEach(btn=>{

  btn.onclick = ()=>{

    const s = btn.dataset.skin;

    const prices = {
      Classic:0,
      Gold:100,
      Ninja:200,
      Frog:300,
      Galaxy:500
    };

    const price = prices[s];

    if(coins < price){
      alert("Không đủ xu.");
      return;
    }

    skin = s;
    saveLocal();
    updateUI();
  };

});

/* START */
resetWorld();
updateUI();
loop();
