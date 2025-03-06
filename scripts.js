const criteriaList = [
    "MejaGuruAdaAlasdanBunga", "MejaPelajarMempunyaiNama", "JadualBertugasKreatif",
    "JamDindingAdaBerfungsi", "LangsirKemasBersih", "BukuDisusunKemasDalamLoker",
    "MempunyaiNamaPelajarLoker", "LantaiBersih", "PenyapuPenyodokDigantungdiBelakangKelas",
    "TongSampahKecilTiadaSampahSelepasRehatdanSebelumBalik", "KerusiKemasdanTeratur",
    "BukudiBawahMejaKemas", "LampuBersih", "KipasBersih", "PapanPutihBersih",
    "PemadamWhiteBoardAda", "TingkapBersih", "PintuBersih", "SilingBersih",
    "DindingKelasBersih", "MempunyaiTajukSoftboard", "MengikutPelanSoftboard",
    "DihiasDenganKreatifdanMenarikSoftboard", "AlasMejaPelajar", "BannerPintu",
    "KataKataMotivasi", "SudutKhasDalamKelas", "KoridorKelasBersihCeria"
];

const displayCriteriaList = [
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
const scriptUrl = "https://script.google.com/macros/s/AKfycbxEJTp3UdIy_haJEvH49PV36NY7YETOVjmm4YHZnd17V1LTDdY9yrDrBFXxGQhCfAzy/exec";

// Page Navigation
const loginPage = document.getElementById("loginPage");
const formPage = document.getElementById("formPage");
const analysisPage = document.getElementById("analysisPage");
const statusPage = document.getElementById("statusPage");
const analysisBtn = document.getElementById("analysisBtn");
const formBtn = document.getElementById("formBtn");
const statusBtn = document.getElementById("statusBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Analysis page is accessible without login
analysisBtn.addEventListener("click", () => {
    showPage(analysisPage);
    analysisBtn.classList.add("active");
    formBtn.classList.remove("active");
    statusBtn.classList.remove("active");
    logoutBtn.classList.remove("active");
    loadAnalysisData();
});

// Form page requires login
formBtn.addEventListener("click", () => {
    showPage(loginPage);
    formBtn.classList.add("active");
    analysisBtn.classList.remove("active");
    statusBtn.classList.remove("active");
    logoutBtn.classList.remove("active");
});

// Status page requires login
statusBtn.addEventListener("click", () => {
    showPage(statusPage);
    statusBtn.classList.add("active");
    analysisBtn.classList.remove("active");
    formBtn.classList.remove("active");
    logoutBtn.classList.remove("active");
    loadStatusData();
});

// Logout button
logoutBtn.addEventListener("click", () => {
    showPage(analysisPage);
    logoutBtn.classList.add("hidden");
    statusBtn.classList.add("hidden");
    document.getElementById("loginId").value = "";
    document.getElementById("loginPassword").value = "";
    document.getElementById("loginError").textContent = "";
    document.getElementById("cleanlinessForm").reset();
    document.getElementById("totalScore").textContent = "0";
    document.getElementById("percentageScore").textContent = "0%";
    analysisBtn.classList.add("active");
    formBtn.classList.remove("active");
    statusBtn.classList.remove("active");
    loadAnalysisData();
});

// Login Logic
document.getElementById("loginSubmit").addEventListener("click", () => {
    const id = document.getElementById("loginId").value;
    const password = document.getElementById("loginPassword").value;
    if (id === "mrsmsas" && password === "1234") {
        showPage(formPage);
        logoutBtn.classList.remove("hidden");
        statusBtn.classList.remove("hidden");
        formBtn.classList.add("active");
        analysisBtn.classList.remove("active");
        statusBtn.classList.remove("active");
        logoutBtn.classList.remove("active");
    } else {
        document.getElementById("loginError").textContent = "ID atau Kata Laluan Salah!";
    }
});

function showPage(page) {
    loginPage.classList.add("hidden");
    formPage.classList.add("hidden");
    analysisPage.classList.add("hidden");
    statusPage.classList.add("hidden");
    page.classList.remove("hidden");
}

// Form Setup
const criteriaContainer = document.getElementById("criteriaList");
displayCriteriaList.forEach((criterion, index) => {
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
        formData[criterion] = selected ? selected.value : "0";
    });

    fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "text/plain" },
        mode: "cors",
        redirect: "follow"
    })
    .then(response => response.text())
    .then(result => {
        if (result === "Success") {
            alert("Data berjaya dihantar!");
            document.getElementById("cleanlinessForm").reset();
            document.getElementById("totalScore").textContent = "0";
            document.getElementById("percentageScore").textContent = "0%";
        } else {
            alert("Ralat: " + result);
        }
        submitBtn.disabled = false;
    })
    .catch(error => {
        alert("Ralat: " + error.message);
        submitBtn.disabled = false;
    });
});

