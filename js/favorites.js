import { loadHeaderFooter, qs } from './utils.mjs';
import { getFavorites, removeFavorite } from './favorites.mjs';

function artistCard(favorite) {
  const thumb = favorite.thumb || '';
  const meta = [favorite.genre, favorite.country].filter(Boolean).join(' · ');
  const since = favorite.formedYear
    ? `Since ${favorite.formedYear}`
    : '';

  return `
    <article class="card" data-id="${favorite.id}">
      ${thumb
        ? `<img class="thumb" src="${thumb}" alt="${favorite.name}" onerror="this.style.display='none'"/>`
        : '<div class="thumb" aria-hidden="true" style="background:#0f1220"></div>'}
      <div class="pad">
        <h3>${favorite.name}</h3>
        <p class="muted small">${meta || '&nbsp;'}</p>
        ${since ? `<p class="muted small">${since}</p>` : ''}
        <div class="row" style="margin-top:10px;gap:10px;">
          <a class="btn" href="/artist.html?id=${encodeURIComponent(
            favorite.id
          )}&name=${encodeURIComponent(favorite.name)}">Open</a>
          <button class="btn secondary" type="button" data-remove>Remove</button>
        </div>
      </div>
    </article>
  `;
}

(function initFavoritesPage() {
  const grid = qs('#favorites-grid');
  const empty = qs('#favorites-empty');

  if (!grid || !empty) return;

  const render = (list) => {
    if (!list?.length) {
      grid.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    grid.innerHTML = list.map(artistCard).join('');

    grid.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const article = event.currentTarget.closest('[data-id]');
        if (!article) return;
        const { id } = article.dataset;
        removeFavorite(id);
      });
    });
  };

  window.addEventListener('favorites:change', (event) => {
    render(event.detail);
  });

  (async () => {
    await loadHeaderFooter();
    render(getFavorites());
  })();
})();