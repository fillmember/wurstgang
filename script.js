var THREE = window.THREE;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0 , 0 , 10 );
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x248B4D );
renderer.setSize( window.innerWidth , window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.PointLight( 0xFF0000 , 1 , 100 ); // soft white light
light.position.set(50,50,50);
scene.add( light );

var controls = new THREE.OrbitControls( camera , renderer.domElement );
controls.autoRotate = true
controls.autoRotateSpeed = 0.1
controls.enableDamping = true
controls.rotateSpeed = 0.3
controls.dampingFactor = 0.1
controls.enablePan = false
controls.enableZoom = false
controls.minPolarAngle = 0.15;
controls.maxPolarAngle = 3.0;

var dog,skele,bones;

var loader = new THREE.GLTFLoader();
loader.load(
  'https://cdn.glitch.com/c03493ab-dd08-4537-a1ff-7a40876e881f%2Fwt.glb?1519485752419',
  function ( gltf ) {
    scene = gltf.scene;
    dog = scene.getObjectByName("Mesh");
    dog.position.y = -0.5;
    skele = dog.skeleton
    bones = skele.bones
    // set an unlit material
    // var unlit = new THREE.MeshBasicMaterial({
    //   color: 0xFFFFFF,
    //   map: dog.material.map,
    //   skinning: true
    // });
    
    dog.material.map.encoding = THREE.LinearEncoding

    var unlit = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      map: dog.material.map,
      skinning: true,
      emissive: 0x333333,
      emissiveMap: dog.material.map
    })
    dog.material = unlit;
    
    // Pose Init
    // init a very cute pose
    dog.rotateY(3*0.75)
    bones[5].rotateY(3/8)
    bones[6].rotateY(1/8)
    bones[8].rotateY(3/4)
  },
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  function ( error ) {
    console.log( 'An error happened' , error );
  }
);

// onEnterFrame

function animate() {
  var time = Date.now() * 0.01;
  if (dog) {
    // Wagging
    bones[1].rotation.y = THREE.Math.degToRad( Math.sin(time) * 5 )
    bones[2].rotation.y = THREE.Math.degToRad( Math.sin(time) * -20 )
    bones[3].rotation.y = THREE.Math.degToRad( Math.sin(time) * -30 )
  }
  controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene , camera );
}
animate();

// resize

window.addEventListener("resize",function(){
  camera.ratio = window.innerWidth / window.innerHeight
  renderer.setSize( window.innerWidth , window.innerHeight );
})