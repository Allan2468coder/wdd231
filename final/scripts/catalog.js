import { fillVideoLinks, setYear, setupNavigation } from "./site.js";

const grid = document.querySelector("#tool-grid");
const dialog = document.querySelector("#tool-dialog");
const filter = document.querySelector("#category-filter");
const savedKey = "growwell-saved-tools";
let tools = [];
let saved = new Set(JSON.parse(localStorage.getItem(savedKey) || "[]"));

function saveFavorites() { localStorage.setItem(savedKey, JSON.stringify([...saved])); }

function card(tool) {
  const pressed = saved.has(tool.id);
  return `<article class="tool-card"><p class="tag">${tool.category}</p><h3>${tool.name}</h3><p>${tool.summary}</p><div class="tool-meta"><span><strong>Type:</strong> ${tool.type}</span><span><strong>Best for:</strong> ${tool.idealFor}</span><span><strong>Time:</strong> ${tool.time}</span><span><strong>ID:</strong> ${String(tool.id).padStart(2, "0")}</span></div><div class="tool-actions"><button class="text-button" type="button" data-details="${tool.id}">View details</button><button class="favorite-button" type="button" data-save="${tool.id}" aria-label="Save ${tool.name}" aria-pressed="${pressed}">${pressed ? "♥" : "♡"}</button></div></article>`;
}

function render() {
  const active = filter.value;
  const visible = active === "All" ? tools : tools.filter((tool) => tool.category === active);
  grid.innerHTML = visible.map(card).join("") || `<p class="empty">No guides match that category yet.</p>`;
}

function showDetails(id) {
  const tool = tools.find((entry) => entry.id === Number(id));
  dialog.querySelector(".dialog-content").innerHTML = `<button class="dialog-close" type="button" aria-label="Close details">×</button><p class="eyebrow">${tool.category} guide</p><h2>${tool.name}</h2><p>${tool.summary}</p><p><strong>Format:</strong> ${tool.type}<br><strong>Ideal for:</strong> ${tool.idealFor}<br><strong>Time needed:</strong> ${tool.time}</p><button class="button" type="button" data-close-dialog>Got it</button>`;
  dialog.showModal();
}

async function getTools() {
  try {
    const response = await fetch("data/farm-tools.json");
    if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
    tools = await response.json();
    render();
  } catch (error) {
    grid.innerHTML = `<p class="empty">We could not load the field guides. Please refresh and try again.</p>`;
    console.error(error);
  }
}

filter.addEventListener("change", render);
grid.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-details]");
  const saveButton = event.target.closest("[data-save]");
  if (detailButton) showDetails(detailButton.dataset.details);
  if (saveButton) { const id = Number(saveButton.dataset.save); saved.has(id) ? saved.delete(id) : saved.add(id); saveFavorites(); render(); }
});
dialog.addEventListener("click", (event) => { if (event.target === dialog || event.target.closest("[data-close-dialog], .dialog-close")) dialog.close(); });
setYear(); setupNavigation(); fillVideoLinks(); getTools();
