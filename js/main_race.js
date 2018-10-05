

const EXECUTION_INTERVAL = 100;
const CANVAS_SIZE = 200;
const BORD_SIZE = 1040;
const THRESHHOLD = 150;
const CANVAS_SMALL_LIMIT = CANVAS_SIZE / 100 * 2
const CAMERA_MOVE_UNIT = 5;
const BORD_ROTE_UNIT = 1;
const DRAGON_SPEED_UNIT = 1;
const DRAGON_SIDE_MOVE_UNIT = 1;
const DRAGON_SPEED = 5;
const SOCKET_CONNECT = 'https://gentle-dusk-86476.herokuapp.com/';
const SYNCHTIME = 300;
const BLOCK_NUMBER = 6;
const GRAVITY = 5 * 9.81;
const FIRE_VEL = 500;
const radToDeg = 180 / Math.PI;

// var camera_position = { x: 500, y: 800, z: 500 }
// var camera_rotation = { x: -90, y: -180, z: 0 }

var camera_position = { x: 500, y: 40, z: 70 };
var camera_rotation = { x: -20, y: -180, z: 0 };
var light_position = { x: 600, y: 200, z: -100 };
var bord_position = { x: -100, y: 0, z: -100 };
var bord_rotation = { x: 0, y: 0, z: 0 };
var dragon_position = { x: 940, y: 25, z: 50 };
var dragon_rotation = { x: 0, y: 0, z: 0 };

var velocity = DRAGON_SPEED;
var sidemove = 0;
var direction = 90;
var omega = 0;
var block_point = 0;

var cnt = 0;

var socket;
var mobile_acc = { x: 0, y: 0, z: 0 };

