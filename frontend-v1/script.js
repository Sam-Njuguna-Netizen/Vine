// index.mjs
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Folders to skip (add folder names here, relative to scanned folders)
const skipFolders = ['node_modules', '.git', 'dist', '.next','public'];

// ✅ Set the root directory to scan
const rootDir = path.join(__dirname, '.'); // replace 'your-folder' with your target folder

let allText = '';

async function processFile(filePath) {
  const ext = path.extname(filePath);
  const title = path.basename(filePath);

  if (ext === '.ts'||ext=='.js' || ext === '.json' || ext === '.md' || ext ==='.tsx' || ext === '.jsx') {
    const content = await readFile(filePath, 'utf8');
    allText += `// Path: ${filePath}\n// Title: ${title}\n${content.trim()}\n`;
  } else {
    allText += `// Path: ${filePath}\n// Title: ${title}\n`;
  }
}

async function traverseDirectory(dir) {
  const files = await readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const fileStat = await stat(fullPath);

    if (fileStat.isDirectory()) {
      const folderName = path.basename(fullPath);
      if (skipFolders.includes(folderName)) {
        continue; // Skip folders in skipFolders
      }
      await traverseDirectory(fullPath);
    } else {
      await processFile(fullPath);
    }
  }
}

async function main() {
  try {
    await traverseDirectory(rootDir);
    const cleanedText = allText.trim().replace(/\n{2,}/g, '\n\n');
    await writeFile(path.join(__dirname, 'frontend.txt'), cleanedText, 'utf8');
    console.log('All file data has been written to text.txt');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
