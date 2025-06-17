const fs = require('fs');
const { createCanvas } = require('canvas');

// Create icons directory if it doesn't exist
if (!fs.existsSync('icons')) {
    fs.mkdirSync('icons');
}

// Function to create an icon
function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, size, size);

    // Draw a simple minecraft-style block
    const blockSize = size * 0.6;
    const blockX = (size - blockSize) / 2;
    const blockY = (size - blockSize) / 2;

    // Block face
    ctx.fillStyle = '#7FB238';
    ctx.fillRect(blockX, blockY, blockSize, blockSize);

    // Block shading
    ctx.fillStyle = '#91BD59';
    ctx.fillRect(blockX, blockY, blockSize, blockSize * 0.3);

    // Block outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = size * 0.02;
    ctx.strokeRect(blockX, blockY, blockSize, blockSize);

    return canvas.toBuffer('image/png');
}

// Generate icons
const sizes = [192, 512];
sizes.forEach(size => {
    const icon = createIcon(size);
    fs.writeFileSync(`icons/icon-${size}x${size}.png`, icon);
    console.log(`Created icon-${size}x${size}.png`);
}); 