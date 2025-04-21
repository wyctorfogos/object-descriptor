const axios = require('axios');
require('dotenv').config();

async function requestDownloadImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
    } catch (error) {
        console.error("Error downloading the image! Please try again.\n", error);
        return null;
    }
}

async function downloadImageContent(file_path, telegram_bot_token) {
    const downloadUrl = `https://api.telegram.org/file/bot${telegram_bot_token}/${file_path}`;
    const imageData = await requestDownloadImage(downloadUrl);
    if (imageData && imageData.length > 0) {
        return imageData; // Returns the raw image data as a buffer
    } else {
        return null; // Return null if the download fails
    }
}

module.exports = { downloadImageContent };