// js/suggest.mjs
import Api from './api.mjs';
import { debounce, fuzzyScore, uniqueBy, qs } from './utils.mjs';

const api = new Api();

/**
 * Adjunta sugerencias a un <input>.
 * @param {HTMLInputElement} input
 */
export function attachSuggest(input) {
  if (!input) return;

  // Contenedor de la lista de sugerencias
  const wrap = document.createElement('div');
  wrap.className = 'suggest';
  wrap.innerHTML = `<ul class="suggest-list" role="listbox" aria-label="Suggestions"></ul>`;
  wrap.style.display = 'none'; // 👈 aseguramos oculto al inicio

  // No pisar estilos existentes del padre
  const parent = input.parentElement;
  const prevPos = getComputedStyle(parent).position;
  if (prevPos === 'static') parent.style.position = 'relative';
  parent.appendChild(wrap);

  const list = wrap.querySelector('.suggest-list');

  // Vincular input con listbox para accesibilidad
  const listId = `suggest-${Math.random().toString(36).slice(2)}`;
  list.id = listId;
  input.setAttribute('aria-controls', listId);
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-expanded', 'false');

  let currentItems = [];
  let activeIndex = -1;
  let reqId = 0; // para descartar respuestas viejas

  const close = () => {
    list.innerHTML = '';
    wrap.style.display = 'none';
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
    currentItems = [];
  };

  const open = () => {
    const has = currentItems.length > 0;
    wrap.style.display = has ? 'block' : 'none';
    input.setAttribute('aria-expanded', has ? 'true' : 'false');
  };

  function render(items) {
    currentItems = items.slice(0, 8);
    if (!currentItems.length) {
      close();
      return;
    }
    list.innerHTML = currentItems
      .map((it, i) => {
        const icon = it.type === 'artist' ? '👤' : '♪';
        const optId = `${listId}-opt-${i}`;
        return `<li id="${optId}" class="suggest-item" role="option" data-i="${i}" aria-selected="${i===activeIndex}">
          <span class="ic">${icon}</span>
          <span class="main">${it.label}</span>
          ${it.sub ? `<span class="sub">${it.sub}</span>` : ''}
        </li>`;
      })
      .join('');
    open();
  }

  function pick(i) {
    const item = currentItems[i];
    if (!item) return;
    location.href = item.href;
  }

  function updateActive() {
    const items = list.querySelectorAll('.suggest-item');
    items.forEach((el, i) => {
      const active = i === activeIndex;
      el.classList.toggle('active', active);
      el.setAttribute('aria-selected', String(active));
      if (active) input.setAttribute('aria-activedescendant', el.id);
    });
    if (activeIndex < 0) input.removeAttribute('aria-activedescendant');
  }

  // Busca artistas y tracks y aplica fuzzy (con debounce + token anti-stale)
  const doSuggest = debounce(async (term) => {
    const q = term.trim();
    if (q.length < 2) {
      close();
      return;
    }

    const myReq = ++reqId;
    try {
      const [artists, tracks] = await Promise.all([
        api.searchArtists(q),
        api.searchTracks(q),
      ]);

      // Si llegó otra búsqueda más nueva, descarta esta
      if (myReq !== reqId) return;

      const artistItems = (artists || []).map(a => ({
        type: 'artist',
        label: a.strArtist,
        sub: a.strGenre || '',
        href: `/artist.html?id=${encodeURIComponent(a.idArtist)}`,
        _score: fuzzyScore(q, a.strArtist || '')
      }));

      const trackItems = (tracks || []).map(t => ({
        type: 'track',
        label: t.strTrack,
        sub: t.strArtist || '',
        href: `/lyrics.html?artist=${encodeURIComponent(t.strArtist)}&track=${encodeURIComponent(t.strTrack)}`,
        _score: Math.max(
          fuzzyScore(q, t.strTrack || ''),
          fuzzyScore(q, `${t.strArtist} ${t.strTrack}` || '')
        )
      }));

      let all = [...artistItems, ...trackItems];
      all = uniqueBy(all, x => `${x.type}:${x.label}:${x.sub}`);
      all.sort((a, b) => b._score - a._score);

      render(all);
    } catch {
      if (myReq === reqId) close();
    }
  }, 250);

  // Eventos de input/focus/blur
  input.addEventListener('input', () => doSuggest(input.value));
  input.addEventListener('focus', () => {
    if (currentItems.length) open();
  });
  input.addEventListener('blur', () => {
    // permite click en la lista antes de cerrar
    setTimeout(close, 150);
  });

  // Click en item (usar mousedown para evitar que blur cierre antes)
  list.addEventListener('mousedown', (e) => {
    const li = e.target.closest('.suggest-item');
    if (!li) return;
    e.preventDefault();
    const i = Number(li.dataset.i);
    pick(i);
  });

  // Hover: mover activo visual (opcional)
  list.addEventListener('mousemove', (e) => {
    const li = e.target.closest('.suggest-item');
    if (!li) return;
    const i = Number(li.dataset.i);
    if (i !== activeIndex) {
      activeIndex = i;
      updateActive();
    }
  });

  // Teclado
  input.addEventListener('keydown', (e) => {
    if (!currentItems.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % currentItems.length;
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + currentItems.length) % currentItems.length;
      updateActive();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        pick(activeIndex);
      }
    } else if (e.key === 'Escape') {
      close();
    }
  });
}

