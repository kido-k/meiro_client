

const EXECUTION_INTERVAL = 50;
const CANVAS_SIZE = 200;
const THRESHHOLD = 150;
const PLAYSER_SIZE_HOSEI = 1;
const CHECK_DISTANCE = 3;
const MAGNIFICATION = 3;
const CANVAS_SMALL_LIMIT = CANVAS_SIZE / 100 * 2
const CAMERA_MOVE_UNIT = 5;
const BORD_ROTE_UNIT = 1;
const PLAYER_MOVE_UNIT = 5;
const PLAYER_SPEED = 1;

var image;
// var player = {};
var map = [];
// var size = 0;
var position = {};
var start = [];
var end = [];
var players = [];
var wall_width = 0;
var camera_position = { x: 0, y: 150, z: 0 }
var camera_rotation = { x: -90, y: 0, z: 0 }
var light_position = { x: 100, y: 300, z: 100 }
var bord_position = { x: -100, y: 0, z: -100 }
var bord_rotation = { x: 360, y: 0, z: 0 }

var player_pass = [];
var player_num = 0;
const player_start_position = {  x: -95, y: 15, z: -85  };
var player_size = 3;
var parts_depth = 5;
var first_play = true;
const goal = { x: CANVAS_SIZE * 0.99 }
var socket;

$(function () {
    var finish = false;
    var auto = false;
    var display = true;

    connectSocket();

    dragFile();

    console.log('gamestart');

    $('#load').on('click', function () {
        setInitial();
        finish = false;
        auto = false;
        display = true;
        createMeiro();
        createPlayer();
        $('#show').click();
    });

    $('#show').on('click', function () {
        display = displayBtn(display);
        if (display) {
            $('#show').html('非表示');
        } else {
            $('#show').html('表示');
        }
    });

    $('.move').on('click', function () {
        const btn = this.id;
        $('#msg').html('　');
        player = movePlayer_btn(map, player, btn);
        displayLoad(CANVAS_SIZE, map, player);
        judgeGoal(player);
    });

    $('.a_move').on('click', function () {
        const btn = this.id;
        player = moveCamera_btn(btn);
    });

    $('.b_move').on('click', function () {
        const btn = this.id;
        roteBord(btn);
    });

    socket.on('bord_control', function (btn) {
        console.log(btn);
        roteBord(btn);
    });

    $('html').keyup(function (e) {
        const key = e.which;
        if (key === 37 || key === 38 || key === 39 || key === 40) {
            $('#msg').html('　');
            player = movePlayer_key(map, player, key);
            displayLoad(CANVAS_SIZE, map, player);
            judgeGoal(player);
        }
    });

    // $('#create').on('click', function () {
    //     createPlayer();
    // });

    $('#step').on('click', function () {
        moveAframePlayer();
    });

    $('#auto').on('click', function () {
        auto = true;
        searchGoal();
    });

    $('#download').on('click', function () {
        if (map.length !== 0) {
            downloadCsv(map);
        }
    });

    function searchGoal() {
        if (!finish) {
            moveAframePlayer();
            finish = judgeGoal();
        }
        if (auto) {
            setTimeout(function () { searchGoal() }, EXECUTION_INTERVAL);
        }
    }

    function judgeGoal() {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (player.x === goal.x) {
                console.log('GameClear');
                // displayLoadtoGoal(player, size, map);    
                return true;
            }
        };
        return false;
    }
});

function connectSocket() {
    socket = io.connect('http://localhost:8080');
    socket.emit('connected', 'board_connected');
    socket.on('connect_return', function (msg) {
        console.log(msg);
    });
}


function createPlayer() {
    var id = 'player' + 0;
    var x = player_start_position.x;
    var y = player_start_position.y;
    var z = player_start_position.z;
    player_size = 3;
    var pass_idx = 999;
    var direction = '';
    var distance = 0;
    var root = [];
    // var player = players[0];
    var player = new Player(id, x, y, player_size, pass_idx, direction, distance, root);
    players.push(player);
    // addSvgRectElement(id, x, y, size, size, 'yellow');
    addAframeElement(id, x, y, z, player_size, '#C0C0C0');
    // $("#player0").velocity.set(0, 0, -4);
}



