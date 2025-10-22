/* =========================
   CONFIG - replace this
   ========================= */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID"; 
// Replace YOUR_FORM_ID with your Formspree form id (instructions below).
/* ========================= */

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;

/* Star particle system */
const stars = [];
const STAR_COUNT = Math.round((w*h)/70000); // responsive density
function rand(min,max){ return Math.random()*(max-min)+min }

function initStars(){
  stars.length = 0;
  for(let i=0;i<STAR_COUNT;i++){
    stars.push({
      x: rand(0,w),
      y: rand(0,h),
      r: rand(0.3,1.6),
      vx: rand(-0.05,0.05),
      vy: rand(0.02,0.2),
      alpha: rand(0.1,0.9),
      twinkle: Math.random()*0.03
    })
  }
}
initStars();

function resize(){
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  initStars();
}
addEventListener("resize", resize);

function draw(){
  ctx.clearRect(0,0,w,h);
  // subtle gradient overlay
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,"rgba(255,255,255,0.01)");
  g.addColorStop(1,"rgba(0,0,0,0.2)");
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,w,h);
  for(let s of stars){
    s.x += s.vx;
    s.y += s.vy;
    s.alpha += (Math.sin(performance.now()*0.001 + s.x)*0.005) * s.twinkle;
    if(s.x< -10) s.x = w+10;
    if(s.x> w+10) s.x = -10;
    if(s.y> h+20) s.y = -20;
    ctx.beginPath();
    ctx.globalAlpha = Math.max(0.05, Math.min(1, s.alpha));
    ctx.fillStyle = "white";
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
draw();

/* =========================
   Form handling
   ========================= */
const form = document.getElementById("applyForm");
const status = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function showStatus(msg, ok = true){
  status.textContent = msg;
  status.style.color = ok ? "#bfe8c6" : "#ffb3b3";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // basic front-end validation
  const data = {
    fullname: form.fullname.value.trim(),
    brand: form.brand.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    monthly: form.monthly.value.trim(),
    budget: form.budget.value.trim(),
    notes: form.notes.value.trim(),
    timestamp: new Date().toISOString()
  };

  if(!data.fullname || !data.brand || !data.email || !data.phone || !data.monthly || !data.budget){
    showStatus("Please fill in all required fields.", false);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    // If user didn't replace FORMSPREE_ENDPOINT, fallback to mailto (opens email client).
    if(FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")){
      // fallback: create mailto link
      const body = encodeURIComponent(
        `New Cyahh Scales lead:\n\nName: ${data.fullname}\nBrand: ${data.brand}\nEmail: ${data.email}\nPhone: ${data.phone}\nMonthly revenue: ${data.monthly}\nDaily budget: ${data.budget}\nNotes: ${data.notes}\nTime: ${data.timestamp}`
      );
      const mailto = `mailto:cyahhscales@gmail.com?subject=${encodeURIComponent("New Cyahh Scales Lead")}&body=${body}`;
      showStatus("No form endpoint set. Opening your email client...", true);
      setTimeout(()=>{ location.href = mailto; submitBtn.disabled=false; submitBtn.textContent="Submit Application"; }, 800);
      return;
    }

    // Post to Formspree
    const formData = new FormData();
    Object.entries(data).forEach(([k,v]) => formData.append(k,v));

    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    });

    const json = await res.json();
    if(res.ok){
      form.reset();
      showStatus("✅ Thanks — we'll contact you soon.", true);
    } else {
      showStatus(json.error || "Submission failed. Try again later.", false);
    }
  } catch (err){
    console.error(err);
    showStatus("Network error — try again.", false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Application";
  }
});
