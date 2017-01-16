/* *************** Подключение модулей *************** */
var express = require("express");
var port = 443;
var fs = require('fs');

console.log('port: ', port);


/* *************** Создание http/https сервера *************** */
var httpServer = express.createServer({ 
    key:  fs.readFileSync(__dirname + '/certificate/server_localhost.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/certificate/server_localhost.crt', 'utf8')
});

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