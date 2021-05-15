//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    brownDark:0x23190f,
    pink:0xF5986E,
    yellow:0xf4ce93,
    blue:0x68c3c0,
    blueDark:0x5067e7,
};

///////////////

// GAME VARIABLES
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];

function resetGame(){
  game = {speed:0,
          initSpeed:.00035,
          baseSpeed:.00035,
          targetBaseSpeed:.00035,
          incrementSpeedByTime:.0000005,
          incrementSpeedByLevel:.000005,
          distanceForSpeedUpdate:100,
          speedLastUpdate:0,

          score:0,
          distance:0,
          ratioSpeedDistance:50,
          energy:100,
          ratioSpeedEnergy:3,

          level:1,
          levelLastUpdate:0,
          distanceForLevelUpdate:1000,

          planeDefaultHeight:300,
          planeAmpHeight:80,
          planeAmpWidth:75,
          planeMoveSensivity:0.005,
          planeRotXSensivity:0.0008,
          planeRotZSensivity:0.0003,
          planeFallSpeed:.001,
          planeMinSpeed:0.6,
          planeMaxSpeed:0.8,
          planeSpeed:0,
          planeCollisionDisplacementX:0,
          planeCollisionSpeedX:0,

          planeCollisionDisplacementY:0,
          planeCollisionSpeedY:0,
          planeCollisionDisplacementZ:0,
          planeCollisionSpeedZs:0,

          missleSpeed:280,
          missileDistanceTolerance:20,

          seaRadius:2000,
          seaLength:2000,
          //seaRotationSpeed:0.006,
          wavesMinAmp : 5,
          wavesMaxAmp : 20,
          wavesMinSpeed : 0.001,
          wavesMaxSpeed : 0.003,

          cameraFarPos:500,
          cameraNearPos:150,
          cameraSensivity:0.002,

          coinDistanceTolerance:15,
          coinValue:3,
          coinsSpeed:.5,
          coinLastSpawn:0,
          distanceForCoinsSpawn:60,

          ennemyDistanceTolerance:10,
          ennemyValue:10,
          ennemiesSpeed:.6,
          ennemyLastSpawn:0,
          distanceForEnnemiesSpawn:20,
          enemyMissileDist:40,

          status : "playing",
         };
  // fieldLevel.innerHTML = Math.floor(game.level);
}

//THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer,
    container,
    controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0, z: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 50;
  nearPlane = .1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  // scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = -100;
  camera.position.z = 0;
  camera.position.y = game.planeDefaultHeight+200;
  camera.lookAt(new THREE.Vector3(0, game.planeDefaultHeight, 0));

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);

  /*
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = -Math.PI / 2;
  controls.maxPolarAngle = Math.PI ;

  //controls.noZoom = true;
  //controls.noPan = true;
  //*/
}

// MOUSE AND SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {z:tx, x:ty};
}

function handleTouchMove(event) {
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
    mousePos = {z:tx, x:ty};
}

function handleMouseUp(event){
  if (game.status == "waitingReplay"){
    // resetGame();
    // hideReplay();
    // window.location.reload();
    location.reload(true);
  }
}


function handleTouchEnd(event){
  if (game.status == "waitingReplay"){
    location.reload(true);
    // resetGame();
    // hideReplay();
  }
}

// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {
  
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
  
  ambientLight = new THREE.AmbientLight(0xdc8874, .5);
  
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(50, 350, 250);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;
  
  var ch = new THREE.CameraHelper(shadowLight.shadow.camera);
  
  //scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);
  
}

Sky = function(){
  this.mesh = new THREE.Object3D();
  this.nClouds = 50;
  this.clouds = [];
  var stepAngle = Math.PI*2 / this.nClouds;
  for(var i=0; i<this.nClouds; i++){
    var c = new Cloud();
    this.clouds.push(c);
    var a = stepAngle*i;
    var h = game.seaRadius + 50 + Math.random()*50;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = (Math.random()-0.5)*game.seaLength*2;
    c.mesh.rotation.z = a + Math.PI/2;
    var s = 1+Math.random()*2;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh);
  }
}

