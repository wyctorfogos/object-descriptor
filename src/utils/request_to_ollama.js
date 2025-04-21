const axios = require("axios");

async function request_to_llm(model_name, llm_server_host, llm_server_port, message_content) {
    try {
        const response = await axios.post(`http://${llm_server_host}:${llm_server_port}/api/generate/`, JSON.stringify({
            prompt: message_content,
            model: model_name,
            stream: false
        }));

        if (response.status !== 200) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        // Return the response data
        return response.data.response;

    } catch (error) {
        error.message = `Error in request_to_llm: ${error.message}`;
        console.error(error); // Log the error for debugging
        throw error;
    }
}

module.exports = { request_to_llm };