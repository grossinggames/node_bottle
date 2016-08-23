/* *************** Подключение модулей *************** */
var groups = module.parent.exports.groups;
var maxClientOnGroup = module.parent.exports.maxClientOnGroup; 
var routingMessage     = module.parent.exports.routingMessage;


/* *************** Настройки правил в группах *************** */
// Получить следующего вращающего бутылочку
function getNextRotating(group) {
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

    function randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1);
        rand = Math.round(rand);
        return rand;
    }

    if (slots.length > 0) {
        return slots[ randomInteger(0, slots.length - 1) ];
    }

    return -1;
}

// Переход хода бутылки
function changeCurrent(idGroup) {
    var slot = getNextRotating(idGroup);
    
    // Отправка всей группе того кто крутит бутылку
    if (groups[idGroup]) {
        if ("slots" in groups[idGroup]) {
            groups[idGroup].current = slot;
            console.log('groups[idGroup] = ', groups[idGroup]);
            routingMessage.sendMessageGroup(idGroup, { bottle: {current: slot} });
            //traceState();
            //return;
        }
    }
    groups[idGroup].timer = setTimeout( 
        function() {
            clickBottle(idGroup);
        }, 5000
    );
}

// Имитация клика по бутылке
function clickBottle(idGroup) {
    clearTimeout(groups[idGroup].timer);

    // Избавиться от partner1 partner2 когда удалится availibleGroups
    var partner1;
    var partner2;

    if (groups[idGroup]) {
        if ("partners" in groups[idGroup]) {
            groups[idGroup].partners[0] = groups[idGroup].current;
            partner2 = getPartner(idGroup);
            groups[idGroup].partners[1] = partner2;
            partner1 = groups[idGroup].partners[0];
        }
    }
    
    // Отправка тех кто будет целоваться
    routingMessage.sendMessageGroup(idGroup, { bottle: {partners: [partner1, partner2]} });

    groups[idGroup].timer = setTimeout(function() {
        startKissing(idGroup, partner1, partner2);
    }, 5000);
}

// Анимация приближения партнеров
function startKissing(idGroup, partner1, partner2) {
    if (groups[idGroup].slots[partner1] && groups[idGroup].slots[partner2]) {
        // Запуск анимации поцелуя
        // Отправка тех кто будет целоваться
        routingMessage.sendMessageGroup(idGroup, { bottle: {start_kissing: [partner1, partner2]} });
        
        // Передача хода по таймауту
        groups[idGroup].timer = setTimeout(function() {
            changeCurrent(idGroup);
        }, 5000);
    } else {
        changeCurrent(idGroup);
    }
}


/* *************** Экспорт данных и методов *************** */
module.exports = {
    clickBottle: clickBottle
};