var missileModel, planeModel, enemyModel;

Sky.prototype.moveClouds = function(){
  for(var i=0; i<this.nClouds; i++){
    var c = this.clouds[i];
    c.rotate();
  }
  this.mesh.rotation.z += game.speed*deltaTime;
  
}

Sea = function(){
  var geom = new THREE.CylinderGeometry(game.seaRadius,game.seaRadius,game.seaLength,40,10);
  // geom = new THREE.Geometry().fromBufferGeometry(geom);
  // console.log(geom);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  // var utils = new THREE.BufferGeometryUtils();
  // geom = THREE.BufferGeometryUtils.mergeVertices(geom);
  // var l = geom.vertices.length;

  // this.waves = [];

  // for (var i=0;i<l;i++){
  //   var v = geom.vertices[i];
  //   //v.y = Math.random()*30;
  //   this.waves.push({y:v.y,
  //                    x:v.x,
  //                    z:v.z,
  //                    ang:Math.random()*Math.PI*2,
  //                    amp:game.wavesMinAmp + Math.random()*(game.wavesMaxAmp-game.wavesMinAmp),
  //                    speed:game.wavesMinSpeed + Math.random()*(game.wavesMaxSpeed - game.wavesMinSpeed)
  //                   });
  // };
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blueDark,
    transparent:false,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "waves";
  this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function (){
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    vprops.ang += vprops.speed*deltaTime;
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}

Cloud = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "cloud";
  var geom = new THREE.BoxGeometry(20,20,20);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.white,

  });

  //*
  var nBlocs = 3+Math.floor(Math.random()*3);
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = i*15;
    m.position.y = Math.random()*10;
    m.position.z = Math.random()*10;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    var s = .1 + Math.random()*.9;
    m.scale.set(s,s,s);
    this.mesh.add(m);
    m.castShadow = true;
    m.receiveShadow = true;

  }
}

Cloud.prototype.rotate = function(){
  var l = this.mesh.children.length;
  for(var i=0; i<l; i++){
    var m = this.mesh.children[i];
    m.rotation.z+= Math.random()*.005*(i+1);
    m.rotation.y+= Math.random()*.002*(i+1);
  }
}

Ennemy = function(){
  // let enemyLoader = new THREE.GLTFLoader();
  // var xx = 0;
  // enemyLoader.load('models/plane1.gltf', function(gltf){
  //   this.mesh = gltf.scene;
  //   this.mesh.scale.set(3.5, 3.5, 3.5);
  //   this.mesh.castShadow = true;
  //   this.mesh.receiveShadow = true;
  //   this.angle = 0;
  //   this.dist = 0;
  // }.bind(this));

  // console.log(enemyModel);
  this.mesh = enemyModel.clone();
  this.mesh.rotation.y = Math.PI;
  this.mesh.scale.set(3.5, 3.5, 3.5);
  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;
  this.angle = 0;
  this.dist = 0;

  // var geom = new THREE.TetrahedronGeometry(8,2);
  // var mat = new THREE.MeshPhongMaterial({
  //   color:Colors.red,
  //   shininess:0,
  //   specular:0xffffff,
  //   shading:THREE.FlatShading
  // });
  // this.mesh = new THREE.Mesh(geom,mat);
  // this.mesh.castShadow = true;
  // this.angle = 0;
  // this.dist = 0;
}

EnnemiesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.ennemiesInUse = [];
}

