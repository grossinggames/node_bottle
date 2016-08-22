var groups             = module.parent.exports.groups;
var routingClients     = module.parent.exports.routingClients;
var rulesGroup         = module.parent.exports.rulesGroup;


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
        sendStateGroup(client.group);
    }
    
    // Пользователь отправил сообщение
    if (message["msg"]) {
        sendMessageGroup(client.group, {
            msg: message.msg, 
            first_name: client.first_name
        });
        traceState(client.group);
    }

    // Пользователь хочет сменить стол
    if (message["change_table"]) {
        var group = client.group;
        routingClients.changeGroup(client);
        sendStateGroup(group);
        sendStateGroup(client.group);
    }

    // Пользователь кликнул по бутылке.
    if (message["bottle"]) {
        rulesGroup.clickBottle(client);
    }
}

// Отправить сообщение своей группе
function sendMessageGroup(group, message) {
    // Если пустое сообщение в чат не отправляем его
    if (message["msg"] == "") {
        console.log("message.js ERROR free message: message.msg");
        return false;
    }

    if (groups[group]["slots"]) {
        var jsonMsg = JSON.stringify(message);
        for (var key in groups[group]["slots"]) {
            if (groups[group].slots[key]) {
                sendMessageClient(groups[group].slots[key], jsonMsg);
            }
        }
    }
}

// Отправить сообщение клиенту
function sendMessageClient(client, message) {
    try {
        client.send(message);
    } catch (err) {
        routingClients.outClient(client);
        sendStateGroup(client.group);
        console.log("message.js ERROR (client.send) description: ", err);
    }
}

// Состояние слотов в группе
function sendStateGroup(group) {
    sendMessageGroup( group, routingClients.getStateGroup(group) );
}

// Состояние в слотах
function traceState(group) {
    //console.log(groups);
}

module.exports = {
    addMessage: addMessage,
    sendStateGroup: sendStateGroup
};