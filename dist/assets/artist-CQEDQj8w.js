import{l as d,g as u,q as e}from"./utils-DoH-JBCW.js";import{A as p}from"./api-CAVFttsR.js";const n=new p;function h(t){return`
    <img src="${t.strArtistThumb||t.strArtistFanart||""}" alt="${t.strArtist}" onerror="this.style.display='none'"/>
    <div class="meta">
      <h1 style="margin:0 0 6px">${t.strArtist}</h1>
      <p>${t.strGenre||""} ${t.intFormedYear?"· since "+t.intFormedYear:""}</p>
      <p class="muted small">${t.strCountry||""}</p>
    </div>
  `}function y(t){return`
    <div class="item">
      <img src="${t.strTrackThumb||t.strAlbumThumb||""}" alt="${t.strTrack}" onerror="this.style.display='none'"/>
      <div style="flex:1">
        <div><strong>${t.strTrack}</strong></div>
        <div class="muted small">${t.strAlbum||""}</div>
      </div>
      <a class="btn" href="/lyrics.html?artist=${encodeURIComponent(t.strArtist)}&track=${encodeURIComponent(t.strTrack)}">Lyrics</a>
    </div>
  `}function A(t){return`
    <article class="card">
      <img class="thumb" src="${t.strAlbumThumb||""}" alt="${t.strAlbum}" onerror="this.style.display='none'"/>
      <div class="pad">
        <h3>${t.strAlbum}</h3>
        <p class="muted small">${t.intYearReleased||""}</p>
      </div>
    </article>
  `}(async function(){await d();const t=u("id");if(!t){location.href="/";return}const s=e("#artist-header"),l=e("#artist-tracks"),o=e("#artist-albums"),m=e("#tracks-empty"),c=e("#albums-empty");try{const r=await n.artistById(t);if(!r){s.innerHTML='<p class="muted">Artist not found.</p>';return}s.innerHTML=h(r);const[i,a]=await Promise.all([n.topTracksByArtist(r.strArtist),n.albumsByArtist(r.strArtist)]);i!=null&&i.length?l.innerHTML=i.map(y).join(""):m.hidden=!1,a!=null&&a.length?o.innerHTML=a.map(A).join(""):c.hidden=!1}catch(r){console.error(r),s.innerHTML='<p class="muted">Failed to load artist.</p>'}})();