EnnemiesHolder.prototype.spawnEnnemies = function(){
  var nEnnemies = game.level;

  for (var i=0; i<nEnnemies; i++){
    var ennemy;
    if (ennemiesPool.length) {
      ennemy = ennemiesPool.pop();
    }else{
      ennemy = new Ennemy();
    }

    ennemy.angle = - (i*0.1);
    ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
    if(ennemy.mesh)
    {
      ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
      ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
      ennemy.mesh.position.z = (Math.random()-0.5)*200;

      this.mesh.add(ennemy.mesh);
    }
    this.ennemiesInUse.push(ennemy);

  }
  // for (var )
  // {
  //   ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
  //   ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
  //   ennemy.mesh.position.z = (Math.random()-0.5)*200;
  // }
}

EnnemiesHolder.prototype.rotateEnnemies = function(){
  for (var i=0; i<this.ennemiesInUse.length; i++){
    var ennemy = this.ennemiesInUse[i];

    if(!ennemy || !ennemy.mesh)
      continue;
    
    if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;
    
    ennemy.mesh.position.y = game.planeDefaultHeight;
    if(ennemy.mesh.position.x > 80)
    {
      ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;
      ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
    }
    else
    {
      if(!ennemy.direction)
        ennemy.direction = 1;
      ennemy.mesh.position.z += ennemy.direction;
      if(ennemy.mesh.position.z>=200 || ennemy.mesh.position.z<=-200)
        ennemy.direction *= -1;

      if(!ennemy.lastshoot)
        ennemy.lastshoot = 0;
      ennemy.lastshoot+=1;
      if(ennemy.lastshoot%game.enemyMissileDist==0)
      {
        var newmis = new Missile(ennemy.mesh.position.clone(),-1);
        newmis.type = -1;
        enemymissile.push(newmis);
      }
    }
    // ennemy.mesh.rotation.z += Math.random()*.1;
    // ennemy.mesh.rotation.y += Math.random()*.1;

    //var globalEnnemyPosition =  ennemy.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.ennemyDistanceTolerance){
      particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);

      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      game.planeCollisionSpeedX = 100 * diffPos.x / d;
      game.planeCollisionSpeedY = 100 * diffPos.y / d;
      ambientLight.intensity = 2;

      removeEnergy();
      i--;
    }else if (ennemy.angle > Math.PI){
      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      i--;
    }
    torem = []
    mymissile.forEach(missile => {
      if(missile.mesh)
      {
        var diffPos = missile.mesh.position.clone().sub(ennemy.mesh.position.clone());
        var d = diffPos.length();
        if (d<game.missileDistanceTolerance){
          // particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);
          torem.push(missile);
          ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
          this.mesh.remove(ennemy.mesh);
          // game.planeCollisionSpeedX = 100 * diffPos.x / d;
          // game.planeCollisionSpeedY = 100 * diffPos.y / d;
          // ambientLight.intensity = 2;
          addScore();
          i--;
        }
      }
    });
    torem.forEach(missile => {
      scene.remove(missile.mesh);
    });
  }
}

Particle = function(){
  var geom = new THREE.TetrahedronGeometry(3,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
  var _this = this;
  var _p = this.mesh.parent;
  this.mesh.material.color = new THREE.Color( color);
  this.mesh.material.needsUpdate = true;
  this.mesh.scale.set(scale, scale, scale);
  var targetX = pos.x + (-1 + Math.random()*2)*50;
  var targetY = pos.y + (-1 + Math.random()*2)*50;
  var speed = .6+Math.random()*.2;
  TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
  TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
  TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
      if(_p) _p.remove(_this.mesh);
      _this.mesh.scale.set(1,1,1);
      particlesPool.unshift(_this);
    }});
}

ParticlesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.particlesInUse = [];
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){

  var nPArticles = density;
  for (var i=0; i<nPArticles; i++){
    var particle;
    if (particlesPool.length) {
      particle = particlesPool.pop();
    }else{
      particle = new Particle();
    }
    this.mesh.add(particle.mesh);
    particle.mesh.visible = true;
    var _this = this;
    particle.mesh.position.y = pos.y;
    particle.mesh.position.x = pos.x;
    particle.explode(pos,color, scale);
  }
}


