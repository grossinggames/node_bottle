/* *************** require modules *************** */
var httpServer = module.parent.exports.http_server;

var groups = [];
module.exports.groups = groups;

var maxClientOnGroup = 12;
module.exports.maxClientOnGroup = maxClientOnGroup;

var routingClients = require("./routing/client.js");
module.exports.routingClients = routingClients;

var rulesGroup = require("./rules/group.js");
module.exports.rulesGroup = rulesGroup;

var routingMessage = require("./routing/message.js");
module.exports.routingMessage = routingMessage;


/* *************** create wsServer *************** */
var wsServer   = require("ws").Server;
var socket     = new wsServer({server: httpServer});

socket.on("connection", function(client) {
    client.on("message", function(message) {
        routingMessage.addMessage(client, message);
    });
    client.on("close", function () {
        var group = client.group;
        routingClients.outClient(client);
        routingMessage.sendStateGroup(group);
    });
});