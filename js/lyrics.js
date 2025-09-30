import { loadHeaderFooter, getParam, qs, alertMessage } from './utils.mjs';
import Api from './api.mjs';

const api = new Api();

(async function(){
  await loadHeaderFooter();

  const artist = getParam('artist') || '';
  const track  = getParam('track') || '';
  const titleEl = qs('#song-title');
  const artistEl = qs('#song-artist');
  const pre = qs('#lyrics-body');

  if(!artist || !track){
    pre.textContent = 'Missing artist or track.';
    return;
  }

  titleEl.textContent = track;
  artistEl.textContent = artist;

  try{
    const lyrics = await api.lyrics(artist, track);
    pre.textContent = lyrics || 'Lyrics not found.';
  }catch(e){
    console.error(e);
    pre.textContent = 'Lyrics not available right now.';
    alertMessage('Lyrics service failed for this request.', {type:'error', scroll:false});
  }
})();
