const criteriaList = [
    "Meja Guru - Ada Alas dan Bunga", "Meja Pelajar - Mempunyai Nama", "Jadual Bertugas - Kreatif",
    "Jam Dinding - Ada & Berfungsi", "Langsir - Kemas & Bersih", "Buku - Disusun Kemas Dalam Loker",
    "Mempunyai Nama Pelajar (Loker)", "Lantai Bersih", "Penyapu/Penyodok - Digantung di Belakang Kelas",
    "Tong Sampah Kecil - Tiada Sampah Selepas Rehat dan Sebelum Balik", "Kerusi - Kemas dan Teratur",
    "Buku di Bawah Meja - Kemas", "Lampu - Bersih", "Kipas - Bersih", "Papan Putih - Bersih",
    "Pemadam White Board - Ada", "Tingkap - Bersih", "Pintu - Bersih", "Siling - Bersih",
    "Dinding Kelas - Bersih", "Mempunyai Tajuk (Softboard)", "Mengikut Pelan (Softboard)",
    "Dihias Dengan Kreatif dan Menarik (Softboard)", "Alas Meja Pelajar", "Banner Pintu",
    "Kata-Kata Motivasi", "Sudut Khas Dalam Kelas", "Koridor Kelas - Bersih & Ceria"
];

const maxScore = criteriaList.length * 5; // 28 criteria * 5 = 140
const scriptUrl = "https://script.google.com/macros/s/AKfycbxW92yzopui-Hqgo4K2IL8U6hvohyn3KnEGCuJOVklGJDiCjy9di8PvhrTgi3nNcmbI/exec";

// Page Navigation
const loginPage = document.getElementById("loginPage");
const formPage = document.getElementById("formPage");
const analysisPage = document.getElementById("analysisPage");
const analysisBtn = document.getElementById("analysisBtn");
const formBtn = document.getElementById("formBtn");

analysisBtn.addEventListener("click", () => {
    showPage(analysisPage);
    loadAnalysisData();
});
formBtn.addEventListener("click", () => showPage(loginPage));

// Login Logic
document.getElementById("loginSubmit").addEventListener("click", () => {
    const id = document.getElementById("loginId").value;
    const password = document.getElementById("loginPassword").value;
    if (id === "mrsmsas" && password === "1234") {
        showPage(formPage);
        document.getElementById("logoutBtn").classList.remove("hidden");
    } else {
        document.getElementById("loginError").textContent = "ID atau Kata Laluan Salah!";
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    showPage(loginPage);
    document.getElementById("logoutBtn").classList.add("hidden");
    document.getElementById("loginId").value = "";
    document.getElementById("loginPassword").value = "";
    document.getElementById("loginError").textContent = "";
});

function showPage(page) {
    loginPage.classList.add("hidden");
    formPage.classList.add("hidden");
    analysisPage.classList.add("hidden");
    page.classList.remove("hidden");
}

// Form Setup
const criteriaContainer = document.getElementById("criteriaList");
criteriaList.forEach((criterion, index) => {
    const div = document.createElement("div");
    div.classList.add("criteria");
    div.innerHTML = `
        <label>${criterion}:</label>
        <div class="radio-group">
            ${[1, 2, 3, 4, 5].map(score => `
                <label><input type="radio" name="criteria${index}" value="${score}" required> ${score}</label>
            `).join("")}
        </div>
    `;
    criteriaContainer.appendChild(div);
});

// Calculate Total and Percentage
document.getElementById("cleanlinessForm").addEventListener("change", () => {
    let total = 0;
    criteriaList.forEach((_, index) => {
        const selected = document.querySelector(`input[name="criteria${index}"]:checked`);
        if (selected) total += parseInt(selected.value);
    });
    document.getElementById("totalScore").textContent = total;
    const percentage = ((total / maxScore) * 100).toFixed(2);
    document.getElementById("percentageScore").textContent = `${percentage}%`;
});

// Form Submission
document.getElementById("cleanlinessForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;

    const formData = {
        tingkatan: document.querySelector("select[name='tingkatan']").value,
        kelas: document.querySelector("select[name='kelas']").value,
        bulan: document.querySelector("select[name='bulan']").value,
        tarikh: document.querySelector("input[name='tarikh']").value,
        jumlah: document.getElementById("totalScore").textContent,
        peratusan: document.getElementById("percentageScore").textContent
    };

    criteriaList.forEach((criterion, index) => {
        const selected = document.querySelector(`input[name="criteria${index}"]:checked`);
        formData[criterion.replace(/[^a-zA-Z0-9]/g, "")] = selected ? selected.value : "0";
    });

    fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.text())
    .then(result => {
        alert(result === "Success" ? "Data berjaya dihantar!" : "Ralat: " + result);
        submitBtn.disabled = false;
    })
    .catch(error => {
        alert("Ralat: " + error.message);
        submitBtn.disabled = false;
    });
});

