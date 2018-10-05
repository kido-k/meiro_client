

const EXECUTION_INTERVAL = 100;
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

// var camera_position = { x: 500, y: 800, z: 500 }
// var camera_rotation = { x: -90, y: -180, z: 0 }

var camera_position = { x: 500, y: 40, z: 70 };
var camera_rotation = { x: -20, y: -180, z: 0 };
var light_position = { x: 500, y: 300, z: 0 };
var bord_position = { x: -100, y: 0, z: -100 };
var bord_rotation = { x: 0, y: 0, z: 0 };

var velocity = 100;
var direction = 90;
var omega = 0;

var socket;
var mobile_acc = { x: 0, y: 0, z: 0 };

$(function () {
    console.log('gamestart');

    $('#exe').on('click', function () {
        displayAFRAME();
        addAframeElement();
    });

    $('#test').on('click', function () {
        accelDragon();
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
    str += 'pos-tracer="target: a_camera" ';
    str += 'dynamic-body="mass:100;linearDamping: 0.01;angularDamping: 0.0001;"';
    str += 'geometry="primitive:box; width:50; height:50; depth:50;" ';
    str += 'material="color:red; transparent:true; visible:false;"';
    str += 'position="940 25 50">';
    str += '<a-obj-model id="dragon" src="img/BlueEyes/BlueEyes.obj" mtl="img/BlueEyes/BlueEyes.mtl"></a-obj-model>';
    // str += '<a-obj-model id="dragon" position="500 0 0" src="img/BlueEyes/BlueEyes.obj" mtl="img/BlueEyes/BlueEyes.mtl"></a-obj-model>';
    str += '</a-entity>';
    $('#a_cource').append(str);
    run();
    syncCamera();
    fireAction();
}

function roteBordMobile(accel) {
    displayData(accel);
    $('#obj').attr('rotation', 0 + ' ' + 0 + ' ' + accel.x * 0.33);
    if (-90 <= accel.x && accel.x <= 90) {
        direction = 90 + accel.x * 0.8;
    } else if (-90 > accel.x) {
        direction = 90 - 80;
    } else if (accel.x > 90) {
        direction = 90 + 80;
    }
};

function accelDragon() {
    var dragon = document.querySelector('#obj').body;
    dragon.wakeUp();
    var x_vel = velocity * Math.cos(direction / 180 * Math.PI);
    var z_vel = velocity * Math.sin(direction / 180 * Math.PI);
    dragon.velocity.set(x_vel, 0, z_vel);
    dragon.angularVelocity.set(0, 0, 0);
    // $('#obj').attr('rotation', 0 + ' ' + direction + ' ' + 0);
    // var txt = document.getElementById("txt");   // データを表示するdiv要素の取得
    // txt.innerHTML = "direction: " + Math.floor(direction);
    // displayDir();
    setTimeout(accelDragon, EXECUTION_INTERVAL);
}


// データを表示する displayData 関数
function displayData(accel) {
    var txt = document.getElementById("txt");   // データを表示するdiv要素の取得
    txt.innerHTML = "alpha: " + Math.floor(accel.z) + "<br>"  // x軸の値
        + "beta:  " + Math.floor(accel.x) + "<br>"  // y軸の値
        + "gamma: " + Math.floor(accel.y) + "<br>"  // z軸の値
}

function displayDir() {
    var txt = document.getElementById("txt");   // データを表示するdiv要素の取得
    txt.innerHTML = "direction: " + Math.floor(direction);
}

function displayAFRAME() {
    $('#vr_cource').empty();
    var str = "";
    str += '<a-scene id="a_cource" embedded physics="debug: true;friction: 0.01;gravity:-19.62; restitution: 0.01; iterations:5">';
    str += '<a-entity light="color: #FFF; intensity: 1.5" position="' + light_position.x + ' ' + light_position.y + ' ' + light_position.z + '"></a-entity>';
    str += '<a-entity id="a_camera" position="' + camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z + '" rotation="' + camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z + '">';
    str += '<a-camera><a-cursor></a-cursor></a-camera>';
    str += '</a-entity>';
    str += '<a-sky cursor-listener color="#DDDDDD"></a-sky>';
    //地面
    str += '<a-box cursor-listener static-body width= ' + BORD_SIZE + ' height=50 ' + 'depth=' + BORD_SIZE * 10 + ' position="' + (BORD_SIZE / 2) + ' -25 ' + (BORD_SIZE * 10 / 2) + ' color="white" ></a-box>';
    //外壁
    str += '<a-box cursor-listener static-body width=20 height=100 ' + 'depth=' + BORD_SIZE * 10 + ' position="' + 10 + ' 50 ' + (BORD_SIZE * 10 / 2) + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=20 height=100 ' + 'depth=' + BORD_SIZE * 10 + ' position="' + (BORD_SIZE - 10) + ' 50 ' + (BORD_SIZE * 10 / 2) + ' color="silver" ></a-box>';
    // str += '<a-box cursor-listener static-body width=' + (BORD_SIZE - 100) + ' height=100 ' + 'depth=20 position="' + ((BORD_SIZE / 2) + 50) + ' 50 ' + BORD_SIZE + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + (BORD_SIZE - 100) + ' height=100 ' + 'depth=20 position="' + ((BORD_SIZE / 2) - 50) + ' 50 ' + 10 + ' color="silver" ></a-box>';
    //内装
    //z-500
    str += '<a-box cursor-listener static-body width=' + 240 + ' height=100 ' + 'depth=100 position="' + 140 + ' 50 ' + 500 + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + 260 + ' height=100 ' + 'depth=100 position="' + 480 + ' 50 ' + 500 + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + 280 + ' height=100 ' + 'depth=100 position="' + 840 + ' 50 ' + 500 + ' color="silver" ></a-box>';
    //z-1000    
    str += '<a-box cursor-listener static-body width=' + 240 + ' height=100 ' + 'depth=100 position="' + 140 + ' 50 ' + 1000 + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + 260 + ' height=100 ' + 'depth=100 position="' + 480 + ' 50 ' + 1000 + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + 280 + ' height=100 ' + 'depth=100 position="' + 840 + ' 50 ' + 1000 + ' color="silver" ></a-box>';
    //z-1500
    str += '<a-box cursor-listener static-body width=' + 240 + ' height=100 ' + 'depth=100 position="' + 140 + ' 50 ' + 1500 + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + 260 + ' height=100 ' + 'depth=100 position="' + 480 + ' 50 ' + 1500 + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + 280 + ' height=100 ' + 'depth=100 position="' + 840 + ' 50 ' + 1500 + ' color="silver" ></a-box>';
    //z-2000
    str += '<a-box cursor-listener static-body width=' + 240 + ' height=100 ' + 'depth=100 position="' + 140 + ' 50 ' + 2000 + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + 260 + ' height=100 ' + 'depth=100 position="' + 480 + ' 50 ' + 2000 + ' color="silver" ></a-box>';
    str += '<a-box cursor-listener static-body width=' + 280 + ' height=100 ' + 'depth=100 position="' + 840 + ' 50 ' + 2000 + ' color="silver" ></a-box>';

    str += '</a-entity>'
    str += '</a-scene>';
    $('#vr_cource').append(str);
}

function syncCamera() {
    AFRAME.registerComponent('pos-tracer', {
        init: function () {
            this.targetEl = document.getElementById(this.data.target);
        },
        tick: function () {
            const radToDeg = 180 / Math.PI;

            // var x_rote = this.el.object3D.rotation.x * radToDeg
            // var y_rote = this.el.object3D.rotation.y * radToDeg
            // var z_rote = this.el.object3D.rotation.z * radToDeg

            // if (x_rote <= 90) {
            //     var y = y_rote + 180;
            // } else {
            //     var y = y_rote * (-1);
            // }

            // var rot = AFRAME.utils.coordinates.stringify({
            //     x: 0,
            //     y: y,
            //     z: 0
            // });

            var pos = AFRAME.utils.coordinates.stringify({
                x: this.el.object3D.position.x,
                y: this.el.object3D.position.y + 35,
                z: this.el.object3D.position.z + 30
            });

            this.targetEl.setAttribute("position", pos);
            // this.targetEl.setAttribute("rotation", rot);
        }
    });
}

function fireAction() {
    AFRAME.registerComponent('cursor-listener', {
        init: function () {
            this.el.addEventListener("click", function (evt) {
                addFireBallElement();
                // addBox();
            });
        }
    });
}


function addFireBallElement() {
    var str = '<a-sphere id="fire" ';
    str += 'dynamic-body ';
    str += 'radius=5 color=orange ';
    str += 'position="940 25 150">';
    // str += '<a-obj-model position="500 15 50" src="img/FireGem/Fire Gem.obj" mtl="img/FireGem/Fire Gem.mtl"></a-obj-model>';
    str += '</a-sphere>';
    $('#a_cource').append(str);
    canon();
}

function run() {
    if (document.getElementById("dragon").object3D.children[0]) {
        document.getElementById("dragon").object3D.children[0].children[0].material[1].transparent = true;
    } else {
        setTimeout(run, EXECUTION_INTERVAL);
    }
}

function canon() {
    if (document.querySelector('#fire').body) {
        var fire = document.querySelector('#fire').body;
        fire.wakeUp();
        fire.velocity.set(0, 0, 500);
    } else {
        setTimeout(canon, EXECUTION_INTERVAL);
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
        // case 'b_up':
        //     bord_rotation.x -= BORD_ROTE_UNIT;
        //     break;
        case 'b_left':
            direction -= 5;
            break;
        case 'b_right':
            direction += 5;
            break;
        // case 'b_down':
        //     bord_rotation.x += BORD_ROTE_UNIT;
        //     break;
        // case 'b_minus':
        //     bord_rotation.y -= BORD_ROTE_UNIT;
        //     break;
        // case 'b_plus':
        //     bord_rotation.y += BORD_ROTE_UNIT;
        //     break;
        // default:
        //     console.log('error btn= ' + btn);
    }
    // $('#a_board').attr('rotation', bord_rotation.x + ' ' + bord_rotation.y + ' ' + bord_rotation.z);
};
