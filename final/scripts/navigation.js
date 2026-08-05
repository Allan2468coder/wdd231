const menuButton = document.querySelector('.menu-button');
const primaryNav = document.querySelector('.nav');

if (menuButton && primaryNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? 'Close' : 'Menu';
  });
}
