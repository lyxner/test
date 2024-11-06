// Load environment variables
const apiUser = process.env.API_USER;
const apiSecret = process.env.API_SECRET;

// ... other code remains the same

// Endpoint untuk menerima gambar dan melakukan analisis
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Create form-data for the API request
    const formData = new FormData();
    formData.append('media', fs.createReadStream(imagePath));
    formData.append('models', 'genai');
    formData.append('api_user', apiUser);  // Use environment variable
    formData.append('api_secret', apiSecret);  // Use environment variable

    // Send request to the API
    const response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, {
      headers: formData.getHeaders(),
    });

    // Log API response data for debugging
    console.log('API Response Data:', response.data);

    // Delete the file after processing
    fs.unlinkSync(imagePath);

    // Send response to frontend
    res.json({ status: 'success', data: response.data });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ status: 'error', message: 'Terjadi kesalahan saat analisis gambar.' });
  }
});
