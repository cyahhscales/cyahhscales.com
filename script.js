const form = document.getElementById("brandForm");
const thankYou = document.getElementById("thankYou");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.classList.add("hidden");
  thankYou.classList.remove("hidden");
});
