

const EXECUTION_INTERVAL = 10;
const CANVAS_SIZE = 80;
const THRESHHOLD = 100;
const PLAYSER_SIZE_HOSEI = 1;
const CHECK_DISTANCE = 3;

var image;
var player = {};
var map = [];
var size = 0;
var position = {};
var start = [];
var end = [];
var player_size = 0;

$(function () {
    var players = [];
    var finish = false;
    var auto = false;
    var display = true;
    var start_flg = false;
    var end_flg = false;
    var rows = [];
    var clms = [];

    dragFile();

    console.log('gamestart');

    $('#load').on('click', function () {
        setInitial();
        display = true;
        start_flg = false;
        end_flg = false;
        finish = false;
        auto = false;
        createMeiro();
        $('#show').click();
        $('#msg').html('スタートを指定してください');
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

    $('html').keyup(function (e) {
        const key = e.which;
        if (key === 37 || key === 38 || key === 39 || key === 40) {
            $('#msg').html('　');
            player = movePlayer_key(map, player, key);
            displayLoad(CANVAS_SIZE, map, player);
            judgeGoal(player);
        }
    });

    $(document).on('click', '.p', function () {
        if (!start_flg) {
            if (window.confirm('スタートはここでいいですか？')) {
                start = setStartEnd(this.id);
            }
            if (start.length > 0) {
                start_flg = true;
                $('#msg').html('ゴールを指定してください');
            }
        } else if (!end_flg) {
            if (window.confirm('ゴールはここでいいですか？')) {
                end = setStartEnd(this.id);
            }
            if (end.length > 0) {
                end_flg = true;
                $('#msg').html('ゲームを開始！！');
                // player = { row: 7, clm: 1 };
                player = setPlayer();
                players.push(player);
                goal = setGoal();
            }
        }
        displayLoad(CANVAS_SIZE, map, player);
    });

    $('#step').on('click', function () {
        if (!finish) {
            var new_players = createAvatar();
            finish = displayLoad_bunshin(CANVAS_SIZE, map, new_players);
            for (var i = 0; i < new_players.length; i++) {
                var new_player = new_players[i];
                finish = judgeGoal(new_player);
            }
        }
    });

    $('#auto').on('click', function () {
        auto = true;
        if (auto) {
            searchGoal();
        }
    });

    function searchGoal() {
        if (!finish) {
            var new_players = createAvatar();
            finish = displayLoad_bunshin(CANVAS_SIZE, map, new_players);
            for (var i = 0; i < new_players.length; i++) {
                var new_player = new_players[i];
                finish = judgeGoal(new_player);
            }
        }
        if (auto) {
            setTimeout(function () { searchGoal() }, EXECUTION_INTERVAL);
        }
    }

    function createAvatar() {
        const new_players = [];
        for (var i = 0; i < players.length; i++) {
            const player = players[i];
            const movelist = checkDirection(map, player, player.pre_move)
            for (var n = 0; n < movelist.length; n++) {
                var new_player = { ...player };
                move = movelist[n];
                new_player = movePlayer(map, new_player, move);
                rows.push(new_player.row);
                clms.push(new_player.clm);
                new_players.push(new_player);
            };
        }
        players = new_players;
        return new_players;
    }

});

function setPlayer() {
    var pos = { row: 0, clm: 0, pre_move: "" };
    pos.row = Number(start[0].substr(0, 2));
    pos.clm = Number(start[0].substr(2, 2));

    for (var i = 1; i < start.length; i++) {
        var row = Number(start[i].substr(0, 2));
        var clm = Number(start[i].substr(2, 2));
        if (pos.row > row) {
            pos.row = row;
        }
        if (pos.clm > clm) {
            pos.clm = clm;
        }
    }
    return pos;
}

function setGoal() {
    var pos = { row: 0, clm: 0 };
    pos.row = Number(end[0].substr(0, 2));
    pos.clm = Number(end[0].substr(2, 2));

    for (var i = 1; i < end.length; i++) {
        var row = Number(end[i].substr(0, 2));
        var clm = Number(end[i].substr(2, 2));
        if (pos.row > row) {
            pos.row = row;
        }
        if (pos.clm > clm) {
            pos.clm = clm;
        }
    }
    return pos;
}

function setInitial() {
    start = [];
    end = [];
    player = {};
    var cv = document.createElement('canvas');
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    $('#st_msg').css({ display: 'inline' });
    $('#show').css({ display: 'inline' });
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

function judgeGoal(player) {
    if (player.row === goal.row && player.clm === goal.clm) {
        console.log('GameClear');
        console.log(player);
        // displayLoadtoGoal(player, size, map);
        return true;
    };
    return false;
}

function checkDirection(map, player, pre_move) {
    const movelist = [];
    switch (pre_move) {
        case 'up':
            if (map[player.row - 1][player.clm] > THRESHHOLD
                && map[player.row - 1][player.clm + player_size] > THRESHHOLD) {
                movelist.push('up');
            }
            if (map[player.row][player.clm - 1] > THRESHHOLD
                && map[player.row][player.clm - CHECK_DISTANCE] > THRESHHOLD
                && map[player.row + player_size][player.clm - 1] > THRESHHOLD
                && map[player.row + player_size][player.clm - CHECK_DISTANCE] > THRESHHOLD
                && (map[player.row + player_size + 1][player.clm - 1] < THRESHHOLD
                    || map[player.row + player_size + 1][player.clm - CHECK_DISTANCE] < THRESHHOLD)
            ) {
                movelist.push('left');
            }
            if (map[player.row][player.clm + player_size + 1] > THRESHHOLD
                && map[player.row][player.clm + player_size + CHECK_DISTANCE] > THRESHHOLD
                && map[player.row + player_size][player.clm + player_size + 1] > THRESHHOLD
                && map[player.row + player_size][player.clm + player_size + CHECK_DISTANCE] > THRESHHOLD
                && (map[player.row + player_size + 1][player.clm + player_size + 1] < THRESHHOLD
                    || map[player.row + player_size + 1][player.clm + player_size + CHECK_DISTANCE] < THRESHHOLD)
            ) {
                movelist.push('right');
            }
            break;
        case 'left':
            if (map[player.row - 1][player.clm] > THRESHHOLD
                && map[player.row - CHECK_DISTANCE][player.clm] > THRESHHOLD
                && map[player.row - 1][player.clm + player_size] > THRESHHOLD
                && map[player.row - 1 - CHECK_DISTANCE][player.clm + player_size] > THRESHHOLD
                && (map[player.row - 1][player.clm + player_size + 1] < THRESHHOLD
                    || map[player.row - 1 - CHECK_DISTANCE][player.clm + player_size + 1] < THRESHHOLD)
            ) {
                movelist.push('up');
            }
            if (map[player.row][player.clm - 1] > THRESHHOLD
                && map[player.row + player_size][player.clm - 1] > THRESHHOLD) {
                movelist.push('left');
            }
            if (map[player.row + player_size + 1][player.clm] > THRESHHOLD
                && map[player.row + player_size + CHECK_DISTANCE][player.clm] > THRESHHOLD
                && map[player.row + player_size + 1][player.clm + player_size] > THRESHHOLD
                && map[player.row + player_size + CHECK_DISTANCE][player.clm + player_size] > THRESHHOLD
                && (map[player.row + player_size + 1][player.clm + player_size + 1] < THRESHHOLD
                    || map[player.row + player_size + CHECK_DISTANCE][player.clm + player_size + 1] < THRESHHOLD)
            ) {
                movelist.push('down');
            }
            break;
        case 'right':
            if (map[player.row - 1][player.clm] > THRESHHOLD
                && map[player.row - CHECK_DISTANCE][player.clm] > THRESHHOLD
                && map[player.row - 1][player.clm + player_size] > THRESHHOLD
                && map[player.row - 1 - CHECK_DISTANCE][player.clm + player_size] > THRESHHOLD
                && (map[player.row - 1][player.clm - 1] < THRESHHOLD
                    || map[player.row - 1 - CHECK_DISTANCE][player.clm - 1] < THRESHHOLD)
            ) {
                movelist.push('up');
            }
            if (map[player.row][player.clm + player_size + 1] > THRESHHOLD
                && map[player.row + player_size][player.clm + player_size + 1] > THRESHHOLD) {
                movelist.push('right');
            }
            if (map[player.row + player_size + 1][player.clm] > THRESHHOLD
                && map[player.row + player_size + CHECK_DISTANCE][player.clm] > THRESHHOLD
                && map[player.row + player_size + 1][player.clm + player_size] > THRESHHOLD
                && map[player.row + player_size + CHECK_DISTANCE][player.clm + player_size] > THRESHHOLD
                && (map[player.row + player_size + 1][player.clm - 1] < THRESHHOLD
                    || map[player.row + player_size + CHECK_DISTANCE][player.clm - 1] < THRESHHOLD)
            ) {
                movelist.push('down');
            }
            break;
        case 'down':
            if (map[player.row][player.clm - 1] > THRESHHOLD
                && map[player.row][player.clm - CHECK_DISTANCE] > THRESHHOLD
                && map[player.row + player_size][player.clm - 1] > THRESHHOLD
                && map[player.row + player_size][player.clm - CHECK_DISTANCE] > THRESHHOLD
                && (map[player.row - 1][player.clm - 1] < THRESHHOLD
                    || map[player.row - 1][player.clm - CHECK_DISTANCE] < THRESHHOLD)
            ) {
                movelist.push('left');
            }
            if (map[player.row][player.clm + player_size + 1] > THRESHHOLD
                && map[player.row][player.clm + player_size + CHECK_DISTANCE] > THRESHHOLD
                && map[player.row + player_size][player.clm + player_size + 1] > THRESHHOLD
                && map[player.row + player_size][player.clm + player_size + CHECK_DISTANCE] > THRESHHOLD
                && (map[player.row - 1][player.clm + player_size + 1] < THRESHHOLD
                    || map[player.row - 1][player.clm + player_size + CHECK_DISTANCE] < THRESHHOLD)
            ) {
                movelist.push('right');
            }
            if (map[player.row + player_size + 1][player.clm] > THRESHHOLD
                && map[player.row + player_size + 1][player.clm + player_size] > THRESHHOLD) {
                movelist.push('down');
            }
            break;
        default:
            if (map[player.row - 1][player.clm] > THRESHHOLD
                && map[player.row - 1][player.clm + player_size] > THRESHHOLD
                && pre_move !== 'down') {
                movelist.push('up');
            }
            if (map[player.row][player.clm - 1] > THRESHHOLD
                && map[player.row + player_size][player.clm - 1] > THRESHHOLD
                && pre_move !== 'right') {
                movelist.push('left');
            }
            if (map[player.row][player.clm + player_size + 1] > THRESHHOLD
                && map[player.row + player_size][player.clm + player_size + 1] > THRESHHOLD
                && pre_move !== 'left') {
                movelist.push('right');
            }
            if (map[player.row + player_size + 1][player.clm] > THRESHHOLD
                && map[player.row + player_size + 1][player.clm + player_size] > THRESHHOLD
                && pre_move !== 'up') {
                movelist.push('down');
            }
    }
    return movelist;
};

function movePlayer(map, new_player, move) {
    switch (move) {
        case 'up':
            if (map[new_player.row - 1][new_player.clm] > THRESHHOLD) {
                new_player.row = new_player.row - 1;
            }
            break;
        case 'left':
            if (map[new_player.row][new_player.clm - 1] > THRESHHOLD) {
                new_player.clm = new_player.clm - 1;
            }
            break;
        case 'right':
            if (map[new_player.row][new_player.clm + 1] > THRESHHOLD) {
                new_player.clm = new_player.clm + 1;
            } break;
        case 'down':
            if (map[new_player.row + 1][new_player.clm] > THRESHHOLD) {
                new_player.row = new_player.row + 1;
            } break;
        default:
            console.log('error move= ' + move);
    }
    new_player.pre_move = move;
    return new_player;
};

function movePlayer_btn(map, player, btn) {
    switch (btn) {
        case 'up':
            if (map[player.row - 1][player.clm] > THRESHHOLD
                && map[player.row - 1][player.clm + player_size] > THRESHHOLD) {
                player.row = player.row - 1;
            }
            break;
        case 'left':
            if (map[player.row][player.clm - 1] > THRESHHOLD
                && map[player.row + player_size][player.clm - 1] > THRESHHOLD) {
                player.clm = player.clm - 1;
            }
            break;
        case 'right':
            if (map[player.row][player.clm + player_size + 1] > THRESHHOLD
                && map[player.row + player_size][player.clm + player_size + 1] > THRESHHOLD) {
                player.clm = player.clm + 1;
            }
            break;
        case 'down':
            if (map[player.row + player_size + 1][player.clm] > THRESHHOLD
                && map[player.row + player_size + 1][player.clm + player_size] > THRESHHOLD) {
                player.row = player.row + 1;
            }
            break;
        default:
            console.log('error btn= ' + btn);
    }
    return player;
};

function movePlayer_key(map, player, key) {
    switch (key) {
        case 38: // Key[↑]
            if (map[player.row - 1][player.clm] > THRESHHOLD
                && map[player.row - 1][player.clm + player_size] > THRESHHOLD) {
                player.row = player.row - 1;
            }
            break;
        case 37: // Key[←]
            if (map[player.row][player.clm - 1] > THRESHHOLD
                && map[player.row + player_size][player.clm - 1] > THRESHHOLD) {
                player.clm = player.clm - 1;
            }
            break;
        case 39: // Key[→]
            if (map[player.row][player.clm + player_size + 1] > THRESHHOLD
                && map[player.row + player_size][player.clm + player_size + 1] > THRESHHOLD) {
                player.clm = player.clm + 1;
            }
            break;
        case 40: // Key[↓]
            if (map[player.row + player_size + 1][player.clm] > THRESHHOLD
                && map[player.row + player_size + 1][player.clm + player_size] > THRESHHOLD) {
                player.row = player.row + 1;
            }
            break;
        default:
            console.log('error key= ' + key);
    }
    return player;
};

function showBtn() {
    $('#btn').css({ display: 'inline-block' });
    $('#btn_auto').css({ display: 'inline-block' });
}

function displayLoad(size, map, player) {
    $('#meiro').empty();
    var str = "";
    for (var i = 0; i < size; i++) {
        var str_i = String(getdoubleDigestNumer(i));
        const line = map[i];
        const length = line.length;
        str += '<div class="block">';
        for (var n = 0; n < length; n++) {
            var str_n = String(getdoubleDigestNumer(n));
            if (line[n] > THRESHHOLD) {
                if (i === player.row && n === player.clm
                    || i === player.row && n === player.clm + player_size
                    || i === player.row + player_size && n === player.clm
                    || i === player.row + player_size && n === player.clm + player_size) {
                    str += '<div ' + 'id=id' + str_i + str_n + ' class="p z">';
                } else {
                    str += '<div ' + 'id=id' + str_i + str_n + ' class="p">';
                }
            } else {
                str += '<div ' + 'id=id' + str_i + str_n + ' class="w">';
            }


            str += '</div>';
        }
        str += '</div>';
        $('#meiro').append(str);
        str = "";
    }
    for (var j = 0; j < start.length; j++) {
        $('#id' + start[j]).addClass('s');
    }
    for (var j = 0; j < end.length; j++) {
        $('#id' + end[j]).addClass('e');
    }
}

function displayLoad_bunshin(size, map, players) {
    $('#meiro').empty();
    if (players.length === 0) {
        console.log('ゴールできませんでした');
        return false;
    }
    var str = "";
    for (var i = 0; i < size; i++) {
        var str_i = String(getdoubleDigestNumer(i));
        const line = map[i];
        const length = line.length;
        str += '<div class="block">';
        for (var n = 0; n < length; n++) {
            var str_n = String(getdoubleDigestNumer(n));
            if (line[n] > THRESHHOLD) {
                //playerがいる場所
                for (var j = 0; j < players.length; j++) {
                    var player = players[j];
                    var str_ply = '';
                    if (i === player.row && n === player.clm
                        || i === player.row && n === player.clm + player_size
                        || i === player.row + player_size && n === player.clm
                        || i === player.row + player_size && n === player.clm + player_size) {
                        str_ply = '<div ' + 'id=id' + str_i + str_n + ' class="p z">';
                        break;
                    } else {
                        str_ply = '<div ' + 'id=id' + str_i + str_n + ' class="p">';
                    }
                }
                str += str_ply;
            } else {
                str += '<div ' + 'id=id' + str_i + str_n + ' class="w">';
            }
            str += '</div>';
        }
        str += '</div>';
        $('#meiro').append(str);
        str = "";
    }
    for (var j = 0; j < start.length; j++) {
        $('#id' + start[j]).addClass('s');
    }
    for (var j = 0; j < end.length; j++) {
        $('#id' + end[j]).addClass('e');
    }
}

function setStartEnd(click_id) {
    var list = [];
    // var pos = { row: 0, clm: 0 };
    //クリックしたポジション
    var pos_row = Number(click_id.substr(2, 2));
    var pos_clm = Number(click_id.substr(4, 2));

    //8方向の壁までの距離をチェック
    var dist = { north: 0, north_east: 0, east: 0, south_east: 0, south: 0, south_west: 0, west: 0, north_west: 0 };

    //北
    for (var i = 1; i < 100; i++) {
        if (map[pos_row - i][pos_clm] > THRESHHOLD) {
            dist.north = i;
        } else {
            break;
        }
    }

    //北東
    for (var i = 1; i < 100; i++) {
        if (map[pos_row - i][pos_clm + i] > THRESHHOLD) {
            dist.north_east = i;
        } else {
            break;
        }
    }
    //東
    for (var i = 1; i < 100; i++) {
        if (map[pos_row][pos_clm + i] > THRESHHOLD) {
            dist.east = i;
        } else {
            break;
        }
    }
    //南東
    for (var i = 1; i < 100; i++) {
        if (map[pos_row + i][pos_clm + i] > THRESHHOLD) {
            dist.south_east = i;
        } else {
            break;
        }
    }
    //南
    for (var i = 1; i < 100; i++) {
        if (map[pos_row + i][pos_clm] > THRESHHOLD) {
            dist.south = i;
        } else {
            break;
        }
    }
    //南西
    for (var i = 1; i < 100; i++) {
        if (map[pos_row + i][pos_clm - i] > THRESHHOLD) {
            dist.south_west = i;
        } else {
            break;
        }
    }
    //西
    for (var i = 1; i < 100; i++) {
        if (map[pos_row][pos_clm - i] > THRESHHOLD) {
            dist.west = i;
        } else {
            break;
        }
    }
    //北西
    for (var i = 1; i < 100; i++) {
        if (map[pos_row - i][pos_clm - i] > THRESHHOLD) {
            dist.north_west = i;
        } else {
            break;
        }
    }

    var tate = dist.north + dist.south + 1;
    var yoko = dist.east + dist.west + 1;
    var naname1 = dist.north_east + dist.south_west + 5;
    var naname2 = dist.north_west + dist.south_east + 5;
    var kijun = '';

    if (tate <= yoko) {
        if (tate <= naname1) {
            if (tate <= naname2) {
                kijun = 'tate';
            } else {
                kijun = 'naname2';
            }
        } else {
            if (naname1 <= naname2) {
                kijun = 'naname1';
            } else {
                kijun = 'naname2';
            }
        }
    } else {
        if (yoko <= naname1) {
            if (yoko <= naname2) {
                kijun = 'yoko';
            } else {
                kijun = 'naname2';
            }
        } else {
            if (naname1 <= naname2) {
                kijun = 'naname1';
            } else {
                kijun = 'naname2';
            }
        }
    }

    switch (kijun) {
        case 'tate':
            if (player_size === 0 && tate > 1) {
                player_size = tate - PLAYSER_SIZE_HOSEI;
            } else if (player_size === 0) {
                player_size = tate;
            }
            for (var j = 0; j < tate; j++) {
                list.push(createPositionId(pos_row, pos_clm + j));
                // list = addPos(list, pos_row, pos_clm + j);
            }
            for (var i = 1; i < 100; i++) {
                if (map[pos_row - i][pos_clm] > THRESHHOLD) {
                    list.push(createPositionId(pos_row - i, pos_clm));
                    // list = addPos(list, pos_row - i, pos_clm);
                    for (var j = 1; j < tate; j++) {
                        list.push(createPositionId(pos_row - i, pos_clm + j));
                        // list = addPos(list, pos_row - i, pos_clm + j);
                    }
                } else {
                    break;
                }
            }
            for (var i = 1; i < 100; i++) {
                if (map[pos_row + i][pos_clm] > THRESHHOLD) {
                    list.push(createPositionId(pos_row + i, pos_clm));
                    // list = addPos(list, pos_row + i, pos_clm);
                    for (var j = 1; j < tate; j++) {
                        list.push(createPositionId(pos_row + i, pos_clm + j));
                        // list = addPos(list, pos_row + i, pos_clm + j);
                    }
                } else {
                    break;
                }
            }
            break;
        case 'yoko':
            if (yoko > 1 && player_size === 0) {
                player_size = yoko - PLAYSER_SIZE_HOSEI;
            } else if (player_size === 0) {
                player_size = yoko;
            }
            for (var j = 0; j < yoko; j++) {
                list.push(createPositionId(pos_row + j, pos_clm));
                // list = addPos(list, pos_row + j, pos_clm);
            }
            for (var i = 1; i < 100; i++) {
                if (map[pos_row][pos_clm - i] > THRESHHOLD) {
                    list.push(createPositionId(pos_row, pos_clm - i));
                    // list = addPos(list, pos_row, pos_clm - i);
                    for (var j = 1; j < yoko; j++) {
                        list.push(createPositionId(pos_row + j, pos_clm - i));
                        // list = addPos(list, pos_row + j, pos_clm - i);
                    }
                } else {
                    break;
                }
            }
            for (var i = 1; i < 100; i++) {
                if (map[pos_row][pos_clm + i] > THRESHHOLD) {
                    list.push(createPositionId(pos_row, pos_clm + i));
                    // list = addPos(list, pos_row, pos_clm + i);
                    for (var j = 1; j < yoko; j++) {
                        list.push(createPositionId(pos_row + j, pos_clm + i));
                        // list = addPos(list, pos_row + j, pos_clm + i);
                    }
                } else {
                    break;
                }
            }
            break;
        case 'naname1':
            alert('もう一度選択してください');
            console.log('tate:' + tate);
            console.log('yoko:' + yoko);
            console.log('naname1:' + naname1);
            console.log('naname2:' + naname2);
            console.log('北東:' + dist.north_east);
            console.log('南西:' + dist.south_west);
            break;

            console.log('北東:' + dist.north_east);
            console.log('南西:' + dist.south_west);

            //北側を塗りつぶし
            for (var i = 0; i < dist.north_east + 1; i++) {
                //東側を塗りつぶし
                for (var j = 0; j < dist.north_east + 1; j++) {
                    // list.push(createPositionId(pos_row - i, pos_clm - j));
                }
                //西側を塗りつぶし
                for (var j = 0; j < dist.south_west + 1; j++) {
                    // list.push(createPositionId(pos_row - i, pos_clm - j));
                }
            }

            //南側を塗りつぶし
            for (var i = 1; i < dist.south_west + 1; i++) {
                //東側を塗りつぶし
                for (var j = 0; j < dist.north_east + 1; j++) {
                    // list.push(createPositionId(pos_row + i, pos_clm - j));
                }
                //西側を塗りつぶし
                for (var j = 0; j < dist.south_west + 1; j++) {
                    // list.push(createPositionId(pos_row + i, pos_clm - j));
                }
            }

            break;
        case 'naname2':
            alert('もう一度選択してください');
            console.log('tate:' + tate);
            console.log('yoko:' + yoko);
            console.log('naname1:' + naname1);
            console.log('naname2:' + naname2);
            break;
            console.log('北西:' + dist.north_west);
            console.log('南東:' + dist.south_east);

            //北側を塗りつぶし
            for (var i = 0; i < dist.north_west + 1; i++) {
                //東側を塗りつぶし
                for (var j = 0; j < dist.south_east + 1; j++) {
                    // list.push(createPositionId(pos_row - i, pos_clm - j));
                }
                //西側を塗りつぶし
                for (var j = 0; j < dist.north_west + 1; j++) {
                    // list.push(createPositionId(pos_row - i, pos_clm - j));
                }
            }

            //南側を塗りつぶし
            for (var i = 1; i < dist.south_east + 1; i++) {
                //東側を塗りつぶし
                for (var j = 0; j < dist.south_east + 1; j++) {
                    // list.push(createPositionId(pos_row + i, pos_clm - j));
                }
                //西側を塗りつぶし
                for (var j = 0; j < dist.north_west + 1; j++) {
                    // list.push(createPositionId(pos_row + i, pos_clm - j));
                }
            }
            break;
        default:
            console.log('error');
    }

    // console.log('tate:' + tate);
    // console.log('yoko:' + yoko);
    // console.log('naname1:' + naname1);
    // console.log('naname2:' + naname2);

    // console.log(list);
    return list;
}

function addPos(list, pos_row, pos_clm) {
    var pos = { row: pos_row, clm: pos_clm };
    list.push(pos);
    return list;
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
        //ファイルの読込が終了した時の処理
        // anallizeImage(img);

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
            for (var x = 0; x < width; x++) {
                var index = (y * CANVAS_SIZE * 4) + x * 4;
                red_x.push(img_data.data[index]);
            }
            red.push(red_x);
        }
        console.log(red);
        map = red;
        displayLoad(height, red, player)
    }
    $('#btn').css({ display: 'inline' });
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
    size = CANVAS_SIZE;
    map = red;
    console.log(map);
    displayLoad(size, map, player)}