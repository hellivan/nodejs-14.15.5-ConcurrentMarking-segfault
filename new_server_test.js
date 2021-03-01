const net = require('net');

const a = require('./sample_data.json');
const { encodeMessage } = require('./message-tools');

const sampleA = Buffer.from(JSON.stringify(a));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const server = net.createServer(async socket => {

    for(let i = 0; i < 1000; i++) {
        console.time(i);

        const jsonString = JSON.parse(sampleA.toString());
        const j = Array(6).fill(jsonString);

        const data = {i, data: j};

        const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8');

        const messageBuffer = encodeMessage(dataBuffer);

        socket.write(messageBuffer);
        await sleep(10);
        console.timeEnd(i);
    }

});

server.listen(5673, '127.0.0.1');
console.log('Server listening on port 5673');