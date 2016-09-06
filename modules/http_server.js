/* *************** Подключение модулей *************** */
var express = require("express");
var port = process.env.PORT;


/* *************** Создание http/https сервера *************** */
var httpServer = express.createServer();
httpServer.use( express.static("client") );
httpServer.listen(port, function (err) {
    if (err) {
        console.log("Модуль http_server Ошибка при запуске сервера: " + err);
        return false;
    }
    require("./ws_server.js");
});

/* *************** Экспорт данных и методов *************** */
module.exports = {
    httpServer: httpServer,
    bus: module.parent.exports.bus
};