function moveAframePlayer() {
    if (first_play) {
        var player = players[0];
        for (var i = 0; i < player_pass.length; i++) {
            var pass = player_pass[i];
            if (player.y === pass.y && pass.x <= player.x && (pass.x + pass.width) >= player.x) {
                if (pass.width >= pass.height) {
                    player.direction = 'east';
                    player.x += PLAYER_SPEED;
                    player.pass_idx = i;
                    break;
                } else {
                    player.direction = 'south';
                    player.y -= PLAYER_SPEED;
                    player.pass_idx = i;
                    break;
                }
            }
        }
        $('#a_' + player.id).attr('position', player.x + ' ' + 2 + ' ' + player.y);
        first_play = false;
    } else {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            for (var j = 0; j < player_pass.length; j++) {
                var pass = player_pass[j];
                if (player.pass_idx === j) {
                    switch (player.direction) {
                        case 'north':
                            if (player.y >= pass.y) {
                                player.y -= PLAYER_SPEED;
                            } else {
                                $('#a_' + player.id).remove();
                            }
                            break;
                        case 'east':
                            if (player.x <= (pass.x + pass.width)) {
                                player.x += PLAYER_SPEED;
                            } else {
                                $('#a_' + player.id).remove();
                            }
                            break;
                        case 'south':
                            if (player.y <= (pass.y + pass.height)) {
                                player.y += PLAYER_SPEED;
                            } else {
                                $('#a_' + player.id).remove();
                            }
                            break;
                        case 'west':
                            if (player.x >= pass.x) {
                                player.x -= PLAYER_SPEED;
                            } else {
                                $('#a_' + player.id).remove();
                            }
                            break;
                        default:
                            console.log('error btn= ' + player);
                    }
                }
                $('#a_' + player.id).attr('position', player.x + ' ' + 2 + ' ' + player.y);

                if (player.pass_idx !== j && player.y === pass.y
                    && player.x >= pass.x && player.x <= (pass.x + pass.width)
                    && (player.direction === 'north' || player.direction === 'south')) {
                    var left_dif = player.x - pass.x;
                    var right_dif = pass.x + pass.width - player.x;
                    if (left_dif > right_dif) {
                        player_num += 1;
                        var player_id = 'player' + player_num;
                        var new_player = new Player(player_id, player.x - PLAYER_SPEED, player.y, player_size, j, "west", pass.width, "");
                        players.push(new_player);
                        // addSvgRectElement(new_player.id, new_player.x, new_player.y, new_player.size, new_player.size, 'yellow');
                        addAframeElement(new_player.id, new_player.x, new_player.y, player_size, '#C0C0C0');
                    } else if (left_dif < right_dif) {
                        player_num += 1;
                        var player_id = 'player' + player_num;
                        var new_player = new Player(player_id, player.x + PLAYER_SPEED, player.y, player_size, j, "east", pass.width, "");
                        players.push(new_player);
                        // addSvgRectElement(new_player.id, new_player.x, new_player.y, new_player.size, new_player.size, 'yellow');
                        addAframeElement(new_player.id, new_player.x, new_player.y, player_size, '#C0C0C0');
                    }
                }
                if (player.pass_idx !== j && player.x === player_pass[j].x
                    && player.y >= pass.y && player.y <= (pass.y + pass.height)
                    && (player.direction === 'west' || player.direction === 'east')) {
                    var up_dif = player.y - pass.y;
                    var down_dif = player.y - (pass.y + pass.height);
                    if (up_dif > 0) {
                        player_num += 1;
                        var player_id = 'player' + player_num;
                        var new_player = new Player(player_id, player.x, player.y - PLAYER_SPEED, player_size, j, "north", pass.height, "");
                        players.push(new_player);
                        // addSvgRectElement(new_player.id, new_player.x, new_player.y, new_player.size, new_player.size, 'yellow');
                        addAframeElement(new_player.id, new_player.x, new_player.y, player_size, '#C0C0C0');
                    }
                    if (down_dif < 0) {
                        player_num += 1;
                        var player_id = 'player' + player_num;
                        var new_player = new Player(player_id, player.x, player.y + PLAYER_SPEED, player_size, j, "south", pass.height, "");
                        players.push(new_player);
                        // addSvgRectElement(new_player.id, new_player.x, new_player.y, new_player.size, new_player.size, 'yellow');
                        addAframeElement(new_player.id, new_player.x, new_player.y, player.size, '#C0C0C0');
                    }
                }
            }
        }
    }
}

