var groups = module.parent.exports.groups;


/* *************** Настройки правил в группе *************** */

function clickBottle(client) {
    console.log("group: " + client.group);
}

module.exports = {
    clickBottle: clickBottle
};