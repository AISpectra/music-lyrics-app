import{l as d,g as m,q as c,a as l,f as h}from"./utils-DoH-JBCW.js";import{A as u}from"./api-CAVFttsR.js";const o=new u;function p(t){return`
  <article class="card">
    <img class="thumb" src="${t.strArtistThumb||t.strArtistFanart||""}" alt="${t.strArtist}" onerror="this.style.display='none'"/>
    <div class="pad">
      <h3>${t.strArtist}</h3>
      <p class="muted small">${t.strGenre||""} ${t.intFormedYear?"· since "+t.intFormedYear:""}</p>
      <div class="row">
        <a class="btn" href="/artist.html?id=${t.idArtist}">Open</a>
      </div>
    </div>
  </article>`}function f(t){const r=t.strTrackThumb||t.strAlbumThumb||"",e=h.duration(t.intDuration);return`
  <article class="card">
    <img class="thumb" src="${r}" alt="${t.strTrack}" onerror="this.style.display='none'"/>
    <div class="pad">
      <h3>${t.strTrack}</h3>
      <p class="muted small">${t.strArtist} ${e?"· "+e:""}</p>
      <div class="row">
        <a class="btn" href="/lyrics.html?artist=${encodeURIComponent(t.strArtist)}&track=${encodeURIComponent(t.strTrack)}">Lyrics</a>
      </div>
    </div>
  </article>`}(async function(){await d();const t=m("q")||"",r=c("#results-title"),e=c("#results-grid"),n=c("#results-empty");if(r&&(r.textContent=`Results: ${t}`),!t){n.hidden=!1,l("Type something to search.");return}try{const[s,a]=await Promise.all([o.searchArtists(t),o.searchTracks(t)]),i=[];if(s!=null&&s.length&&i.push(...s.slice(0,12).map(p)),a!=null&&a.length&&i.push(...a.slice(0,12).map(f)),!i.length){n.hidden=!1;return}e.innerHTML=i.join("")}catch(s){console.error(s),n.hidden=!1,l("Failed to fetch results. Try again in a moment.",{type:"error"})}})();
