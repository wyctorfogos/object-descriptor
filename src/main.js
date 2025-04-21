const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../conf/.env') });// Replace with your bot token from BotFather
const {request_to_llm} = require("./utils/request_to_ollama.js");

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
    if (text=="/getchatid"){
        bot.sendMessage(chatId, `Bot: Your chatid is ${chatId}"`);
    }
});
// Handle errors
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.message}`);
});