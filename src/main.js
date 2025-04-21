const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../conf/.env') });// Replace with your bot token from BotFather
const {request_to_llm} = require("./utils/request_to_ollama.js");
const { downloadImageContent } = require("./utils/dowload_image_content.js");
const {resizeImage} = require("./utils/resize_image.js");


// Carregar os dados de configuração 
const token = process.env.TELEGRAM_BOT_TOKEN;
const llm_model_name = process.env.llm_model_name;
const ollama_api_server_ipaddress = process.env.ollama_api_server_ipaddress;
const ollama_api_server_port = process.env.ollama_api_server_port;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Listen for any message
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    console.log(`Received message: "${text}" from chat ID: ${chatId}`);

    if (text == "/chatbot") {
        const bot_feedback = await bot.sendMessage(chatId, 'Escreva o que deseja pergutar', {
            reply_markup: {
                force_reply: true,
            }
        });

        bot.onReplyToMessage(chatId, bot_feedback.message_id, async (feedbackResponse) => {
            // Adicionar a requisição de adição de um veículo no Traffic
            let user_message_content = String(feedbackResponse.text);
                    // Mensagem de loading
            const loadingMessageGetReport = await bot.sendMessage(chatId, '🔄 Obtendo dados ...');
            const llm_response = await request_to_llm(
                llm_model_name, 
                ollama_api_server_ipaddress, 
                ollama_api_server_port, 
                user_message_content
            );
            bot.sendMessage(chatId, `Bot: ${llm_response}`);
            
            await bot.deleteMessage(chatId, loadingMessageGetReport.message_id);      
        });

        
    }
    if (text == "/describeImage") {
        const bot_feedback = await bot.sendMessage(chatId, 'Envie a imagem que deseja descrever', {
            reply_markup: {
                force_reply: true,
            }
        });

        bot.onReplyToMessage(chatId, bot_feedback.message_id, async (responseWithPhoto) => {
            if (responseWithPhoto.photo) {
                const photo = responseWithPhoto.photo[responseWithPhoto.photo.length - 1];
                const file = await bot.getFile(photo.file_id);
                const filePath = file.file_path;

                const imageData = await downloadImageContent(filePath, token);
                if (imageData) {
                    console.log("Image downloaded successfully!");
                        
                    const resizedImage = await resizeImage(imageData);
                    // Convert the image buffer to Base64
                    const base64Image = resizedImage.toString('base64');
                    console.log(`Base64 Image: ${base64Image}`);

                    // Optionally, send the Base64 string back to the user
                    bot.sendMessage(chatId, `Imagem processada com sucesso!`);
                } else {
                    console.error("Failed to download the image.");
                    bot.sendMessage(chatId, "Failed to download the image. Please try again.");
                }
            } else {
                bot.sendMessage(chatId, "No image was provided. Please send an image.");
            }
        });
    }
    if (text=="/getchatid"){
        bot.sendMessage(chatId, `Bot: Your chatid is ${chatId}`);
    }
});
// Handle errors
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.message}`);
});