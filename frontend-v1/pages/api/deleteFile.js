// pages/api/deleteVideo.ts
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'DELETE') {
    const { fileName } = req.query;

    // Validate input
    if (!fileName || typeof fileName !== 'string' || fileName.includes('..')) {
      return res.status(400).json({ success: false, message: 'Invalid file name' });
    }

    // Restrict to PDF files
    // if (!fileName.endsWith('.pdf')) {
    //   return res.status(400).json({ success: false, message: 'Only PDF files are allowed' });
    // }

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', fileName);

    // Check if the file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'File deletion failed', error: err.message });
        }
        return res.status(200).json({ success: true, message: 'File deleted successfully' });
      });
    } else {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }
}