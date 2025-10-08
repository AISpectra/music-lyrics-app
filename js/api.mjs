// js/api.mjs

// En local usamos el proxy de Vite.
// En producción puedes dejarlo igual si tu host respeta CORS, o
// si necesitas proxy también en prod, lo resolvemos con Netlify redirects.
const TADB_BASE   = '/api/tadb/api/v1/json/2';
const LYRICS_BASE = '/api/lyrics/v1';

async function toJson(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (error) {
    console.warn('Failed to parse JSON response', error);
  }
  if (!res.ok) {
    throw { name: 'servicesError', message: data || { status: res.status } };
  }
  return data;
}

export default class Api {
  // ------- Artists -------
  async searchArtists(q) {
    const url = `${TADB_BASE}/search.php?s=${encodeURIComponent(q)}`;
    const data = await fetch(url).then(toJson);
    return data?.artists || [];
  }

  async artistById(id) {
    // ✅ El endpoint correcto es artist.php?i=
    const url = `${TADB_BASE}/artist.php?i=${encodeURIComponent(id)}`;
    const data = await fetch(url).then(toJson);
    return data?.artists?.[0] || null;
  }

  // ------- Tracks -------
  async searchTracks(q) {
    // 1) búsqueda por título
    const byName = `${TADB_BASE}/searchtrack.php?track=${encodeURIComponent(q)}`;
    let data = await fetch(byName).then(toJson);
    if (data?.track?.length) return data.track;

    // 2) patrón "artista - título"
    if (q.includes('-')) {
      const [artist, title] = q.split('-').map(s => s.trim());
      if (artist && title) {
        const byBoth = `${TADB_BASE}/searchtrack.php?s=${encodeURIComponent(artist)}&t=${encodeURIComponent(title)}`;
        data = await fetch(byBoth).then(toJson);
        if (data?.track?.length) return data.track;
      }
    }
    return [];
  }

  async topTracksByArtist(name) {
    const url = `${TADB_BASE}/track-top10.php?s=${encodeURIComponent(name)}`;
    const data = await fetch(url).then(toJson);
    return data?.track || [];
  }

  // ------- Albums -------
  async albumsByArtist(name) {
    const url = `${TADB_BASE}/searchalbum.php?s=${encodeURIComponent(name)}`;
    const data = await fetch(url).then(toJson);
    return data?.album || [];
  }

  // ------- Lyrics -------
  async lyrics(artist, title) {
    const url = `${LYRICS_BASE}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    let data = null;
    try {
      data = await res.json();
    } catch (error) {
      console.warn('Failed to parse lyrics response', error);
    }
    if (!res.ok) {
      throw { name: 'servicesError', message: data || { status: res.status } };
    }
    return data?.lyrics || '';
  }
}
