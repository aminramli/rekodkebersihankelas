const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzl4CHEkx1TsseThtCPW-22rXlzEIFg7sVSo58YccXuSQhqgsJPDS7ZC8zw2kS7oX5w/exec';
const CRITERIA_COUNT = 28;
let charts = {};
let isLoggedIn = false;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'mrsmsas' && password === '1234') {
        isLoggedIn = true;
        document.getElementById('logoutBtn').style.display = 'inline-block';
        showForm();
    } else {
        alert('ID atau kata laluan salah!');
    }
}

function logout() {
    isLoggedIn = false;
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showLogin();
}

function showLogin() {
    document.getElementById('login').classList.add('active');
    document.getElementById('form').classList.remove('active');
    document.getElementById('analysis').classList.remove('active');
}

function showForm() {
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    document.getElementById('form').classList.add('active');
    document.getElementById('login').classList.remove('active');
    document.getElementById('analysis').classList.remove('active');
}

function showAnalysis() {
    document.getElementById('analysis').classList.add('active');
    document.getElementById('form').classList.remove('active');
    document.getElementById('login').classList.remove('active');
    fetchAnalysisData();
}

document.getElementById('cleanlinessForm').addEventListener('submit', async function(e) {
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

    try {
        const response = await fetch(APP_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'no-cors' // Guna 'no-cors' kerana Apps Script tidak menyokong respons CORS penuh
        });

        // Dengan 'no-cors', kita tidak boleh membaca response.text() secara langsung,
        // jadi kita anggap kejayaan jika tiada ralat dilemparkan
        alert('Data berjaya disimpan!');
        submitBtn.disabled = false;
        this.reset();
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('Ralat berlaku semasa menghantar data: ' + error.message);
        submitBtn.disabled = false;
    }
});

function fetchAnalysisData() {
    fetch(APP_SCRIPT_URL, {
        method: 'GET',
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        processAnalysis(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Ralat mengambil data analisis: ' + error.message);
    });
}

function processAnalysis(data) {
    const months = ['JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN', 'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'];
    const classes = ['BERLIAN', 'DELIMA', 'INTAN', 'NILAM', 'TOPAZ', 'ZAMRUD'];
    const currentMonth = 'MAC';

    const monthFilter = document.getElementById('analysisMonth').value || currentMonth;
    const tablesDiv = document.getElementById('tables');
    tablesDiv.innerHTML = '';

    for (let tingkatan = 1; tingkatan <= 5; tingkatan++) {
        let tableData = data
            .filter(row => row[1] === tingkatan.toString() && row[3] === monthFilter)
            .map(row => ({
                kelas: row[2],
                total: row[32],
                peratusan: row[33]
            }))
            .sort((a, b) => b.total - a.total);

        let table = `
            <h3>Tingkatan ${tingkatan}</h3>
            <table>
                <tr><th>Kelas</th><th>Jumlah</th><th>Peratusan</th></tr>
                ${tableData.map(row => `<tr><td>${row.kelas}</td><td>${row.total}</td><td>${row.peratusan}%</td></tr>`).join('')}
            </table>
        `;
        tablesDiv.innerHTML += table;
    }

    for (let tingkatan = 1; tingkatan <= 5; tingkatan++) {
        const chartData = {
            labels: months,
            datasets: classes.map(kelas => ({
                label: kelas,
                data: months.map(month => {
                    const entry = data.find(row => row[1] === tingkatan.toString() && row[2] === kelas && row[3] === month);
                    return entry ? entry[32] : 0;
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
        data.filter(row => row[3] === currentMonth && row[1] === t.toString())
            .forEach(row => recorded.add(`${row[1]}-${row[2]}`));
    }
    
    const notRecorded = allClasses.filter(c => !recorded.has(c));
    document.getElementById('recorded').innerHTML = `<h4>Sudah Direkodkan:</h4><p>${Array.from(recorded).join(', ')}</p>`;
    document.getElementById('notRecorded').innerHTML = `<h4>Belum Direkodkan:</h4><p>${notRecorded.join(', ')}</p>`;
}

document.getElementById('analysisMonth').addEventListener('change', fetchAnalysisData);
