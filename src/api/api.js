const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '../../docker/conf/.env') });// Replace with your bot token from BotFather

const MONGO_SERVER_IPADDRESS = process.env.MONGO_SERVER_IPADDRESS;
const MONGODB_PORT = process.env.MONGODB_PORT;
const DB_NAME = process.env.DB_NAME;
const app = express()

// Cliente a ser conectado ao banco de dados
const client = MongoClient(`${MONGO_SERVER_IPADDRESS}:${MONGODB_PORT}`);

// Porta usada para a API para acessar o banco de dados MongoDB
const port = 3000

app.post('/v1.0/create_conversation?chat_id', async(req, res) => {
    await client.connect()
    const db = client.db(DB_NAME);

    try {
        res.send(JSON.stringify()).status(200);
    } catch (error) {
        console.log(`Error when tried to connect do the Database. Erro message:${error}\n`);
    }
})

app.get('/v1.0/get_last_conversation?chat_id', (req, res)=>{
    try {
        
    } catch (error) {
        
    }

}    
)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

