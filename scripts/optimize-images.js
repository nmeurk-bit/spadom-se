// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

const images = [
  { file: 'ikon-vem.png', maxWidth: 256, quality: 85 },
  { file: 'ikon-kategori.png', maxWidth: 256, quality: 85 },
  { file: 'ikon-fraga.png', maxWidth: 256, quality: 85 },
  { file: 'ikon-vand.png', maxWidth: 256, quality: 85 },
  { file: 'ikon-historik.png', maxWidth: 256, quality: 85 },
  { file: 'tarot-back.png', maxWidth: 800, quality: 90 },
];

async function optimizeImage(filename, maxWidth, quality) {
  const inputPath = path.join(publicDir, filename);
  const tempPath = path.join(publicDir, `temp_${filename}`);

  try {
    const stats = fs.statSync(inputPath);
    const originalSize = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`\nOptimizing ${filename}...`);
    console.log(`Original size: ${originalSize} MB`);

    await sharp(inputPath)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({
        quality,
        compressionLevel: 9,
        effort: 10,
      })
      .toFile(tempPath);

    const newStats = fs.statSync(tempPath);
    const newSize = (newStats.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - newStats.size / stats.size) * 100).toFixed(1);

    console.log(`New size: ${newSize} MB`);
    console.log(`Reduction: ${reduction}%`);

    // Replace original with optimized
    fs.renameSync(tempPath, inputPath);

    return { filename, originalSize, newSize, reduction };
  } catch (error) {
    console.error(`Error optimizing ${filename}:`, error.message);
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    return null;
  }
}

async function main() {
  console.log('=== Image Optimization Started ===');

  const results = [];

  for (const img of images) {
    const result = await optimizeImage(img.file, img.maxWidth, img.quality);
    if (result) {
      results.push(result);
    }
  }

  console.log('\n=== Optimization Complete ===');
  console.log('\nSummary:');

  let totalOriginal = 0;
  let totalNew = 0;

  results.forEach(r => {
    totalOriginal += parseFloat(r.originalSize);
    totalNew += parseFloat(r.newSize);
    console.log(`${r.filename}: ${r.originalSize}MB → ${r.newSize}MB (-${r.reduction}%)`);
  });

  const totalReduction = ((1 - totalNew / totalOriginal) * 100).toFixed(1);
  console.log(`\nTotal: ${totalOriginal.toFixed(2)}MB → ${totalNew.toFixed(2)}MB (-${totalReduction}%)`);
}

main().catch(console.error);
