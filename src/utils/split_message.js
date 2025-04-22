// Utility function to split a long message into smaller parts
function splitMessage(message, maxLength = 4000) {
    const parts = [];
    while (message.length > maxLength) {
        parts.push(message.slice(0, maxLength));
        message = message.slice(maxLength);
    }
    parts.push(message);
    return parts;
}

module.exports={splitMessage}