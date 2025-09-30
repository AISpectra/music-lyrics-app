import { loadHeaderFooter, qs } from './utils.mjs';

(async function(){
  await loadHeaderFooter();

  // main search form
  const form = qs('#search-form');
  form?.addEventListener('submit', e=>{
    e.preventDefault();
    const term = new FormData(form).get('q')?.trim();
    if(!term) return;
    location.href = `/results.html?q=${encodeURIComponent(term)}`;
  });

  // chips
  document.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const q = btn.dataset.query;
      location.href = `/results.html?q=${encodeURIComponent(q)}`;
    });
  });
})();
