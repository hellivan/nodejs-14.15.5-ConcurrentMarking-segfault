const HEADER_CONTENT_BYTES = 4;
const HEADER_BYTES = 4;

function encodeMessage(dataBuffer) {
    const contentSizeBuffer = Buffer.alloc(HEADER_CONTENT_BYTES);
    contentSizeBuffer.writeUInt32LE(dataBuffer.length);
    
    const headerBuffer = Buffer.alloc(HEADER_BYTES);
    contentSizeBuffer.copy(headerBuffer, 0, 0, HEADER_CONTENT_BYTES);

    const messageBuffer = Buffer.concat([headerBuffer, dataBuffer]);
    return messageBuffer;
}

function decodeMessage(messageBuffer) {
    if(messageBuffer.length < HEADER_BYTES) throw new Error('Invalid message size!');
    const headerBuffer = messageBuffer.slice(0, HEADER_BYTES);

    const contentSizeBuffer = headerBuffer.slice(0, 0 + HEADER_CONTENT_BYTES);
    const contentSize = contentSizeBuffer.readUInt32LE();

    const dataBuffer = messageBuffer.slice(HEADER_BYTES, HEADER_BYTES + contentSize);
    const leftoverBuffer = null;
    if(messageBuffer.length > HEADER_BYTES + contentSize) {
        leftoverBuffer = messageBuffer.slice(HEADER_BYTES + contentSize);
    }
    return {contentSize, dataBuffer, leftoverBuffer};
}

module.exports = {
    encodeMessage,
    decodeMessage
};