function loadMissileModel()
{
  let enemyLoader = new THREE.GLTFLoader();
  enemyLoader.load('models/missile.gltf', function(gltf){
    gltf.scene.traverse( function( node ) {
      if ( node.isMesh ) { node.castShadow = true; }
    } );
    missileModel = gltf.scene;
  }.bind(this));
}

function loadPlaneModel()
{
  let enemyLoader = new THREE.GLTFLoader();
  enemyLoader.load('models/plane1.gltf', function(gltf){
    planeModel = gltf.scene;
  }.bind(this));
}

function loadEnemyModel()
{
  let enemyLoader = new THREE.GLTFLoader();
  enemyLoader.load('models/enemy.gltf', function(gltf){
    gltf.scene.traverse( function( node ) {
      if ( node.isMesh ) { node.castShadow = true; }
    } );
    enemyModel = gltf.scene;
    // console.log(enemyModel);
    for (var i=0; i<10; i++){
      var ennemy = new Ennemy();
      ennemiesPool.push(ennemy);
    }
  }.bind(this));
}

Missile = function(pos,type){
  // let enemyLoader = new THREE.GLTFLoader();
  // enemyLoader.load('models/missile.gltf', function(gltf){
  //   this.mesh = gltf.scene;
  //   this.mesh.scale.set(20, 20, 20);
  //   this.mesh.rotation.y = Math.PI/2;
  //   if(type==-1)
  //     this.mesh.rotation.y = 3*Math.PI/2;
  //   this.mesh.castShadow = true;
  //   this.mesh.receiveShadow = true;
  //   // this.mesh.position.x = airplane.mesh.position.x;
  //   // this.mesh.position.y = airplane.mesh.position.y;
  //   // this.mesh.position.z = airplane.mesh.position.z;
  //   this.mesh.position.x = pos.x;
  //   this.mesh.position.y = pos.y;
  //   this.mesh.position.z = pos.z;
  //   // console.log(pos);
  //   scene.add(this.mesh);
  //   // this.mesh.
  // }.bind(this));

  this.mesh = missileModel.clone();
  this.mesh.scale.set(20, 20, 20);
  this.mesh.rotation.y = Math.PI/2;
  if(type==-1)
    this.mesh.rotation.y = 3*Math.PI/2;
  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;
  // this.mesh.position.x = airplane.mesh.position.x;
  // this.mesh.position.y = airplane.mesh.position.y;
  // this.mesh.position.z = airplane.mesh.position.z;
  this.mesh.position.x = pos.x;
  this.mesh.position.y = pos.y;
  this.mesh.position.z = pos.z;
  // console.log(pos);
  scene.add(this.mesh);

  // var geom = new THREE.TetrahedronGeometry(3,0);
  // var mat = new THREE.MeshPhongMaterial({
  //   color:0x009999,
  //   shininess:0,
  //   specular:0xffffff,
  //   shading:THREE.FlatShading
  // });
  // this.mesh = new THREE.Mesh(geom,mat);
  // this.mesh.castShadow = true;
  // this.mesh.receiveShadow = true;
  // this.mesh.position = pos;
  // scene.add(this.mesh);
}

Missile.prototype.move = function(){
  if(!this.mesh)
    return;
  this.mesh.position.x += game.speed*deltaTime*(this.type)*game.missleSpeed;
  if(this.type==-1)
  {
    console.log("yes");
    enemymissile.forEach(missile => {
      var diffPos = airplane.mesh.position.clone().sub(missile.mesh.position.clone());
      var d = diffPos.length();
      if (d<game.ennemyDistanceTolerance){
        particlesHolder.spawnParticles(airplane.mesh.position.clone(), 15, Colors.red, 3);
        game.planeCollisionSpeedX = 100 * diffPos.x / d;
        game.planeCollisionSpeedY = 100 * diffPos.y / d;
        ambientLight.intensity = 2;
        scene.remove(missile.mesh);
  
        removeEnergy();
      }
    });
  }
}