function addSvgRectElement(id, x, y, width, height, color) {
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("id", "s_" + id);
    rect.setAttribute("x", x * MAGNIFICATION);
    rect.setAttribute("y", y * MAGNIFICATION);
    rect.setAttribute("width", width * MAGNIFICATION);
    rect.setAttribute("height", height * MAGNIFICATION);
    rect.setAttribute("fill", color);
    $('#svg_meiro').append(rect);
}

function addAframeElement(id, x, y, z, radius, color) {
    var str = '<a-entity id=a_' + id + ' ';
    str += 'dynamic-body="mass:100000;linearDamping: 0.01;angularDamping: 0.0001;"';
    str += 'geometry="primitive:sphere; radius:' + radius + ';"';
    str += 'material="color:' + color + ';"';
    str += 'position="' + x + ' ' + y + ' ' + z + '"';
    str += '></a-entity>';
    str += '<a-obj-model static-body id="dragon" position="0 30 0" src="img/BlueEyes/BlueEyes.obj" mtl="img/BlueEyes/BlueEyes.mtl"></a-obj-model>';
    $('#a_meiro').append(str);
    run();
}

function moveCamera_btn(btn) {
    switch (btn) {
        case 'a_up':
            camera_position.z -= CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_left':
            camera_position.x -= CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_right':
            camera_position.x += CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_down':
            camera_position.z += CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_zmin':
            camera_position.y -= CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_zmout':
            camera_position.y += CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_drote':
            camera_rotation.x -= CAMERA_MOVE_UNIT;
            $('#a_camera').attr('rotation', camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z);
            break;
        case 'a_urote':
            camera_rotation.x += CAMERA_MOVE_UNIT;
            $('#a_camera').attr('rotation', camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z);
            break;
        case 'a_rrote':
            camera_rotation.y -= CAMERA_MOVE_UNIT;
            $('#a_camera').attr('rotation', camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z);
            break;
        case 'a_lrote':
            camera_rotation.y += CAMERA_MOVE_UNIT;
            $('#a_camera').attr('rotation', camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z);
            break;
        default:
            console.log('error btn= ' + btn);
    }
};

function roteBord(btn) {
    switch (btn) {
        case 'b_up':
            bord_rotation.x -= BORD_ROTE_UNIT;
            break;
        case 'b_left':
            bord_rotation.z += BORD_ROTE_UNIT;
            break;
        case 'b_right':
            bord_rotation.z -= BORD_ROTE_UNIT;
            break;
        case 'b_down':
            bord_rotation.x += BORD_ROTE_UNIT;
            break;
        case 'b_minus':
            bord_rotation.y -= BORD_ROTE_UNIT;
            break;
        case 'b_plus':
            bord_rotation.y += BORD_ROTE_UNIT;
            break;
        default:
            console.log('error btn= ' + btn);
    }
    $('#a_board').attr('rotation', bord_rotation.x + ' ' + bord_rotation.y + ' ' + bord_rotation.z);
};

