/* ═══════════════════════════════════════════════════════════════
   TPLE003 — Portal Akademik | script.js
   Bahasa: Indonesia
   ═══════════════════════════════════════════════════════════════ */

/* ═══ LOADING SCREEN + HERO PARTICLES ═══ */
document.addEventListener('DOMContentLoaded', function() {

  /* ── Loading Screen ── */
  const pesanLoading = [
    'Memuat sistem...',
    'Menghubungkan database...',
    'Menyiapkan data kelas...',
    'Hampir selesai...',
  ];

  const loadingBar   = document.querySelector('.loading-bar');
  const loadingLabel = document.getElementById('loading-label');

  function majuLoadingBar(persen, pesan) {
    if (loadingBar)   loadingBar.style.width = persen + '%';
    if (loadingLabel) loadingLabel.textContent = pesan;
  }

  setTimeout(() => majuLoadingBar(30,  pesanLoading[0]), 100);
  setTimeout(() => majuLoadingBar(55,  pesanLoading[1]), 600);
  setTimeout(() => majuLoadingBar(80,  pesanLoading[2]), 1100);
  setTimeout(() => majuLoadingBar(100, pesanLoading[3]), 1600);

  setTimeout(() => {
    const screen = document.getElementById('loading-screen');
    if (screen) screen.classList.add('hide');
  }, 2200);

  /* ── Hero Particles ── */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resizeCanvas() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', () => { resizeCanvas(); buatPartikel(); });

    function buatPartikel() {
      particles = [];
      const jumlah = Math.floor((W * H) / 8000);
      for (let i = 0; i < jumlah; i++) {
        particles.push({
          x     : Math.random() * W,
          y     : Math.random() * H,
          r     : Math.random() * 1.5 + 0.3,
          alpha : Math.random() * 0.6 + 0.1,
          speed : Math.random() * 0.3 + 0.05,
          drift : (Math.random() - 0.5) * 0.2,
          pulse : Math.random() * Math.PI * 2,
        });
      }
    }
    buatPartikel();

    function gambarGaris(a, b) {
      const dx   = a.x - b.x;
      const dy   = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 120) return;
      const opacity = (1 - dist / 120) * 0.15;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(201,168,76,${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p, i) => {
        p.y     -= p.speed;
        p.x     += p.drift;
        p.pulse += 0.02;

        if (p.y < -5)  p.y = H + 5;
        if (p.x < -5)  p.x = W + 5;
        if (p.x > W+5) p.x = -5;

        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${a})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${a * 0.15})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          gambarGaris(p, particles[j]);
        }
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

});

/* ───────────────────────────────────────────────────────────────
   DATA MATA KULIAH
   ─────────────────────────────────────────────────────────────── */
const MATA_KULIAH = [
  { id: 1, nama: 'Analisa & Perancangan Sistem',  singkat: 'APS', icon: '<i class="fas fa-project-diagram"></i>' },
  { id: 2, nama: 'Cloud Computing',               singkat: 'CC',  icon: '<i class="fas fa-cloud"></i>' },
  { id: 3, nama: 'Metode Numerik',                singkat: 'MN',  icon: '<i class="fas fa-calculator"></i>' },
  { id: 4, nama: 'Interaksi Manusia & Komputer',  singkat: 'IMK', icon: '<i class="fas fa-desktop"></i>' },
  { id: 5, nama: 'Data Mining',                   singkat: 'DM',  icon: '<i class="fas fa-database"></i>' },
  { id: 6, nama: 'Pemrograman 1',                 singkat: 'P1',  icon: '<i class="fas fa-code"></i>' },
  { id: 7, nama: 'Basis Data 1',                  singkat: 'BD1', icon: '<i class="fas fa-server"></i>' },
  { id: 8, nama: 'Teori Bahasa & Automata',       singkat: 'TBA', icon: '<i class="fas fa-robot"></i>' },
];

/* ───────────────────────────────────────────────────────────────
   STATE GLOBAL
   ─────────────────────────────────────────────────────────────── */
let state = {
  halamanAktif  : 'home',
  matkulDipilih : null,
  dataMahasiswa : [],
  dataDosen     : [],
  dataModul     : {},
  mahasiswaFilter: '',
  dosenFilter   : '',
  carouselIndex : 0,
};

/* ───────────────────────────────────────────────────────────────
   ROUTER
   ─────────────────────────────────────────────────────────────── */
