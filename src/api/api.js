const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
// require('dotenv').config(); // or remove entirely, Docker injects env vars
require('dotenv').config({ path: path.resolve(__dirname, '../../docker/conf/.env') });
const MONGO_SERVER_IPADDRESS = process.env.MONGO_SERVER_IPADDRESS;
const MONGODB_PORT = process.env.MONGODB_PORT;
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = "conversations"; // Nome da coleção no MongoDB
const app = express();

// Middleware para processar JSON
app.use(express.json());

// Cliente MongoDB
const client = new MongoClient(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_SERVER_IPADDRESS}:${MONGODB_PORT}/`);

// Porta usada para a API
const port = 3000;

// Rota para criar uma conversa
app.post('/v1.0/create_conversation', async (req, res) => {
    const chat_id = req.query.chat_id; // Obtém o chat_id da query string
    const user_history = req.body.data; // Obtém os dados do corpo da requisição

    if (!chat_id || !user_history) {
        return res.status(400).json({ error: "chat_id and data are required" });
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        await db.collection(COLLECTION_NAME).insertOne({ _id: chat_id, user_conversation: user_history });
        res.status(201).json({ message: "Conversation created successfully" });
    } catch (error) {
        console.error(`Error creating conversation: ${error}`);
        res.status(500).json({ error: "Failed to create conversation" });
    }
});

// Rota para atualizar uma conversa
app.put('/v1.0/update_conversation', async (req, res) => {
    const chat_id = req.query.chat_id; // Obtém o chat_id da query string
    const user_history = req.body.data; // Obtém os dados do corpo da requisição

    if (!chat_id || !user_history) {
        return res.status(400).json({ error: "chat_id and data are required" });
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        // Atualiza o documento correspondente ao chat_id
        const result = await db.collection(COLLECTION_NAME).updateOne(
            { _id: chat_id }, // Filtro para localizar o documento
            { $set: { user_conversation: user_history } } // Atualizações
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.status(200).json({ message: "Conversation updated successfully" });
    } catch (error) {
        console.error(`Error updating conversation: ${error}`);
        res.status(500).json({ error: "Failed to update conversation" });
    }
});

// Rota para obter a última conversa
app.get('/v1.0/get_last_conversation', async (req, res) => {
    const chat_id = req.query.chat_id; // Obtém o chat_id da query string

    if (!chat_id) {
        return res.status(400).json({ error: "chat_id is required" });
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const conversation = await db.collection(COLLECTION_NAME).findOne({ _id: chat_id });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.status(200).json(conversation);
    } catch (error) {
        console.error(`Error fetching conversation: ${error}`);
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
});

// Rota para deletar uma conversa
app.delete('/v1.0/delete_last_conversation', async (req, res) => {
    const chat_id = req.query.chat_id; // Obtém o chat_id da query string

    if (!chat_id) {
        return res.status(400).json({ error: "chat_id is required" });
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: chat_id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.error(`Error deleting conversation: ${error}`);
        res.status(500).json({ error: "Failed to delete conversation" });
    }
});

// Inicia o servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});
