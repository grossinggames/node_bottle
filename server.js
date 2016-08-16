/* *************** Подключение зависимостей *************** */
// Отлавливаем необработанные исключения
process.on('uncaughtException', function (err) {
    console.log("Неотловленное исключения: " + err);
});

var app = {};
app["http_server"] = require("./modules/http_server.js");