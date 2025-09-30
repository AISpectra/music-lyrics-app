// DOM + storage
export const qs = (sel, parent=document)=>parent.querySelector(sel);
export const qsa = (sel, parent=document)=>[...parent.querySelectorAll(sel)];
export const getLS = (k)=>JSON.parse(localStorage.getItem(k) || 'null');
export const setLS = (k,v)=>localStorage.setItem(k, JSON.stringify(v));

export function getParam(name){
  const p = new URLSearchParams(location.search);
  return p.get(name);
}

export function alertMessage(message, {type='info', scroll=true} = {}){
  let host = qs('main') || document.body;
  const el = document.createElement('div');
  el.className = `alert ${type}`;
  el.textContent = message;
  el.style.cssText = `
    background:#1a1d2b;border:1px solid #2a2d40;color:#fff;padding:12px 14px;border-radius:10px;
    margin:10px 0; box-shadow:0 8px 24px rgba(0,0,0,.25)
  `;
  host.prepend(el);
  if(scroll) window.scrollTo({top:0, behavior:'smooth'});
  setTimeout(()=>el.remove(), 4000);
}

export async function loadTemplate(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`Template load error: ${path}`);
  return await res.text();
}

export async function loadHeaderFooter(){
  const [h,f] = await Promise.all([
    loadTemplate('/partials/header.html'),
    loadTemplate('/partials/footer.html')
  ]);

  const hEl = qs('#site-header'), fEl = qs('#site-footer');
  if(hEl){ hEl.innerHTML = h; wireHeaderSearch(hEl); }
  if(fEl){ fEl.innerHTML = f; }
}

function wireHeaderSearch(root){
  const form = qs('#header-search', root);
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const term = new FormData(form).get('q')?.trim();
    if(!term) return;
    location.href = `/results.html?q=${encodeURIComponent(term)}`;
  });
}

// helpers
export const fmt = {
  duration(ms){
    if(!ms) return '';
    const s = Math.round(Number(ms)/1000);
    const m = Math.floor(s/60);
    const r = (s%60).toString().padStart(2,'0');
    return `${m}:${r}`;
  }
};
