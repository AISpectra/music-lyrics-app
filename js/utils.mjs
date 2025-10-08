
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


export const fmt = {
  duration(ms){
    if(!ms) return '';
    const s = Math.round(Number(ms)/1000);
    const m = Math.floor(s/60);
    const r = (s%60).toString().padStart(2,'0');
    return `${m}:${r}`;
  }
};




export function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}


export function normalize(str = "") {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}


export function editDistance(a = "", b = "") {
  a = normalize(a);
  b = normalize(b);
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}


export function fuzzyScore(query, text) {
  const q = normalize(query);
  const t = normalize(text);
  if (!q || !t) return 0;
  if (t.startsWith(q)) return 1.0;     
  if (t.includes(q)) return 0.8;       
  const dist = editDistance(q, t);     
  const maxLen = Math.max(q.length, t.length);
  return Math.max(0, 1 - dist / (maxLen || 1)) * 0.7;
}


export function uniqueBy(arr, keyFn) {
  const seen = new Set();
  return arr.filter((x) => {
    const k = keyFn(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
