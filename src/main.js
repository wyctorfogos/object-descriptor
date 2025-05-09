const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../conf/.env') });
const { request_to_llm } = require("./utils/request_to_ollama.js");
const { request_image_description } = require("./utils/request_to_llm_with_image.js");
const { downloadImageContent } = require("./utils/dowload_image_content.js");
const { resizeImage} = require("./utils/resize_image.js");
const { splitMessage } = require("./utils/split_message.js");
const { messages } = require('./models/dict_languages.js')
const axios = require('axios');

// Carregar os dados de configuração 
const token = process.env.TELEGRAM_BOT_TOKEN;
const llm_model_name = process.env.llm_model_name;
const ollama_api_server_ipaddress = process.env.ollama_api_server_ipaddress;
const ollama_api_server_port = process.env.ollama_api_server_port;
const API_BASE_URL = process.env.MONGO_SERVER_IPADDRESS;
const API_BASE_URL_PORT = process.env.API_BASE_URL_PORT;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Initialize conversation history
const conversationHistory = {};
const activeConversations = {}; // Rastreia quais chatIds estão em modo de conversa contínua
const userLanguages = {}; // Armazena o idioma selecionado por cada chatId

// Listen for any message
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    console.log(`Received message: "${text}" from chat ID: ${chatId}`);

    // Verifica se o usuário está em modo de conversa contínua
    if (activeConversations[chatId] && text !== "/stop") {
        // Inicializa o histórico de conversa se não existir
        if (!Array.isArray(conversationHistory[chatId])) {
            conversationHistory[chatId] = [];
        }

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

            // Atualiza o histórico no banco de dados
            await axios.put(`http://${API_BASE_URL}:${API_BASE_URL_PORT}/v1.0/update_conversation?chat_id=${chatId}`, {
                data: conversationHistory[chatId]
            });

            // Divide a resposta em partes menores
            const responseParts = splitMessage(llm_response, 4000);

            // Envia cada parte da resposta
            for (const part of responseParts) {
                await bot.sendMessage(chatId, `Bot: ${part}`);
            }

            console.log("Registro da conversa atualizado!");
        } catch (error) {
            console.error("Error processing LLM response:", error);
            bot.sendMessage(chatId, "Ocorreu um erro ao processar sua solicitação. Tente novamente.");
        } finally {
            // Remove a mensagem de carregamento
            await bot.deleteMessage(chatId, loadingMessageGetReport.message_id);
        }
    }

    // Comando para iniciar o chatbot
    if (text == "/chatbot") {
        try {
            // Verifica se há uma conversa existente
            const response = await axios.get(`http://${API_BASE_URL}:${API_BASE_URL_PORT}/v1.0/get_last_conversation?chat_id=${chatId}`);
            if (response.status == 200 && response.data && response.data.user_conversation) {
                let conversation = response.data.user_conversation.filter(entry => entry.role === "user");

                if (conversation.length > 0) {
                    // Carrega a conversa existente no histórico
                    conversationHistory[chatId] = conversation.map(entry => entry.content);
                    activeConversations[chatId] = true;
                    bot.sendMessage(chatId, messages[userLanguages[chatId] || "en"].startConversation);
                } else {
                    bot.sendMessage(chatId, "Nenhuma mensagem encontrada no histórico.");
                }
            } else {
                bot.sendMessage(chatId, "Ocorreu um erro ao requisitar dados da conversa. Tente novamente.");
            }
        } catch (error) {
            if (error.response && error.response.status == 404) {
                try {
                    // Cria uma nova conversa se não houver histórico
                    await axios.post(`http://${API_BASE_URL}:${API_BASE_URL_PORT}/v1.0/create_conversation?chat_id=${chatId}`, {
                        data: []
                    });
                    conversationHistory[chatId] = [];
                    activeConversations[chatId] = true;
                    bot.sendMessage(chatId, messages[userLanguages[chatId] || "en"].startConversation);
                } catch (postError) {
                    console.error("Erro ao criar nova conversa:", postError);
                    bot.sendMessage(chatId, "Ocorreu um erro ao criar uma nova conversa. Tente novamente.");
                }
            } else {
                console.error("Erro ao verificar ou criar conversa:", error);
                bot.sendMessage(chatId, "Ocorreu um erro ao iniciar a conversa. Tente novamente.");
            }
        }
    }

    // Comando para encerrar a conversa
    if (text == "/stop") {
        try {
            // Apaga a conversa do banco de dados
            conversationHistory[chatId] = [];
            activeConversations[chatId] = false;
            bot.sendMessage(chatId, messages[userLanguages[chatId] || "en"].stopConversation);
        } catch (error) {
            console.error("Erro ao apagar a conversa:", error.message);
            bot.sendMessage(chatId, "Ocorreu um erro ao encerrar a conversa. Tente novamente.");
        }
    }


    // Comando para apagar o histórico de conversa
    if (text == "/delete") {
        try {
            // Apaga a conversa do banco de dados
            await axios.delete(`http://${API_BASE_URL}:${API_BASE_URL_PORT}/v1.0/delete_last_conversation?chat_id=${chatId}`);
            conversationHistory[chatId] = [];
            activeConversations[chatId] = false;
            bot.sendMessage(chatId, messages[userLanguages[chatId] || "en"].stopConversation);
        } catch (error) {
            console.error("Erro ao apagar a conversa:", error.message);
            bot.sendMessage(chatId, "Ocorreu um erro ao encerrar a conversa. Tente novamente.");
        }
    }

    // Outros comandos
    if (text == "/describeImage") {
        const bot_feedback = await bot.sendMessage(chatId, 'Upload the image to describe it', {
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
                        message_content = responseWithPhoto.caption === null ? "Describe the image content": responseWithPhoto.caption,
                        image_base64_content= base64Image
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
    
    if (text == "/getchatid") {
        bot.sendMessage(chatId, `Bot: Your chatid is ${chatId}`);
    }

    if (text == "/help") {
        bot.sendMessage(chatId, messages[userLanguages[chatId] || "en"].help);
    }

    if (text == "/languages") {
        const languageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "English", callback_data: "en" }],
                    [{ text: "French", callback_data: "fr" }],
                    [{ text: "Spanish", callback_data: "es" }],
                    [{ text: "Portuguese", callback_data: "pt" }],
                ],
            },
        };

        bot.sendMessage(chatId, messages[userLanguages[chatId] || "en"].selectLanguage, languageOptions);
    }
});

bot.on("callback_query", (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const selectedLanguage = callbackQuery.data;

    // Atualiza o idioma do usuário
    userLanguages[chatId] = selectedLanguage;

    bot.sendMessage(chatId, `Language changed to ${selectedLanguage === "en" ? "English" : selectedLanguage === "fr" ? "French" : selectedLanguage === "es" ? "Spanish" : "Portuguese"}.`);
});

// Handle errors
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.message}`);
});