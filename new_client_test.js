const net = require('net');

const { decodeMessage } = require('./message-tools');

let iteration = 0;

class ChunkedMessage {
    dataChunks = [];
    currentBytesCount = 0;

    constructor(totalBytes) {
        this.totalBytes = totalBytes;
    }

    addData(dataChunk) {
        this.dataChunks.push(dataChunk);
        this.currentBytesCount += dataChunk.length;
    }

    getMissingBytesCount() {
        return this.totalBytes - this.currentBytesCount;
    }

    getData() {
        if(this.currentBytesCount !== this.totalBytes) throw new Error('Data is not complete yet!');
        return Buffer.concat(this.dataChunks);
    }
}

class DataConsumer {

    currentMessage = null;

    pushMessage(messageBuffer) {
        if(this.currentMessage == null) {
            // messageBuffer is a start segment
            this.handleStartSegment(messageBuffer);
        } else {
            // console.log(`Got continuation segment ${this.dataBuffer.length}/${this.dataLength}!`)
            // we already received some data in a previous message. This is the continuation
            const missingBytesCount = this.currentMessage.getMissingBytesCount();

            if(messageBuffer.length === missingBytesCount) {
                // message is the missing data chunk
                this.currentMessage.addData(messageBuffer);
                this.emitData(this.currentMessage.getData(), this.currentMessage.totalBytes);
                this.currentMessage = null;

            } else if(messageBuffer.length > missingBytesCount) {
                // buffer contains rest of the message + next message header
                const missingBytes = messageBuffer.slice(0, missingBytesCount);
                this.currentMessage.addData(missingBytes);
                this.emitData(this.currentMessage.getData(), this.currentMessage.totalBytes);
                const leftoverBuffer = messageBuffer.slice(missingBytesCount);
                this.handleStartSegment(leftoverBuffer);
            } else {
                // buffer contains the next chunk of the data but data is not complete yet
                this.currentMessage.addData(messageBuffer);
            }
        }

    }

    handleStartSegment(messageBuffer) {
        console.log('Got startsegment!');
        // messageBuffer is a start segment
        const {dataBuffer, contentSize, leftoverBuffer} = decodeMessage(messageBuffer);
        if(dataBuffer.length === contentSize) {
            // whole data was delivered at once
            this.emitData(dataBuffer, contentSize);
        } else if(dataBuffer.length < contentSize) {
            // data is not yet complete. We have to wait for further segments
            this.currentMessage = new ChunkedMessage(contentSize);
            this.currentMessage.addData(dataBuffer);
        } else {
            // data is complete and we also got the start of the next segment
            this.emitData(dataBuffer, contentSize);
            this.handleStartSegment(leftoverBuffer);
        }
    }

    emitData(dataBuffer, contentSize) {
        console.time(iteration);
        const messageString = dataBuffer.toString('utf-8');
        console.log(`New event ${JSON.parse(messageString).i} len ${contentSize}`);
        console.timeEnd(iteration++);
    }
}


const options = {
    host: '127.0.0.1',
    port: 5673
}

const socket = net.connect(options, () => {
    socket.setNoDelay(false);


});

const dataConsumer = new DataConsumer();

socket.on('data', function(data) {
    dataConsumer.pushMessage(data);
});

socket.on('close', function() {
    console.log('Connection closed');
});
