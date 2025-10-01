import{l as h,g as c,q as e,a as y}from"./utils-DoH-JBCW.js";import{A as $}from"./api-CAVFttsR.js";const l=new $;function A(t){const s=t.strArtistThumb||t.strArtistFanart||"";return`
    ${s?`<img src="${s}" alt="${t.strArtist}" onerror="this.style.display='none'"/>`:""}
    <div class="meta">
      <h1 style="margin:0 0 6px">${t.strArtist}</h1>
      <p>${t.strGenre||""} ${t.intFormedYear?"· since "+t.intFormedYear:""}</p>
      <p class="muted small">${t.strCountry||""}</p>
    </div>
  `}function f(t){const s=t.strTrackThumb||t.strAlbumThumb||"";return`
    <div class="item">
      ${s?`<img src="${s}" alt="${t.strTrack}" onerror="this.style.display='none'"/>`:""}
      <div style="flex:1">
        <div><strong>${t.strTrack}</strong></div>
        <div class="muted small">${t.strAlbum||""}</div>
      </div>
      <a class="btn" href="/lyrics.html?artist=${encodeURIComponent(t.strArtist)}&track=${encodeURIComponent(t.strTrack)}">Lyrics</a>
    </div>
  `}function T(t){const s=t.strAlbumThumb||"";return`
    <article class="card">
      ${s?`<img class="thumb" src="${s}" alt="${t.strAlbum}" onerror="this.style.display='none'"/>`:""}
      <div class="pad">
        <h3>${t.strAlbum}</h3>
        <p class="muted small">${t.intYearReleased||""}</p>
      </div>
    </article>
  `}(async function(){await h();const t=c("id"),s=c("name"),o=e("#artist-header"),m=e("#artist-tracks"),d=e("#artist-albums"),u=e("#tracks-empty"),p=e("#albums-empty");try{let r=null;if(t)try{r=await l.artistById(t)}catch{}if(!r&&s){const n=await l.searchArtists(s);r=(n==null?void 0:n[0])||null}if(!r){o.innerHTML='<p class="muted">Artist not found.</p>';return}o.innerHTML=A(r);const[a,i]=await Promise.all([l.topTracksByArtist(r.strArtist),l.albumsByArtist(r.strArtist)]);a!=null&&a.length?m.innerHTML=a.map(f).join(""):u.hidden=!1,i!=null&&i.length?d.innerHTML=i.map(T).join(""):p.hidden=!1}catch(r){console.error(r),y("Failed to load artist.",{type:"error"}),o.innerHTML='<p class="muted">Failed to load artist.</p>'}})();
