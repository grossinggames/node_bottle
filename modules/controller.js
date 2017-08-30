module.exports.bus = module.parent.exports.bus;
var clients = {};

// Маршрутизация сообщений
var routingMessage = require("./routing/message.js");
var db = require("./db/db.js");

/* *************** Новое сообщение от клиента *************** */
async function addMessage(client, message) {
    try {
        message = JSON.parse(message);
    } catch (err) {
        console.log("message.js ERROR: JSON.parse(message) description: ", err);
        return false;
    }

    // Пользователь указал ссылку на аву и имя
    if ( message["photo"] && message["first_name"] 
        && message["id"] && ('sex' in message) && ('age' in message) ) {

        if (clients[ message["id"] ]) {
            routingMessage.outClient(clients[ message["id"] ]);
            routingMessage.sendStateGroup(clients[ message["id"] ].group);
        }

        clients[ message["id"] ] = client;

        client.photo = message.photo;
        client.first_name = message.first_name;
        client.id = message.id;
        client.sex = message.sex;
        client.age = message.age;

        let isAddUser = await db.createOrUpdateUser(client);

        if (isAddUser) {
            routingMessage.addClient(client);
            routingMessage.sendStateGroup(client.group);
        }
        // module.parent.exports.bus.emit("changeRotating", client.group); // addRotating
    }

    if ( !(client.group) || !(client.slot) ) {
        return false;
    }
    
    // Пользователь запросил рейтинг
    if (message["rating"]) {
        let ratingList = await db.getRating();

        try {
            if (ratingList) {
                routingMessage.sendMessageClient(client, {
                    rating: JSON.stringify(ratingList)
                });
            } else {
                routingMessage.sendMessageClient(client, {
                    rating: JSON.stringify(false)
                });
            }
        } catch (err) {
            console.log('Send rating err: ' + err);
        }
    }

    // Пользователь отправил сообщение
    if (message["msg"]) {
        routingMessage.sendMessageGroup(client.group, {
            msg: message.msg, 
            first_name: client.first_name,
            photo: client.photo
        });
        routingMessage.traceState(client.group);
    }

    // Пользователь хочет сменить стол
    if (message["change_table"] && client.group) {
        var clientGroup = client.group;
        routingMessage.changeGroup(client);
        routingMessage.sendStateGroup(clientGroup);
        routingMessage.sendStateGroup(client.group);
    }

    // Пользователь кликнул по бутылке
    if ( message["bottle"] && (routingMessage.groups[client.group].current == client.slot) ) {
        routingMessage.clickBottle(client.group);
    }

    // Пользователь принял или отказал в поцелуе
    if ("kiss_offer" in message) {  
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