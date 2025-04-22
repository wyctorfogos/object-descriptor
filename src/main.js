const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../conf/.env') });// Replace with your bot token from BotFather
const { request_to_llm } = require("./utils/request_to_ollama.js");
const { request_image_description } = require("./utils/request_to_llm_with_image.js");
const { downloadImageContent } = require("./utils/dowload_image_content.js");
const { resizeImage} = require("./utils/resize_image.js");
const { splitMessage } = require("./utils/split_message.js");


// Carregar os dados de configuração 
const token = process.env.TELEGRAM_BOT_TOKEN;
const llm_model_name = process.env.llm_model_name;
const ollama_api_server_ipaddress = process.env.ollama_api_server_ipaddress;
const ollama_api_server_port = process.env.ollama_api_server_port;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Listen for any message
bot.on('message', async (msg) => {
    console.log(`Bot service is online!`)
    const chatId = msg.chat.id;
    const text = msg.text;
    console.log(`Received message: "${text}" from chat ID: ${chatId}`);

    if (text == "/chatbot") {
        const bot_feedback = await bot.sendMessage(chatId, 'Escreva o que deseja perguntar', {
            reply_markup: {
                force_reply: true,
            }
        });

        bot.onReplyToMessage(chatId, bot_feedback.message_id, async (feedbackResponse) => {
            let user_message_content = String(feedbackResponse.text);

            // Send a loading message
            const loadingMessageGetReport = await bot.sendMessage(chatId, '🔄 Obtendo dados ...');

            try {
                const llm_response = await request_to_llm(
                    llm_model_name,
                    ollama_api_server_ipaddress,
                    ollama_api_server_port,
                    user_message_content
                );

                // Split the response into smaller parts
                const responseParts = splitMessage(llm_response, 4000); // Split into chunks of 4000 characters

                // Send each part sequentially
                for (const part of responseParts) {
                    await bot.sendMessage(chatId, `Bot: ${part}`);
                }
            } catch (error) {
                console.error("Error processing LLM response:", error);
                bot.sendMessage(chatId, "Ocorreu um erro ao processar sua solicitação. Tente novamente.");
            } finally {
                // Delete the loading message
                await bot.deleteMessage(chatId, loadingMessageGetReport.message_id);
            }
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
                    const resizedImage = await resizeImage(imageData);
                    const base64Image = resizedImage.toString('base64');

                    const llm_response = await request_image_description(
                        llm_model_name, 
                        ollama_api_server_ipaddress, 
                        ollama_api_server_port, 
                        "Descreva o conteúdo da imagem",
                        base64Image
                    );

                    // Split the response into smaller parts
                    const responseParts = splitMessage(llm_response);

                    // Send each part sequentially
                    for (const part of responseParts) {
                        await bot.sendMessage(chatId, `Bot: ${part}`);
                    }
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