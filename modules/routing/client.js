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
    var group = getAvailableGroup();
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
    if (client.group && client.slot) {
        // console.log("Удален из группы: " + client.group + "\n");
        availableGroups[client.group] = availableGroups[client.group] || {};
        availableGroups[client.group].push(client.slot);
        delete groups[client.group].slots[client.slot];
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
function getAvailableGroup() {
    for (var key in availableGroups) {
        return key;
    }
    return false;
}

// Добавить клиента в группу
function addClientInGroup(group, client) {
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
        timer:    {}
    };
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