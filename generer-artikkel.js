// =========================================
// FORSIKRINGOVERSIKT.NO – Artikkelgenerator
// =========================================

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOPICS = [
  { tittel: 'Slik sparer du på bilforsikringen i 2026', kategori: 'Bilforsikring', emoji: '🚗', color: '#dbeafe' },
  { tittel: 'IF vs Gjensidige — hvem er billigst i 2026?', kategori: 'Bilforsikring', emoji: '⚖️', color: '#dbeafe' },
  { tittel: 'Hva dekker kasko — og hva dekker den ikke?', kategori: 'Bilforsikring', emoji: '🛡️', color: '#dbeafe' },
  { tittel: 'Innboforsikring 2026 — full guide', kategori: 'Innboforsikring', emoji: '🏠', color: '#dcfce7' },
  { tittel: 'Er reiseforsikringen fra kortet godt nok?', kategori: 'Reiseforsikring', emoji: '✈️', color: '#ffedd5' },
  { tittel: 'Samlerabatt — spar 20% ved å samle forsikringene', kategori: 'Sparetips', emoji: '💰', color: '#fef9c3' },
  { tittel: 'Elbil og forsikring — alt du trenger å vite', kategori: 'Bilforsikring', emoji: '⚡', color: '#dbeafe' },
  { tittel: 'Husforsikring — hvor mye bør du forsikre for?', kategori: 'Husforsikring', emoji: '🏡', color: '#f3e8ff' },
  { tittel: 'Bonus og bonustap — slik fungerer det', kategori: 'Bilforsikring', emoji: '📈', color: '#dbeafe' },
  { tittel: 'Helseforsikring — er det verdt pengene?', kategori: 'Helseforsikring', emoji: '💊', color: '#fce7f3' },
];

function callAnthropic(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.content[0].text);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function lagSlug(tittel) {
  return tittel.toLowerCase()
    .replace(/æ/g,'ae').replace(/ø/g,'o').replace(/å/g,'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function genererArtikkel() {
  const rootDir = __dirname;
  const artiklerDir = path.join(rootDir, 'artikler');
  if (!fs.existsSync(artiklerDir)) fs.mkdirSync(artiklerDir);

  // Les eksisterende index
  const indexPath = path.join(artiklerDir, 'index.json');
  let artikler = [];
  if (fs.existsSync(indexPath)) {
    artikler = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  }

  // Velg tema som ikke er brukt nylig
  const brukte = artikler.map(a => a.tittel);
  const tilgjengelige = TOPICS.filter(t => !brukte.includes(t.tittel));
  const tema = tilgjengelige.length > 0
    ? tilgjengelige[Math.floor(Math.random() * tilgjengelige.length)]
    : TOPICS[Math.floor(Math.random() * TOPICS.length)];

  console.log('Genererer artikkel:', tema.tittel);

  const prompt = `Du er ekspert på norske forsikringer. Skriv en grundig og nyttig artikkel på norsk bokmål om: "${tema.tittel}"

Artikkelen skal:
- Ha en kort, engasjerende ingress (2-3 setninger)
- Inneholde 4-6 seksjoner med overskrifter (H2)
- Gi konkrete, praktiske råd til norske forbrukere
- Nevne relevante forsikringsselskaper (IF, Gjensidige, Frende, Storebrand) med korrekte detaljer
- Ha korrekte norske priser og tall fra 2026
- Avslutte med en oppfordring til å sammenligne priser
- Totalt 500-700 ord

Formater som HTML med <h2>, <h3>, <p>, <ul>, <li> tagger. Ikke inkluder <!DOCTYPE>, <html>, <head> eller <body> tagger.`;

  const innhold = await callAnthropic(prompt);
  const slug = lagSlug(tema.tittel);
  const dato = new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
  const datoISO = new Date().toISOString().split('T')[0];

  // Lag HTML-fil
  const artikkelHTML = `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${tema.tittel} | Forsikringoversikt.no</title>
<meta name="description" content="${tema.tittel} — Les vår guide og spar penger på forsikringen din.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="logo">🛡️ Forsikring<span class="logo-accent">oversikt</span>.no</a>
    <nav class="main-nav">
      <a href="bilforsikring.html">Bil</a>
      <a href="innboforsikring.html">Innbo</a>
      <a href="reiseforsikring.html">Reise</a>
      <a href="husforsikring.html">Hus</a>
      <a href="artikler.html">Artikler</a>
      <a href="kalkulator.html" class="nav-cta">Sammenlign →</a>
    </nav>
    <button class="hamburger" onclick="toggleMenu()"><span></span><span></span><span></span></button>
  </div>
  <nav class="mobile-menu" id="mobileMenu">
    <a href="bilforsikring.html">🚗 Bilforsikring</a>
    <a href="innboforsikring.html">🏠 Innboforsikring</a>
    <a href="reiseforsikring.html">✈️ Reiseforsikring</a>
    <a href="husforsikring.html">🏡 Husforsikring</a>
    <a href="artikler.html">📖 Artikler</a>
    <a href="kalkulator.html">🧮 Sammenlign</a>
  </nav>
</header>

<section class="article-hero">
  <div class="container">
    <div style="margin-bottom:12px"><a href="artikler.html" style="color:rgba(255,255,255,0.6);font-size:0.85rem">← Alle artikler</a></div>
    <h1>${tema.tittel}</h1>
    <div class="article-hero-meta">
      <span>📅 ${dato}</span>
      <span>🏷️ ${tema.kategori}</span>
      <span>⏱️ 5 min lesetid</span>
    </div>
  </div>
</section>

<article class="article-content">
  ${innhold}

  <div class="article-cta-box">
    <h3>Sammenlign priser nå</h3>
    <p>Bruk vår gratis kalkulator og se hva du kan spare ved å bytte forsikring</p>
    <a href="kalkulator.html" class="btn-primary">Start sammenligning →</a>
  </div>
</article>

<footer class="site-footer">
  <div class="container">
    <div class="footer-bottom">
      <p>© 2026 Forsikringoversikt.no · <a href="index.html" style="color:rgba(255,255,255,0.5)">Hjem</a> · <a href="artikler.html" style="color:rgba(255,255,255,0.5)">Artikler</a></p>
    </div>
  </div>
</footer>
<script src="main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(artiklerDir, `${slug}.html`), artikkelHTML);

  // Oppdater index.json
  const nyArtikkel = {
    slug,
    tittel: tema.tittel,
    kategori: tema.kategori,
    emoji: tema.emoji,
    color: tema.color,
    dato,
    datoISO,
    lesetid: '5 min',
    ingress: `Les vår guide om ${tema.tittel.toLowerCase()} og finn ut hvordan du kan spare penger på forsikringen din.`
  };

  artikler.unshift(nyArtikkel);
  if (artikler.length > 50) artikler = artikler.slice(0, 50);
  fs.writeFileSync(indexPath, JSON.stringify(artikler, null, 2));

  console.log('✅ Artikkel generert:', slug);
}

genererArtikkel().catch(console.error);
