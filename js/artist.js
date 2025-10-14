// js/artist.js
import { loadHeaderFooter, getParam, qs, alertMessage } from './utils.mjs';
import { attachSuggest } from './suggest.mjs';
import Api from './api.mjs';
import {
  toggleFavorite,
  isFavorite,
  asFavoritePayload,
} from './favorites.mjs';

const api = new Api();

function headerTemplate(a) {
  const thumb = a.strArtistThumb || a.strArtistFanart || '';
  return `
    ${thumb ? `<img src="${thumb}" alt="${a.strArtist}" onerror="this.style.display='none'"/>` : ''}
    <div class="meta">
      <h1 style="margin:0 0 6px">${a.strArtist}</h1>
      <p>${a.strGenre || ''} ${a.intFormedYear ? '· since ' + a.intFormedYear : ''}</p>
      <p class="muted small">${a.strCountry || ''}</p>
      <div class="row" style="margin-top:12px;gap:12px;">
        <button class="btn secondary" type="button" data-favorite-btn aria-pressed="false">
          Save to favorites
        </button>
      </div>
    </div>
  `;
}

function trackItem(t) {
  const img = t.strTrackThumb || t.strAlbumThumb || '';
  return `
    <div class="item">
      ${img ? `<img src="${img}" alt="${t.strTrack}" onerror="this.style.display='none'"/>` : ''}
      <div style="flex:1">
        <div><strong>${t.strTrack}</strong></div>
        <div class="muted small">${t.strAlbum || ''}</div>
      </div>
      <a class="btn" href="/lyrics.html?artist=${encodeURIComponent(t.strArtist)}&track=${encodeURIComponent(t.strTrack)}">Lyrics</a>
    </div>
  `;
}

function albumCard(alb) {
  const img = alb.strAlbumThumb || '';
  return `
    <article class="card">
      ${img ? `<img class="thumb" src="${img}" alt="${alb.strAlbum}" onerror="this.style.display='none'"/>` : ''}
      <div class="pad">
        <h3>${alb.strAlbum}</h3>
        <p class="muted small">${alb.intYearReleased || ''}</p>
      </div>
    </article>
  `;
}

// dedupe helpers
function uniqueBy(arr, keyFn) {
  const seen = new Set();
  return (arr || []).filter(x => {
    const k = keyFn(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

(async function () {
  await loadHeaderFooter();

  // activar sugerencias en header
  const headerInput = qs('#header-search input');
  if (headerInput) attachSuggest(headerInput);

  const id   = getParam('id');     // idArtist (preferido)
  const name = getParam('name');   // fallback por nombre

  const headerEl = qs('#artist-header');
  const tracksEl = qs('#artist-tracks');
  const albumsEl = qs('#artist-albums');
  const tracksEmpty = qs('#tracks-empty');
  const albumsEmpty = qs('#albums-empty');

  // estado de carga
  headerEl.innerHTML = `<p class="muted">Loading artist…</p>`;
  tracksEl.innerHTML = `<p class="muted">Loading top tracks…</p>`;
  albumsEl.innerHTML = `<p class="muted">Loading albums…</p>`;
  tracksEmpty.hidden = true;
  albumsEmpty.hidden = true;

  try {
    let artist = null;

    // 1) Buscar por id
    if (id) {
      try {
        artist = await api.artistById(id);
      } catch (error) {
        console.warn('Artist lookup by id failed, falling back to name search', error);
        // seguir al fallback si falla
      }
    }

    // 2) Fallback: por nombre (si vino)
    if (!artist && name) {
      const list = await api.searchArtists(name);
      artist = list?.[0] || null;
    }

    if (!artist) {
      headerEl.innerHTML = '<p class="muted">Artist not found.</p>';
      tracksEl.innerHTML = '';
      albumsEl.innerHTML = '';
      tracksEmpty.hidden = false;
      albumsEmpty.hidden = false;
      return;
    }

    headerEl.innerHTML = headerTemplate(artist);

        const favBtn = qs('[data-favorite-btn]', headerEl);
    const payload = asFavoritePayload(artist);

    if (!payload.id && favBtn) {
      favBtn.disabled = true;
      favBtn.textContent = 'Unavailable';
      favBtn.setAttribute('aria-disabled', 'true');
    }

    const refreshFavBtn = (state) => {
      if (!favBtn) return;
      favBtn.textContent = state ? 'Remove from favorites' : 'Save to favorites';
      favBtn.setAttribute('aria-pressed', state ? 'true' : 'false');
      favBtn.classList.toggle('is-favorite', state);
    };

    if (payload.id) {
      refreshFavBtn(isFavorite(payload.id));

      favBtn?.addEventListener('click', () => {
        const { favorite } = toggleFavorite(payload);
        refreshFavBtn(favorite);
        alertMessage(
          favorite
            ? `${artist.strArtist} added to favorites!`
            : `${artist.strArtist} removed from favorites.`,
          { type: 'success', scroll: false }
        );
      });
    }

    const [tracksRaw, albumsRaw] = await Promise.all([
      api.topTracksByArtist(artist.strArtist),
      api.albumsByArtist(artist.strArtist)
    ]);

    // quitar duplicados
    const tracks = uniqueBy(tracksRaw, t => t.idTrack || `${t.strArtist}:${t.strTrack}`);
    const albums = uniqueBy(albumsRaw, a => a.idAlbum || a.strAlbum);

    if (tracks?.length) {
      tracksEl.innerHTML = tracks.map(trackItem).join('');
      tracksEmpty.hidden = true;
    } else {
      tracksEl.innerHTML = '';
      tracksEmpty.hidden = false;
    }

    if (albums?.length) {
      albumsEl.innerHTML = albums.map(albumCard).join('');
      albumsEmpty.hidden = true;
    } else {
      albumsEl.innerHTML = '';
      albumsEmpty.hidden = false;
    }
  } catch (err) {
    console.error(err);
    alertMessage('Failed to load artist.', { type: 'error' });
    headerEl.innerHTML = '<p class="muted">Failed to load artist.</p>';
    tracksEl.innerHTML = '';
    albumsEl.innerHTML = '';
    tracksEmpty.hidden = false;
    albumsEmpty.hidden = false;
  }
})();

