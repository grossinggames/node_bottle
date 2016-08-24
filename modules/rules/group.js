/* *************** Подключение модулей *************** */
var groups = module.parent.exports.groups;
var maxClientOnGroup = module.parent.exports.maxClientOnGroup; 
var routingMessage     = module.parent.exports.routingMessage;


/* *************** Работа с вращающим *************** */
// Остановка таймера в группе
function clearTimerGroup(group) {
    clearTimeout(groups[group].timer);
}

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

// Переход хода бутылки
function changeRotating(group) {
    clearTimerGroup(group);
    var slot = getNextRotating(group);
    
    // Отправка всей группе того кто крутит бутылку
    if (groups[group]) {
        if ("slots" in groups[group]) {
            groups[group].current = slot;
            console.log('groups[group] = ', groups[group]);
            routingMessage.sendMessageGroup(group, { bottle: {current: slot} });
            //traceState();
            //return;
        }
    }
    groups[group].timer = setTimeout( 
        function() {
            clickBottle(group);
        }, 5000
    );
}


/* *************** Работа с партнером *************** */
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


/* *************** Работа с бутылкой *************** */
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


/* *************** Экспорт данных и методов *************** */
module.exports = {
    clickBottle: clickBottle
};