$(function () {
    console.log('gamestart');

    $('#exe').on('click', function () {
        displayAFRAME();
        addAframeElement();
    });

    $('#test').on('click', function () {
        // accelDragon();
        moveDragon();
    });

    $('.a_move').on('click', function () {
        const btn = this.id;
        player = moveCamera_btn(btn);
    });

    $('.b_move').on('click', function () {
        const btn = this.id;
        roteBord(btn);
    });

    $('#shot').on('click', function () {
        addFireBallElement();
        cannon();
    });

    $('#jump').on('click', function () {
        jumpDragon();
    });

    connectSocket();

    socket.on('bord_control', function (btn) {
        roteBord(btn);
    });

    socket.on('jyro_sensor', function (accel) {
        roteMobileAction(accel);
    });

    socket.on('shot', function (accel) {
        addFireBallElement();
        cannon();
    });

    socket.on('jump', function (accel) {
        roteMobileAction(accel);
    });

    // collisionWall();

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
    // str += 'pos-tracer="target: a_camera" ';
    str += 'dynamic-body="mass:100;linearDamping: 0.01;angularDamping: 0.0001;"';
    str += 'geometry="primitive:box; width:50; height:50; depth:50;" ';
    str += 'material="color:red; transparent:true; visible:false;" ';
    str += 'rotation="' + dragon_rotation.x + ' ' + dragon_rotation.y + ' ' + dragon_rotation.z + '" ';
    str += 'position="' + dragon_position.x + ' ' + dragon_position.y + ' ' + dragon_position.z + '">';
    str += '<a-obj-model id="dragon" src="img/BlueEyes/BlueEyes.obj" mtl="img/BlueEyes/BlueEyes.mtl"></a-obj-model>';
    // str += '<a-obj-model id="dragon" position="500 0 0" src="img/BlueEyes/BlueEyes.obj" mtl="img/BlueEyes/BlueEyes.mtl"></a-obj-model>';
    str += '</a-entity>';
    $('#a_cource').append(str);
    run();
    // syncCamera();
    fireAction();
}

function roteMobileAction(accel) {
    displayData(accel);
    if (-10 <= accel.x && accel.x <= 10) {
        sidemove = 0;
    } else if (-30 <= accel.x && accel.x < -10) {
        sidemove = 1;
    } else if (-50 <= accel.x && accel.x < -30) {
        sidemove = 2;
    } else if (-70 <= accel.x && accel.x < -50) {
        sidemove = 3;
    } else if (accel.x < -70) {
        sidemove = 4;
    } else if (10 < accel.x && accel.x <= 30) {
        sidemove = -1;
    } else if (30 < accel.x && accel.x <= 50) {
        sidemove = -2;
    } else if (50 < accel.x && accel.x <= 70) {
        sidemove = -3;
    } else if (70 < accel.x) {
        sidemove = -4;
    }
    sidemove = sidemove * Math.floor(velocity / 5 * 2);
};

function moveDragon() {
    var dragon = document.querySelector('#obj').body;
    dragon.wakeUp();

    dragon_position.x += sidemove;
    dragon_position.z += velocity;

    var unit = 5;
    dragon_rotation = { x: 0, y: (unit * sidemove), z: (-1 * unit * sidemove) };
    dragon.position.set(dragon_position.x, dragon_position.y, dragon_position.z);

    // dragon.position.x = dragon_position.x;
    // dragon.position.z = dragon_position.z;

    $('#dragon').attr('rotation', dragon_rotation.x + ' ' + dragon_rotation.y + ' ' + dragon_rotation.z);
    setCameraPosition(dragon.position.y);
    if (dragon_position.z >= block_point) {
        block_point += 500;
        makeBrock(block_point, BLOCK_NUMBER);
    }
    setTimeout(moveDragon, EXECUTION_INTERVAL);
}

function setCameraPosition(y) {
    var rote_y = (dragon_rotation.y + 90) / radToDeg;
    var rote_z = (dragon_rotation.z + 90) / radToDeg;

    camera_position.x = dragon_position.x + (25 * Math.cos(rote_z)) + (25 * Math.cos(rote_y));
    camera_position.y = dragon_position.y + (25 * Math.sin(rote_z));
    // camera_position.y = y + (25 * Math.sin(rote_z));
    camera_position.z = dragon_position.z + (10 * Math.sin(rote_y));
    $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);

    camera_rotation.x = dragon_rotation.x;
    camera_rotation.y = dragon_rotation.y + 180;
    camera_rotation.z = (-1 * dragon_rotation.z);
    $('#a_camera').attr('rotation', camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z);

}

// データを表示する displayData 関数
function displayData(accel) {
    var txt = document.getElementById("txt");   // データを表示するdiv要素の取得
    txt.innerHTML = "alpha: " + Math.floor(accel.z) + "<br>"  // x軸の値
        + "beta:  " + Math.floor(accel.x) + "<br>"  // y軸の値
        + "gamma: " + Math.floor(accel.y) + "<br>"  // z軸の値
        + "velocity: " + velocity + "<br>"  // 速度
        + "sidemove: " + sidemove + "<br>"  // 横移動速度
}

function displayDir() {
    var txt = document.getElementById("txt");   // データを表示するdiv要素の取得
    txt.innerHTML = "direction: " + Math.floor(direction);
}

