import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  const publicFolder = path.join(process.cwd(), 'public', 'FeaturedImages');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(publicFolder)) {
    fs.mkdirSync(publicFolder, { recursive: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: publicFolder,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Upload failed' });
      }

      res.status(200).json({ 
        filename: req.file.filename,
        publicUrl: `/FeaturedImages/${req.file.filename}`,
        message: 'Featured Images Stored.'
      });
      resolve();
    });
  });
  }
  