const timestampField = document.querySelector('#timestamp');
const modalLinks = document.querySelectorAll('[data-modal]');
const dialogs = document.querySelectorAll('.modal-backdrop');
const closeButtons = document.querySelectorAll('.modal-close');

if (timestampField) {
  timestampField.value = new Date().toISOString();
}

modalLinks.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById(trigger.dataset.modal);
    if (target) {
      target.classList.add('active');
      target.querySelector('.modal')?.focus();
    }
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    button.closest('.modal-backdrop')?.classList.remove('active');
  });
});

dialogs.forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.classList.remove('active');
    }
  });
});
