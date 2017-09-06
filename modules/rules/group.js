var parent = module.parent.exports;
var bus = parent.bus;
var groups = parent.groups;
var maxClientOnGroup = parent.maxClientOnGroup;
var db = require("../db/db.js");

/* *************** Остановка таймера в группе *************** */
function clearTimerGroup(group) {
    clearTimeout(groups[group].timer);
}

/* *************** Переход хода *************** */
bus.on("changeRotating", changeRotating);

// Переход хода бутылки
function changeRotating(group) {
    clearTimerGroup(group);
    groups[group].clickBottle = 0;
    var slot = getRotating(group);

    if (slot) {
        groups[group].current = slot;
        //console.log('groups[group] = ', groups[group]);
        startTimerClickBottle(group);
        offerClickBottle(group, slot);
    } else {
        groups[group].timer = setTimeout( 
            function() {
                changeRotating(group);
            }, 5000
        );
    }
}


/* *************** Поиск вращающего *************** */
// Получить вращающего
function getRotating(group) {
    for (var i = ++groups[group].current; i <= maxClientOnGroup; i++) {
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
                groups[group].clickBottle = 0;
                clickBottle(group);
            }, 5000
        );
    }    
}

// Отправка всей группе того кто крутит бутылку
function offerClickBottle(group, slot) {
    // sendMessageGroup(group, { bottle: {current: slot} });
    bus.emit("sendMessageGroup", group, { bottle: {current: slot} });
}


/* *************** Поиск партнера *************** */
// Поиск партнера
function getPartner(group) {
    // формируем список доступных слотов
    var slots = [];

    if (groups[group]) {
        if ("slots" in groups[group]) {
            for (var i = 1; i <= maxClientOnGroup; i++) {
                if ( (groups[group].slots[i]) 
                    && (groups[group].partners[0] != i)
                    && (groups[group].slots[ groups[group].partners[0] ])
                    && (groups[group].slots[ groups[group].partners[0] ].sex != groups[group].slots[i].sex) ) {
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
    bus.emit("sendMessageGroup", group, { bottle: {partners: [partner1, partner2]} });
}

// Клик по бутылке
function clickBottle(group) {
    if (groups[group] && (groups[group].clickBottle === 0) ) {
        clearTimerGroup(group);
        groups[group].clickBottle = 1;
        groups[group].partners[0] = groups[group].current;
        var partner2 = getPartner(group);
        groups[group].partners[1] = partner2;
        var partner1 = groups[group].partners[0];
        groups[group].kiss_offer = {
            'left': 0,
            'right': 0
        };
        
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
        // sendMessageGroup(group, { bottle: {start_kissing: [partner1, partner2]} });
        bus.emit("sendMessageGroup", group, { bottle: {start_kissing: [partner1, partner2]} });
    } else {
        changeRotating(group);
    }
}

// Анимация приближения партнеров
function setKissOffer(client, kissOffer) {
    if ( (!groups[client.group].kiss_offer.left) && (groups[client.group].partners[0] == client.slot) ) {
        groups[client.group].kiss_offer.left = 1;
        bus.emit('sendMessageGroup', client.group, { bottle: {kiss_offer: kissOffer, side: "left"} });

        if (groups[client.group].partners[1]) {
            db.incrementKissUser(groups[client.group].partners[1]);
        }
    }
    if ( (!groups[client.group].kiss_offer.right) && (groups[client.group].partners[1] == client.slot) ) {
        groups[client.group].kiss_offer.right = 1;
        bus.emit('sendMessageGroup', client.group, { bottle: { kiss_offer: kissOffer, side: "right" } } );

        if (groups[client.group].partners[0]) {
            db.incrementKissUser(groups[client.group].partners[0]);
        }
    }
    
    
}
module.exports.setKissOffer = setKissOffer;

/* *************** Установить бутылочку *************** */
// Установить бутылочку
function setBottle(client, bottle) {
    if (!client){
        console.log('group.js setBottle not client');
        return false;
    }

    if (!client.group){
        console.log('group.js setBottle not client.group');
        return false;
    }

    if (!bottle) {
        console.log('group.js setBottle not bottle');
        return false;
    }

    let group = client.group;

    if (groups[group] && (groups[group].bottle != bottle) ) {
        groups[group].bottle = bottle;
    }
}
module.exports.setBottle = setBottle;