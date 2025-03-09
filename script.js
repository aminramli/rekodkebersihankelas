// URL Apps Script baru
const API_URL = "https://script.google.com/macros/s/AKfycbyAaIofcKqUPPJ8o7Vvlwk2D--IzanvxNPupuzyJi7vgnlcXmmzWx83aM8GbSnRz2ixdg/exec";
const criteriaList = [
  "Meja Guru - Ada alas dan bunga", "Meja Pelajar - Mempunyai nama", "Jadual Bertugas - Kreatif",
  "Jam Dinding - Ada & berfungsi", "Langsir - Kemas & bersih", "Buku - Disusun kemas dalam loker",
  "Mempunyai nama pelajar (loker)", "Lantai - Bersih", "Penyapu/Penyodok - Digantung di belakang kelas",
  "Tong Sampah Kecil - Tiada sampah selepas rehat dan sebelum balik", "Kerusi - Kemas dan teratur",
  "Buku di Bawah Meja - Kemas", "Lampu - Bersih", "Kipas - Bersih", "Papan Putih - Bersih",
  "Pemadam Whiteboard - Ada", "Tingkap - Bersih", "Pintu - Bersih", "Siling - Bersih",
  "Dinding Kelas - Bersih", "Mempunyai Tajuk (Softboard)", "Mengikut Pelan (Softboard)",
  "Dihias dengan Kreatif dan Menarik (Softboard)", "Alas Meja Pelajar", "Banner Pintu",
  "Kata-Kata Motivasi", "Sudut Khas dalam Kelas", "Koridor Kelas - Bersih & ceria"
];

function setupNavigation() {
  const analysisBtn = document.getElementById('analysisBtn');
  const formBtn = document.getElementById('formBtn');
  const statusBtn = document.getElementById('statusBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  analysisBtn.addEventListener('click', loadAnalysisPage);
  formBtn.addEventListener('click', loadFormPage);
  statusBtn.addEventListener('click', loadStatusPage);
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    loadAnalysisPage();
  });

  if (localStorage.getItem('loggedIn') === 'true') {
    statusBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
  }
}

function loadAnalysisPage() {
  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = `
    <section class="container">
      <h1>Analisis Kebersihan Kelas</h1>
      <div class="select-wrapper">
        <select id="monthSelect">
          <option value="Januari">Januari</option>
          <option value="Februari">Februari</option>
          <option value="Mac">Mac</option>
          <option value="April">April</option>
          <option value="Mei">Mei</option>
          <option value="Jun">Jun</option>
          <option value="Julai">Julai</option>
          <option value="Ogos">Ogos</option>
          <option value="September">September</option>
          <option value="Oktober">Oktober</option>
          <option value="November">November</option>
          <option value="Disember">Disember</option>
        </select>
      </div>
      <button id="loadRankings" class="btn-primary">Muatkan Ranking</button>
      <div id="rankings" class="table-container"></div>
    </section>
  `;

  document.getElementById('loadRankings').addEventListener('click', async () => {
    const monthSelect = document.getElementById('monthSelect');
    const rankingsDiv = document.getElementById('rankings');
    try {
      const response = await fetch(`${API_URL}?action=ranking&bulan=${monthSelect.value}`, {
        headers: { 'Content-Type': 'text/plain' }
      });
      const text = await response.text();
      const rankings = JSON.parse(text);

      let html = '';
      for (const tingkatan in rankings) {
        html += `<h2>Tingkatan ${tingkatan}</h2>`;
        html += `
          <table>
            <thead>
              <tr>
                <th>Nama Kelas</th>
                <th>Peratus</th>
              </tr>
            </thead>
            <tbody>
        `;
        rankings[tingkatan].forEach(row => {
          html += `
            <tr>
              <td>${row.kelas}</td>
              <td>${row.peratus}%</td>
            </tr>
          `;
        });
        html += `
            </tbody>
          </table>
        `;
      }
      rankingsDiv.innerHTML = html || '<p>Tiada data untuk bulan ini.</p>';
    } catch (error) {
      rankingsDiv.innerHTML = 'Error: ' + error.message;
    }
  });
}

