/* *************** Подключение модулей *************** */
var parent = module.parent.exports;
var bus = module.parent.exports.bus;
var groups = [];
const maxClientOnGroup = 12;


/* *************** Экспорт данных и методов *************** */
module.exports = {
    groups:           groups,
    maxClientOnGroup: maxClientOnGroup,
    sendMessageGroup: sendMessageGroup,
    sendStateGroup:   sendStateGroup,
    traceState:       traceState,
    bus: bus
};


/* *************** Маршрутизация клиентов *************** */
var routingClients = require("./client.js");

function addClient(client) {
    routingClients.addClient(client);
    bus.emit("changeRotating", client.group); // addRotating
}
module.exports.addClient   = addClient;

function outClient(client) {
    //checkOnKissing(client);
    routingClients.removeClient(client);
}
module.exports.outClient   = outClient;
module.exports.changeGroup = routingClients.changeGroup;


/* *************** Правила в группе *************** */
var rulesGroup = require("../rules/group.js");
module.exports.clickBottle = rulesGroup.clickBottle;


/* *************** Маршрутизация сообщений *************** */
bus.on("sendMessageGroup", sendMessageGroup);

// Отправить сообщение своей группе
function sendMessageGroup(group, message) {
    // Если пустое сообщение в чат не отправляем его
    if (message["msg"] == "") {
        console.log("message.js ERROR free message: message.msg");
        return false;
    }

    if (group && groups[group]["slots"]) {
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
        var group = client.group;
        outClient(client);
        sendStateGroup(group);
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