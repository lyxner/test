// upload.js
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Log all environment variables to see if API_USER and API_SECRET are set correctly
console.log('All environment variables:', process.env);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Check if the environment variables are defined
    if (!process.env.API_USER || !process.env.API_SECRET) {
      console.error('API_USER or API_SECRET is missing!');
      return res.status(500).json({
        status: 'error',
        message: 'API_USER or API_SECRET environment variables are not defined.',
      });
    }

    try {
      const formData = new FormData();
      const file = req.body.image; // Assuming you're receiving the image from the frontend

      formData.append('media', file); // Append the image to the form data
      formData.append('models', 'genai');
      formData.append('api_user', process.env.API_USER);
      formData.append('api_secret', process.env.API_SECRET);

      const response = await axios.post(
        'https://api.sightengine.com/1.0/check.json',
        formData,
        { headers: formData.getHeaders() }
      );

      // Respond with the analysis result
      res.status(200).json({ status: 'success', data: response.data });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ status: 'error', message: 'Error processing the image.' });
    }
  } else {
    res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }
}
