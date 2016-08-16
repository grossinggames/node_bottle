/* *************** require modules *************** */

var httpServer = module.parent.exports.http_server;

var groups = [];
module.exports.groups = groups;

var maxClientOnGroup = 12;
module.exports.maxClientOnGroup = maxClientOnGroup;

var routingClients = require("./routing/client.js");
module.exports.routingClients = routingClients;

var routingMessage = require("./routing/message.js");
module.exports.routingMessage = routingMessage;

/* *************** create wsServer *************** */

var wsServer   = require("ws").Server;
var socket     = new wsServer({server: httpServer});

socket.on("connection", function(client) {
    routingClients.addClient(client);
    client.on("message", function(message) {
        routingMessage.addMessage(client, message);
    });
    client.on("close", function () {
        routingClients.removeClient(client);
    });
});