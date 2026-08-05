export const videoUrl = "https://www.youtube.com/";

export function setYear() {
  document.querySelectorAll("[data-year]").forEach((item) => { item.textContent = new Date().getFullYear(); });
}

export function setupNavigation() {
  const button = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Close" : "Menu";
  });
}

export function fillVideoLinks() {
  document.querySelectorAll("[data-video-link]").forEach((link) => { link.href = videoUrl; });
}
