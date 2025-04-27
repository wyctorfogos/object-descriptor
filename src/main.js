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

// Initialize conversation history
const conversationHistory = {};
const activeConversations = {}; // Rastreia quais chatIds estão em modo de conversa contínua

// Listen for any message
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    console.log(`Received message: "${text}" from chat ID: ${chatId}`);

    // Verifica se o usuário está em modo de conversa contínua
    if (activeConversations[chatId] && text !== "/stop") {
        // Adiciona a mensagem do usuário ao histórico
        conversationHistory[chatId].push({ role: "user", content: text });

        // Envia uma mensagem de carregamento
        const loadingMessageGetReport = await bot.sendMessage(chatId, '🔄 Obtendo dados ...');

        try {
            // Envia o histórico completo para o LLM
            const llm_response = await request_to_llm(
                llm_model_name,
                ollama_api_server_ipaddress,
                ollama_api_server_port,
                conversationHistory[chatId]
            );

            // Adiciona a resposta do LLM ao histórico
            conversationHistory[chatId].push({ role: "assistant", content: llm_response });

            // Divide a resposta em partes menores
            const responseParts = splitMessage(llm_response, 4000);

            // Envia cada parte da resposta
            for (const part of responseParts) {
                await bot.sendMessage(chatId, `Bot: ${part}`);
            }
        } catch (error) {
            console.error("Error processing LLM response:", error);
            bot.sendMessage(chatId, "Ocorreu um erro ao processar sua solicitação. Tente novamente.");
        } finally {
            // Remove a mensagem de carregamento
            await bot.deleteMessage(chatId, loadingMessageGetReport.message_id);
        }
    }

    // Outros comandos
    if (text == "/stop") {
        activeConversations[chatId] = false; // Desativa o modo de conversa contínua
        bot.sendMessage(chatId, "Modo de conversa encerrado. Digite /chatbot para iniciar novamente.");
    }

    if (text == "/chatbot") {
        if (!conversationHistory[chatId]) {
            conversationHistory[chatId] = []; // Inicializa o histórico para o chatId
        }

        activeConversations[chatId] = true; // Ativa o modo de conversa contínua

        bot.sendMessage(chatId, "Modo de conversa ativado! Envie suas mensagens e eu responderei. Para encerrar, digite /stop.");
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

    if (text == "/reset") {
        conversationHistory[chatId] = []; // Limpa o histórico para o chatId
        bot.sendMessage(chatId, "Histórico de conversa foi resetado.");
    }

    if (text == "/getchatid") {
        bot.sendMessage(chatId, `Bot: Your chatid is ${chatId}`);
    }

    if (text == "/help") {
        bot.sendMessage(chatId, `Bot: Você possui os seguintes comandos disponíveis:\n
            /describeImage: O usuário envia a image a ser descrita;
            /chatbot: O usuário conversa com a IA;
            /stop: Comando para parar a conversa com a IA;
            /reset: Apagar o histórico de conversa com o usuário.
            /getchatid: Fornece o chat id do usuário
            `);
    }
    
});

// Handle errors
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.message}`);
});