window.onload = function () {

    /* *************** Инициализация вк *************** */
    VK.init(function() {
        // API initialization succeeded
        console.log("Успеная регстрация вконтакте");

        /* *************** Преднастройки *************** */
        // Настройки служебные
        SwitchRoom("room_bottle");

        // Массив событий для комнат и интерфейса
        var ticks = [];
        ticks["room_interface"] = new CustomEvent("room_interface");

        var curTime = new Date().getTime();
        var diffTickTime = 0;
        var FPS = 0;
        var startFPStime = curTime;

        // Заполняем ассациативный массив событиями
        for (var i = 0, len = rooms.length; i < len; i++) {
            ticks[ rooms[i] ] = new CustomEvent(rooms[i]);
        }

        var tmrGlobal = window.document.getElementById("tmr_global");
        var intervalTick = setInterval(function () {
            var newTime = new Date().getTime();
            diffTickTime = (newTime - curTime);
            curTime = newTime;

            if ( (curTime - startFPStime) >= 1000 ) {
                startFPStime = curTime;
                ObjSet('txt_bottle_fps', { text: 'FPS: ' +FPS });
                FPS = 0;
            } else {
                FPS++;
            }

            ticks[currentRoom]['diffMs'] = diffTickTime;
            tmrGlobal.dispatchEvent(ticks[currentRoom]);
            tmrGlobal.dispatchEvent(ticks["room_interface"]);

            //console.log('diffTickTime: ', diffTickTime);
        }, TIME_UPDATE);

        /* *************** Websocket соединение *************** */
        var slot = 0;
        var group = 0;
        var photo = "";

        var socket     = new WebSocket("wss://" + window.location.hostname + ":" + window.location.port);
        socket.onopen  = function() {
            //console.log("Websocket connect");
            VK.api("users.get", {fields: "photo_100"}, function(data) { 
                if (data && data.response && data.response[0] &&
                  data.response[0].photo_100 && data.response[0].first_name && 
                  data.response[0].id) {
                    photo = data.response[0].photo_100;
                    socket.send(JSON.stringify({
                        photo: data.response[0].photo_100,
                        first_name: data.response[0].first_name,
                        id: data.response[0].id
                    }));
                }
            });
        };

        socket.onclose = function(event) {
          if (event.wasClean) {
            console.log("Close connect");
          } else {
            console.log("Websocet connect break");
          }
          console.log("Code: " + event.code + " reason: " + event.reason);
        };

        var chatField = window.document.getElementById("spr_bottle_chat_field");
        var txtTable = window.document.getElementById("txt_bottle_table");
        var txtSlot = window.document.getElementById("txt_bottle_slot");
        
        socket.onmessage = function (event) {
            try {
                var message = JSON.parse(event.data);

                // Номер стола
                if (message["group"]) {
                    group = message.group.substring(1);
                    txtTable.innerText = "Стол: " + group;
                }

                // Состояние в слотах
                if (message["slots"]) {
                    ClearSlots();
                    for (var key in message["slots"]) {
                        ObjSet("spr_bottle_slot_" + key, {res: message["slots"][key]["photo"]});
                        if (message["slots"][key]["photo"] == photo) {
                            slot = key;
                            txtSlot.innerText = "Слот: " + slot;
                        }
                    }
                }

                // Если нет группы или слота то считаем, что нет смысла обрабатывать сообщения
                if ( (!group) || (!slot) ) {
                    return;
                }

                // Новое сообщение
                if (message["msg"]) {
                    //chatField.innerHTML += "<li>" + message.first_name + ": " + message.msg + "</li>";
                    //chatField.scrollTop = chatField.scrollHeight;
                    var now = new Date();
                    var hours = now.getHours();
                    var minutes = now.getMinutes();
                    var seconds = now.getSeconds();
                    if (hours <= 9) {
                        hours = "0" + hours;
                    }
                    if (minutes <= 9) {
                        minutes = "0" + minutes;
                    }
                    if (seconds <= 9) {
                        seconds = "0" + seconds;
                    }

                    var timeMsg = hours + ":" + minutes + ":" + seconds;

                    chatField.innerHTML += [
                        '<li class="collection-item avatar" style="word-wrap: break-word; overflow-wrap: break-word; width: 92%; margin: 3px auto; -webkit-user-select: none; -moz-user-select: none;">',
                            '<img src="' + message.photo + '" alt="" class="circle">',
                            '<span class="title">' + message.first_name + '</span>',
                            '<span style="margin-left: 7px;">' + timeMsg + '</span>',
                            '<br>',
                            '<span>' + message.msg + '</span>',
                            '<div style="cursor: pointer;" class="secondary-content">',
                            '<i style="cursor: pointer;" onclick="$(this.parentNode.parentNode).remove()" class="close material-icons">close</i>',
                            '</div>',
                        '</li>'
                    ].join(' ');
                    chatField.scrollTop = chatField.scrollHeight;
                }

                // Бутылка
                if (message["bottle"]) {
                    // Установить ответ на предложение полцеловать
                    if (message["bottle"]["kiss_offer"] == 0) {
                        ObjSet("spr_bottle_kiss_left_no", {alp: 1});
                    } else if (message["bottle"]["kiss_offer"] == 1) {
                        ObjSet("spr_bottle_kiss_left_yes", {alp: 1});
                    }

                    // Кто крутит
                    if (message["bottle"]["current"]) {
                        //chatField.innerHTML += "<li> крутит: " + message["bottle"].current + "</li>";

                        ObjAnimate("spr_bottle_kiss_your_choice", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_your_choice").alp, 0.3,0,0 ]);
                        ObjAnimate("spr_bottle_kiss_yes", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_yes").alp, 0.3,0,0 ]);
                        ObjAnimate("spr_bottle_kiss_no", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_no").alp, 0.3,0,0 ]);

                        ObjSet("spr_bottle_kiss_yes", {input: 0});
                        ObjSet("spr_bottle_kiss_no", {input: 0});
                        
                        // Появляется стрелка
                        if (slot == message["bottle"].current) {
                            ObjAnimate("spr_bottle_arrow", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_arrow").alp, 0.1,0,0 ]);
                            ObjAnimate("spr_bottle_rotate_bottle", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_rotate_bottle").alp, 0.3,0,1 ]);
                            
                            // Устанавливаеся кликабельность бутылки
                            ObjSet("spr_bottle_floor_bottle", {input: 1});
                        } else {
                            ObjAnimate("spr_bottle_arrow", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_arrow").alp, 0.3,0,1 ]);
                            ObjAnimate("spr_bottle_rotate_bottle", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_rotate_bottle").alp, 0.1,0,0 ]);
                        }

                        // Появляется бутылка
                        ObjAnimate("spr_bottle_floor_bottle", "alp", 0, 0, function() { }, [ 0,0,ObjGet('spr_bottle_floor_bottle').alp, 0.3,0,1 ]);

                        // Обнуляются углы слотов
                        for (var i = 1; i < 13; i++) {
                            ObjAnimate('spr_bottle_slot_' + i, 'angle', 0, 0, function() { }, [ 0,0,ObjGet('spr_bottle_slot_' + i).angle, 0.3,0,0 ]);
                        }

                        // Установка позиции и угола стрелке
                        var current = message["bottle"].current;
                        ObjSet("spr_bottle_arrow", { pos_x: arrowSettings[current - 1].posXY[0], pos_y: arrowSettings[current - 1].posXY[1], angle: arrowSettings[current - 1].angle });

                        // Анимация слота по углу (влево вправо)
                        ObjAnimate("spr_bottle_slot_" + message["bottle"].current, "angle", 0, 0, function() { }, [ 0,0,0, 0.2,0,-5, 0.4,0,0, 0.6,0,5, 0.8,0,0 ]);
                    }

                    // На кого выпадет бутылка и кто крутит
                    if (message["bottle"]["partners"]) {
                        //chatField.innerHTML += "<li> партнеры: " + message["bottle"].partners + "</li>";
                        if (message['bottle'].partners[1] < 1) {
                            return false;
                        }

                        ObjAnimate("spr_bottle_rotate_bottle", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_rotate_bottle").alp, 0.3,0,0 ]);
                        ObjAnimate("spr_bottle_kiss_your_choice", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_your_choice").alp, 0.3,0,0 ]);
                        ObjAnimate("spr_bottle_kiss_yes", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_yes").alp, 0.3,0,0 ]);
                        ObjAnimate("spr_bottle_kiss_no", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_no").alp, 0.3,0,0 ]);

                        ObjSet("spr_bottle_kiss_yes", {input: 0});
                        ObjSet("spr_bottle_kiss_no", {input: 0});

                        var slotId = message['bottle'].partners[1] - 1;
                        var newAngle = slotPositions[ slotId ].angle  + 2520;

                        ObjSet("spr_bottle_floor_bottle", {input: 0});
                        var btn = ObjGet("spr_bottle_floor_bottle");

                        ObjAnimate("spr_bottle_floor_bottle", "angle", 0, 0, function() { }, [ 
                            0,0,btn.angle % 360,
                            2,0,newAngle - 1220,
                            3,0,newAngle - 650,
                            4,0,newAngle - 260,
                            4.75,0,newAngle
                        ]);
                    }

                    // Начало поцелуев
                    if (message["bottle"]["start_kissing"]) {
                        //chatField.innerHTML += "<li> анимация поцелуев: " + message["bottle"].start_kissing + "</li>";

                        if ( (slot == message["bottle"]["start_kissing"][0]) || (slot == message["bottle"]["start_kissing"][1]) ) {
                            ObjAnimate("spr_bottle_kiss_your_choice", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_your_choice").alp, 0.3,0,1, 4.5,0,1, 4.75,0,0 ]);
                            ObjAnimate("spr_bottle_kiss_or_not", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_or_not").alp, 0.3,0,0 ]);
                        } else {
                            ObjAnimate("spr_bottle_kiss_your_choice", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_your_choice").alp, 0.3,0,0 ]);
                            ObjAnimate("spr_bottle_kiss_or_not", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_or_not").alp, 0.3,0,1, 4.5,0,1, 4.75,0,0 ]);
                        }

                        ObjAnimate("spr_bottle_kiss_yes", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_yes").alp, 0.3,0,1, 4.5,0,1, 4.75,0,0 ]);
                        ObjAnimate("spr_bottle_kiss_no", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_kiss_no").alp, 0.3,0,1, 4.5,0,1, 4.75,0,0 ]);

                        ObjSet("spr_bottle_kiss_yes", {input: 1});
                        ObjSet("spr_bottle_kiss_no", {input: 1});
                        ObjSet("spr_bottle_floor_bottle", {input: 0});
                        ObjSet("spr_bottle_kiss_left_yes", {alp: 0});
                        
                        // Блок надписей поцелуются они или нет
                        ObjAnimate("spr_bottle_arrow", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_arrow").alp, 0.3,0,0 ]);
                        ObjAnimate("spr_bottle_floor_bottle", "alp", 0, 0, function() { }, [ 0,0,1, 0.3,0,0, 4.5,0,0, 4.75,0,1 ]);
                        ObjAnimate("spr_bottle_kiss_time", "alp", 0, 0, function() { }, [ 0,0,0, 0.3,0,1, 4.5,0,1, 4.75,0,0 ]);

                        var timerBackPos = {
                            1:  [3, -3],
                            2:  [-56, -3],
                            3:  [-116, -3],
                            4:  [-178, -3],
                            5:  [-239, -3],
                            6:  [8, -66],
                            7:  [-49, -66],
                            8:  [-109, -66],
                            9:  [-168, -66],
                            10: [-230, -66]
                        };
                        ObjAnimate("spr_bottle_kiss_time", "drawoff_x", 0, 0, function() { }, [ 
                            0,0,timerBackPos['10'][0], 
                            0.72,0,timerBackPos['10'][0], 

                            0.72,0,timerBackPos['9'][0],
                            1.14,0,timerBackPos['9'][0],

                            1.14,0,timerBackPos['8'][0],
                            1.56,0,timerBackPos['8'][0],

                            1.56,0,timerBackPos['7'][0],
                            1.98,0,timerBackPos['7'][0],

                            1.98,0,timerBackPos['6'][0],
                            2.4,0,timerBackPos['6'][0],

                            2.4,0,timerBackPos['5'][0],
                            2.82,0,timerBackPos['5'][0],

                            2.82,0,timerBackPos['4'][0],
                            3.24,0,timerBackPos['4'][0],

                            3.24,0,timerBackPos['3'][0],
                            3.66,0,timerBackPos['3'][0],

                            3.66,0,timerBackPos['2'][0],
                            4.08,0,timerBackPos['2'][0],

                            4.08,0,timerBackPos['1'][0], 
                            4.5,0,timerBackPos['1'][0]
                        ]);
                        ObjAnimate("spr_bottle_kiss_time", "drawoff_y", 0, 0, function() { }, [ 
                            0,0,timerBackPos['10'][1], 
                            0.72,0,timerBackPos['10'][1], 

                            0.72,0,timerBackPos['9'][1],
                            1.14,0,timerBackPos['9'][1],

                            1.14,0,timerBackPos['8'][1],
                            1.56,0,timerBackPos['8'][1],

                            1.56,0,timerBackPos['7'][1],
                            1.98,0,timerBackPos['7'][1],

                            1.98,0,timerBackPos['6'][1],
                            2.4,0,timerBackPos['6'][1],

                            2.4,0,timerBackPos['5'][1],
                            2.82,0,timerBackPos['5'][1],

                            2.82,0,timerBackPos['4'][1],
                            3.24,0,timerBackPos['4'][1],

                            3.24,0,timerBackPos['3'][1],
                            3.66,0,timerBackPos['3'][1],

                            3.66,0,timerBackPos['2'][1],
                            4.08,0,timerBackPos['2'][1],

                            4.08,0,timerBackPos['1'][1], 
                            4.5,0,timerBackPos['1'][1]
                        ]);

                        for (var i = 1; i < 13; i++) {
                            ObjAnimate('spr_bottle_slot_' + i, 'angle', 0, 0, function() { }, [ 0,0,ObjGet('spr_bottle_slot_' + i).angle, 0.3,0,0 ]);
                            ObjAnimate('spr_bottle_slot_' + i, 'pos_x', 0, 0, function() { }, [ 0,0,ObjGet('spr_bottle_slot_' + i).pox_x, 0.3,0,slotPositions[i - 1]['defPos'][0] ]);
                            ObjAnimate('spr_bottle_slot_' + i, 'pos_y', 0, 0, function() { }, [ 0,0,ObjGet('spr_bottle_slot_' + i).pos_y, 0.3,0,slotPositions[i - 1]['defPos'][1] ]);
                        }                        

                        var slot1 = message["bottle"].start_kissing[0] - 1;
                        ObjAnimate("spr_bottle_slot_" + message["bottle"].start_kissing[0], "pos_x", 0, 0, function() {}, [ 0,0,ObjGet("spr_bottle_slot_" + message["bottle"].start_kissing[0]).pos_x, 0.25,0,212, 4.5,0,212, 4.75,0,slotPositions[slot1]['defPos'][0] ]);
                        ObjAnimate("spr_bottle_slot_" + message["bottle"].start_kissing[0], "pos_y", 0, 0, function() {}, [ 0,0,ObjGet("spr_bottle_slot_" + message["bottle"].start_kissing[0]).pos_y, 0.25,0,250, 4.5,0,250, 4.75,0,slotPositions[slot1]['defPos'][1] ]);

                        var slot2 = message["bottle"].start_kissing[1] - 1;
                        ObjAnimate("spr_bottle_slot_" + message["bottle"].start_kissing[1], "pos_x", 0, 0, function() {}, [ 0,0,ObjGet("spr_bottle_slot_" + message["bottle"].start_kissing[1]).pos_x, 0.25,0,412, 4.5,0,412, 4.75,0,slotPositions[slot2]['defPos'][0] ]);
                        ObjAnimate("spr_bottle_slot_" + message["bottle"].start_kissing[1], "pos_y", 0, 0, function() {}, [ 0,0,ObjGet("spr_bottle_slot_" + message["bottle"].start_kissing[1]).pos_y, 0.25,0,250, 4.5,0,250, 4.75,0,slotPositions[slot2]['defPos'][1] ]);
                    }
                    chatField.scrollTop = chatField.scrollHeight;
                }
            } catch(err) {
                console.log('socket.onmessage Error description: ');
                console.log(err);
                return;
            }
        };

        socket.onerror = function(error) {
          console.log("Error " + error.message);
        };

        /* *************** Прочее *************** */
        // Очистить слоты от аватарок
        function ClearSlots() {
            for (var i = 1; i < 13; i++) {
                ObjSet("spr_bottle_slot_" + i, {res: ""});
            }
        }

        /* *************** Работа с сокетом *************** */
        // Отправка сообщений в чат
        function SendMessage(msg) {
            msg = msg || inputText.value;
            if (msg != "") {
                socket.send( JSON.stringify({msg: msg}) );
                inputText.value = "";
                //inputText.focus();
            }
        }

        // Отправить сообщение о смене стола
        function changeTable() {
            group = 0;
            slot = 0;
            socket.send( JSON.stringify({change_table: 1}) );
            //inputText.focus();
        }

        /* *************** Глобавльные анимации *************** */
        // Визуальные настройки
        function ButtonEnter(name) {
            var btn = ObjGet(name);
            ObjAnimate(name, "scale_x", 0, 0, function() {}, [ 0,0,btn.scale_x, 0.1,0,1.2, 0.2,0,1.1 ]);
            ObjAnimate(name, "scale_y", 0, 0, function() {}, [ 0,0,btn.scale_y, 0.1,0,1.2, 0.2,0,1.1 ]);
        }

        var inputText = window.document.getElementById("spr_bottle_sending_input");

        function ButtonLeave(name) {
            var btn = ObjGet(name);
            ObjAnimate(name, "scale_x", 0, 0, function() {}, [ 0,0,btn.scale_x, 0.1,0,0.8, 0.2,0,1 ]);
            ObjAnimate(name, "scale_y", 0, 0, function() {}, [ 0,0,btn.scale_y, 0.1,0,0.8, 0.2,0,1 ]);
            //inputText.focus();
        }

        function ButtonDown(name) {
            var btn = ObjGet(name);
            ObjAnimate(name, "scale_x", 0, 0, function() {}, [ 0,0,btn.scale_x, 0.1,0,0.6, 0.2,0,0.8 ]);
            ObjAnimate(name, "scale_y", 0, 0, function() {}, [ 0,0,btn.scale_y, 0.1,0,0.6, 0.2,0,0.8 ]);
            //inputText.focus();
        }

        function ButtonUp(name) {
            var btn = ObjGet(name);
            ObjAnimate(name, "scale_x", 0, 0, function() {}, [ 0,0,btn.scale_x, 0.1,0,1.2, 0.2,0,1 ]);
            ObjAnimate(name, "scale_y", 0, 0, function() {}, [ 0,0,btn.scale_y, 0.1,0,1.2, 0.2,0,1 ]);
            //inputText.focus();
        }

        /* *************** Преднастройки кнопок *************** */
        // Установка параметров
        ObjSet("spr_bottle_floor_bottle",
        {
            input: 0,
            cursor: "hand",
            event_mdown: function() {

            },
            event_mup: function() {
                var btn = ObjGet("spr_bottle_floor_bottle");
                ObjSet("spr_bottle_floor_bottle", {input: 0});
                ObjAnimate("spr_bottle_rotate_bottle", "alp", 0, 0, function() { }, [ 0,0,ObjGet("spr_bottle_rotate_bottle").alp, 0.3,0,0 ]);
                //ObjAnimate("spr_bottle_floor_bottle", "angle", 0, 0, function() {  }, [ 0,0,btn.angle, 1,0,btn.angle + 360 ]);
                socket.send( JSON.stringify({bottle: 1}) );
                //inputText.focus();
            },
            event_mleave: function() {

            }
        });

        ObjSet("spr_bottle_button_change_bottle_btn",
        {
            cursor: "hand",
            popup: "Поменять бутылку",
            event_mdown: function() {
                //ButtonDown("spr_bottle_button_change_bottle");
            },
            event_mup: function() {
                //ButtonUp("spr_bottle_button_change_bottle");
                ShowModalWindow("spr_interface_modalwindow_change_bottle");
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_button_change_bottle");
                ObjSet("spr_bottle_button_change_bottle", { drawoff_x: 0 });
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_button_change_bottle");
                ObjSet("spr_bottle_button_change_bottle", { drawoff_x: -35 });
            }
        });

        ObjSet("spr_interface_modalwindow_change_bottle_close",
        {
            cursor: "hand",
            popup: "Закрыть",
            event_mdown: function() {
                //ButtonDown("spr_interface_modalwindow_change_bottle_close");
            },
            event_mup: function() {
                //ButtonUp("spr_interface_modalwindow_change_bottle_close");
                HideModalWindow();
            },
            event_mleave: function() {
                //ButtonLeave("spr_interface_modalwindow_change_bottle_close");
            },
            event_menter: function() {
                //ButtonEnter("spr_interface_modalwindow_change_bottle_close");
            }
        });

        ObjSet("spr_bottle_button_change_table_btn",
        {
            cursor: "hand",
            popup: "Сменить стол",
            event_mdown: function() {
                //ButtonDown("spr_bottle_button_change_table");
            },
            event_mup: function() {
                //ButtonUp("spr_bottle_button_change_table");
                //ShowModalWindow("spr_interface_modalwindow_change_table");
                changeTable();
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_button_change_table");
                ObjSet("spr_bottle_button_change_table", { drawoff_x: 0 });
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_button_change_table");
                ObjSet("spr_bottle_button_change_table", { drawoff_x: -35 });
            }
        });

        ObjSet("spr_interface_modalwindow_change_table_close",
        {
            cursor: "hand",
            popup: "Закрыть",
            event_mdown: function() {
                //ButtonDown("spr_interface_modalwindow_change_table_close");
            },
            event_mup: function() {
                //ButtonUp("spr_interface_modalwindow_change_table_close");
                HideModalWindow();
            },
            event_mleave: function() {
                //ButtonLeave("spr_interface_modalwindow_change_table_close");
            },
            event_menter: function() {
                //ButtonEnter("spr_interface_modalwindow_change_table_close");
            }
        });

        ObjSet("spr_bottle_button_achievements_btn",
        {
            cursor: "hand",
            popup: "Достижения",
            event_mdown: function() {
                //ButtonDown("spr_bottle_button_achievements");
            },
            event_mup: function() {
                //ButtonUp("spr_bottle_button_achievements");
                ShowModalWindow("spr_interface_modalwindow_achievements");
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_button_achievements");
                ObjSet("spr_bottle_button_achievements", { drawoff_x: 0 });
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_button_achievements");
                ObjSet("spr_bottle_button_achievements", { drawoff_x: -35 });
            }
        });

        ObjSet("spr_interface_modalwindow_achievements_close",
        {
            cursor: "hand",
            popup: "Закрыть",
            event_mdown: function() {
                //ButtonDown("spr_interface_modalwindow_achievements_close");
            },
            event_mup: function() {
                //ButtonUp("spr_interface_modalwindow_achievements_close");
                HideModalWindow();
            },
            event_mleave: function() {
                //ButtonLeave("spr_interface_modalwindow_achievements_close");
            },
            event_menter: function() {
                //ButtonEnter("spr_interface_modalwindow_achievements_close");
            }
        });

        ObjSet("spr_bottle_button_buy_btn",
        {
            cursor: "hand",
            popup: "Купить сердечки",
            event_mdown: function() {
                //ButtonDown("spr_bottle_button_buy");
            },
            event_mup: function() {
                //ButtonUp("spr_bottle_button_buy");
                ShowModalWindow("spr_interface_modalwindow_buy");
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_button_buy");
                ObjSet("spr_bottle_button_buy", { drawoff_x: 0 });
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_button_buy");
                ObjSet("spr_bottle_button_buy", { drawoff_x: -42 });
            }
        });

        ObjSet("spr_interface_modalwindow_buy_close",
        {
            cursor: "hand",
            popup: "Закрыть",
            event_mdown: function() {
                //ButtonDown("spr_interface_modalwindow_buy_close");
            },
            event_mup: function() {
                //ButtonUp("spr_interface_modalwindow_buy_close");
                HideModalWindow();
            },
            event_mleave: function() {
                //ButtonLeave("spr_interface_modalwindow_buy_close");
            },
            event_menter: function() {
                //ButtonEnter("spr_interface_modalwindow_buy_close");
            }
        });

        ObjSet("spr_bottle_button_rating_btn",
        {
            cursor: "hand",
            popup: "Рейтинг игроков",
            event_mdown: function() {
                //ButtonDown("spr_bottle_button_rating");
            },
            event_mup: function() {
                //ButtonUp("spr_bottle_button_rating");
                ShowModalWindow("spr_interface_modalwindow_rating");
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_button_rating");
                ObjSet("spr_bottle_button_rating", { drawoff_x: 0 });
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_button_rating");
                ObjSet("spr_bottle_button_rating", { drawoff_x: -35 });
            }
        });

        ObjSet("spr_interface_modalwindow_rating_close",
        {
            cursor: "hand",
            popup: "Закрыть",
            event_mdown: function() {
                //ButtonDown("spr_interface_modalwindow_rating_close");
            },
            event_mup: function() {
                //ButtonUp("spr_interface_modalwindow_rating_close");
                HideModalWindow();
            },
            event_mleave: function() {
                //ButtonLeave("spr_interface_modalwindow_rating_close");
            },
            event_menter: function() {
                //ButtonEnter("spr_interface_modalwindow_rating_close");
            }
        });

        ObjSet("spr_bottle_button_sound_btn",
        {
            cursor: "hand",
            popup: "Управление звуками",
            event_mdown: function() {
                //ButtonDown("spr_bottle_button_sound");
            },
            event_mup: function() {
                //ButtonUp("spr_bottle_button_sound");
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_button_sound");
                ObjSet("spr_bottle_button_sound", { drawoff_x: 0 });
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_button_sound");
                ObjSet("spr_bottle_button_sound", { drawoff_x: -35 });
            }
        });

        ObjSet("spr_bottle_sending_send",
        {
            cursor: "hand",
            popup: "Отправить сообщение",
            event_mdown: function() {
                //ButtonDown("spr_bottle_sending_send");
            },
            event_mup: function() {
                SendMessage();
                //inputText.scrollTop =  inputText.scrollHeight;
                //ButtonUp("spr_bottle_sending_send");
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_sending_send");
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_sending_send");
            }
        });

        // Отпавить сообщение на Enter
        inputText.onkeydown = function (e) {
            if (e.keyCode == 13) {
                SendMessage();
            }
        };

        ObjSet("spr_bottle_sending_input",
        {
            popup: "Написать сообщение",
        });

        // Кнопка поцеловать
        ObjSet("spr_bottle_kiss_yes",
        {
            cursor: "hand",
            popup: "Поцеловать",
            event_mdown: function() {
                //ButtonDown("spr_bottle_kiss_yes");
            },
            event_mup: function() {
                //ButtonUp("spr_bottle_kiss_yes");
                ObjSet("spr_bottle_kiss_yes", {input: 0});
                ObjSet("spr_bottle_kiss_no", {input: 0});
                SendMessage('Согласился поцеловать');
                socket.send(JSON.stringify({
                    kiss_offer: 1
                }));
                ObjSet("spr_bottle_kiss_left_yes", {alp: 1});
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_kiss_yes");
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_kiss_yes");
            }
        });

        // Кнопка отказать
        ObjSet("spr_bottle_kiss_no",
        {
            cursor: "hand",
            popup: "Поцеловать",
            event_mdown: function() {
                //ButtonDown("spr_bottle_kiss_no");
            },
            event_mup: function() {
                //ButtonUp("spr_bottle_kiss_no");
                ObjSet("spr_bottle_kiss_yes", {input: 0});
                ObjSet("spr_bottle_kiss_no", {input: 0});
                SendMessage('Отказался поцеловать');
                socket.send( JSON.stringify({kiss_offer: 0}) );
            },
            event_mleave: function() {
                //ButtonLeave("spr_bottle_kiss_no");
            },
            event_menter: function() {
                //ButtonEnter("spr_bottle_kiss_no");
            }
        });

    /* *************** Позиции *************** */
    // Настройки слотов
    var slotPositions = [
        { defPos: [375,  40], angle: 18 },  // 1
        { defPos: [469,  74], angle: 41  },  // 2
        { defPos: [565, 208], angle: 77  },  // 3
        { defPos: [560, 347], angle: 110 }, // 4
        { defPos: [467, 442], angle: 135 }, // 5
        { defPos: [374, 473], angle: 165 }, // 6
        { defPos: [272, 470], angle: 200 }, // 7
        { defPos: [181, 431], angle: 224 }, // 8
        { defPos: [93,  343], angle: 262 }, // 9
        { defPos: [96,  195], angle: 297 }, // 10
        { defPos: [188,  67], angle: 322 }, // 11
        { defPos: [278,  38], angle: 350 }  // 12
    ];

    // Настройки стрелки
    var arrowSettings = [
        { posXY: [336, 177], angle: -69  }, // 1
        { posXY: [372, 184], angle: -27  }, // 2
        { posXY: [417, 253], angle: -6   }, // 3
        { posXY: [418, 355], angle: 0    }, // 4
        { posXY: [375, 356], angle: 42   }, // 5
        { posXY: [344, 357], angle: 77   }, // 6
        { posXY: [252, 357], angle: 77   }, // 7
        { posXY: [252, 357], angle: 134  }, // 8
        { posXY: [225, 320], angle: 162  }, // 9
        { posXY: [225, 224], angle: 182  }, // 10
        { posXY: [224, 202], angle: 234  }, // 11
        { posXY: [328, 180], angle: 234  }  // 12
    ];

    }, function() {
        // API initialization failed
        console.log('Ошибка инициализации');
    }, '5.42');
};