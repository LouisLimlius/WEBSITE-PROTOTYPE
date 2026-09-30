// Data Awal
const mobilAwal = [
    { id: 1, nama: "Toyota Avanza", tipe: "MPV", harga: 350000, stok: true, img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=400" },
    { id: 2, nama: "Honda Brio", tipe: "City Car", harga: 300000, stok: true, img: "https://images.unsplash.com/photo-1562141961-b5d1855d787d?auto=format&fit=crop&q=80&w=400" },
    { id: 3, nama: "Pajero Sport", tipe: "SUV", harga: 800000, stok: true, img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400" }
];

const promoAwal = [
    { judul: "Diskon Akhir Tahun", ket: "Potongan 20% untuk semua unit.", kode: "YEAR20" },
    { judul: "Sewa 3 Hari Gratis 1", ket: "Berlaku khusus untuk Honda Brio.", kode: "BRIOFREE" }
];

// Inisialisasi Data dari LocalStorage (Jika ada)
let mobil = JSON.parse(localStorage.getItem('mobil')) || mobilAwal;
let pesanan = JSON.parse(localStorage.getItem('pesanan')) || [];

// Fungsi untuk render daftar mobil
function tampilkanMobil() {
    const container = document.getElementById('daftar-mobil');
    const select = document.getElementById('select-mobil');
    
    container.innerHTML = '';
    select.innerHTML = '<option value="">-- Pilih --</option>';

    mobil.forEach(m => {
        // Render Card
        container.innerHTML += `
            <div class="card mobil-card">
                <img src="${m.img}" alt="${m.nama}">
                <h3>${m.nama}</h3>
                <p>Tipe: ${m.tipe}</p>
                <p><strong>Rp ${m.harga.toLocaleString()}/hari</strong></p>
                <span class="badge ${m.stok ? 'badge-tersedia' : 'badge-habis'}">
                    ${m.stok ? 'Tersedia' : 'Sudah Terpakai'}
                </span>
            </div>
        `;

        // Update Dropdown Form
        if (m.stok) {
            select.innerHTML += `<option value="${m.id}">${m.nama} - Rp ${m.harga.toLocaleString()}</option>`;
        }
    });

    updateStats();
}

// Fungsi render promo
function tampilkanPromo() {
    const container = document.getElementById('daftar-promo');
    container.innerHTML = '';
    promoAwal.forEach(p => {
        container.innerHTML += `
            <div class="promo-item">
                <h3>${p.judul}</h3>
                <p>${p.ket}</p>
                <p><strong>KODE: ${p.kode}</strong></p>
            </div>
        `;
    });
}

// Fungsi Update Statistik
function updateStats() {
    document.getElementById('count-mobil').innerText = mobil.length;
    document.getElementById('count-tersedia').innerText = mobil.filter(m => m.stok).length;
    document.getElementById('count-pesanan').innerText = pesanan.length;
}

// Fungsi Render Riwayat
function tampilkanRiwayat() {
    const container = document.getElementById('riwayat-booking');
    if (pesanan.length === 0) {
        container.innerHTML = '<p>Belum ada riwayat pesanan.</p>';
        return;
    }
    container.innerHTML = '';
    pesanan.forEach((p, index) => {
        container.innerHTML += `
            <div class="booking-row">
                <div>
                    <strong>${p.mobilNama}</strong> oleh ${p.customer}
                    <br><small>${p.tglMulai} s/d ${p.tglSelesai} (${p.hari} hari)</small>
                </div>
                <div>Rp ${p.total.toLocaleString()}</div>
            </div>
        `;
    });
}

// Event Kalkulasi Harga saat input berubah
function hitungHarga() {
    const id = document.getElementById('select-mobil').value;
    const mulai = document.getElementById('tgl-mulai').value;
    const selesai = document.getElementById('tgl-selesai').value;
    const info = document.getElementById('info-harga');

    if (id && mulai && selesai) {
        const m = mobil.find(x => x.id == id);
        const d1 = new Date(mulai);
        const d2 = new Date(selesai);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays > 0) {
            const total = diffDays * m.harga;
            info.innerHTML = `Estimasi Sewa: <strong>${diffDays} Hari</strong> | Total: <strong>Rp ${total.toLocaleString()}</strong>`;
            return { total, diffDays, mobilNama: m.nama };
        }
    }
    info.innerHTML = "Pilih mobil dan tanggal untuk melihat harga.";
    return null;
}

// Event Submit Form
document.getElementById('form-sewa').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = hitungHarga();
    if (!data) return alert("Pilih tanggal dengan benar!");

    const idMobil = document.getElementById('select-mobil').value;
    
    // 1. Simpan Data Pesanan
    const baru = {
        mobilNama: data.mobilNama,
        customer: document.getElementById('nama').value,
        tglMulai: document.getElementById('tgl-mulai').value,
        tglSelesai: document.getElementById('tgl-selesai').value,
        hari: data.diffDays,
        total: data.total
    };
    pesanan.push(baru);

    // 2. Update Stok Mobil (Ubah jadi false)
    mobil = mobil.map(m => {
        if (m.id == idMobil) return { ...m, stok: false };
        return m;
    });

    // 3. Simpan ke Storage
    localStorage.setItem('mobil', JSON.stringify(mobil));
    localStorage.setItem('pesanan', JSON.stringify(pesanan));

    // 4. Feedback & Reset
    const notif = document.getElementById('notif');
    notif.innerText = `Berhasil memesan ${data.mobilNama}! Stok langsung terupdate di sistem.`;
    notif.classList.remove('hidden');
    
    this.reset();
    tampilkanMobil();
    tampilkanRiwayat();
    
    // Sembunyikan notif setelah 5 detik
    setTimeout(() => notif.classList.add('hidden'), 5000);
});

// Fungsi Reset
function resetData() {
    if(confirm("Hapus semua simulasi?")) {
        localStorage.clear();
        location.reload();
    }
}

// Jalankan saat load
document.getElementById('select-mobil').addEventListener('change', hitungHarga);
document.getElementById('tgl-mulai').addEventListener('change', hitungHarga);
document.getElementById('tgl-selesai').addEventListener('change', hitungHarga);

tampilkanMobil();
tampilkanPromo();
tampilkanRiwayat();
