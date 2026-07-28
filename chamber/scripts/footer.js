document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.querySelector('#currentyear');
  const modifiedEl = document.querySelector('#lastModified');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (modifiedEl) modifiedEl.textContent = document.lastModified;
});