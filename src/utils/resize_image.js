const sharp = require('sharp');

async function resizeImage(imageData) {
    const processedImage = await sharp(imageData)
        .resize(300, 300) // Resize the image to 300x300
        .toBuffer();
    return processedImage;
}

module.exports={resizeImage};
