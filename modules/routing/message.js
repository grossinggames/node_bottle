var groups           = module.parent.exports.groups;
var maxClientOnGroup = module.parent.exports.maxClientOnGroup;
var routingClients   = module.parent.exports.routingClients;

// Новое сообщение от клиента
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
        //sendStateGroup(client);
    }
    
    // Пользователь отправил сообщение
    if (message["msg"]) {
        sendMessageGroup(client.group, {msg: message.msg, first_name: client.first_name});
        //traceState();
    }

    // Пользователь хочет сменить стол
    if (message["change_table"]) {
        //outClient(client);
        //sendStateGroup(client);
        //client.group = addClient(client);
        //sendStateGroup(client);
    }

    // Пользователь кликнул по бутылке.
    if (message["bottle"]) {
        //clickBottle(client.group);
    }
}

// Отправить сообщение своей группе
function sendMessageGroup(group, message) {
    // Если пустое сообщение в чат не отправляем его
    if (message.msg == "") {
        console.log("message.js ERROR free message: message.msg");
        return false;
    }

    if (groups[group]["slots"]) {
        for (var key in groups[group]["slots"]) {
            if (groups[group].slots[key]) {
                sendMessageClient( groups[group].slots[key], JSON.stringify(message) );
            }
        }
    }
}

// Отправить сообщение клиенту
function sendMessageClient(client, message) {
    try {
        client.send(message);
    } catch (err) {
        //outClient(client);
        //sendStateGroup(client);
        console.log("message.js ERROR (client.send) description: ", err);
    }
}

// Состояние слотов в группе
function sendStateGroup() {

}

module.exports = {
    addMessage: addMessage
};