/* *************** Подключение модулей *************** */
// Отлавливаем необработанные исключения
process.on('uncaughtException', function (err) {
    console.log("Неотловленное исключения: " + err);
});

var events = require("events");
var bus = new events.EventEmitter();
module.exports.bus = bus;

require("./modules/http_server.js");