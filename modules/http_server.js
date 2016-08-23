/* *************** Подключение модулей *************** */
var express = require("express");
var port = process.env.PORT;


/* *************** Создание http/https сервера *************** */
var app = express.createServer();
app.use( express.static("client") );
app.listen(port);


/* *************** Подключение зависимостей *************** */
require("./ws_server.js");


/* *************** Экспорт данных и методов *************** */
module.exports = {
    http_server: app
};