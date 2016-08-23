/* *************** Подключение модулей *************** */
var groups = [];
module.exports.groups = groups;

var maxClientOnGroup = 12;
module.exports.maxClientOnGroup = maxClientOnGroup;

// Маршрутизация клиентов
var routingClients = require("./routing/client.js");
module.exports.routingClients = routingClients;

// Маршрутизация сообщений
var routingMessage = require("./routing/message.js");
module.exports.routingMessage = routingMessage;

// Правила в группе
var rulesGroup = require("./rules/group.js");
module.exports.rulesGroup = rulesGroup;


/* *************** Новое сообщение от клиента *************** */
function addMessage(client, message) {
    try {
        message = JSON.parse(message);
    } catch (err) {
        console.log("message.js ERROR: JSON.parse(message) description: ", err);
        return false;
    }    

    // Пользователь указал ссылку на аву и имя
    if ( (message["photo"]) && (message["first_name"]) ) {
        client.photo = message.photo;
        //console.log("client.photo " + client.photo);

        client.first_name = message.first_name;
        //console.log("client.first_name " + client.first_name);
        
        routingClients.addClient(client);
        routingMessage.sendStateGroup(client.group);
    }
    
    // Пользователь отправил сообщение
    if (message["msg"]) {
        routingMessage.sendMessageGroup(client.group, {
            msg: message.msg, 
            first_name: client.first_name
        });
        routingMessage.traceState(client.group);
    }

    // Пользователь хочет сменить стол
    if (message["change_table"]) {
        var group = client.group;
        routingClients.changeGroup(client);
        routingMessage.sendStateGroup(group);
        routingMessage.sendStateGroup(client.group);
    }

    // Пользователь кликнул по бутылке.
    if (message["bottle"]) {
        // rulesGroup.clickBottle(client);
    }
}


/* *************** Экспорт данных и методов *************** */
module.exports = {
    addMessage:     addMessage,
    outClient:      routingClients.outClient,
    sendStateGroup: routingMessage.sendStateGroup
};