function displayAFRAME() {
    $('#vr_cource').empty();
    var str = "";
    str += '<a-scene id="a_cource" embedded physics="debug: true;friction: 0.01;gravity:-' + GRAVITY + '; restitution: 0.01; iterations:5">';
    str += '<a-sky color="#dcdcdc"></a-sky>';
    str += '<a-entity light="color: #FFF; intensity: 1.5" position="' + light_position.x + ' ' + light_position.y + ' ' + light_position.z + '"></a-entity>';
    str += '<a-entity id="a_camera" position="' + camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z + '" rotation="' + camera_rotation.x + ' ' + camera_rotation.y + ' ' + camera_rotation.z + '">';
    str += '<a-camera><a-cursor></a-cursor></a-camera>';
    str += '</a-entity>';
    //地面
    str += '<a-box static-body width= ' + BORD_SIZE + ' height=50 ' + 'depth=' + BORD_SIZE * 10 + ' position="' + ((BORD_SIZE / 2) - 20) + ' -25 ' + (BORD_SIZE * 10 / 2) + ' color="white" ></a-box>';
    //外壁
    str += '<a-box class="wall" cursor-listener static-body width=20 height=100 ' + 'depth=' + BORD_SIZE * 10 + ' position="' + -10 + ' 50 ' + (BORD_SIZE * 10 / 2) + ' color="silver" ></a-box>';
    str += '<a-box class="wall" cursor-listener static-body width=20 height=100 ' + 'depth=' + BORD_SIZE * 10 + ' position="' + (BORD_SIZE - 30) + ' 50 ' + (BORD_SIZE * 10 / 2) + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + (BORD_SIZE - 100) + ' height=100 ' + 'depth=20 position="' + ((BORD_SIZE / 2) + 50) + ' 50 ' + BORD_SIZE + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + (BORD_SIZE - 100) + ' height=100 ' + 'depth=20 position="' + ((BORD_SIZE / 2) - 50) + ' 50 ' + 10 + ' color="silver" ></a-box>';
    //内装
    //z-500
    // str += '<a-box class="wall" cursor-listener static-body width=' + 240 + ' height=100 ' + 'depth=100 position="' + 240 + ' 50 ' + 500 + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + 260 + ' height=100 ' + 'depth=100 position="' + 480 + ' 50 ' + 500 + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + 80 + ' height=100 ' + 'depth=100 position="' + 840 + ' 50 ' + 500 + ' color="silver" ></a-box>';
    // //z-1000
    // str += '<a-box class="wall" cursor-listener static-body width=' + 240 + ' height=100 ' + 'depth=100 position="' + 140 + ' 50 ' + 1000 + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + 260 + ' height=100 ' + 'depth=100 position="' + 480 + ' 50 ' + 1000 + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + 280 + ' height=100 ' + 'depth=100 position="' + 840 + ' 50 ' + 1000 + ' color="silver" ></a-box>';
    // //z-1500
    // str += '<a-box class="wall" cursor-listener static-body width=' + 240 + ' height=100 ' + 'depth=100 position="' + 140 + ' 50 ' + 1500 + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + 260 + ' height=100 ' + 'depth=100 position="' + 480 + ' 50 ' + 1500 + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + 280 + ' height=100 ' + 'depth=100 position="' + 840 + ' 50 ' + 1500 + ' color="silver" ></a-box>';
    // //z-2000
    // str += '<a-box class="wall" cursor-listener static-body width=' + 240 + ' height=100 ' + 'depth=100 position="' + 140 + ' 50 ' + 2000 + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + 260 + ' height=100 ' + 'depth=100 position="' + 480 + ' 50 ' + 2000 + ' color="silver" ></a-box>';
    // str += '<a-box class="wall" cursor-listener static-body width=' + 280 + ' height=100 ' + 'depth=100 position="' + 840 + ' 50 ' + 2000 + ' color="silver" ></a-box>';
    str += '</a-scene>';
    $('#vr_cource').append(str);
}

function fireAction() {
    AFRAME.registerComponent('cursor-listener', {
        init: function () {
            this.el.addEventListener("click", function (e) {
                // if ($(".fire").length <= 2) {
                addFireBallElement();
                cannon();
                // }
            });
            this.el.addEventListener("collide", function (e) {
                // console.log(e.detail.body.el);
                if (e) {
                    collisionWall(e);
                    // if ($('#fire').length >= 1) {
                    //     $('#fire').remove();
                    // }
                }
            });
        }
    });
}


