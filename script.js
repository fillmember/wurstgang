var THREE = window.THREE;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 22, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0 , 0 , 30 );
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x1B8547 );
renderer.setSize( window.innerWidth , window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set(0,1,0.5)

var controls = new THREE.OrbitControls( camera , renderer.domElement );
controls.autoRotate = true
controls.autoRotateSpeed = 0.033
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
    scene.add(light);
    dog = scene.getObjectByName("Mesh");
    dog.position.y = -0.4;
    skele = dog.skeleton
    bones = skele.bones
    // Correct material
    dog.material.map.encoding = THREE.LinearEncoding
    var mat = new THREE.MeshLambertMaterial({
      color: 0x444444,
      map: dog.material.map,
      skinning: true,
      emissive: 0xFFFFFF,
      emissiveMap: dog.material.map
    })
    dog.material = mat;
    // Pose Init
    // init a very cute pose
    dog.rotateY(3*0.66)
    bones[5].rotateY(3/8)
    bones[6].rotateY(1/8)
    bones[7].rotation.z = -0.1
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
    // Looking
    
  }
  //
  controls.update();
	renderer.render( scene , camera );
  //
	requestAnimationFrame( animate );
}
animate();

// resize

window.addEventListener("resize",function(){
  var w = window.innerWidth
  var h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize( w , h );
})

// mouse
var mousePosition = {x:0,y:0};
window.addEventListener("mousemove",function(evt){

  mousePosition.x = (evt.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(evt.clientY / window.innerHeight) * 2 + 1;
  
  // camera.position + camera.

})