function setInitial() {
    start = [];
    end = [];
    player = {};
    players = [];

    var cv = document.createElement('canvas');
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    $('#st_msg').css({ display: 'inline' });
    $('#show').css({ display: 'inline' });
    $('#vr_meiro').empty();
}

function displayBtn(display) {
    if (display) {
        $('#drop').css({ display: 'none' });
        return false;
    } else {
        $('#drop').css({ display: 'flex' });
        return true;
    }
}

function showBtn() {
    $('#btn').css({ display: 'inline-block' });
    $('#btn_auto').css({ display: 'inline-block' });
}

function shuffleList(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
    return array;
};


function dragFile() {
    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    function handleFileSelect(evt) {
        var img;

        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';

        files = evt.dataTransfer.files; // FileList object.
        // console.log(files);
        var file = files[0];
        var reader = new FileReader();
        //dataURL形式でファイルを読み込む
        reader.readAsDataURL(file);
        //ファイルの読込が終了した時の処理
        reader.onload = function () {
            // readImage(reader);
            var result_DataURL = reader.result;
            pre_userimage_url = reader.result;
            img = new Image();
            img.onload = function () {
                /*読み込み終了後ここで画像を加工して表示する*/
            }
            //読み込んだ画像ソースを入れる
            img.src = reader.result;

            $('#drop_image').attr('src', result_DataURL);
            $("#drop_image").css({ display: 'inline' });
            $("#drop_msg").css({ display: 'none' });
            $("#drop_zone").css({ border: '2px dashed #ff8952' });
        }
    }
}

