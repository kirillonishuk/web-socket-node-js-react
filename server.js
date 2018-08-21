const express = require('express');
const http = require('http');
const WebSocket = require('websocket').server;
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors())

app.use((req, res, next) => {
    console.log(`${req.url} ${req.method}`);
    next();
});

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.use(function (req, res, next) {
    res.status(404);
    res.json({
        error: 'Not found. ERROR 404 :<'
    });
    return;
});

const normalizePort = port => parseInt(port, 10);
const PORT = normalizePort(process.env.PORT || 80);
const server = http.createServer(app);

server.listen(PORT, err => {
    if (err)
        console.error(err);
    else console.log(`Express's runing on port ${PORT}.`);
});

const ws = new WebSocket({
    httpServer: server
});

let clients = [];

ws.on('request', (client) => {
    const connection = client.accept(null, client.origin);

    connection.send(JSON.stringify({
        type: 'users online',
        users: clients.map(elem => {
            return {
                key: elem.key,
                name: elem.name
            }
        }),
        myKey: client.key
    }))

    console.log(`User with ID=${client.key} was connected.`);


    connection.on('message', mes => {
        let message = JSON.parse(mes.utf8Data);

        if (message.type === 'connection message') {
            clients.forEach(cl => {
                cl.connection.send(JSON.stringify({
                    user: message.name,
                    key: client.key,
                    type: 'new user'
                }))
            });
            clients.push({
                key: client.key,
                connection: connection,
                name: message.name
            })
        }
        if (message.type === 'message to all') {
            clients.forEach(cl => {
                cl.connection.send(JSON.stringify({
                    message: message.message,
                    img: message.img,
                    fromUser: message.fromUser,
                    fromUserKey: message.fromUserKey,
                    type: 'new all message'
                }))
            });
        }
        if (message.type === 'message to user') {
            clients.find((elem) => elem.key === message.toUserKey).connection.send(JSON.stringify({
                type: 'private message to you',
                toUser: message.toUser,
                toUserKey: message.toUserKey,
                fromUser: message.fromUser,
                fromUserKey: message.fromUserKey,
                message: message.message,
                img: message.img,
            }))
            clients.find((elem) => elem.key === message.fromUserKey).connection.send(JSON.stringify({
                type: 'private message from you',
                toUser: message.toUser,
                toUserKey: message.toUserKey,
                fromUser: message.fromUser,
                fromUserKey: message.fromUserKey,
                message: message.message,
                img: message.img,
            }))
        }
    })

    connection.on('close', req => {
        console.log(`User with ID=${client.key} was dissconnected.`);
        let userName = clients.find((elem) => elem.key === client.key).name
        clients.splice(clients.indexOf(clients.find((elem) => elem.key === client.key)), 1);
        clients.forEach(cl => {
            cl.connection.send(JSON.stringify({
                type: 'user disconnect',
                key: client.key,
                name: userName
            }))
        })
    })
});