// Analysis Page
function loadAnalysisData() {
    fetch(scriptUrl)
        .then(response => response.json())
        .then(data => {
            const monthFilter = document.getElementById("monthFilter").value;
            const filteredData = monthFilter ? data.filter(row => row.bulan === monthFilter) : data;

            // Ranking Tables
            const tablesContainer = document.getElementById("rankingTables");
            tablesContainer.innerHTML = "";
            for (let tingkatan = 1; tingkatan <= 5; tingkatan++) {
                const tingkatanData = filteredData
                    .filter(row => row.tingkatan === String(tingkatan))
                    .sort((a, b) => b.jumlah - a.jumlah);
                tablesContainer.innerHTML += `
                    <h3>Tingkatan ${tingkatan}</h3>
                    <table>
                        <tr><th>Kelas</th><th>Jumlah</th><th>Peratusan</th></tr>
                        ${tingkatanData.map(row => `
                            <tr><td>${row.kelas}</td><td>${row.jumlah}</td><td>${row.peratusan}</td></tr>
                        `).join("")}
                    </table>
                `;
            }

            // Line Charts
            const classes = ["BERLIAN", "DELIMA", "INTAN", "NILAM", "TOPAZ", "ZAMRUD"];
            const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
            for (let tingkatan = 1; tingkatan <= 5; tingkatan++) {
                const ctx = document.getElementById(`chart${tingkatan}`).getContext("2d");
                const datasets = classes.map((kelas, index) => {
                    const classData = data.filter(row => row.tingkatan === String(tingkatan) && row.kelas === kelas);
                    const monthlyScores = ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"].map(month => {
                        const row = classData.find(r => r.bulan === month);
                        return row ? parseInt(row.jumlah) : 0;
                    });
                    return {
                        label: kelas,
                        data: monthlyScores,
                        borderColor: colors[index],
                        fill: false
                    };
                });
                new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"],
                        datasets
                    },
                    options: { scales: { y: { beginAtZero: true, max: maxScore } } }
                });
            }

            // Record Status
            const recordStatus = document.getElementById("recordStatus");
            recordStatus.innerHTML = "<h3>Status Rekod</h3>";
            const months = ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"];
            months.forEach(month => {
                const recorded = data.filter(row => row.bulan === month).map(row => `${row.tingkatan}-${row.kelas}`);
                const allClasses = [];
                for (let t = 1; t <= 5; t++) classes.forEach(k => allClasses.push(`${t}-${k}`));
                const notRecorded = allClasses.filter(cls => !recorded.includes(cls));
                recordStatus.innerHTML += `
                    <p>${month}:</p>
                    <ul>
                        ${recorded.map(cls => `<li style="color: green">${cls} (Sudah Rekod)</li>`).join("")}
                        ${notRecorded.map(cls => `<li style="color: red">${cls} (Belum Rekod)</li>`).join("")}
                    </ul>
                `;
            });
        })
        .catch(error => console.error("Error loading analysis data:", error));
}

document.getElementById("monthFilter").addEventListener("change", loadAnalysisData);
showPage(analysisPage); // Default page
loadAnalysisData();