function loadFormPage() {
  const mainContent = document.getElementById('mainContent');
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
  
  mainContent.innerHTML = `
    <section class="container">
      <div id="loginSection" class="login-form ${isLoggedIn ? 'hidden' : ''}">
        <h1>Log Masuk</h1>
        <input type="text" id="username" placeholder="ID">
        <input type="password" id="password" placeholder="Password">
        <button id="loginBtn" class="btn-primary">Log Masuk</button>
      </div>
      <form id="cleaningForm" class="${isLoggedIn ? '' : 'hidden'}">
        <h1>Borang Kebersihan Kelas</h1>
        <div class="select-wrapper">
          <select name="tingkatan" required>
            <option value="">Pilih Tingkatan</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div class="select-wrapper">
          <select name="kelas" required>
            <option value="">Pilih Kelas</option>
            <option value="Berlian">Berlian</option>
            <option value="Delima">Delima</option>
            <option value="Intan">Intan</option>
            <option value="Nilam">Nilam</option>
            <option value="Topaz">Topaz</option>
            <option value="Zamrud">Zamrud</option>
          </select>
        </div>
        <div class="select-wrapper">
          <select name="bulan" required>
            <option value="">Pilih Bulan</option>
            <option value="Januari">Januari</option>
            <option value="Februari">Februari</option>
            <option value="Mac">Mac</option>
            <option value="April">April</option>
            <option value="Mei">Mei</option>
            <option value="Jun">Jun</option>
            <option value="Julai">Julai</option>
            <option value="Ogos">Ogos</option>
            <option value="September">September</option>
            <option value="Oktober">Oktober</option>
            <option value="November">November</option>
            <option value="Disember">Disember</option>
          </select>
        </div>
        <input type="date" name="tarikh" required>
        <div id="criteria" class="criteria-container"></div>
        <button type="submit" id="submitBtn" class="btn-primary">Hantar</button>
        <p id="message"></p>
      </form>
    </section>
  `;

  const criteriaDiv = document.getElementById('criteria');
  if (criteriaDiv) {
    criteriaList.forEach((criterion, index) => {
      const div = document.createElement('div');
      div.className = 'criteria-item';
      div.innerHTML = `
        <label>${criterion}</label>
        <div class="rating">
          ${[1,2,3,4,5].map(val => `
            <input type="radio" name="criteria${index}" id="criteria${index}-${val}" value="${val}" required>
            <label for="criteria${index}-${val}">${val}</label>
          `).join('')}
        </div>
      `;
      criteriaDiv.appendChild(div);
    });
  }

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      if (username === 'mrsmsas' && password === '1234') {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('cleaningForm').classList.remove('hidden');
        localStorage.setItem('loggedIn', 'true');
        setupNavigation();
      } else {
        alert('ID atau Password salah!');
      }
    });
  }

  const form = document.getElementById('cleaningForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      
      const formData = new FormData(form);
      const data = {
        tingkatan: formData.get('tingkatan'),
        kelas: formData.get('kelas'),
        bulan: formData.get('bulan'),
        tarikh: formData.get('tarikh'),
      };
      criteriaList.forEach((_, i) => {
        data[`criteria${i}`] = formData.get(`criteria${i}`);
      });

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(data)
        });
        const text = await response.text();
        document.getElementById('message').textContent = text;
        form.reset();
      } catch (error) {
        document.getElementById('message').textContent = 'Error: ' + error.message;
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
}

function loadStatusPage() {
  if (localStorage.getItem('loggedIn') !== 'true') {
    loadFormPage();
    return;
  }

  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = `
    <section class="container">
      <h1>Status Rekod</h1>
      <div class="select-wrapper">
        <select id="monthSelect">
          <option value="Januari">Januari</option>
          <option value="Februari">Februari</option>
          <option value="Mac">Mac</option>
          <option value="April">April</option>
          <option value="Mei">Mei</option>
          <option value="Jun">Jun</option>
          <option value="Julai">Julai</option>
          <option value="Ogos">Ogos</option>
          <option value="September">September</option>
          <option value="Oktober">Oktober</option>
          <option value="November">November</option>
          <option value="Disember">Disember</option>
        </select>
      </div>
      <button id="loadStatus" class="btn-primary">Muatkan Status</button>
      <div id="statusTables" class="table-container"></div>
    </section>
  `;

  document.getElementById('loadStatus').addEventListener('click', async () => {
    const monthSelect = document.getElementById('monthSelect');
    const statusDiv = document.getElementById('statusTables');
    try {
      const response = await fetch(`${API_URL}?action=status&bulan=${monthSelect.value}`, {
        headers: { 'Content-Type': 'text/plain' }
      });
      const text = await response.text();
      const statusData = JSON.parse(text);

      let html = '';
      for (const tingkatan in statusData) {
        html += `<h2>Tingkatan ${tingkatan}</h2>`;
        html += `
          <table>
            <thead>
              <tr>
                <th>Nama Kelas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
        `;
        statusData[tingkatan].forEach(row => {
          html += `
            <tr>
              <td>${row.kelas}</td>
              <td class="${row.status.toLowerCase()}">${row.status}</td>
            </tr>
          `;
        });
        html += `
            </tbody>
          </table>
        `;
      }
      statusDiv.innerHTML = html || '<p>Tiada data untuk bulan ini.</p>';
    } catch (error) {
      statusDiv.innerHTML = 'Error: ' + error.message;
    }
  });
}

// Memuatkan halaman analisis secara lalai apabila dokumen dimuatkan
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadAnalysisPage();
});