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

  // Wrapper de lista
  const wrap = document.createElement('div');
  wrap.className = 'suggest';
  wrap.innerHTML = `<ul class="suggest-list" role="listbox" aria-label="Suggestions"></ul>`;
  const parent = input.parentElement;
  const prevPos = getComputedStyle(parent).position;
  if (prevPos === 'static') parent.style.position = 'relative';
  parent.appendChild(wrap);

  const list = wrap.querySelector('.suggest-list');
  const listId = `suggest-${Math.random().toString(36).slice(2)}`;
  list.id = listId;
  input.setAttribute('aria-controls', listId);
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-expanded', 'false');

  let currentItems = [];
  let activeIndex = -1;
  let reqId = 0;

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
    currentItems = items.slice(0, 10);
    if (!currentItems.length) {
      list.innerHTML = `<li class="suggest-item empty" aria-disabled="true">No suggestions</li>`;
      wrap.style.display = 'block';
      input.setAttribute('aria-expanded', 'true');
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

  // --- Núcleo: buscar y fusionar candidatos con varios términos + artistas desde tracks
  const doSuggest = debounce(async (term) => {
    const q = term.trim();
    if (q.length < 2) {
      close();
      return;
    }

    const myReq = ++reqId;

    // preparar variantes de búsqueda (primera/última palabra)
    const parts = q.split(/\s+/).filter(Boolean);
    const first = parts[0];
    const last  = parts[parts.length - 1];

    // consultas en paralelo
    const tasks = [
      api.searchArtists(q),
      api.searchTracks(q)
    ];

    // si hay varias palabras proba también con first/last (ayuda con “biber” → bieber)
    if (first && first.toLowerCase() !== q.toLowerCase()) {
      tasks.push(api.searchArtists(first), api.searchTracks(first));
    }
    if (last && last.toLowerCase() !== first?.toLowerCase() && last.toLowerCase() !== q.toLowerCase()) {
      tasks.push(api.searchArtists(last), api.searchTracks(last));
    }

    try {
      const results = await Promise.allSettled(tasks);
      if (myReq !== reqId) return; // respuesta vieja

      const flat = (idx) => (results[idx]?.status === 'fulfilled' ? results[idx].value || [] : []);

      // Agrupar artistas/tracks devueltos
      const artistsAll = [
        ...flat(0),
        ...(results[2]?.status === 'fulfilled' ? results[2].value || [] : []),
        ...(results[4]?.status === 'fulfilled' ? results[4].value || [] : []),
      ];

      const tracksAll = [
        ...flat(1),
        ...(results[3]?.status === 'fulfilled' ? results[3].value || [] : []),
        ...(results[5]?.status === 'fulfilled' ? results[5].value || [] : []),
      ];

      // Sugerencias de artistas
      const artistItems = (artistsAll || []).map(a => ({
        type: 'artist',
        label: a.strArtist,
        sub: a.strGenre || '',
        href: `/artist.html?id=${encodeURIComponent(a.idArtist)}`,
        _score: fuzzyScore(q, a.strArtist || '')
      }));

      // Sugerencias de tracks
      const trackItems = (tracksAll || []).map(t => ({
        type: 'track',
        label: t.strTrack,
        sub: t.strArtist || '',
        href: `/lyrics.html?artist=${encodeURIComponent(t.strArtist)}&track=${encodeURIComponent(t.strTrack)}`,
        _score: Math.max(
          fuzzyScore(q, t.strTrack || ''),
          fuzzyScore(q, `${t.strArtist || ''} ${t.strTrack || ''}`)
        )
      }));

      // Extra: añadir artistas deducidos desde tracks (por si la búsqueda parcial no devuelve artist)
      const artistsFromTracks = Array.from(
        new Map( // dedupe por nombre
          (tracksAll || [])
            .filter(t => t.strArtist)
            .map(t => [t.strArtist.toLowerCase(), t.strArtist])
        ).values()
      ).map(name => ({
        type: 'artist',
        label: name,
        sub: '',
        href: `/artist.html?name=${encodeURIComponent(name)}`,
        _score: fuzzyScore(q, name)
      }));

      // Fusionar, deduplicar y ordenar
      let all = [...artistItems, ...trackItems, ...artistsFromTracks];
      all = uniqueBy(all, x => `${x.type}:${(x.label || '').toLowerCase()}:${(x.sub || '').toLowerCase()}`);
      all.sort((a, b) => b._score - a._score);

      render(all);
    } catch {
      if (myReq === reqId) {
        list.innerHTML = `<li class="suggest-item empty" aria-disabled="true">Suggestions unavailable</li>`;
        wrap.style.display = 'block';
        input.setAttribute('aria-expanded', 'true');
      }
    }
  }, 200);

  // Eventos
  input.addEventListener('input', () => doSuggest(input.value));
  input.addEventListener('focus', () => { if (currentItems.length) open(); });
  input.addEventListener('blur',  () => { setTimeout(close, 150); });

  // mousedown para no perder el focus antes de navegar
  list.addEventListener('mousedown', (e) => {
    const li = e.target.closest('.suggest-item');
    if (!li || li.classList.contains('empty')) return;
    e.preventDefault();
    pick(Number(li.dataset.i));
  });

  // hover → resalta opción
  list.addEventListener('mousemove', (e) => {
    const li = e.target.closest('.suggest-item');
    if (!li || li.classList.contains('empty')) return;
    const idx = Number(li.dataset.i);
    if (idx !== activeIndex) {
      activeIndex = idx;
      updateActive();
    }
  });

  // teclado
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
