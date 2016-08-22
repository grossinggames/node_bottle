/* *************** Подключение модулей *************** */
var httpServer = module.parent.exports.http_server;

// Контроллер
var controller = require("./controller.js");


/* *************** Создание Websocket *************** */
var wsServer   = require("ws").Server;
var socket     = new wsServer({server: httpServer});

socket.on("connection", function(client) {
    client.on("message", function(message) {
        controller.addMessage(client, message);
    });
    client.on("close", function () {
        var group = client.group;
        controller.outClient(client);
        controller.sendStateGroup(group);
    });
});