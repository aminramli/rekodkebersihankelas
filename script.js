const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzKMD71rI8MvTKeF0KO0_8Sz5LHXuN5oCMqEHaW7ilY1ZuxQgzJGZdR7X_vis9vOg/exec';
const CRITERIA_COUNT = 28;
let charts = {};
let isLoggedIn = false;

// Log Masuk
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'mrsmsas' && password === '1234') {
        isLoggedIn = true;
        document.getElementById('logoutBtn').style.display = 'inline-block';
        showForm();
    } else {
        alert('ID atau kata laluan salah!');
    }
});

// Log Keluar
function logout() {
    isLoggedIn = false;
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showLogin();
}

// Tunjukkan Bahagian Log Masuk
function showLogin() {
    document.getElementById('login').classList.add('active');
    document.getElementById('form').classList.remove('active');
    document.getElementById('analysis').classList.remove('active');
}

// Tunjukkan Bahagian Borang
function showForm() {
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    document.getElementById('form').classList.add('active');
    document.getElementById('login').classList.remove('active');
    document.getElementById('analysis').classList.remove('active');
}

// Tunjukkan Bahagian Analisis
function showAnalysis() {
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    document.getElementById('analysis').classList.add('active');
    document.getElementById('form').classList.remove('active');
    document.getElementById('login').classList.remove('active');
    fetchAnalysisData();
}

// Hantar Borang
document.getElementById('cleanlinessForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    let total = 0;
    for (let key in data) {
        if (key !== 'tingkatan' && key !== 'kelas' && key !== 'bulan' && key !== 'tarikh') {
            total += parseInt(data[key]) || 0;
        }
    }
    data.total = total;
    data.peratusan = ((total / (CRITERIA_COUNT * 5)) * 100).toFixed(2);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', APP_SCRIPT_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Respons dari Apps Script:', xhr.responseText);
                alert('Data berjaya disimpan!');
                submitBtn.disabled = false;
                document.getElementById('cleanlinessForm').reset();
            } else if (xhr.status === 0) {
                alert('Gagal menyimpan data: Tiada sambungan ke pelayan (Status: 0). Sila hoskan aplikasi pada pelayan web.');
                submitBtn.disabled = false;
            } else {
                alert('Gagal menyimpan data: ' + xhr.statusText + ' (Status: ' + xhr.status + ')');
                console.log('Ralat respons:', xhr.responseText);
                submitBtn.disabled = false;
            }
        }
    };

    xhr.onerror = function() {
        alert('Ralat rangkaian semasa menghantar data. Sila semak sambungan internet atau hoskan aplikasi pada pelayan web.');
        console.error('Ralat xhr:', xhr);
        submitBtn.disabled = false;
    };

    xhr.send(JSON.stringify(data));
});

// Ambil Data Analisis
function fetchAnalysisData() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', APP_SCRIPT_URL, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log('Data dari Google Sheet:', data);
                    if (data.length === 0) {
                        alert('Tiada data dalam Google Sheet.');
                    }
                    processAnalysis(data);
                } catch (e) {
                    alert('Ralat memproses data dari Google Sheet: ' + e.message);
                }
            } else if (xhr.status === 0) {
                alert('Gagal mengambil data analisis: Tiada sambungan ke pelayan (Status: 0). Sila hoskan aplikasi pada pelayan web.');
            } else {
                alert('Gagal mengambil data analisis: ' + xhr.statusText + ' (Status: ' + xhr.status + ')');
            }
        }
    };

    xhr.onerror = function() {
        alert('Ralat rangkaian semasa mengambil data. Sila semak sambungan internet atau hoskan aplikasi pada pelayan web.');
    };

    xhr.send();
}

// Proses Data Analisis
function processAnalysis(data) {
    const months = ['JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN', 'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'];
    const classes = ['BERLIAN', 'DELIMA', 'INTAN', 'NILAM', 'TOPAZ', 'ZAMRUD'];
    const currentMonth = 'MAC';

    const monthFilter = document.getElementById('analysisMonth').value || currentMonth;
    console.log('Bulan yang dipilih:', monthFilter);

    const tablesDiv = document.getElementById('tables');
    tablesDiv.innerHTML = '';

    const filteredData = data.filter(row => String(row[3]).toUpperCase() === monthFilter);
    console.log('Data ditapis untuk bulan:', filteredData);

    if (filteredData.length === 0) {
        tablesDiv.innerHTML = '<p>Tiada data untuk bulan yang dipilih.</p>';
    } else {
        for (let tingkatan = 1; tingkatan <= 5; tingkatan++) {
            let tableData = filteredData
                .filter(row => String(row[1]) === String(tingkatan))
                .map(row => ({
                    kelas: row[2],
                    total: row[33],
                    peratusan: row[34]
                }))
                .sort((a, b) => b.total - a.total);

            let table = `
                <h3>Tingkatan ${tingkatan}</h3>
                <table>
                    <tr><th>Kelas</th><th>Jumlah</th><th>Peratusan</th></tr>
                    ${tableData.length > 0 ? tableData.map(row => `<tr><td>${row.kelas}</td><td>${row.total}</td><td>${row.peratusan}%</td></tr>`).join('') : '<tr><td colspan="3">Tiada data</td></tr>'}
                </table>
            `;
            tablesDiv.innerHTML += table;
        }
    }

    for (let tingkatan = 1; tingkatan <= 5; tingkatan++) {
        const chartData = {
            labels: months,
            datasets: classes.map(kelas => ({
                label: kelas,
                data: months.map(month => {
                    const entry = data.find(row => String(row[1]) === String(tingkatan) && row[2] === kelas && String(row[3]).toUpperCase() === month);
                    return entry ? entry[33] : 0;
                }),
                borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                fill: false
            }))
        };

        if (charts[tingkatan]) charts[tingkatan].destroy();
        charts[tingkatan] = new Chart(document.getElementById(`chart${tingkatan}`), {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: CRITERIA_COUNT * 5 }
                },
                plugins: {
                    title: { display: true, text: `Progres Kebersihan Tingkatan ${tingkatan}` }
                }
            }
        });
    }

    const recorded = new Set();
    const allClasses = [];
    for (let t = 1; t <= 5; t++) {
        classes.forEach(k => allClasses.push(`${t}-${k}`));
        data.filter(row => String(row[3]).toUpperCase() === currentMonth && String(row[1]) === String(t))
            .forEach(row => recorded.add(`${row[1]}-${row[2]}`));
    }
    
    const notRecorded = allClasses.filter(c => !recorded.has(c));
    document.getElementById('recorded').innerHTML = `<h4>Sudah Direkodkan:</h4><p>${Array.from(recorded).join(', ')}</p>`;
    document.getElementById('notRecorded').innerHTML = `<h4>Belum Direkodkan:</h4><p>${notRecorded.join(', ')}</p>`;
}

document.getElementById('analysisMonth').addEventListener('change', fetchAnalysisData);

// Tunjukkan log masuk pada permulaan
showLogin();
