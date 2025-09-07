// DV Drone - Gallery v1 (vanilla JS, no deps)
// Expects: photos.json [{src, alt, w, h}] and a <div id="gallery" class="gallery"></div>

(function(){
  const $ = (s, d=document) => d.querySelector(s);

  const container = $("#gallery");
  if (!container) return;

  // Lightbox
  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.setAttribute("aria-hidden","true");
  lb.style.cssText = [
    "position:fixed","inset:0","display:none","place-items:center",
    "background:rgba(0,0,0,.85)","z-index:9999","padding:24px"
  ].join(";");
  lb.innerHTML = `
    <figure style="margin:0;max-width:min(1200px,90vw);max-height:80vh;display:grid;gap:8px;justify-items:center">
      <img id="lb-img" alt="" style="max-width:100%;max-height:70vh;border-radius:12px;border:1px solid #2a3a28"/>
      <figcaption id="lb-cap" style="color:#dbe7d2;font:14px/1.4 system-ui,Segoe UI,Inter,sans-serif;text-align:center"></figcaption>
      <div style="display:flex;gap:12px">
        <button id="lb-prev" class="btn" aria-label="Image précédente">◀</button>
        <button id="lb-next" class="btn" aria-label="Image suivante">▶</button>
        <button id="lb-close" class="btn" aria-label="Fermer">Fermer</button>
      </div>
    </figure>`;
  document.body.appendChild(lb);

  const lbImg = $("#lb-img", lb);
  const lbCap = $("#lb-cap", lb);
  const btnPrev = $("#lb-prev", lb);
  const btnNext = $("#lb-next", lb);
  const btnClose = $("#lb-close", lb);

  let photos = [];
  let idx = 0;

  function open(i){
    idx = i;
    const p = photos[idx];
    lbImg.src = p.src;
    lbImg.alt = p.alt || "";
    lbCap.textContent = p.alt || "";
    lb.style.display = "grid";
    lb.setAttribute("aria-hidden","false");
  }
  function close(){
    lb.style.display = "none";
    lb.setAttribute("aria-hidden","true");
  }
  function next(){ open((idx+1)%photos.length); }
  function prev(){ open((idx-1+photos.length)%photos.length); }

  btnClose.addEventListener("click", close);
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  window.addEventListener("keydown", (e)=>{
    if (lb.style.display !== "grid") return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  // Build grid
  function render(){
    container.innerHTML = "";
    photos.forEach((p, i) => {
      const fig = document.createElement("figure");
      fig.style.margin = "0";
      fig.className = "ph";
      fig.style.position = "relative";

      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = p.src;
      img.alt = p.alt || "";
      img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:12px;display:block";
      img.addEventListener("click", ()=>open(i));
      fig.appendChild(img);

      if (p.alt){
        const cap = document.createElement("figcaption");
        cap.textContent = p.alt;
        cap.style.cssText = "position:absolute;left:8px;bottom:8px;color:#dbe7d2;font-size:12px;opacity:.85;text-shadow:0 1px 2px rgba(0,0,0,.6)";
        fig.appendChild(cap);
      }
      container.appendChild(fig);
    });
  }

  // Load list
  fetch("photos.json", {cache: "no-store"})
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(list => { photos = list; render(); })
    .catch(err => {
      console.warn("Impossible de charger photos.json", err);
      container.innerHTML = '<p style="color:#cbd5c0">⚠️ Impossible de charger <code>photos.json</code>. Vérifie son emplacement à la racine et les chemins d’images.</p>';
    });
})();