function readImage(reader) {
    //ファイル読み取り後の処理
    var result_DataURL = reader.result;
    //読み込んだ画像とdataURLを書き出す
    // var img = document.getElementById('drop_image');
    $('#drop_image').attr('src', result_DataURL);
    $("#drop_image").css({ display: 'inline' });
    $("#drop_msg").css({ display: 'none' });
    $("#drop_zone").css({ border: '2px dashed #ff8952' });
    $("#icon_image").css({ display: 'inline' });
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function createMeiro() {
    var data = createImageData(document.getElementById('drop_image'));
    document.getElementById('test_canvas').getContext('2d').putImageData(data, 0, 0);
    processImageData(data);
}

function createImageData(img) {
    var cv = document.createElement('canvas');
    var ct = cv.getContext('2d');

    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    // cv.width = CANVAS_SIZE;
    // cv.height = CANVAS_SIZE;

    ct.drawImage(img, 0, 0, cv.width, cv.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    var data = ct.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // console.log(data.data);
    image = data;
    return data;
}

function processImageData() {
    var width = CANVAS_SIZE;
    var height = CANVAS_SIZE;

    var canvas = document.getElementById("test_canvas");

    if (canvas.getContext) {
        // コンテキストの取得
        var ctx = canvas.getContext("2d");
        var red = [];
        var img_data = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (var y = 0; y < height; y++) {
            var red_x = [];
            var val = 0;
            for (var x = 0; x < width; x++) {
                var index = (y * CANVAS_SIZE * 4) + x * 4;
                if (img_data.data[index] > THRESHHOLD) {
                    val = 1;
                } else {
                    val = 0;
                }
                red_x.push(val);
            }
            red.push(red_x);
        }
        map = red;
        var parts_list = makePartsList(red);
        displaySVG(parts_list);
        displayAFRAME(parts_list);

        // console.log(map);
        // size = map.length;
        // displayLoad(size, map, player)
    }
    $('#btn').css({ display: 'inline' });
}

function makePartsList(map) {
    var x_cnt = 0;
    // var y_cnt = 0;
    var parts = { x: 0, y: 0, width: 1, height: 0, type: '' }
    const parts_list = [];

    // console.log(map);
    for (var y = 0; y < map.length; y++) {
        parts = { x: 0, y: y, width: 1, height: 1, type: '' }
        const map_x = map[y];
        for (var x = 0; x < map_x.length; x++) {
            if (x === 0) {
                x_cnt += 1;
                parts.x = 0;
                if (map_x[x] === 1) {
                    parts.type = 'pass';
                } else {
                    parts.type = 'wall';
                }
            } else {
                if (x === map_x.length - 1) {
                    if (parts.type === '') {
                        if (map_x[x] === 1) {
                            parts.type = 'pass';
                        } else {
                            parts.type = 'wall';
                        }
                    }
                    x_cnt += 1;
                    parts.width = x_cnt;
                    parts_list.push(parts);
                    x_cnt = 0;
                } else {
                    if (map_x[x] === map_x[x - 1]) {
                        x_cnt += 1;
                    } else {
                        parts.width = x_cnt;
                        parts_list.push(parts);

                        // x_cnt += 1;

                        x_cnt = 0;
                        parts = { x: x, y: y, width: 1, height: 1, type: '' };
                        if (map_x[x] === 1) {
                            parts.type = 'pass';
                        } else {
                            parts.type = 'wall';
                        }
                    }
                }
            }
            // parts_list.push(parts);
        }
    }

    // console.log(parts_list);
    // return parts_list;

    //キャラの通り道を作成

    const pass_list = [];

    for (var i = 0; i < parts_list.length; i++) {
        var parts = parts_list[i];
        if (parts.type === 'pass') {
            pass_list.push(parts);
        }
    }

    pass_list.sort(function (a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });

    for (var i = 0; i < pass_list.length - 1; i++) {
        var pass1 = pass_list[i];
        var pass2 = pass_list[i + 1];
        var pass_y_dif = pass2.y - pass1.y;
        var pass_w_dif = Math.abs(pass2.width - pass1.width);

        if (pass_y_dif === pass1.height && pass_w_dif <= 2) {
            pass_list[i].height += 1;
            pass_list.splice(i + 1, 1);
            i = i - 1;
        }
    }

    pass_list.sort(function (a, b) {
        if ((a.x + a.width) < (b.x + b.width)) return 1;
        if ((a.x + a.width) > (b.x + b.width)) return -1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });

    for (var i = 0; i < pass_list.length - 1; i++) {
        var pass1 = pass_list[i];
        var pass2 = pass_list[i + 1];
        var pass1_area = pass1.width * pass1.height;
        var pass_y_dif = pass2.y - pass1.y;
        var pass_h_dif = pass1.height - pass2.height;
        var pass_w_dif = Math.abs(pass1.width - pass2.width);
        if (pass_y_dif === pass1.height && pass_w_dif <= 2) {
            if (pass_w_dif !== 0 && pass1.width >= 0) {
                pass_list[i].width = pass1.width;
            } else {
                pass_list[i].width = pass2.width;
            }
            pass_list[i].height += pass2.height;
            pass_list.splice(i + 1, 1);
            i = i - 1;
        }
        if (pass1_area <= CANVAS_SMALL_LIMIT) {
            pass_list.splice(i, 1);
            i = i - 1;
        }
    }

    var avg = calcurateAverageThickness(pass_list);

    for (var i = 0; i < pass_list.length; i++) {
        var pass = pass_list[i];
        if (pass.width > pass.height) {
            pass.y = Math.ceil(pass.y + pass.height / 2);
            pass.height = 1;
        } else {
            pass.x = Math.ceil(pass.x + pass.width / 2);
            pass.width = 1;
            pass.y = Math.ceil(pass.y - (avg / 2));
            pass.height = Math.ceil(pass.height + avg * 1.8);
        }
    }

    pass_list.sort(function (a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });

    for (var i = 0; i < pass_list.length - 1; i++) {
        var pass1 = pass_list[i];
        var pass2 = pass_list[i + 1];
        if (pass1.x === pass2.x && pass1.width === 1 && pass2.width === 1
            && pass1.y <= pass2.y && pass2.y <= (pass1.y + pass1.height)) {
            pass1.height = pass2.y + pass2.height - pass1.y;
            pass_list.splice(i + 1, 1);
            i = i - 1;
        }
    }

    // pass_list.sort(function (a, b) {
    //     if (a.y < b.y) return -1;
    //     if (a.y > b.y) return 1;
    //     if (a.x < b.x) return -1;
    //     if (a.x > b.x) return 1;
    //     return 0;
    // });


    // for (var i = 0; i < pass_list.length - 1; i++) {
    //     var pass1 = pass_list[i];
    //     var pass2 = pass_list[i + 1];
    //     if (pass1.height === 1 && pass1.x <= pass2.x && pass2.x <= (pass1.x + pass1.width)) {
    //         pass1.x = pass2.x + pass2.width;
    //         pass_list.splice(i + 1, 1);
    //         i = i - 1;
    //     }
    // }

    // console.log(pass_list);

    player_pass = pass_list;

    // return pass_list;

    // 壁のみでテスト------------------------------
    const wall_list = [];

    for (var i = 0; i < parts_list.length; i++) {
        var parts = parts_list[i];
        if (parts.type === 'wall') {
            wall_list.push(parts);
        }
    }

    wall_list.sort(function (a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });

    for (var i = 0; i < wall_list.length - 1; i++) {
        var wall1 = wall_list[i];
        var wall2 = wall_list[i + 1];
        var wall_x_dif = wall1.x - wall2.x;
        var wall_y_dif = wall2.y - wall1.y;
        var wall_w_dif = Math.abs(wall2.width - wall1.width);

        if (wall_y_dif === wall1.height && wall_w_dif <= 2) {
            if (wall_w_dif < 0) {
                wall1.width = wall2.width;
            }
            wall_list[i].height += 1;
            wall_list.splice(i + 1, 1);
            i = i - 1;
        }
    }

    wall_list.sort(function (a, b) {
        if ((a.x + a.width) < (b.x + b.width)) return 1;
        if ((a.x + a.width) > (b.x + b.width)) return -1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });


    for (var i = 0; i < wall_list.length - 1; i++) {
        var wall1 = wall_list[i];
        var wall2 = wall_list[i + 1];
        var wall1_area = wall1.width * wall1.height;
        var wall_y_dif = wall2.y - wall1.y;
        var wall_h_dif = wall1.height - wall2.height;
        var wall_w_dif = Math.abs(wall1.width - wall2.width);
        if (wall_y_dif === wall1.height && wall_w_dif <= 2) {
            if (wall_w_dif !== 0 && wall1.width >= 0) {
                wall_list[i].width = wall1.width;
            } else {
                wall_list[i].width = wall2.width;
            }
            wall_list[i].height += wall2.height;
            wall_list.splice(i + 1, 1);
            i = i - 1;
        }
        if (wall1_area <= CANVAS_SMALL_LIMIT) {
            wall_list.splice(i, 1);
            i = i - 1;
        }
    }

    // console.log(wall_list);
    for (var i = 0; i < pass_list.length; i++) {
        wall_list.push(pass_list[i]);
    }
    // wall_list.push(parts_list);

    // ------------------------------    
    return wall_list;
}

function calcurateAverageThickness(list) {
    var sum = 0;
    for (var i = 0; i < list.length - 1; i++) {
        if (list[i].width <= list[i].height) {
            sum += list[i].width;
        } else {
            sum += list[i].height;
        }
    };

    var avg = Math.ceil(sum / list.length);
    return avg;
}

function displaySVG(parts_list) {
    $('#new_meiro').empty();
    var str = "";
    str += '<svg id="svg_meiro" width=' + CANVAS_SIZE * MAGNIFICATION + ' height=' + CANVAS_SIZE * MAGNIFICATION + ' viewBox="0 0 ' + CANVAS_SIZE * MAGNIFICATION + ' ' + CANVAS_SIZE * MAGNIFICATION + '">';

    for (var i = 0; i < parts_list.length; i++) {
        var parts = parts_list[i];
        if (parts.type !== 'pass') {
            str += '<rect x=' + parts.x * MAGNIFICATION + ' y=' + parts.y * MAGNIFICATION + ' width=' + parts.width * MAGNIFICATION + ' height=' + parts.height * MAGNIFICATION + ' fill="blue"></rect>';
        } else {
            str += '<rect x=' + parts.x * MAGNIFICATION + ' y=' + parts.y * MAGNIFICATION + ' width=' + parts.width * MAGNIFICATION + ' height=' + parts.height * MAGNIFICATION + ' fill="orange"></rect>';
        }
    }
    str += '</svg>';
    $('#new_meiro').append(str);
}

function displayAFRAME(parts_list) {
    $('#vr_meiro').empty();
    var str = "";
    str += '<a-scene id="a_meiro" embedded physics="debug: true;friction: 0.1;gravity:-19.6; restitution: 0.01">';
    str += '<a-entity light="color: #FFF; intensity: 1.5" position="' + light_position.x + ' ' + light_position.y + ' ' + light_position.z + '"></a-entity>';
    str += '<a-entity id="a_camera" position="' + camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z + '" rotation="' + camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z + '">';
    str += '<a-camera><a-cursor></a-cursor></a-camera>';
    str += '</a-entity>';
    str += '<a-entity id="a_board" rotation="' + bord_rotation.x + ' ' + bord_rotation.y + ' ' + bord_rotation.z + '">';
    // str += '<a-entity id="a_all">';
    str += '<a-sky color="#DDDDDD"></a-sky>';
    str += '<a-entity id="a_board" position="' + bord_position.x + ' ' + bord_position.y + ' ' + bord_position.z + ' ' + '" rotation="' + bord_rotation.x + ' ' + bord_rotation.y + ' ' + bord_rotation.z + '">';
    // str += '<a-box static-body width= ' + CANVAS_SIZE + ' height= ' + CANVAS_SIZE + ' depth= 1' + ' position="' + (CANVAS_SIZE / 2) + ' ' + (CANVAS_SIZE / 2) * -1 +  ' ' + '-0.5' + ' color="white" transparent="true" opacity=1></a-box>';
    str += '<a-box static-body width= ' + CANVAS_SIZE + ' height=10 ' + 'depth=' + CANVAS_SIZE + ' position="' + (CANVAS_SIZE / 2) + ' -5 ' + (CANVAS_SIZE / 2) + ' color="white" ></a-box>';
    for (var i = 0; i < parts_list.length; i++) {
        var parts = parts_list[i];
        if (parts.type === 'wall') {
            // str += '<a-box static-body id="box' + i + '" cursor-listener width= ' + parts.width + ' height=' + parts.height + ' depth=' + parts_depth + ' ' + ' position="' + (parts.x + parts.width / 2) + ' ' + (parts.y + parts.height / 2) * -1 + ' ' + (parts_depth / 2) + '" color="blue"></a-box>';
            str += '<a-box static-body id="box' + i + '" cursor-listener width= ' + parts.width + ' height="8"' + ' depth=' + parts.height + ' position="' + (parts.x + parts.width / 2) + ' 2 ' + (parts.y + parts.height / 2) + '" color="#1B1B1B"></a-box>';
        }
    }
    // str += '</a-entity>'
    str += '</a-entity>'
    str += '</a-scene>';
    $('#vr_meiro').append(str);
}

function getdoubleDigestNumer(number) {
    return ("0" + number).slice(-2);
};

function createPositionId(pos_row, pos_clm) {
    pos_row = getdoubleDigestNumer(pos_row);
    pos_clm = getdoubleDigestNumer(pos_clm);
    var pos = String(pos_row) + String(pos_clm);
    return pos;
};


function startVideo() {
    Promise.resolve()
        .then(function () {
            return navigator.mediaDevices.enumerateDevices();
        })
        .then(function (mediaDeviceInfoList) {
            console.log('使える入出力デバイスs->', mediaDeviceInfoList);

            var videoDevices = mediaDeviceInfoList.filter(function (deviceInfo) {
                return deviceInfo.kind == 'videoinput';
            });
            if (videoDevices.length < 1) {
                throw new Error('error');
            }

            return navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    deviceId: videoDevices[1].deviceId
                }
            });
        })
        .then(function (mediaStream) {
            console.log('MediaStream->', mediaStream);
            videoStreamInUse = mediaStream;
            document.querySelector('video').src = window.URL.createObjectURL(mediaStream);
            // 対応していればこっちの方が良い
            // document.querySelector('video').srcObject = mediaStream;
        })
        .catch(function (error) {
            console.error('error', error);
        });
}

