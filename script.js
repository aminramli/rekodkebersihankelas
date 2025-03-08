const API_URL = "https://script.google.com/macros/s/AKfycbwYM6yCgSOpv9FRl5qvIn3uchSOo52sm3Jducjz37QCpRYAgM8KaDAmGyMmgtDMWjLtsQ/exec";
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

// Navigasi
function setupNavigation() {
  const analysisBtn = document.getElementById('analysisBtn');
  const formBtn = document.getElementById('formBtn');
  const statusBtn = document.getElementById('statusBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (analysisBtn) analysisBtn.addEventListener('click', () => window.location.href = 'index.html');
  if (formBtn) formBtn.addEventListener('click', () => window.location.href = 'form.html');
  if (statusBtn) statusBtn.addEventListener('click', () => window.location.href = 'status.html');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    window.location.href = 'index.html';
  });

  if (localStorage.getItem('loggedIn') === 'true') {
    if (statusBtn) statusBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  }
}

// Halaman Borang
if (document.getElementById('cleaningForm')) {
  setupNavigation();
  const form = document.getElementById('cleaningForm');
  const loginSection = document.getElementById('loginSection');
  const submitBtn = document.getElementById('submitBtn');
  const message = document.getElementById('message');
  const totalScore = document.getElementById('totalScore');
  const percentage = document.getElementById('percentage');

  // Generate kriteria dinamik
  const criteriaDiv = document.getElementById('criteria');
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

  // Kira skor secara real-time
  form.addEventListener('change', () => {
    const formData = new FormData(form);
    let total = 0;
    criteriaList.forEach((_, i) => {
      const value = formData.get(`criteria${i}`);
      if (value) total += parseInt(value);
    });
    totalScore.textContent = total;
    percentage.textContent = ((total / 140) * 100).toFixed(2);
  });

  // Log Masuk
  document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'mrsmsas' && password === '1234') {
      loginSection.classList.add('hidden');
      form.classList.remove('hidden');
      localStorage.setItem('loggedIn', 'true');
      setupNavigation();
    } else {
      alert('ID atau Password salah!');
    }
  });

  // Periksa status log masuk
  if (localStorage.getItem('loggedIn') === 'true') {
    loginSection.classList.add('hidden');
    form.classList.remove('hidden');
  }

  // Hantar borang
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
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
        body: JSON.stringify(data),
      });
      const text = await response.text();
      message.textContent = text;
      form.reset();
      totalScore.textContent = '0';
      percentage.textContent = '0';
    } catch (error) {
      message.textContent = 'Error: ' + error.message;
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Halaman Analisis
if (document.getElementById('loadRankings')) {
  setupNavigation();
  const loadRankingsBtn = document.getElementById('loadRankings');
  const monthSelect = document.getElementById('monthSelect');
  const rankingsDiv = document.getElementById('rankings');

  loadRankingsBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(`${API_URL}?action=ranking&bulan=${monthSelect.value}`);
      const rankings = await response.json();
      
      rankingsDiv.innerHTML = '';
      [1, 2, 3, 4, 5].forEach(tingkatan => {
        const table = document.createElement('table');
        table.innerHTML = `
          <thead>
            <tr><th colspan="2">Tingkatan ${tingkatan}</th></tr>
            <tr><th>Kelas</th><th>Peratusan</th></tr>
          </thead>
          <tbody>
            ${rankings[tingkatan].map(row => `
              <tr><td>${row.kelas}</td><td>${row.peratusan}%</td></tr>
            `).join('')}
          </tbody>
        `;
        rankingsDiv.appendChild(table);
      });
    } catch (error) {
      rankingsDiv.innerHTML = 'Error: ' + error.message;
    }
  });
}

// Halaman Status
if (document.getElementById('statusTables')) {
  setupNavigation();
  const statusTables = document.getElementById('statusTables');

  if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'form.html';
  } else {
    fetch(`${API_URL}?action=status`)
      .then(res => res.json())
      .then(status => {
        [1, 2, 3, 4, 5].forEach(tingkatan => {
          const table = document.createElement('table');
          table.innerHTML = `
            <thead>
              <tr><th colspan="2">Tingkatan ${tingkatan}</th></tr>
              <tr><th>Kelas</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${Object.entries(status[tingkatan]).map(([kelas, recorded]) => `
                <tr class="${recorded ? 'green' : 'red'}">
                  <td>${kelas}</td>
                  <td>${recorded ? 'Sudah Direkod' : 'Belum Direkod'}</td>
                </tr>
              `).join('')}
            </tbody>
          `;
          statusTables.appendChild(table);
        });
      })
      .catch(error => {
        statusTables.innerHTML = 'Error: ' + error.message;
      });
  }
}