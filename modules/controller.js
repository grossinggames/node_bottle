module.exports.bus = module.parent.exports.bus;
var clients = {};

// Маршрутизация сообщений
var routingMessage = require("./routing/message.js");


/* *************** Новое сообщение от клиента *************** */
function addMessage(client, message) {
    try {
        message = JSON.parse(message);
    } catch (err) {
        console.log("message.js ERROR: JSON.parse(message) description: ", err);
        return false;
    }
    
    // Пользователь указал ссылку на аву и имя
    if ( (message["photo"]) && (message["first_name"]) && 
        (message["id"]) ) {

        if (clients[ message["id"] ]) {
            routingMessage.outClient(clients[ message["id"] ]);
            routingMessage.sendStateGroup(clients[ message["id"] ].group);
        }

        clients[ message["id"] ] = client;

        client.photo = message.photo;
        client.first_name = message.first_name;
        client.id = message.id;

        routingMessage.addClient(client);
        routingMessage.sendStateGroup(client.group);
    }

    if ( !(client.group) || !(client.slot) ) {
        return false;
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
    if (message["change_table"] && client.group) {
        routingMessage.changeGroup(client);
        routingMessage.sendStateGroup(client.group);
    }

    // Пользователь кликнул по бутылке
    if ( message["bottle"] && (routingMessage.groups[client.group].current == client.slot) ) {
        routingMessage.clickBottle(client.group);
    }

    // Пользователь кликнул по бутылке
    if ("kiss_offer" in message) {  
        /*
        console.log(message["kiss_offer"]);
        console.log(client.slot);
        console.log(routingMessage.groups[client.group].partners[0]);
        console.log(routingMessage.groups[client.group].partners[1]);
        console.log("");
        */

        if ((routingMessage.groups[client.group].partners[0] == client.slot) || 
            (routingMessage.groups[client.group].partners[1] == client.slot) ) {
            routingMessage.setKissOffer(client, message["kiss_offer"]);
        }
    }
}


/* *************** Экспорт данных и методов *************** */
module.exports = {
    addMessage:     addMessage,
    sendStateGroup: routingMessage.sendStateGroup,
    outClient:      routingMessage.outClient
};