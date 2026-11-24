const opener = document.querySelector("#opener");
const openBtn = document.querySelector("#openBtn");
const skipBtn = document.querySelector("#skipBtn");
const replayBtn = document.querySelector("#replayBtn");
const book = document.querySelector("#book");
const live = document.querySelector("#live");
const form = document.querySelector("#rsvpForm");
const thanks = document.querySelector("#thanks");
const thanksText = document.querySelector("#thanksText");
const formError = document.querySelector("#formError");
const countdown = document.querySelector("#countdown");
const hudKicker = document.querySelector("#hudKicker");
const hudIndex = document.querySelector("#hudIndex");
const hudFill = document.querySelector("#hudFill");
const frames = [...document.querySelectorAll(".frame")];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let opened = false;
let openTimer = 0;
let hideTimer = 0;

function daysUntil(iso) {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

if (countdown) {
  const days = daysUntil(countdown.dataset.date);
  if (days > 1) countdown.textContent = `${days} days from today`;
  else if (days === 1) countdown.textContent = "Tomorrow";
  else if (days === 0) countdown.textContent = "Today";
  else countdown.textContent = "A day we will keep";
}

const musicBtn = document.querySelector("#musicBtn");
const taleSong = document.querySelector("#taleSong");

function playTale() {
  if (!taleSong) return;
  taleSong.loop = true;
  taleSong.volume = 0.8;
  const started = taleSong.play();
  if (started && started.then) {
    started.then(() => {
      musicBtn.hidden = false;
      musicBtn.textContent = "Pause the music";
    }).catch(() => {
      musicBtn.hidden = true;
    });
  }
}

function pauseSong() {
  if (!taleSong) return;
  taleSong.pause();
  taleSong.currentTime = 0;
  musicBtn.hidden = true;
}

function revealReel() {
  document.documentElement.classList.add("reel-ready");
  opener.classList.add("is-gone");
  document.querySelector("#couple").classList.add("inview");
  live.textContent = "The invitation is open. Scroll to read every detail.";
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    opener.hidden = true;
  }, 850);
}

function untie() {
  if (opened) return;
  opened = true;
  openBtn.disabled = true;
  playTale();
  if (reduceMotion) {
    revealReel();
    return;
  }
  opener.classList.add("is-untying");
  clearTimeout(openTimer);
  openTimer = setTimeout(revealReel, 2500);
}

function replay() {
  clearTimeout(openTimer);
  clearTimeout(hideTimer);
  window.scrollTo(0, 0);
  opener.hidden = false;
  opener.classList.add("no-motion");
  opener.classList.remove("is-untying", "is-gone");
  document.documentElement.classList.remove("reel-ready", "on-dark");
  void opener.offsetWidth;
  opener.classList.remove("no-motion");
  opened = false;
  openBtn.disabled = false;
  live.textContent = "";
  pauseSong();
  musicBtn.hidden = true;
}

openBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  untie();
});
book.addEventListener("click", untie);
skipBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  if (opened) return;
  opened = true;
  openBtn.disabled = true;
  revealReel();
});
replayBtn.addEventListener("click", replay);
musicBtn.addEventListener("click", () => {
  if (!taleSong) return;
  if (taleSong.paused) {
    taleSong.play();
    musicBtn.textContent = "Pause the music";
  } else {
    taleSong.pause();
    musicBtn.textContent = "Play the music";
  }
});

document.addEventListener("keydown", (event) => {
  if (opened) return;
  if (event.key === "Enter" || event.key === " ") {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA") return;
    event.preventDefault();
    untie();
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("inview");
    const index = frames.indexOf(entry.target);
    hudIndex.textContent = String(index + 1).padStart(2, "0");
    hudKicker.textContent = entry.target.dataset.kicker || "";
    document.documentElement.classList.remove("on-dark");
    if (taleSong && entry.target === frames[frames.length - 1]) taleSong.loop = false;
  });
}, { threshold: 0.52 });

frames.forEach((frame) => observer.observe(frame));

document.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  hudFill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
}, { passive: true });

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = form.guest.value.trim();
  if (!name) {
    formError.textContent = "Write your name, so we can save your seat.";
    form.guest.focus();
    return;
  }
  formError.textContent = "";
  const coming = form.attending.value === "yes";
  thanksText.textContent = coming
    ? `${name}, your place is saved. We will look for you by the lake.`
    : `${name}, thank you for telling us. You will be missed, and you will be toasted.`;
  form.hidden = true;
  thanks.hidden = false;
});
