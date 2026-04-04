// =========================================
// FORSIKRINGOVERSIKT.NO – Hoved JavaScript
// =========================================

// --- HAMBURGER MENY ---
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

// --- NEWSLETTER ---
function handleNewsletter(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const input = e.target.querySelector('input');
  btn.textContent = '✅ Du er påmeldt!';
  btn.style.background = '#16a34a';
  btn.disabled = true;
  input.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Meld meg på';
    btn.style.background = '';
    btn.disabled = false;
    input.disabled = false;
    input.value = '';
  }, 4000);
}

// --- LOAD ARTICLES ---
async function loadArticles() {
  const grid = document.getElementById('artiklerGrid');
  if (!grid) return;

  try {
    const response = await fetch('artikler/index.json');
    if (!response.ok) return;
    const articles = await response.json();
    if (!articles.length) return;

    grid.innerHTML = articles.slice(0, 6).map(a => `
      <a href="artikler/${a.slug}.html" class="article-card">
        <div class="article-card-img" style="background:${a.color || '#dbeafe'}">
          ${a.emoji || '📋'}
        </div>
        <div class="article-card-body">
          <span class="article-tag">${a.kategori || 'Forsikring'}</span>
          <h3>${a.tittel}</h3>
          <p>${a.ingress || ''}</p>
          <div class="article-meta">
            <span>📅 ${a.dato || ''}</span>
            <span>⏱️ ${a.lesetid || '5 min'}</span>
          </div>
        </div>
      </a>`).join('');
  } catch(e) {
    console.log('Ingen artikler ennå');
  }
}

document.addEventListener('DOMContentLoaded', loadArticles);