function stopVideo() {
    videoStreamInUse.getVideoTracks()[0].stop();
    if (videoStreamInUse.active) {
        console.error('error', videoStreamInUse);
    } else {
        // console.log('停止できたよ！', videoStreamInUse);
    }
}

function snapshot() {
    //videoタグ取得
    var videocnt = $("#camera_zone");
    //canvas取得
    var canvas = $("#canvas")[0];
    canvas.width = videocnt.width();
    canvas.height = videocnt.height();
    var cnt2d = $("#canvas")[0].getContext('2d');
    //canvasに書き込み
    // cnt2d.drawImage(videocnt[0], 0, 0);
    cnt2d.drawImage(videocnt[0], 0, 0, 800, 800, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (canvas.getContext) {
        // コンテキストの取得
        // var ctx = canvas.getContext("2d");
        var red = [];
        var img_data = cnt2d.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (var y = 0; y < 100; y++) {
            var red_x = [];
            for (var x = 0; x < 100; x++) {
                var index = (y * CANVAS_SIZE * 4) + x * 4;
                red_x.push(img_data.data[index]);
            }
            red.push(red_x);
        }
    }
    // size = CANVAS_SIZE;
    map = red;
    console.log(map);
    // displayLoad(size, map, player);
}


var downloadCsv = (function () {

    var tableToCsvString = function (table) {
        var str = '\uFEFF';
        for (var i = 0, imax = table.length - 1; i <= imax; ++i) {
            var row = table[i];
            for (var j = 0, jmax = row.length - 1; j <= jmax; ++j) {
                str += row[j];
                if (j !== jmax) {
                    str += ',';
                }
            }
            str += '\n';
        }
        return str;
    };

    var createDataUriFromString = function (str) {
        return 'data:text/csv,' + encodeURIComponent(str);
    }

    var downloadDataUri = function (uri, filename) {
        var link = document.createElement('a');
        link.download = filename;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return function (table, filename) {
        if (!filename) {
            filename = 'output.csv';
        }
        var uri = createDataUriFromString(tableToCsvString(table));
        downloadDataUri(uri, filename);
    };

})();

class Player {
    constructor(id, x, y, size, pass_idx, direction, distance, root) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.pass_idx = pass_idx;
        this.direction = direction;
        this.distance = distance;
        this.root = root;
    }
    set id(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }
    set y(y) {
        this._y = y;
    }
    get y() {
        return this._y;
    }
    set size(size) {
        this._size = size;
    }
    get size() {
        return this._size;
    }
    set direction(direction) {
        this._direction = direction;
    }
    get direction() {
        return this._direction;
    }
    set distance(distance) {
        this._distance = distance;
    }
    get distance() {
        return this._distance;
    }
    set pass_idx(pass_idx) {
        this._pass_idx = pass_idx;
    }
    get pass_idx() {
        return this._pass_idx;
    }
    set root(root) {
        this._root = root;
    }
    get root() {
        return this._root;
    }
}

function run() {
    if (document.getElementById("dragon").object3D.children[0]) {
        document.getElementById("dragon").object3D.children[0].children[0].material[1].transparent = true;
    } else {
        setTimeout(run, 500);
    }
}