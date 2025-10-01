
const TADB = 'https://theaudiodb.com/api/v1/json/2'; // sin barra final
const LYRICS = 'https://api.lyrics.ovh/v1';

async function toJson(res) {
  let data = null;
  try { data = await res.json(); } catch (_) { /* ignore */ }
  if (!res.ok) {
    // Propaga objeto con más info
    throw { name: 'servicesError', message: data || { status: res.status } };
  }
  return data;
}

export default class Api {
  // ------- Artists -------
  async searchArtists(q) {
    const url = `${TADB}/search.php?s=${encodeURIComponent(q)}`;
    const data = await fetch(url).then(toJson);
    return data?.artists || [];
  }

  async artistById(id) {
    // CORRECCIÓN: lookup.php?i= (no artist.php)
    const url = `${TADB}/lookup.php?i=${encodeURIComponent(id)}`;
    const data = await fetch(url).then(toJson);
    return data?.artists?.[0] || null;
  }

  // ------- Tracks -------
  async searchTracks(q) {
    // 1) búsqueda por título
    const byName = `${TADB}/searchtrack.php?track=${encodeURIComponent(q)}`;
    let data = await fetch(byName).then(toJson);
    if (data?.track?.length) return data.track;

    // 2) patrón "artist - title"
    if (q.includes('-')) {
      const [artist, title] = q.split('-').map(s => s.trim());
      if (artist && title) {
        const byBoth = `${TADB}/searchtrack.php?s=${encodeURIComponent(artist)}&t=${encodeURIComponent(title)}`;
        data = await fetch(byBoth).then(toJson);
        if (data?.track?.length) return data.track;
      }
    }
    return [];
  }

  async topTracksByArtist(name) {
    const url = `${TADB}/track-top10.php?s=${encodeURIComponent(name)}`;
    const data = await fetch(url).then(toJson);
    return data?.track || [];
  }

  // ------- Albums -------
  async albumsByArtist(name) {
    const url = `${TADB}/searchalbum.php?s=${encodeURIComponent(name)}`;
    const data = await fetch(url).then(toJson);
    return data?.album || [];
  }

  // ------- Lyrics -------
  async lyrics(artist, title) {
    const url = `${LYRICS}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      throw { name: 'servicesError', message: data || { status: res.status } };
    }
    return data?.lyrics || '';
  }
}
