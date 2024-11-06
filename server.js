const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware untuk menyajikan file statis
app.use(express.static(path.join(__dirname)));

// Konfigurasi Multer untuk menyimpan file yang diupload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Menyimpan dengan nama asli
  },
});

const upload = multer({ storage: storage });

// Endpoint untuk menerima gambar dan melakukan analisis
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path; // Memastikan file berhasil diupload

    // Membuat form-data untuk dikirim ke API
    const formData = new FormData();
    formData.append('media', fs.createReadStream(imagePath));
    formData.append('models', 'genai');
    formData.append('api_user', '568872453');  // Ganti dengan api_user kamu
    formData.append('api_secret', 'aRhBT7BY4dnFSv7RSRjmSRw54ff4GYcj');  // Ganti dengan api_secret kamu

    // Kirim request ke API
    const response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, {
      headers: formData.getHeaders(),
    });

    // Log data respons dari API untuk debugging
    console.log('Data respons dari API:', response.data);

    // Hapus file setelah diproses
    fs.unlinkSync(imagePath);

    // Kirim respon ke frontend
    res.json({ status: 'success', data: response.data });
  } catch (error) {
    console.error('Error:', error.message); // Mencetak pesan error yang lebih rinci
    res.json({ status: 'error', message: 'Terjadi kesalahan saat analisis gambar.' });
  }
});

// Endpoint untuk menampilkan halaman HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