function addFireBallElement() {
    var str = '<a-sphere id="fire' + cnt + '" class="fire" ';
    str += 'dynamic-body ';
    str += 'radius=3 color=orange ';
    str += 'position="' + dragon_position.x + ' ' + (dragon_position.y + 20) + ' ' + (dragon_position.z + 50) + '">';
    // str += '<a-obj-model position="500 15 50" src="img/FireGem/Fire Gem.obj" mtl="img/FireGem/Fire Gem.mtl"></a-obj-model>';
    str += '</a-sphere>';
    $('#a_cource').append(str);
}

function run() {
    if (document.getElementById("dragon").object3D.children[0]) {
        document.getElementById("dragon").object3D.children[0].children[0].material[1].transparent = true;
    } else {
        setTimeout(run, EXECUTION_INTERVAL);
    }
}

function cannon() {
    var id = '#fire' + cnt;
    var rote_y = (dragon_rotation.y + 90) / radToDeg;

    if (document.querySelector(id).body) {
        var x_vel = FIRE_VEL * Math.cos(rote_y) * (-1);
        var z_vel = FIRE_VEL * Math.sin(rote_y);
        var fire = document.querySelector(id).body;
        fire.wakeUp();
        fire.velocity.set(x_vel, 0, z_vel);
        cnt += 1;
    } else {
        setTimeout(cannon, 100);
    }
}

function collisionWall(e) {
    // ボール(id="ball")と衝突した場合のみ処理を行う
    var str = e.detail.body.el.id;
    if (str.indexOf('fire') !== -1) {
        // 衝突したボールと同じ位置にパーティクルを発生させる
        var effect = document.createElement('a-entity');
        var position = e.detail.body.el.getAttribute('position');
        effect.setAttribute('position', position);
        effect.setAttribute('particle-system', 'color: #EF0000,#44CC00; size:10; velocitySpread:30 30 30; particleCount: 500; duration: 0.2;');
        // パーティクルを<a-scene>に追加する
        var scene = document.querySelector('a-scene');
        scene.appendChild(effect);
    };
}

function jumpDragon() {
    var dragon = document.querySelector('#obj').body;
    dragon.wakeUp();
    dragon.velocity.set(0, 50, 0);
    // dragon.angularVelocity.set(0, 0, 0);
}

function makeBrock(z, length) {
    var x = [50, 150, 250, 350, 450, 550, 650, 750, 850, 950];
    x = shuffle(x);
    var str = "";
    for (var i = 0; i < length; i += 1) {
        str += '<a-box class="wall" cursor-listener dynamic-body width=100 height=100 depth=100 position="' + x[i] + ' 150 ' + z + ' color="silver" ></a-box>';
    }
    $('#a_cource').append(str);
}

function shuffle(array) {
    var n = array.length, t, i;
    while (n) {
        i = Math.floor(Math.random() * n--);
        t = array[n];
        array[n] = array[i];
        array[i] = t;
    }
    return array;
}

function roteBord(btn) {
    switch (btn) {
        case 'b_up':
            velocity += DRAGON_SPEED_UNIT;
            break;
        case 'b_down':
            velocity -= DRAGON_SPEED_UNIT;
            break;
        case 'b_left':
            sidemove += DRAGON_SIDE_MOVE_UNIT;
            break;
        case 'b_right':
            sidemove -= DRAGON_SIDE_MOVE_UNIT;
            break;
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

function moveCamera_btn(btn) {
    switch (btn) {
        case 'a_up':
            camera_position.z += CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_down':
            camera_position.z -= CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_right':
            camera_position.x -= CAMERA_MOVE_UNIT;
            $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
            break;
        case 'a_left':
            camera_position.x += CAMERA_MOVE_UNIT;
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

function accelDragon() {
    var dragon = document.querySelector('#obj').body;
    dragon.wakeUp();
    var x_vel = velocity * Math.cos(direction / 180 * Math.PI);
    var z_vel = velocity * Math.sin(direction / 180 * Math.PI);
    dragon.velocity.set(x_vel, 0, z_vel);
    dragon.angularVelocity.set(0, 0, 0);
    setTimeout(accelDragon, EXECUTION_INTERVAL);
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
