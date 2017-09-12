/* *************** Подключение модулей *************** */
var parent = module.parent.exports;
var bus = module.parent.exports.bus;
var groups = {};
const maxClientOnGroup = 12;
const WebSocket = require('ws');


/* *************** Экспорт данных и методов *************** */
module.exports = {
    groups:           groups,
    maxClientOnGroup: maxClientOnGroup,
    sendMessageClient: sendMessageClient,
    sendMessageGroup: sendMessageGroup,
    sendStateGroup:   sendStateGroup,
    traceState:       traceState,
    bus: bus
};


/* *************** Маршрутизация клиентов *************** */
var routingClients = require("./client.js");

function addClient(client) {
    routingClients.addClient(client);
    //bus.emit("changeRotating", client.group); // addRotating
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
module.exports.setKissOffer = rulesGroup.setKissOffer;
module.exports.setBottle = rulesGroup.setBottle;


/* *************** Маршрутизация сообщений *************** */
bus.on("sendMessageGroup", sendMessageGroup);

// Отправить сообщение своей группе
function sendMessageGroup(group, message) {
    // Если название группы не указано не отправляем ничего
    if (!group) {
        console.log("message.js sendMessageGroup !group: " + group);
        return false;        
    }
    // Если пустое сообщение в чат не отправляем его
    if (message["msg"] == "") {
        console.log("message.js ERROR free message: message.msg");
        return false;
    }

    try {
        if (group && groups[group]["slots"]) {
            var jsonMsg = JSON.stringify(message);
            for (var key in groups[group]["slots"]) {
                if (groups[group].slots[key]) {
                    sendMessageClient(groups[group].slots[key], jsonMsg);
                }
            }
        }
    } catch (err) {
        console.log("SendMessageGroup err: " + err);
    }
}

// Отправить сообщение клиенту
function sendMessageClient(client, message) {
    try {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    } catch (err) {
        var group = client.group;
        outClient(client);
        sendStateGroup(group);
        console.log("message.js ERROR (client.send) description: ", err);
        console.log("group: " + group);
    }
}

// Состояние слотов в группе
function getStateGroup(group) {
    try {
        var result = {slots: {}, group: group, set_bottle: groups[group].bottle};
        for (var key in groups[group]["slots"]) {
            result.slots[key] = {
                photo: groups[group].slots[key].photo,
                first_name: groups[group].slots[key].first_name,
                counter_kissing: groups[group].slots[key].counter_kissing
            };
        }
        return result;
    } catch (err) {
        console.log("getStateGroup err:" + err + " Group: " + group);
    }
}

// Состояние слотов в группе
function sendStateGroup(group) {
    if (group) {
        sendMessageGroup( group, getStateGroup(group) );
    }
}

// Состояние в слотах
function traceState(group) {
    //console.log(groups);
}