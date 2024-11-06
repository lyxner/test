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
    // Log the environment variables to check if they are set correctly
    console.log('API_USER:', process.env.API_USER); // Log API_USER
    console.log('API_SECRET:', process.env.API_SECRET); // Log API_SECRET

    const imagePath = req.file.path; // Memastikan file berhasil diupload

    // Membuat form-data untuk dikirim ke API
    const formData = new FormData();
    formData.append('media', fs.createReadStream(imagePath));
    formData.append('models', 'genai');
    formData.append('api_user', process.env.API_USER);  // Use the env variable
    formData.append('api_secret', process.env.API_SECRET);  // Use the env variable

    // Send the request to the API
    const response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, {
      headers: formData.getHeaders(),
    });

    // Log the API response for debugging
    console.log('API Response:', response.data);

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
