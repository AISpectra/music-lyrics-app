import { loadHeaderFooter, getParam, qs, alertMessage, fmt } from './utils.mjs';
import Api from './api.mjs';

const api = new Api();

function artistCard(a){
  const thumb = a.strArtistThumb || a.strArtistFanart || '';
  return `
  <article class="card">
    <img class="thumb" src="${thumb}" alt="${a.strArtist}" onerror="this.style.display='none'"/>
    <div class="pad">
      <h3>${a.strArtist}</h3>
      <p class="muted small">${a.strGenre || ''} ${a.intFormedYear? '· since '+a.intFormedYear:''}</p>
      <div class="row">
        <a class="btn" href="/artist.html?id=${a.idArtist}">Open</a>
      </div>
    </div>
  </article>`;
}

function trackCard(t){
  const img = t.strTrackThumb || t.strAlbumThumb || '';
  const dur = fmt.duration(t.intDuration);
  return `
  <article class="card">
    <img class="thumb" src="${img}" alt="${t.strTrack}" onerror="this.style.display='none'"/>
    <div class="pad">
      <h3>${t.strTrack}</h3>
      <p class="muted small">${t.strArtist} ${dur? '· '+dur:''}</p>
      <div class="row">
        <a class="btn" href="/lyrics.html?artist=${encodeURIComponent(t.strArtist)}&track=${encodeURIComponent(t.strTrack)}">Lyrics</a>
      </div>
    </div>
  </article>`;
}

(async function(){
  await loadHeaderFooter();

  const q = getParam('q') || '';
  const title = qs('#results-title');
  const grid = qs('#results-grid');
  const empty = qs('#results-empty');

  if(title) title.textContent = `Results: ${q}`;

  if(!q){
    empty.hidden = false;
    alertMessage('Type something to search.');
    return;
  }

  try{
    const [artists, tracks] = await Promise.all([
      api.searchArtists(q),
      api.searchTracks(q)
    ]);

    const cards = [];
    if(artists?.length){
      cards.push(...artists.slice(0,12).map(artistCard));
    }
    if(tracks?.length){
      cards.push(...tracks.slice(0,12).map(trackCard));
    }

    if(!cards.length){
      empty.hidden = false;
      return;
    }

    grid.innerHTML = cards.join('');
  }catch(err){
    console.error(err);
    empty.hidden = false;
    alertMessage('Failed to fetch results. Try again in a moment.', {type:'error'});
  }
})();
