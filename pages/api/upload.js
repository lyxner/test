import FormData from 'form-data';
import axios from 'axios';
import AWS from 'aws-sdk';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file upload
  },
};

const s3 = new AWS.S3();
const BUCKET_NAME = 'your-s3-bucket-name'; // Replace with your S3 bucket name

const uploadToS3 = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: 'image/jpeg', // Adjust based on file type
  };

  return s3.upload(params).promise();
};

export default (req, res) => {
  if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing the form:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengupload gambar' });
      }

      try {
        // Assuming the field name is 'image'
        const uploadedFile = files.image[0];
        const filePath = uploadedFile.filepath;

        // Upload the file to S3
        await uploadToS3(filePath, uploadedFile.originalFilename);

        // Send image to the API for analysis
        const formData = new FormData();
        formData.append('media', fs.createReadStream(filePath));
        formData.append('models', 'genai');
        formData.append('api_user', '568872453');  // Your API user
        formData.append('api_secret', 'aRhBT7BY4dnFSv7RSRjmSRw54ff4GYcj');  // Your API secret

        const response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, {
          headers: formData.getHeaders(),
        });

        // Log API response
        console.log('API Response:', response.data);

        // Respond to the frontend
        res.status(200).json({ status: 'success', data: response.data });
      } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat analisis gambar.' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
