/* *************** Подключение модулей *************** */
var groups = [];
var maxClientOnGroup = 12;


/* *************** Экспорт данных и методов *************** */
module.exports = {
    groups:           groups,
    maxClientOnGroup: maxClientOnGroup,
    sendMessageGroup: sendMessageGroup,
    sendStateGroup:   sendStateGroup,
    traceState:       traceState
};


/* *************** Маршрутизация клиентов *************** */
var routingClients = require("./client.js");

function addClient(client) {
    routingClients.addClient(client);
    changeRotating(client.group);
}
module.exports.addClient   = addClient;

function outClient(client) {
    //checkOnKissing(client);
    routingClients.removeClient(client);
}
module.exports.outClient   = outClient;
module.exports.changeGroup = routingClients.changeGroup;


/* *************** Правила в группе *************** */
// var rulesGroup = require("../rules/group.js");


/* *************** Маршрутизация сообщений *************** */
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















/* *************** Остановка таймера в группе *************** */
function clearTimerGroup(group) {
    clearTimeout(groups[group].timer);
}


/* *************** Переход хода *************** */
// Переход хода бутылки
function changeRotating(group) {
    clearTimerGroup(group);
    var slot = getRotating(group);
    if (slot) {
        groups[group].current = slot;
        //console.log('groups[group] = ', groups[group]);
        startTimerClickBottle(group);
        offerClickBottle(group, slot);
    }
}


/* *************** Поиск вращающего *************** */
// Получить вращающего
function getRotating(group) {
    for (var i = ++groups[group].current; i < maxClientOnGroup; i++) {
        if (groups[group].slots[i]) {
            return i;
        }        
    }
    for (var i = 0, count = groups[group].current; i < count; i++) {
        if (groups[group].slots[i]) {
            return i;
        }        
    }
    return false;
}


/* *************** Предложение крутить *************** */
// Запустить таймер клика по бутылке
function startTimerClickBottle(group) {
    if (group && groups[group]) {
        groups[group].timer = setTimeout( 
            function() {
                clickBottle(group);
            }, 5000
        );
    }    
}

// Отправка всей группе того кто крутит бутылку
function offerClickBottle(group, slot) {
    sendMessageGroup(group, { bottle: {current: slot} });
}


/* *************** Поиск партнера *************** */
// Поиск партнера
function getPartner(group) {
    // формируем список доступных слотов
    var slots = [];

    if (groups[group]) {
        if ("slots" in groups[group]) {
            for (var i = 0; i < maxClientOnGroup; i++) {
                if ( (groups[group].slots[i]) && 
                     (groups[group].partners[0] != i) ) {
                    // console.log('partners[0] = ' + groups[group].partners[0] + ' i = ' + i);
                    slots.push(i);
                }
            }
        }
    }

    function randomInt(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1);
        rand = Math.round(rand);
        return rand;
    }

    if (slots.length > 0) {
        return slots[ randomInt(0, slots.length - 1) ];
    }

    return -1;
}


/* *************** Анимация кручения *************** */
// Запустить таймер на окончание кручения
function startTimerRotate(group, partner1, partner2) {
    groups[group].timer = setTimeout(function() {
        offerKissing(group, partner1, partner2);
    }, 5000);
}

// Начать анимацию кручения
function startAnimRotate(group, partner1, partner2) {
    // Отправка тех кто будет целоваться
    sendMessageGroup(group, { bottle: {partners: [partner1, partner2]} });    
}

// Клик по бутылке
function clickBottle(group) {
    clearTimerGroup(group);
    if (groups[group]) {
        groups[group].partners[0] = groups[group].current;
        var partner2 = getPartner(group);
        groups[group].partners[1] = partner2;
        var partner1 = groups[group].partners[0];
        
        startTimerRotate(group, partner1, partner2);
        startAnimRotate(group, partner1, partner2);
    }
}
module.exports.clickBottle = clickBottle;

/* *************** Предложение целоваться *************** */
// Передача хода по таймауту
function startTimerKissing(group) {
    groups[group].timer = setTimeout(function() {
        changeRotating(group);
    }, 5000);
}

// Анимация приближения партнеров
function offerKissing(group, partner1, partner2) {
    if (groups[group].slots[partner1] && groups[group].slots[partner2]) {
        startTimerKissing(group);
        sendMessageGroup(group, { bottle: {start_kissing: [partner1, partner2]} });
    } else {
        changeRotating(group);
    }
}