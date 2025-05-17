const messages = {
    en: {
        startConversation: "Conversation mode activated! Send your messages and I will respond. To stop, type /stop.",
        stopConversation: "Conversation mode stopped. Type /chatbot to start again.",
        resetHistory: "Conversation history has been reset.",
        sendImage: "Send the image you want to describe.",
        noImage: "No image was provided. Please send an image.",
        failedDownload: "Failed to download the image. Please try again.",
        help: `You have the following commands available:\n
            /describeImage: Send an image to be described;
            /chatbot: Start a conversation with the AI;
            /stop: Stop the conversation with the AI;
            /reset: Clear the conversation history;
            /getchatid: Get your chat ID;
            /pdf_analyser: Make an analyse of a PDF file;
            /languages: Choose another language`,
        selectLanguage: "Select a language:",
    },
    fr: {
        startConversation: "Mode conversation activé ! Envoyez vos messages et je répondrai. Pour arrêter, tapez /stop.",
        stopConversation: "Mode conversation arrêté. Tapez /chatbot pour recommencer.",
        resetHistory: "L'historique de la conversation a été réinitialisé.",
        sendImage: "Envoyez l'image que vous souhaitez décrire.",
        noImage: "Aucune image n'a été fournie. Veuillez envoyer une image.",
        failedDownload: "Échec du téléchargement de l'image. Veuillez réessayer.",
        help: `Vous avez les commandes suivantes disponibles :\n
            /describeImage : Envoyez une image à décrire ;
            /chatbot : Commencez une conversation avec l'IA ;
            /stop : Arrêtez la conversation avec l'IA ;
            /reset : Effacez l'historique de la conversation ;
            /getchatid : Obtenez votre ID de chat;
            /pdf_analyser: Faire un analise du archive en format PDF;
            /languages : Choisissez une autre langue`,
        selectLanguage: "Sélectionnez une langue :",
    },
    es: {
        startConversation: "¡Modo de conversación activado! Envía tus mensajes y responderé. Para detener, escribe /stop.",
        stopConversation: "Modo de conversación detenido. Escribe /chatbot para comenzar de nuevo.",
        resetHistory: "El historial de conversación ha sido restablecido.",
        sendImage: "Envía la imagen que deseas describir.",
        noImage: "No se proporcionó ninguna imagen. Por favor, envía una imagen.",
        failedDownload: "No se pudo descargar la imagen. Por favor, inténtalo de nuevo.",
        help: `Tienes los siguientes comandos disponibles:\n
            /describeImage: Envía una imagen para ser descrita;
            /chatbot: Comienza una conversación con la IA;
            /stop: Detén la conversación con la IA;
            /reset: Borra el historial de conversación;
            /getchatid: Obtén tu ID de chat;
            /pdf_analyser: Analisa um arquivo em PDF;
            /idiomas: Elige otro idioma`,
        selectLanguage: "Selecciona un idioma:",
    },
    pt: {
        startConversation: "Modo de conversação ativado! Envie suas mensagens e eu responderei. Para parar, digite /stop.",
        stopConversation: "O modo de conversação foi interrompido. Digite /chatbot para iniciar novamente.",
        resetHistory: "O histórico da conversa foi redefinido.",
        sendImage: "Envie a imagem que você deseja descrever.",
        noImage: "Nenhuma imagem foi fornecida. Por favor, envie uma imagem.",
        failedDownload: "Não foi possível fazer o download da imagem. Tente novamente.",
        help: `Você tem os seguintes comandos disponíveis:
        /describeImage: Envie uma imagem para ser descrita;
        /chatbot: Inicie uma conversa com a IA;
        /stop: Interrompa a conversa com a IA;
        /reset: Limpe o histórico da conversa;
        /getchatid: Obtenha seu ID de bate-papo;
        /pdf_analyser: Analisa um arquivo em PDF;
        /languages: Escolha outro idioma`,
        selectLanguage: "Selecione um idioma:",
        }
    ,
};

module.exports = { messages }