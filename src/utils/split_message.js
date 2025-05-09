// Utility function to split a long message into smaller parts
function splitMessage(message, maxLength) {
    const parts = [];
    let currentPart = '';

    for (const word of message.split(' ')) {
        if ((currentPart + word).length > maxLength) {
            parts.push(currentPart.trim());
            currentPart = '';
        }
        currentPart += `${word} `;
    }

    if (currentPart.trim().length > 0) {
        parts.push(currentPart.trim());
    }

    return parts;
}

module.exports={splitMessage}