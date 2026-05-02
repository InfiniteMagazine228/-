const supabase = window.supabase.createClient(
"https://gkxzlfaoshjgbatmfnyl.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreHpsZmFvc2hqZ2JhdG1mbnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjQ1MjAsImV4cCI6MjA5MzI0MDUyMH0.LzhQIbniEp42-h0MbNU4V1cfjNGoHykoLet5c479GSI"
);

async function register(){
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

await supabase.auth.signUp({email,password});
alert("Đăng ký thành công");
}

async function login(){
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const {data,error}=await supabase.auth.signInWithPassword({email,password});

if(error) return alert(error.message);

document.getElementById("userText").innerText=data.user.email;

loadCloud();
loadLeaderboard();
}

async function logout(){
await supabase.auth.signOut();
location.reload();
}
