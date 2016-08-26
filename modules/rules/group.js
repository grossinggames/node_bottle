/* *************** Подключение модулей *************** */
/*
var routingMessage   = module.parent.exports; 
var groups           = routingMessage.groups;
var maxClientOnGroup = routingMessage.maxClientOnGroup; 
*/

/* *************** Работа с вращающим *************** */
/*
// Остановка таймера в группе
function clearTimerGroup(group) {
    clearTimeout(groups[group].timer);
}

// Получить вращающего бутылочку
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
    routingMessage.sendMessageGroup(group, { bottle: {current: slot} });
}

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
*/

/* *************** Работа с партнером *************** */
/*
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
*/

/* *************** Работа с бутылкой *************** */
/*
// Имитация клика по бутылке
function clickBottle(group) {
    clearTimeout(groups[group].timer);

    // Избавиться от partner1 partner2 когда удалится availibleGroups
    var partner1;
    var partner2;

    if (groups[group]) {
        if ("partners" in groups[group]) {
            groups[group].partners[0] = groups[group].current;
            partner2 = getPartner(group);
            groups[group].partners[1] = partner2;
            partner1 = groups[group].partners[0];
        }
    }
    
    // Отправка тех кто будет целоваться
    routingMessage.sendMessageGroup(group, { bottle: {partners: [partner1, partner2]} });

    groups[group].timer = setTimeout(function() {
        startKissing(group, partner1, partner2);
    }, 5000);
}

// Анимация приближения партнеров
function startKissing(group, partner1, partner2) {
    if (groups[group].slots[partner1] && groups[group].slots[partner2]) {
        // Запуск анимации поцелуя
        // Отправка тех кто будет целоваться
        routingMessage.sendMessageGroup(group, { bottle: {start_kissing: [partner1, partner2]} });
        
        // Передача хода по таймауту
        groups[group].timer = setTimeout(function() {
            changeRotating(group);
        }, 5000);
    } else {
        changeRotating(group);
    }
}

// Выход клиента
function outClient(client) {
    console.log("Group выход клиента");
}
*/
/* *************** Экспорт данных и методов *************** */
/*
module.exports = {
    changeRotating: changeRotating,
    clickBottle: clickBottle,
    outClient:   outClient
};
*/