.catch(err => {
  console.warn("Impossible de charger photos.json", err);
  const g = document.getElementById('gallery');
  if (g) g.innerHTML = '<p style="color:#cbd5c0">⚠️ Impossible de charger <code>photos.json</code>. Vérifie son emplacement à la racine et les chemins d’images.</p>';
});
