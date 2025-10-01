import { loadHeaderFooter, getParam, qs, alertMessage } from './utils.mjs';
import Api from './api.mjs';

const api = new Api();

function headerTemplate(a) {
  const thumb = a.strArtistThumb || a.strArtistFanart || '';
  return `
    ${thumb ? `<img src="${thumb}" alt="${a.strArtist}" onerror="this.style.display='none'"/>` : ''}
    <div class="meta">
      <h1 style="margin:0 0 6px">${a.strArtist}</h1>
      <p>${a.strGenre || ''} ${a.intFormedYear ? '· since ' + a.intFormedYear : ''}</p>
      <p class="muted small">${a.strCountry || ''}</p>
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

(async function () {
  await loadHeaderFooter();

  const id   = getParam('id');     // idArtist (lo ideal)
  const name = getParam('name');   // fallback por nombre

  const headerEl = qs('#artist-header');
  const tracksEl = qs('#artist-tracks');
  const albumsEl = qs('#artist-albums');
  const tracksEmpty = qs('#tracks-empty');
  const albumsEmpty = qs('#albums-empty');

  try {
    let artist = null;

    // 1) Intentar por id
    if (id) {
      try {
        artist = await api.artistById(id);
      } catch (e) {
        // si lookup devuelve 404/servicio, seguimos al fallback por nombre
      }
    }

    // 2) Fallback por nombre (si vino en la URL)
    if (!artist && name) {
      const list = await api.searchArtists(name);
      artist = list?.[0] || null;
    }

    if (!artist) {
      headerEl.innerHTML = '<p class="muted">Artist not found.</p>';
      return;
    }

    headerEl.innerHTML = headerTemplate(artist);

    const [tracks, albums] = await Promise.all([
      api.topTracksByArtist(artist.strArtist),
      api.albumsByArtist(artist.strArtist)
    ]);

    if (tracks?.length) {
      tracksEl.innerHTML = tracks.map(trackItem).join('');
    } else {
      tracksEmpty.hidden = false;
    }

    if (albums?.length) {
      albumsEl.innerHTML = albums.map(albumCard).join('');
    } else {
      albumsEmpty.hidden = false;
    }
  } catch (err) {
    console.error(err);
    alertMessage('Failed to load artist.', { type: 'error' });
    headerEl.innerHTML = '<p class="muted">Failed to load artist.</p>';
  }
})();
