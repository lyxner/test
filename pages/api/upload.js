import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false, // Disable Vercel's default body parser to handle file uploads manually
  },
};

const handleUpload = async (req, res) => {
  const form = new formidable.IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form Parsing Error:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan saat mengupload gambar' });
    }

    const file = files.image[0]; // Assuming the input field is named 'image'
    
    if (!file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    // Now let's send the file to the API
    const formData = new FormData();
    formData.append('media', fs.createReadStream(file.filepath));
    formData.append('models', 'genai');
    formData.append('api_user', '568872453');  // Replace with your API user
    formData.append('api_secret', 'aRhBT7BY4dnFSv7RSRjmSRw54ff4GYcj');  // Replace with your API secret

    try {
      const response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, {
        headers: formData.getHeaders(),
      });

      console.log('API Response:', response.data);

      res.status(200).json({ status: 'success', data: response.data });
    } catch (error) {
      console.error('API Error:', error.message);
      res.status(500).json({ message: 'Terjadi kesalahan saat analisis gambar.' });
    }
  });
};

export default handleUpload;