function navigateTo(halaman, extra = {}) {
  const lt = document.getElementById('loading-transition');
  if (lt) lt.classList.add('show');

  setTimeout(() => {
    if (lt) lt.classList.remove('show');
    tampilkanHalaman(halaman, extra, true);
  }, 600);
}

function tampilkanHalaman(halaman, extra = {}, pushHistory = false) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  let targetPage;

  if (halaman === 'modul-detail' && extra.matkul) {
    state.matkulDipilih = extra.matkul;
    targetPage = document.getElementById('page-modul-detail');
    renderModulDetail(extra.matkul);

    if (pushHistory) {
      history.pushState(
        { halaman: 'modul-detail', matkul: extra.matkul },
        `Modul ${extra.matkul.nama} — TPLE003`,
        `#modul-${extra.matkul.id}`
      );
    }
  } else {
    targetPage = document.getElementById(`page-${halaman}`);

    if (pushHistory) {
      history.pushState(
        { halaman },
        `TPLE003 — ${labelHalaman(halaman)}`,
        `#${halaman}`
      );
    }
  }

  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const navBtn = document.querySelector(`.nav-btn[data-page="${halaman}"]`);
  if (navBtn) navBtn.classList.add('active');

  state.halamanAktif = halaman;

  if (halaman === 'mahasiswa' && state.dataMahasiswa.length === 0) muatDataMahasiswa();
  if (halaman === 'dosen'     && state.dataDosen.length === 0)     muatDataDosen();
  if (halaman === 'modul')    renderMatkulGrid();
}

function labelHalaman(h) {
  const map = { home: 'Beranda', mahasiswa: 'Data Mahasiswa', dosen: 'Data Dosen', modul: 'Modul' };
  return map[h] || h;
}

window.addEventListener('popstate', function (e) {
  const data = e.state;
  if (!data) { tampilkanHalaman('home'); return; }

  if (data.halaman === 'modul-detail' && data.matkul) {
    tampilkanHalaman('modul-detail', { matkul: data.matkul });
  } else {
    tampilkanHalaman(data.halaman);
  }
});

/* ───────────────────────────────────────────────────────────────
   INISIALISASI
   ─────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  history.replaceState({ halaman: 'home' }, 'TPLE003 — Beranda', '#home');

  document.getElementById('page-home').classList.add('active');
  document.querySelector('.nav-btn[data-page="home"]').classList.add('active');

  setupCarousel();

  const hash = window.location.hash.replace('#', '');
  if (hash && hash !== 'home') {
    const validPages = ['mahasiswa', 'dosen', 'modul'];
    if (validPages.includes(hash)) {
      setTimeout(() => navigateTo(hash), 100);
    }
  }
});

/* ───────────────────────────────────────────────────────────────
   CAROUSEL
   ─────────────────────────────────────────────────────────────── */
let carouselTimer;
let touchStartX = 0;

function setupCarousel() {
  const track = document.getElementById('carousel-track');
  const slides = track.querySelectorAll('.carousel-slide');
  const dotsContainer = document.getElementById('carousel-dots');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  });

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? carouselNext() : carouselPrev();
    }
  }, { passive: true });

  mulaiAutoPlay();
}

function mulaiAutoPlay() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => carouselNext(), 4000);
}

function goToSlide(index) {
  const track  = document.getElementById('carousel-track');
  const slides = track.querySelectorAll('.carousel-slide');
  const dots   = document.querySelectorAll('.carousel-dot');

  state.carouselIndex = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${state.carouselIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === state.carouselIndex));
  mulaiAutoPlay();
}

function carouselNext() { goToSlide(state.carouselIndex + 1); }
function carouselPrev() { goToSlide(state.carouselIndex - 1); }

/* ───────────────────────────────────────────────────────────────
   MOBILE MENU
   ─────────────────────────────────────────────────────────────── */