Coin = function(){
  var geom = new THREE.TetrahedronGeometry(5,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,

    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

CoinsHolder = function (nCoins){
  this.mesh = new THREE.Object3D();
  this.coinsInUse = [];
  this.coinsPool = [];
  for (var i=0; i<nCoins; i++){
    var coin = new Coin();
    this.coinsPool.push(coin);
  }
}

CoinsHolder.prototype.spawnCoins = function(){

  var nCoins = 10 + Math.floor(Math.random()*10);
  var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
  var amplitude = 10 + Math.round(Math.random()*10);
  var zControl = (Math.random()-0.5)/1.5, zControl2 = (Math.random()-0.5)*100;
  for (var i=0; i<nCoins; i++){
    var coin;
    if (this.coinsPool.length) {
      coin = this.coinsPool.pop();
    }else{
      coin = new Coin();
    }
    this.mesh.add(coin.mesh);
    this.coinsInUse.push(coin);
    coin.angle = - (i*0.02);
    coin.distance = d + Math.cos(i*.5)*amplitude;
    coin.mesh.position.z = zControl2 + Math.sin(coin.angle)*coin.distance*zControl;
    coin.mesh.position.y = game.planeDefaultHeight;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
  }
}

CoinsHolder.prototype.rotateCoins = function(){
  for (var i=0; i<this.coinsInUse.length; i++){
    var coin = this.coinsInUse[i];
    if (coin.exploding) continue;
    coin.angle += game.speed*deltaTime*game.coinsSpeed;
    if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
    // coin.mesh.position.z = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
    coin.mesh.rotation.z += Math.random()*.1;
    // coin.mesh.rotation.y += Math.random()*.1;

    //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(coin.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.coinDistanceTolerance){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      // particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
      addEnergy();
      addScore();
      i--;
    }else if (coin.angle > Math.PI){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      i--;
    }
  }
}


// 3D Models
var sea;
var airplane;
var mymissile;
var enemymissile;

// function loadGLTF() {
//   let balloonLoader = new THREE.GLTFLoader();

//   balloonLoader.load('models/plane1.gltf', (gltf) => {
//       Mesh = gltf.scene;
//       // Mesh.scale.set(0.2,0.2,0.2);
//       scene.add(Mesh);
//       Mesh.position.x = 0;
//       Mesh.position.y = 10;
//       Mesh.position.z = 15;
//   });
// }

Airplanen = function(){
  let airplaneLoader = new THREE.GLTFLoader();
  airplaneLoader.load('models/plane1.gltf', function(gltf){
    gltf.scene.traverse( function( node ) {
      if ( node.isMesh ) { node.castShadow = true; }
    } );
    this.mesh = gltf.scene;
    this.mesh.scale.set(3.5, 3.5, 3.5);
    this.mesh.position.y = game.planeDefaultHeight;
    this.mesh.rotation.y = 3.141;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }.bind(this));
  // this.mesh = planeModel.clone();
  // this.mesh.scale.set(3.5, 3.5, 3.5);
  // this.mesh.position.y = game.planeDefaultHeight;
  // this.mesh.rotation.y = 3.141;
  // this.mesh.castShadow = true;
  // this.mesh.receiveShadow = true;
  // scene.add(this.mesh);
}

function createPlane(){
  airplane = new Airplanen();

  // let airplaneLoader = new THREE.GLTFLoader();
  // airplaneLoader.load('models/plane1.gltf', airplane = function(gltf){
  //     // airplane = gltf;
  //     this.mesh = gltf.scene;
  //     this.mesh.scale.set(0.2,0.2,0.2);
  //     scene.add(this.mesh);
  //     this.mesh.position.x = 0;
  //     this.mesh.position.y = game.planeDefaultHeights;
  //     this.mesh.position.z = 0;
  // });
  // console.log(airplane)
}

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -game.seaRadius;
  scene.add(sea.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -game.seaRadius;
  scene.add(sky.mesh);
}

function createCoins(){

  coinsHolder = new CoinsHolder(20);
  scene.add(coinsHolder.mesh)
}

function createEnnemies(){
  // for (var i=0; i<10; i++){
  //   var ennemy = new Ennemy();
  //   ennemiesPool.push(ennemy);
  // }
  ennemiesHolder = new EnnemiesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(ennemiesHolder.mesh)
}

function createParticles(){
  for (var i=0; i<10; i++){
    var particle = new Particle();
    particlesPool.push(particle);
  }
  particlesHolder = new ParticlesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(particlesHolder.mesh)
}

function loop(){

  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;

  if (game.status=="playing"){

    // Add energy coins every 100m;
    if (Math.floor(game.distance)%game.distanceForCoinsSpawn == 0 && Math.floor(game.distance) > game.coinLastSpawn){
      game.coinLastSpawn = Math.floor(game.distance);
      coinsHolder.spawnCoins();
    }

    if (Math.floor(game.distance)%game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate){
      game.speedLastUpdate = Math.floor(game.distance);
      game.targetBaseSpeed += game.incrementSpeedByTime*deltaTime;
    }


    if (Math.floor(game.distance)%game.distanceForEnnemiesSpawn == 0 && Math.floor(game.distance) > game.ennemyLastSpawn){
      game.ennemyLastSpawn = Math.floor(game.distance);
      ennemiesHolder.spawnEnnemies();
    }

    if (Math.floor(game.distance)%game.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate){
      game.levelLastUpdate = Math.floor(game.distance);
      game.level++;
      // fieldLevel.innerHTML = Math.floor(game.level);

      game.targetBaseSpeed = game.initSpeed + game.incrementSpeedByLevel*game.level
    }


    updatePlane();
    updateDistance();
    updateEnergy();
    updateMissiles();
    game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
    game.speed = game.baseSpeed * game.planeSpeed;

  }else if(game.status=="gameover"){
    game.speed *= .99;
    airplane.mesh.rotation.z += (-Math.PI/2 - airplane.mesh.rotation.z)*.0002*deltaTime;
    airplane.mesh.rotation.x += 0.0003*deltaTime;
    game.planeFallSpeed *= 1.05;
    airplane.mesh.position.y -= game.planeFallSpeed*deltaTime;

    if (airplane.mesh.position.y <-200){
      showReplay();
      game.status = "waitingReplay";

    }
  }else if (game.status=="waitingReplay"){

  }


  // airplane.propeller.rotation.x +=.2 + game.planeSpeed * deltaTime*.005;
  sea.mesh.rotation.z += game.speed*deltaTime;//*game.seaRotationSpeed;

  if ( sea.mesh.rotation.z > 2*Math.PI)  sea.mesh.rotation.z -= 2*Math.PI;

  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;

  coinsHolder.rotateCoins();
  ennemiesHolder.rotateEnnemies();

  sky.moveClouds();
  // sea.moveWaves();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function updateDistance(){
  game.distance += game.speed*deltaTime*game.ratioSpeedDistance;
  fieldDistance.innerHTML = Math.floor(game.score);
  energyVal.innerHTML = Math.floor(game.energy);
  var d = 502*(1-(game.distance%game.distanceForLevelUpdate)/game.distanceForLevelUpdate);
  // levelCircle.setAttribute("stroke-dashoffset", d);

}

var blinkEnergy=false;

function updateEnergy(){
  game.energy -= game.speed*deltaTime*game.ratioSpeedEnergy;
  game.energy = Math.max(0, game.energy);
  // energyBar.style.right = (100-game.energy)+"%";
  // energyBar.style.backgroundColor = (game.energy<50)? "#f25346" : "#68c3c0";

  // if (game.energy<30){
  //   energyBar.style.animationName = "blinking";
  // }else{
  //   energyBar.style.animationName = "none";
  // }

  if (game.energy <1){
    game.status = "gameover";
  }
}

function addScore(){
  game.score += game.coinValue;
}

function addEnergy(){
  game.energy += game.coinValue;
  game.energy = Math.min(game.energy, 100);
}

function removeEnergy(){
  game.energy -= game.ennemyValue;
  game.energy = Math.max(0, game.energy);
}

function updateMissiles(){
  mymissile.forEach(missile => {
    if(missile.mesh)
    {
      missile.move();
    }
  });
  enemymissile.forEach(missile => {
    if(missile.mesh)
      missile.move();
  });
}

function updatePlane(){
  if(!airplane.mesh)
    return;
  game.planeSpeed = normalize(mousePos.x,-.5,.5,game.planeMinSpeed, game.planeMaxSpeed);
  // var targetY = normalize(mousePos.y,-.75,.75,game.planeDefaultHeight-game.planeAmpHeight, game.planeDefaultHeight+game.planeAmpHeight);
  var targetZ = normalize(mousePos.z,-.75,.75,-150, 150);
  var targetX = normalize(-mousePos.x,-1,1,-game.planeAmpWidth*.4, -game.planeAmpWidth);

  game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
  targetX += game.planeCollisionDisplacementX;

  // game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
  // targetY += game.planeCollisionDisplacementY;

  airplane.mesh.position.z += (targetZ-airplane.mesh.position.z)*deltaTime*game.planeMoveSensivity;
  // airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*deltaTime*game.planeMoveSensivity;
  airplane.mesh.position.x += (targetX-airplane.mesh.position.x)*deltaTime*game.planeMoveSensivity;

  // airplane.mesh.rotation.z = (targetZ-airplane.mesh.position.z)*deltaTime*game.planeRotXSensivity;
  airplane.mesh.rotation.x = -(airplane.mesh.position.z-targetZ)*deltaTime*game.planeRotZSensivity;

  // var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
  // camera.fov = normalize(mousePos.x,-1,1,40, 80);
  // camera.updateProjectionMatrix ()
  // camera.position.y += (airplane.mesh.position.y - camera.position.y)*deltaTime*game.cameraSensivity;

  game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
  game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
  game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
  game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;

  airplane.mesh.children[2].children[2].rotation.y += 0.4

  // airplane.pilot.updateHairs();
}

function showReplay(){
  replayMessage.style.display="block";
}

function hideReplay(){
  replayMessage.style.display="none";
}

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

var fieldDistance, energyVal, replayMessage, fieldLevel, levelCircle;

function logKey(e) {
  var miss = new Missile(airplane.mesh.position.clone(),1);
  console.log();
  miss.type = 1;
  // miss.mesh.position.x = airplane.mesh.position.x;
  // miss.mesh.position.y = airplane.mesh.position.y;
  // miss.mesh.position.z = airplane.mesh.position.z;
  // scene.add(miss.mesh);
  mymissile.push(miss);
}

function loadModels(){
  loadPlaneModel();
  loadMissileModel();
  loadEnemyModel();
}

function init(event){

  // UI

  fieldDistance = document.getElementById("distValue");
  energyVal = document.getElementById("energyValue");
  replayMessage = document.getElementById("replayMessage");
  // fieldLevel = document.getElementById("levelValue");
  // levelCircle = document.getElementById("levelCircleStroke");

  loadModels();
  resetGame();
  createScene();

  createLights();
  createPlane();
  createSea();
  createSky();
  createCoins();
  createEnnemies();
  createParticles();
  mymissile = [];
  enemymissile = [];

  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchend', handleTouchEnd, false);
  // document.addEventListener('keypress', logKey, false);
  document.onkeypress = logKey;

  loop();
}

window.addEventListener('load', init, false);
