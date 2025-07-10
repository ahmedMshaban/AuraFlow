/**
 *
 * This script downloads the face-api.js models required for the application.
 * It creates a directory for the models if it doesn't exist and downloads
 * the models from the specified URLs.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, 'public', 'models');

// Ensure models directory exists
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Model URLs
const modelUrls = [
  // Face detection model
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',

  // Face landmark model
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',

  // Expression recognition model
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1',
];

// Download each model file
async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(url);
    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
  });
}

async function downloadModels() {
  for (const url of modelUrls) {
    const fileName = path.basename(url);
    const filePath = path.join(modelsDir, fileName);

    try {
      await downloadFile(url, filePath);
    } catch (err) {
      console.error(`Error downloading ${fileName}:`, err);
    }
  }
}

downloadModels();
