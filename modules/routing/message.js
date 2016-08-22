var groups             = module.parent.exports.groups;
var routingClients     = module.parent.exports.routingClients;
var rulesGroup         = module.parent.exports.rulesGroup;

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
function getStateGroup(group) {
    var result = {slots: {}, group: group};
    for (var key in groups[group]["slots"]) {
        result.slots[key] = {photo: groups[group].slots[key].photo};
    }
    return result;
}

// Состояние слотов в группе
function sendStateGroup(group) {
    sendMessageGroup( group, getStateGroup(group) );
}

// Состояние в слотах
function traceState(group) {
    //console.log(groups);
}

module.exports = {
    sendMessageGroup: sendMessageGroup,
    sendStateGroup:   sendStateGroup,
    traceState:       traceState
};