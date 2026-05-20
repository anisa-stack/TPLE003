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
function muatDataMahasiswa() {
  state.dataMahasiswa = dataContohMahasiswa();
  renderTabelMahasiswa(state.dataMahasiswa);
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
function muatDataDosen() {
  state.dataDosen = dataContohDosen();
  renderTabelDosen(state.dataDosen);
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

function renderModulDetail(matkul) {
  const title = document.getElementById('detail-matkul-title');
  title.innerHTML = `${matkul.icon} ${matkul.nama}`;
  tampilkanListModul(dataContohModul(matkul.id), matkul);
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
   DATA STATIS (dari JSON export PHPMyAdmin)
   ─────────────────────────────────────────────────────────────── */

const _DATA_MAHASISWA = [
  {"id":"1","nim":"241011401783","nama":"AHMAD ZACKY ALAMSYAH","no_telepon":"08989665793"},
  {"id":"2","nim":"241011403166","nama":"ALFRED RAHMAT SENTOSA HAREFA","no_telepon":"081263053122"},
  {"id":"3","nim":"241011400196","nama":"ARYA ARESKA RAUZIAN","no_telepon":"081802802245"},
  {"id":"4","nim":"241011400202","nama":"ARYO MAESO AJI","no_telepon":"085740234209"},
  {"id":"5","nim":"241011401354","nama":"ATTHORIQ RHEVAL FAHLEVI","no_telepon":"081380999010"},
  {"id":"6","nim":"241011400872","nama":"DENISE FEBRY SETIAWAN","no_telepon":"0895347360049"},
  {"id":"7","nim":"241011402218","nama":"DESTIN FARISA SAMAKATUL MUSRIKAH","no_telepon":"087712021772"},
  {"id":"8","nim":"241011401614","nama":"FAHRI SAPUTRA","no_telepon":"089674374257"},
  {"id":"9","nim":"241011402102","nama":"GILANG TRI SATRIA KURNIAWAN","no_telepon":"081292355118"},
  {"id":"10","nim":"241011401970","nama":"GIWANG KATON SISWO PANGUDI","no_telepon":"088210780908"},
  {"id":"11","nim":"241011402523","nama":"HANGGA ADIT RHAMDANI","no_telepon":"085839849296"},
  {"id":"12","nim":"241011400221","nama":"JOS VIKEN DARMASAH GUNAWAN","no_telepon":"081380548248"},
  {"id":"13","nim":"241011403133","nama":"KAYLA OLIVIA RAHMA KALESARAN","no_telepon":"088212741019"},
  {"id":"14","nim":"241011402956","nama":"M. HAFIDZ AWALUDIN","no_telepon":"0895635396047"},
  {"id":"15","nim":"241011403160","nama":"MOHAMAD ZAMANI PRASETYO","no_telepon":"085700305997"},
  {"id":"16","nim":"241011400212","nama":"MUHAMAD RIDWAN","no_telepon":"083841301026"},
  {"id":"17","nim":"241011401589","nama":"MUHAMMAD QOWIY","no_telepon":"085710254284"},
  {"id":"18","nim":"241011401350","nama":"MUHAMMAD RIZKI ADI NUGRAHA","no_telepon":"082323561623"},
  {"id":"19","nim":"241011402550","nama":"NUR ANISA FITRI","no_telepon":"088973574905"},
  {"id":"20","nim":"241011402039","nama":"NURUL IMAM","no_telepon":"082223224730"},
  {"id":"21","nim":"241011400163","nama":"NUZULULHAZ KHOFIFAH","no_telepon":"085802963392"},
  {"id":"22","nim":"241011402111","nama":"RAMBAYU RIMBAJATI","no_telepon":"0895630162617"},
  {"id":"23","nim":"241011403168","nama":"REFLY REZEKI ANGGARA SAGALA","no_telepon":"0882015016897"},
  {"id":"24","nim":"241011400166","nama":"RIAN MAULANA","no_telepon":"085774832319"},
  {"id":"25","nim":"241011403153","nama":"RIZAL ARNANDA","no_telepon":"0895342355210"},
];

/* Peta matkul_id → nama mata kuliah (dari mata_kuliah.json) */
const _MAP_MATKUL = {
  "1": "Analisa & Perancangan Sistem",
  "2": "Cloud Computing",
  "3": "Metode Numerik",
  "4": "Interaksi Manusia & Komputer",
  "5": "Data Mining",
  "6": "Pemrograman 1",
  "7": "Basis Data 1",
  "8": "Teori Bahasa & Automata",
};

/* Peta dosen_id → array nama matkul (dari dosen_matkul.json) */
const _MAP_DOSEN_MATKUL = {
  "1": ["Analisa & Perancangan Sistem"],
  "2": ["Cloud Computing"],
  "3": ["Metode Numerik"],
  "4": ["Interaksi Manusia & Komputer"],
  "5": ["Data Mining"],
  "6": ["Pemrograman 1"],
  "7": ["Basis Data 1"],
  "8": ["Teori Bahasa & Automata"],
};

const _DATA_DOSEN_RAW = [
  {"id":"1","nidn":"0404078507","nama":"Joko Suwarno, S.Kom., M.Kom.","jenis_kelamin":"Laki-Laki","no_telepon":"081280616831"},
  {"id":"2","nidn":"0403128603","nama":"Jaka Sutresna, S.Kom., M.Kom.","jenis_kelamin":"Laki-Laki","no_telepon":"0881388994453"},
  {"id":"3","nidn":"0426109102","nama":"Jupron, S.Kom., M.Kom.","jenis_kelamin":"Laki-Laki","no_telepon":"081382301282"},
  {"id":"4","nidn":"0401066503","nama":"Hadi Zakaria, S.Kom., M.M., M.Kom","jenis_kelamin":"Laki-Laki","no_telepon":"087778597991"},
  {"id":"5","nidn":"0415079106","nama":"Zurnan Alfian, S.Kom., M.Kom","jenis_kelamin":"Laki-Laki","no_telepon":"08998444195"},
  {"id":"6","nidn":"0311099102","nama":"Galuh Saputri, S.Kom., M.Kom.","jenis_kelamin":"Perempuan","no_telepon":"082213303751"},
  {"id":"7","nidn":"0405109203","nama":"Octaviana Anugrah Ade Purnama, S.Kom., M.Kom.","jenis_kelamin":"Laki-Laki","no_telepon":"083870132186"},
  {"id":"8","nidn":"0320039201","nama":"Iis Aisyah, S.Kom., M.Kom.","jenis_kelamin":"Perempuan","no_telepon":"088211251617"},
];

const _DATA_MODUL = [
  {"id":"1","matkul_id":"6","judul_modul":"Pertemuan 2 - Dasar Pemrograman","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 2 - Dasar Pemrograman.pdf","tanggal_upload":"2026-03-14"},
  {"id":"2","matkul_id":"2","judul_modul":"Materi Cloud (Drive)","tipe":"link","url_atau_path":"https://drive.google.com/GANTI_LINK_INI","tanggal_upload":"2025-02-12"},
  {"id":"5","matkul_id":"6","judul_modul":"Pertemuan 3 - Input & Output Pada Java","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan3.pdf","tanggal_upload":"2026-03-11"},
  {"id":"6","matkul_id":"6","judul_modul":"Pertemuan 4 - Struktur Control","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 4 - Struktur Control.pdf","tanggal_upload":"2026-04-04"},
  {"id":"7","matkul_id":"6","judul_modul":"Pertemuan 6 - Class","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 6 - Class.pdf","tanggal_upload":"2026-04-06"},
  {"id":"8","matkul_id":"6","judul_modul":"Pertemuan 7 - Class (Lanjutan)","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 7 - Class (Lanjutan).pdf","tanggal_upload":"2026-04-18"},
  {"id":"9","matkul_id":"6","judul_modul":"Pertemuan 8 - Pemrograman Berorientasi Objek","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 8 - Pemrograman Berorientasi Objek.pdf","tanggal_upload":"2026-04-25"},
  {"id":"10","matkul_id":"6","judul_modul":"Pertemuan 9 - Pemrograman Berorientasi Objek","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 9 - Pemrograman Berorientasi Objek.pdf","tanggal_upload":"2026-04-22"},
  {"id":"11","matkul_id":"6","judul_modul":"Pertemuan 10 - Pemrograman Berorientasi Objek","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 10 - Pemrograman Berorientasi Objek.pdf","tanggal_upload":"2026-05-02"},
  {"id":"12","matkul_id":"6","judul_modul":"Pertemuan 11 - Exception dan Assertions","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 11 - Exception dan Assertions.pdf","tanggal_upload":"2026-05-13"},
  {"id":"13","matkul_id":"6","judul_modul":"Pertemuan 12 - Input dan Output Lanjutan","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 12 - Input dan Output Lanjutan.pdf","tanggal_upload":"2026-05-13"},
  {"id":"14","matkul_id":"6","judul_modul":"Pertemuan 5 - Array","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 5 - Array.pdf","tanggal_upload":"2026-04-11"},
  {"id":"15","matkul_id":"4","judul_modul":"Pertemuan 1 - Modul ISBN","tipe":"pdf","url_atau_path":"http://localhost/tple003/uploads/Pertemuan 1 - Modul ISBN.pdf","tanggal_upload":"2026-03-02"},
  {"id":"16","matkul_id":"1","judul_modul":"Pertemuan 1 - Sistem & Analisis Sistem","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1DJyrHTPT2iHCMWo8-GofZabtEmMWXvGx/view?usp=sharing","tanggal_upload":"2026-03-03"},
  {"id":"17","matkul_id":"1","judul_modul":"Pertemuan 2 - Metode Sistem","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1_p2KOfF3Cr7zUHNjCEKeeHvXVYNTCjsz/view?usp=sharing","tanggal_upload":"2026-03-10"},
  {"id":"18","matkul_id":"1","judul_modul":"Pertemuan 3 - Perancangan Sistem Secara Umum","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1llSDQVO3dezPmrrn5qzHN1dVzPoiQVQR/view?usp=drive_link","tanggal_upload":"2026-03-31"},
  {"id":"19","matkul_id":"1","judul_modul":"Pertemuan 4 - Tahapan Perancangan Sistem","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1Favlm8A9piwhZrhXU-zrv7ckrbDwvlkd/view?usp=sharing","tanggal_upload":"2026-04-08"},
  {"id":"20","matkul_id":"1","judul_modul":"Pertemuan 5 - Perancangan Berorientasi Objek","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1xzmxb-FK6PosalmG-9A_cs0oZaWVii_w/view?usp=sharing","tanggal_upload":"2026-04-14"},
  {"id":"21","matkul_id":"1","judul_modul":"Pertemuan 6 - Data Flow Diagram (Part II)","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1p5rvPv0tKtM7FtyaXGtqGr7YQl0RAf2E/view?usp=drive_link","tanggal_upload":"2026-04-22"},
  {"id":"22","matkul_id":"3","judul_modul":"ISBN","tipe":"link","url_atau_path":"https://drive.google.com/drive/folders/1sc0xs-fVKMtACvvRYlNnHX1n9h1nlYBs?usp=sharing","tanggal_upload":"2026-03-07"},
  {"id":"23","matkul_id":"3","judul_modul":"PPT","tipe":"link","url_atau_path":"https://drive.google.com/drive/folders/1LKEtTuEZGRaxBlH6HuLspygWW5r2wUzQ?usp=drive_link","tanggal_upload":"2026-03-14"},
  {"id":"24","matkul_id":"3","judul_modul":"Materi Fordis","tipe":"link","url_atau_path":"https://drive.google.com/drive/folders/1UBCW78-j2O4ckA-SjNVLd-Z1ISCt5YCv?usp=drive_link","tanggal_upload":"2026-03-21"},
  {"id":"25","matkul_id":"8","judul_modul":"Pertemuan 1 - Konsep Teori Otomata (Automata) Dalam Teori Komputasi","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1EgbRbcHvd8-pksBMrOiVN1hzzMZ_zXYo/view?usp=sharing","tanggal_upload":"2026-04-04"},
  {"id":"26","matkul_id":"8","judul_modul":"Pertemuan 2 - Tata Bahasa Formal Pada Teori Otomata","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1v-uGxeOHpC3W-snrc2CT1YV0Lr7JNdrL/view?usp=drive_link","tanggal_upload":"2026-04-11"},
  {"id":"27","matkul_id":"8","judul_modul":"Pertemuan 3 - Tata Bahasa (Grammar) Hirarki Chomsky","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1kjW_1L3zpldsi1wCREUzJpha-7AbUMYz/view?usp=drive_link","tanggal_upload":"2026-04-18"},
  {"id":"28","matkul_id":"8","judul_modul":"Pertemuan 5 - DFA","tipe":"link","url_atau_path":"https://drive.google.com/file/d/1UblqItlXgIN67cWH-HpdJwBZ3cAV-Rls/view?usp=drive_link","tanggal_upload":"2026-05-02"},
];

function dataContohMahasiswa() {
  return _DATA_MAHASISWA;
}

function dataContohDosen() {
  /* Gabungkan data dosen dengan mata kuliah yang diajarkan */
  return _DATA_DOSEN_RAW.map(d => ({
    ...d,
    mata_kuliah: _MAP_DOSEN_MATKUL[d.id] || [],
  }));
}

function dataContohModul(matkulId) {
  return _DATA_MODUL.filter(m => m.matkul_id === String(matkulId));
}
