/* *************** Подключение модулей *************** */
var parent = module.parent.exports;
var httpServer = parent.httpServer;
module.exports.bus = parent.bus;

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