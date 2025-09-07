// DV Drone - Gallery v2 (verbose + fallback)
(function(){
  const $ = (s, d=document) => d.querySelector(s);
  const container = $("#gallery");
  if (!container) {
    console.warn("[gallery] #gallery introuvable dans le DOM");
    return;
  }
  console.log("[gallery] init: conteneur trouvé");

  // Lightbox minimale
  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.setAttribute("aria-hidden","true");
  lb.style.cssText = "position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.85);z-index:9999;padding:24px";
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
  function close(){ lb.style.display = "none"; lb.setAttribute("aria-hidden","true"); }
  $("#lb-close", lb).addEventListener("click", close);
  $("#lb-next", lb).addEventListener("click", ()=>open((idx+1)%photos.length));
  $("#lb-prev", lb).addEventListener("click", ()=>open((idx-1+photos.length)%photos.length));
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  window.addEventListener("keydown", (e)=>{
    if (lb.style.display !== "grid") return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") open((idx+1)%photos.length);
    if (e.key === "ArrowLeft") open((idx-1+photos.length)%photos.length);
  });

  function render(){
    console.log("[gallery] rendu", photos);
    container.innerHTML = "";
    if (!photos.length){
      container.innerHTML = '<p style="color:#cbd5c0">Aucune photo listée. Vérifie <code>photos.json</code>.</p>';
      return;
    }
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
        cap.style.cssText = `
          position:absolute;
          left:8px;
          top:8px;
          color:#000;
          font-weight:600;
          font-size:13px;
          background:#fff;        /* Fond blanc opaque */
          padding:2px 6px;
          border-radius:6px
        `;
        fig.appendChild(cap);
      }
      container.appendChild(fig);
    });
  }

  function useList(list, source){
    console.log(`[gallery] liste de photos chargée depuis ${source}`, list);
    photos = Array.isArray(list) ? list : [];
    render();
  }

  // 1) Tente photos.json
  fetch("photos.json", {cache: "no-store"})
    .then(r => {
      console.log("[gallery] fetch photos.json →", r.status);
      if (!r.ok) throw new Error("Status " + r.status);
      return r.json();
    })
    .then(list => useList(list, "photos.json"))
    .catch(err => {
      console.warn("[gallery] Impossible de charger photos.json :", err);
      // 2) Fallback: window.PHOTOS (si défini dans index.html)
      if (Array.isArray(window.PHOTOS)) {
        useList(window.PHOTOS, "window.PHOTOS (fallback)");
      } else {
        container.innerHTML =
          '<p style="color:#cbd5c0">⚠️ Impossible de charger <code>photos.json</code>. '+
          'Vérifie que le fichier est à la racine et que les noms d’images (<code>/photos/…</code>) sont exacts.</p>';
      }
    });
})();
