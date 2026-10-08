const filters = document.querySelectorAll('[data-filter]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  document.querySelectorAll('.project').forEach(project => { project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter; });
}));
const dialog = document.querySelector('#details');
function showDetails(title, copy) { document.querySelector('#dialog-title').textContent = title; document.querySelector('#dialog-copy').textContent = copy; dialog.showModal(); }
document.querySelectorAll('.project').forEach(project => project.addEventListener('click', () => showDetails(project.dataset.title, 'This is a placeholder for your own work. Add a project name, screenshots, the problem you solved, your contribution, technologies used, and a live or repository link to turn it into a complete case study.')));
document.querySelector('#contact-button').addEventListener('click', () => showDetails('Let’s make it yours.', 'Contact information has not been added yet. Provide your preferred email address and professional profile links to connect this portfolio with you.'));
document.querySelectorAll('.close,.dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
