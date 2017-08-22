/* *************** Подключение модулей *************** */
var groups          = module.parent.exports.groups;
var availableGroups = {};
var counter         = 0;


/* *************** Публичные методы *************** */
// Добавить нового клиента
function addClient(client) {
    if (client.group || client.slot) {
        return false;
    }
    var group = getAvailableGroup(client);
    if (group) {
        addClientInGroup(group, client);
    } else {
        group = addGroup(client);
    }
    //console.log("Добавлен в группу: " + group + "\n");
    return true;
}

// Удалить клиента из группы
function removeClient(client) {
    if ( (client.group) && (client.slot) && ('sex' in client) ) {
        // console.log("Удален из группы: " + client.group + "\n");

        if ( (client.sex == 0) && (groups[client.group].sex.trans > 0) ) {
            groups[client.group].sex.trans--;
        } else if ( (client.sex == 1) && (groups[client.group].sex.woman > 0) ) {
            groups[client.group].sex.woman--;
        } else if ( (client.sex == 2) && (groups[client.group].sex.man > 0) ) {
            groups[client.group].sex.man--;
        } else {
            return false;
        }

        availableGroups[client.group] = availableGroups[client.group] || [];
        availableGroups[client.group].push(client.slot);
        delete groups[client.group].slots[client.slot];
        client.oldGroup = client.group;
        client.group = 0;
        client.slot = 0;
        return true;
    }
    return false;
}

// Смена группы
function changeGroup(client) {
    if ( removeClient(client) ) {
        addClient(client);
    }
}


/* *************** Скрытые методы *************** */
// Получить свободную группу
function getAvailableGroup(client) {
    for (var key in availableGroups) {
        if (client.oldGroup != key) {
            if (client.sex == 0) {
                return key;
            } else if ( (client.sex == 1) && (groups[key].sex.woman < 6) ) {
                return key;
            } else if ( (client.sex == 2) && (groups[key].sex.man < 6) ) {
                return key;
            }
        }
    }
    return false;
}

// Добавить клиента в группу
function addClientInGroup(group, client) {
    if (client.sex == 0) {
        groups[group].sex.trans++;
    } else if ( (client.sex == 1) && (groups[key].sex.woman < 6) ) {
        groups[group].sex.woman++;
    } else if ( (client.sex == 2) && (groups[key].sex.man < 6) ) {
        groups[group].sex.man++;
    } else {
        return false;
    }

    var slot = availableGroups[group].pop();
    client.group = group;
    client.slot = slot;

    groups[group].slots[slot] = client;

    // Удаление группы из списка доступных групп
    if (availableGroups[group].length == 0) {
        delete availableGroups[group];
    }
}

// Добавить новую группу
function addGroup(client) {
    counter++;
    var key = "g" + counter;
    client.group = key;
    client.slot = 1;

    var group = {
        slots:    {
            "1": client
        },
        current:  1,
        clickBottle: 0,
        partners: [0, 0],
        timer:    {},
        kiss_offer: {
            'left': 0,
            'right': 0
        },
        sex: {
            man: 0,
            woman: 0,
            trans: 0
        }
    };

    if (client.sex == 0) { // Пол не указан
        group.sex.trans++;
    } else if (client.sex == 1) { // Женский
        group.sex.woman++;
    } else if (client.sex == 2) { // Мужской
        group.sex.man++;
    }

    groups[key] = group;
    availableGroups[key] = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    return key;
}


/* *************** Экспорт данных и методов *************** */
module.exports = {
    addClient:     addClient,
    changeGroup:   changeGroup,
    removeClient:  removeClient,
    groups:        groups
};