// Analysis Page
function loadAnalysisData() {
    fetch(scriptUrl, { method: "GET" })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok: " + response.status);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) throw new Error("Data is not an array");
            const monthFilter = document.getElementById("monthFilter").value.toUpperCase();
            const filteredData = monthFilter ? data.filter(row => (row.bulan || "").toUpperCase() === monthFilter) : data;

            // Ranking Tables
            const tablesContainer = document.getElementById("rankingTables");
            tablesContainer.innerHTML = "";
            for (let tingkatan = 1; tingkatan <= 5; tingkatan++) {
                const tingkatanData = filteredData
                    .filter(row => row.tingkatan === String(tingkatan))
                    .sort((a, b) => parseInt(b.jumlah || 0) - parseInt(a.jumlah || 0));
                tablesContainer.innerHTML += `
                    <h3>Tingkatan ${tingkatan}</h3>
                    <table>
                        <tr><th>Kelas</th><th>Jumlah</th><th>Peratusan</th></tr>
                        ${tingkatanData.length > 0 
                            ? tingkatanData.map(row => `
                                <tr><td>${row.kelas || "N/A"}</td><td>${row.jumlah || "0"}</td><td>${row.peratusan || "0%"}</td></tr>
                            `).join("")
                            : "<tr><td colspan='3'>Tiada data untuk bulan ini</td></tr>"}
                    </table>
                `;
            }

            // Line Charts
            const classes = ["BERLIAN", "DELIMA", "INTAN", "NILAM", "TOPAZ", "ZAMRUD"];
            const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
            for (let tingkatan = 1; tingkatan <= 5; tingkatan++) {
                const ctx = document.getElementById(`chart${tingkatan}`).getContext("2d");
                if (window[`chart${tingkatan}`]) {
                    window[`chart${tingkatan}`].destroy();
                }
                const datasets = classes.map((kelas, index) => {
                    const classData = data.filter(row => row.tingkatan === String(tingkatan) && row.kelas === kelas);
                    const monthlyScores = ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"].map(month => {
                        const row = classData.find(r => (r.bulan || "").toUpperCase() === month);
                        return row ? parseInt(row.jumlah || 0) : 0;
                    });
                    return {
                        label: kelas,
                        data: monthlyScores,
                        borderColor: colors[index],
                        fill: false,
                        tension: 0.1
                    };
                });
                window[`chart${tingkatan}`] = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"],
                        datasets
                    },
                    options: {
                        scales: {
                            y: { beginAtZero: true, max: maxScore },
                            x: { ticks: { color: '#2c3e50' } }
                        },
                        plugins: {
                            legend: { labels: { color: '#2c3e50' } }
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error("Error loading analysis data:", error);
            document.getElementById("rankingTables").innerHTML = "<p>Ralat memuat data analisis: " + error.message + "</p>";
        });
}

// Status Page
function loadStatusData() {
    fetch(scriptUrl, { method: "GET" })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok: " + response.status);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) throw new Error("Data is not an array");
            const recordStatus = document.getElementById("recordStatus");
            recordStatus.innerHTML = "";
            const months = ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"];
            months.forEach(month => {
                const recorded = data.filter(row => (row.bulan || "").toUpperCase() === month).map(row => `${row.tingkatan}-${row.kelas || "N/A"}`);
                recordStatus.innerHTML += `
                    <p>${month}:</p>
                    <ul>
                        ${recorded.length > 0 
                            ? recorded.map(cls => `<li style="color: green">${cls} (Sudah Rekod)</li>`).join("") 
                            : "<li>Tiada rekod kelas di sini</li>"}
                    </ul>
                `;
            });
        })
        .catch(error => {
            console.error("Error loading status data:", error);
            document.getElementById("recordStatus").innerHTML = "<p>Ralat memuat data status: " + error.message + "</p>";
        });
}

document.getElementById("monthFilter").addEventListener("change", loadAnalysisData);

// Show Analysis Page as default without login
showPage(analysisPage);
analysisBtn.classList.add("active");
loadAnalysisData();
