require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid')

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));

const sessionClient = new dialogflow.SessionsClient();
const sessionId = uuid.v4();

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

io.on('connection', function (socket) {
    socket.on('chat message', async (text) => {

        const sessionPath = sessionClient.projectAgentSessionPath(process.env.DIALOGFLOW_PROJECT_ID, sessionId);
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: text,
                    languageCode: 'en-US'
                }
            }
        };

        try {

            const responses = await sessionClient.detectIntent(request);
            const result = responses[0].queryResult;
            const aiText = result.fulfillmentText;

            socket.emit('Bot Reply', aiText);

        } catch (error) {
            console.error('Dialogflow API Error: ', error);
        }

    });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

