module.exports.bus = module.parent.exports.bus;

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
    if ( (message["photo"]) && (message["first_name"]) ) {
        client.photo = message.photo;
        client.first_name = message.first_name;

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

    // Пользователь кликнул по бутылке.
    if (message["bottle"]) {
        // console.log("Кликнул по бутылке. group: " + client.group + " slot: " + client.slot);
        // routingMessage.clickBottle(client);
    }
}


/* *************** Экспорт данных и методов *************** */
module.exports = {
    addMessage:     addMessage,
    sendStateGroup: routingMessage.sendStateGroup,
    outClient:      routingMessage.outClient
};