/* *************** Подклчение модулей *************** */

var httpServer = module.parent.exports.http_server;
var routingClients = require("./routing/client.js");
require("./routing/message.js");


/* *************** Создание wsServer *************** */

var wsServer   = require("ws").Server;
var socket     = new wsServer({server: httpServer});

socket.on("connection", function(client) {
    routingClients.addClient(client);

    client.on("message", function(message) {
    });

    client.on("close", function() {
        routingClients.removeClient(client);
    });
});