function toggleMobileMenu() {
  const menu    = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  const isOpen  = menu.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

/* ───────────────────────────────────────────────────────────────
   INFO PANEL
   ─────────────────────────────────────────────────────────────── */
function toggleInfoPanel() {
  const panel   = document.getElementById('info-panel');
  const overlay = document.getElementById('info-overlay');
  const isOpen  = panel.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

/* ───────────────────────────────────────────────────────────────
   DATA MAHASISWA
   ─────────────────────────────────────────────────────────────── */
async function muatDataMahasiswa() {
  const tbody = document.getElementById('tbody-mahasiswa');
  tbody.innerHTML = `<tr><td colspan="4" class="loading-row"><div class="loading-spinner"></div> Memuat data mahasiswa...</td></tr>`;

  try {
    const res  = await fetch(JSON_PATH.mahasiswa);
    const json = await res.json();
    /* Format PHPMyAdmin: ambil array dari elemen ke-3 (index 2) */
    const data = json[2]?.data ?? json;
    state.dataMahasiswa = data;
    renderTabelMahasiswa(data);
  } catch (err) {
    console.error('Gagal memuat mahasiswa.json:', err);
    tbody.innerHTML = `<tr><td colspan="4" class="no-data">Gagal memuat data.</td></tr>`;
  }
}
function renderTabelMahasiswa(data) {
  const tbody = document.getElementById('tbody-mahasiswa');
  const count = document.getElementById('mahasiswa-count');

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="no-data">Tidak ada data mahasiswa.</td></tr>`;
    count.textContent = '0 mahasiswa ditemukan';
    return;
  }

  count.textContent = `${data.length} mahasiswa ditemukan`;

  tbody.innerHTML = data.map((m, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="nim-badge">${esc(m.nim)}</span></td>
      <td>${esc(m.nama)}</td>
      <td>
        <a href="https://wa.me/62${m.no_telepon.replace(/^0/, '').replace(/\D/g, '')}"
           target="_blank"
           style="color:#25D366; text-decoration:none; display:flex; align-items:center; gap:0.5rem;">
          <i class="fab fa-whatsapp"></i> ${esc(m.no_telepon)}
        </a>
      </td>
    </tr>
  `).join('');
}

function filterMahasiswa() {
  const q = document.getElementById('search-mahasiswa').value.toLowerCase();
  state.mahasiswaFilter = q;
  const filtered = state.dataMahasiswa.filter(m =>
    m.nim.toLowerCase().includes(q) || m.nama.toLowerCase().includes(q)
  );
  renderTabelMahasiswa(filtered);
}

/* ───────────────────────────────────────────────────────────────
   DATA DOSEN
   ─────────────────────────────────────────────────────────────── */
async function muatDataDosen() {
  const tbody = document.getElementById('tbody-dosen');
  tbody.innerHTML = `<tr><td colspan="6" class="loading-row"><div class="loading-spinner"></div> Memuat data dosen...</td></tr>`;

  try {
    const [resDosen, resDosenMatkul, resMatkul] = await Promise.all([
      fetch(JSON_PATH.dosen),
      fetch(JSON_PATH.dosenMatkul),
      fetch(JSON_PATH.matkul),
    ]);

    const jsonDosen      = await resDosen.json();
    const jsonDosenMatkul = await resDosenMatkul.json();
    const jsonMatkul     = await resMatkul.json();

    const dosen      = jsonDosen[2]?.data      ?? jsonDosen;
    const dosenMatkul = jsonDosenMatkul[2]?.data ?? jsonDosenMatkul;
    const matkul     = jsonMatkul[2]?.data      ?? jsonMatkul;

    /* Buat peta matkul_id → nama */
    const mapMatkul = {};
    matkul.forEach(m => { mapMatkul[m.id] = m.nama; });

    /* Buat peta dosen_id → array nama matkul */
    const mapDosenMatkul = {};
    dosenMatkul.forEach(dm => {
      if (!mapDosenMatkul[dm.dosen_id]) mapDosenMatkul[dm.dosen_id] = [];
      mapDosenMatkul[dm.dosen_id].push(mapMatkul[dm.matkul_id] || dm.matkul_id);
    });

    /* Gabungkan ke data dosen */
    const data = dosen.map(d => ({
      ...d,
      mata_kuliah: mapDosenMatkul[d.id] || [],
    }));

    state.dataDosen = data;
    renderTabelDosen(data);
  } catch (err) {
    console.error('Gagal memuat data dosen:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="no-data">Gagal memuat data.</td></tr>`;
  }
}

function renderTabelDosen(data) {
  const tbody = document.getElementById('tbody-dosen');
  const count = document.getElementById('dosen-count');

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="no-data">Tidak ada data dosen.</td></tr>`;
    count.textContent = '0 dosen ditemukan';
    return;
  }

  count.textContent = `${data.length} dosen ditemukan`;

  tbody.innerHTML = data.map((d, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="nim-badge">${esc(d.nidn)}</span></td>
      <td>${esc(d.nama)}</td>
      <td>${esc(d.jenis_kelamin)}</td>
      <td>
        <a href="https://wa.me/62${d.no_telepon.replace(/^0/, '').replace(/\D/g, '')}"
           target="_blank"
           style="color:#25D366; text-decoration:none; display:flex; align-items:center; gap:0.5rem;">
          <i class="fab fa-whatsapp"></i> ${esc(d.no_telepon)}
        </a>
      </td>
      <td>${formatMatkul(d.mata_kuliah)}</td>
    </tr>
  `).join('');
}

function filterDosen() {
  const q = document.getElementById('search-dosen').value.toLowerCase();
  state.dosenFilter = q;
  const filtered = state.dataDosen.filter(d =>
    d.nidn.toLowerCase().includes(q) || d.nama.toLowerCase().includes(q)
  );
  renderTabelDosen(filtered);
}

function formatMatkul(matkul) {
  if (!matkul) return '—';
  const list = Array.isArray(matkul) ? matkul : matkul.split(',');
  return list.map(m => `<span class="matkul-tag">${esc(m.trim())}</span>`).join(' ');
}

/* ───────────────────────────────────────────────────────────────
   MODUL
   ─────────────────────────────────────────────────────────────── */
function renderMatkulGrid() {
  const grid = document.getElementById('matkul-grid');

  grid.innerHTML = MATA_KULIAH.map(mk => `
    <div class="matkul-card" onclick="bukaModulDetail(${mk.id})">
      <div class="matkul-card-icon" style="font-size:1.3rem;color:#C9A84C">${mk.icon}</div>
      <h3>${mk.nama}</h3>
      <p>${mk.singkat} — Klik untuk melihat modul</p>
      <span class="card-arrow">→</span>
    </div>
  `).join('');
}

function bukaModulDetail(matkulId) {
  const matkul = MATA_KULIAH.find(m => m.id === matkulId);
  if (!matkul) return;
  navigateTo('modul-detail', { matkul });
}

async function renderModulDetail(matkul) {
  const title = document.getElementById('detail-matkul-title');
  const list  = document.getElementById('modul-list');

  title.innerHTML = `${matkul.icon} ${matkul.nama}`;
  list.innerHTML  = `<div class="loading-row"><div class="loading-spinner"></div> Memuat modul...</div>`;

  try {
    const res  = await fetch(JSON_PATH.modul);
    const json = await res.json();
    const semua = json[2]?.data ?? json;
    const data  = semua.filter(m => String(m.matkul_id) === String(matkul.id));
    tampilkanListModul(data, matkul);
  } catch (err) {
    console.error('Gagal memuat modul.json:', err);
    list.innerHTML = `<div class="empty-modul">Gagal memuat modul.</div>`;
  }
}

function tampilkanListModul(data, matkul) {
  const list = document.getElementById('modul-list');

  if (!data || data.length === 0) {
    list.innerHTML = `<div class="empty-modul">Belum ada modul tersedia untuk mata kuliah ini.</div>`;
    return;
  }

  list.innerHTML = data.map(m => {
    const isPdf      = m.tipe === 'pdf';
    const iconLabel  = isPdf ? '📄' : '🔗';
    const badgeClass = isPdf ? 'modul-type-pdf' : 'modul-type-link';
    const badgeText  = isPdf ? 'PDF' : 'Link';
    const aksiLabel  = isPdf ? '⬇ Unduh' : '↗ Buka';

    return `
      <div class="modul-item">
        <div class="modul-item-icon">${iconLabel}</div>
        <div class="modul-item-info">
          <h4>${esc(m.judul_modul)}</h4>
          <p>Diunggah: ${esc(m.tanggal_upload || '—')}</p>
        </div>
        <span class="modul-type-badge ${badgeClass}">${badgeText}</span>
        <a href="${esc(m.url_atau_path)}" target="_blank" rel="noopener" class="btn-download"
           ${isPdf ? 'download' : ''}>${aksiLabel}</a>
      </div>
    `;
  }).join('');
}

/* ───────────────────────────────────────────────────────────────
   HELPER
   ─────────────────────────────────────────────────────────────── */
function esc(str) {
  if (!str) return '—';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ───────────────────────────────────────────────────────────────
   PATH FILE JSON
   ─────────────────────────────────────────────────────────────── */
const JSON_PATH = {
  mahasiswa  : 'data/mahasiswa.json',
  dosen      : 'data/dosen.json',
  dosenMatkul: 'data/dosen_matkul.json',
  matkul     : 'data/mata_kuliah.json',
  modul      : 'data/modul.json',
};