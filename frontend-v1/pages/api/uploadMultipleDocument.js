import fs from 'fs';
import path from 'path';
import multer from 'multer';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure multer storage with dynamic folder creation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.query.folder || 'Default';
    const uploadPath = path.join(process.cwd(), 'public', folder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer to handle multiple files
const upload = multer({ storage }).array('files'); // 'files' is the key name in FormData

export default function handler(req, res) {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        res.status(500).json({ error: 'Upload failed' });
        return reject(err);
      }

      const folder = req.query.folder || 'Default';

      // Map through uploaded files and generate public URLs
      const uploadedFiles = req.files.map((file) => ({
        filename: file.filename,
        publicUrl: `/${folder}/${file.filename}`,
      }));

      res.status(200).json({
        files: uploadedFiles,
        message: 'Files uploaded successfully.',
      });
      resolve();
    });
  });
}
