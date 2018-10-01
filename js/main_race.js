

const EXECUTION_INTERVAL = 50;
const CANVAS_SIZE = 200;
const BORD_SIZE = 1000;
const THRESHHOLD = 150;
const PLAYSER_SIZE_HOSEI = 1;
const CHECK_DISTANCE = 3;
const MAGNIFICATION = 3;
const CANVAS_SMALL_LIMIT = CANVAS_SIZE / 100 * 2
const CAMERA_MOVE_UNIT = 5;
const BORD_ROTE_UNIT = 1;
const PLAYER_MOVE_UNIT = 5;
const PLAYER_SPEED = 1;
const SOCKET_CONNECT = 'https://gentle-dusk-86476.herokuapp.com/';
const SYNCHTIME = 300;

var image;
var map = [];
var size = 0;
var position = {};
var start = [];
var end = [];
var players = [];
var wall_width = 0;
// var camera_position = { x: 500, y: 25, z: 20 };
var camera_position = { x: 500, y: 40, z: 70 };
var camera_rotation = { x: 0, y: -180, z: 0 };
var light_position = { x: 500, y: 300, z: 0 };
var bord_position = { x: -100, y: 0, z: -100 };
var bord_rotation = { x: 0, y: 0, z: 0 };

var player_pass = [];
var player_num = 0;
var player_start_position = { x: -95, y: 15, z: -85 };
var player_size = 3;
var parts_depth = 5;
var first_play = true;
const goal = { x: CANVAS_SIZE * 0.99 }

var socket;
var mobile_acc = { x: 0, y: 0, z: 0 };

$(function () {
    console.log('gamestart');

    $('#exe').on('click', function () {
        displayAFRAME();
        addAframeElement();
    });

    $('#test').on('click', function () {
        var dragon = document.querySelector('#obj').body;
        // サイコロが力の影響を（再び）受けるように設定する
        dragon.wakeUp();
        //    dragon.position = new CANNON.Vec3(500, 60, 60);
        dragon.velocity.set(0, 0, 100);
        //    dragon.applyImpulse(
        //        new CANNON.Vec3(Math.random() * 20, Math.random() * 20, Math.random() * 20), // 与えるベクトル
        //        new CANNON.Vec3(0.5, Math.random() * 10, Math.random() * 10) // 力を与える点
        //    );
    });


    $('.a_move').on('click', function () {
        const btn = this.id;
        player = moveCamera_btn(btn);
    });

    $('.b_move').on('click', function () {
        const btn = this.id;
        roteBord(btn);
    });

    connectSocket();

    socket.on('bord_control', function (btn) {
        roteBord(btn);
    });

    socket.on('jyro_sensor', function (accel) {
        roteBordMobile(accel);
    });

    // dragFile();

});

function connectSocket() {
    socket = io.connect(SOCKET_CONNECT);
    socket.emit('connected', 'board_connected');
    socket.on('connect_return', function (msg) {
        console.log(msg);
    });
}


function createPlayer() {
    addAframeElement();
}



function moveAframePlayer() {
}

function addAframeElement() {
    var str = '<a-entity id="obj" ';
    str += 'dynamic-body="mass:100;linearDamping: 0.01;angularDamping: 0.0001;"';
    str += 'geometry="primitive:box; width:50; height:30; depth:100;" ';
    str += 'material="color:red; transparent:true; visible:false;"';
    str += 'position="500 15 50">';
    str += '<a-obj-model id="dragon" src="img/BlueEyes/BlueEyes.obj" mtl="img/BlueEyes/BlueEyes.mtl"></a-obj-model>';
    // str += '<a-obj-model id="dragon" position="500 0 0" src="img/BlueEyes/BlueEyes.obj" mtl="img/BlueEyes/BlueEyes.mtl"></a-obj-model>';
    str += '</a-entity>';
    $('#a_cource').append(str);
    run();
}

function roteBordMobile(accel) {
    displayData(accel);
    if (accel.x < 70 && accel.x > -70 && accel.y < 70 && accel.y > -70) {
        $('#a_board').attr('rotation', accel.x * 0.4 + ' ' + 0 + ' ' + -accel.y * 0.4);
    }
};


// データを表示する displayData 関数
function displayData(accel) {
    var txt = document.getElementById("txt");   // データを表示するdiv要素の取得
    txt.innerHTML = "alpha: " + Math.floor(accel.z) + "<br>"  // x軸の値
        + "beta:  " + Math.floor(accel.x) + "<br>"  // y軸の値
        + "gamma: " + Math.floor(accel.y);          // z軸の値
}

function displayAFRAME(parts_list) {
    $('#vr_cource').empty();
    var str = "";
    str += '<a-scene id="a_cource" embedded physics="debug: true;friction: 0.01;gravity:-19.62; restitution: 0.01; iterations:5">';
    str += '<a-entity light="color: #FFF; intensity: 1.5" position="' + light_position.x + ' ' + light_position.y + ' ' + light_position.z + '"></a-entity>';
    str += '<a-entity id="a_camera" position="' + camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z + '" rotation="' + camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z + '">';
    str += '<a-camera><a-cursor></a-cursor></a-camera>';
    str += '</a-entity>';
    str += '<a-sky color="#DDDDDD"></a-sky>';
    str += '<a-box static-body width= ' + BORD_SIZE + ' height=50 ' + 'depth=' + BORD_SIZE + ' position="' + (BORD_SIZE / 2) + ' -25 ' + (BORD_SIZE / 2) + ' color="white" ></a-box>';
    // for (var i = 0; i < parts_list.length; i++) {
    //     var parts = parts_list[i];
    //     if (parts.type === 'wall') {
    //         str += '<a-box static-body id="box' + i + '" cursor-listener width= ' + parts.width + ' height="8"' + ' depth=' + parts.height + ' position="' + (parts.x + parts.width / 2) + ' 2 ' + (parts.y + parts.height / 2) + '" color="#1B1B1B"></a-box>';
    //     }
    // }
    str += '</a-entity>'
    str += '</a-scene>';
    $('#vr_cource').append(str);
}

function run() {
    if (document.getElementById("dragon").object3D.children[0]) {
        document.getElementById("dragon").object3D.children[0].children[0].material[1].transparent = true;
    } else {
        setTimeout(run, 500);
    }
}

function moveCamera_btn(btn) {
    switch (btn) {
        case 'a_up':
            camera_position.z -= CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_down':
            camera_position.z += CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_right':
            camera_position.x += CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_left':
            camera_position.x -= CAMERA_MOVE_UNIT;
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