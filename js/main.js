// js/main.js
import { loadHeaderFooter, qs } from './utils.mjs';
import { attachSuggest } from './suggest.mjs'; // 👈 nuevo

(async function () {
  // 1️⃣ Carga header y footer
  await loadHeaderFooter();

  // 2️⃣ Formulario principal
  const form = qs('#search-form');
  const input = qs('#q', form);
  if (input) attachSuggest(input); // 👈 añade autocompletado

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = new FormData(form).get('q')?.trim();
    if (!term) return;
    location.href = `/results.html?q=${encodeURIComponent(term)}`;
  });

  // 3️⃣ Chips
  document.querySelectorAll('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.query;
      location.href = `/results.html?q=${encodeURIComponent(q)}`;
    });
  });

  // 4️⃣ También agrega sugerencias al buscador del header (si existe)
  const headerInput = qs('#header-search input');
  if (headerInput) attachSuggest(headerInput);
})();

