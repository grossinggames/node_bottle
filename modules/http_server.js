/* *************** Подключение модулей *************** */
var express = require("express");
var port = process.env.PORT;


/* *************** Создание http/https сервера *************** */
var http_server = express.createServer();
http_server.use( express.static("client") );
http_server.listen(port, function (err) {
    if (err) {
        console.log("Модуль http_server Ошибка при запуске сервера: " + err);
        return false;
    }
    require("./ws_server.js");
});


/* *************** Экспорт данных и методов *************** */
module.exports = {
    http_server: http_server
};