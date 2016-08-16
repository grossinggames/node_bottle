/* *************** Подключение зависимостей *************** */

var express = require("express");
var port = 3000;

/* *************** Создание http/https сервера *************** */

var app = express.createServer();
app.use( express.static("client") );
app.listen(port);

module.exports = {
    http_server: app
};

/* *************** Подключение зависимостей *************** */
require("./ws_server.js");