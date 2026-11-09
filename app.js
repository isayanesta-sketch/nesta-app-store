const $=id=>document.getElementById(id), appsEl=$("apps"), statusEl=$("status");
$("year").textContent=new Date().getFullYear();let all=[];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(){const q=$("search").value.toLowerCase(),cat=$("category").value;
const found=all.filter(a=>(!cat||a.category===cat)&&(`${a.name} ${a.description} ${a.category}`.toLowerCase().includes(q)));
appsEl.innerHTML=found.map(a=>`<article class="app"><h3>${esc(a.name)}</h3><div class="meta">${esc(a.category)} · Version ${esc(a.version)} · ${(a.size/1048576).toFixed(1)} MB</div><p class="desc">${esc(a.description||"Tsy mbola misy famaritana.")}</p><div class="meta">Téléchargements: ${a.downloads||0}</div><p><a class="download" href="/download/${encodeURIComponent(a.id)}">⬇ Télécharger APK</a></p></article>`).join("");
statusEl.textContent=found.length?`${found.length} application hita.`:"Mbola tsy misy application. Ampidirin'ny Admin aloha ny APK.";}
async function load(){try{const r=await fetch("/api/apps");if(!r.ok)throw Error();all=await r.json();const cats=[...new Set(all.map(a=>a.category).filter(Boolean))].sort();$("category").innerHTML='<option value="">Sokajy rehetra</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");render();}catch{statusEl.textContent="Tsy afaka mifandray amin'ny serveur. Jereo raha mandeha izy.";}}
$("search").addEventListener("input",render);$("category").addEventListener("change",render);load();
