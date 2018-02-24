var THREE = window.THREE;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var dog,skele;

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x248B4D);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls( camera, renderer.domElement );

var loader = new THREE.GLTFLoader();

loader.load(
  // resource URL
  'https://cdn.glitch.com/c03493ab-dd08-4537-a1ff-7a40876e881f%2Fwt.glb?1519485752419',
  // called when the resource is loaded
  function ( gltf ) {
    scene = gltf.scene;
    dog = scene.getObjectByName("Mesh");
    skele = dog.skeleton
    // set dog material
    var unlit = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      map: dog.material.map,
      skinning: true
    });
    unlit.map.encoding = THREE.LinearEncoding
    unlit.needsUpdate = true;
    dog.material = unlit;
    //
    dog.rotateY(0);
    // Skele Helper
    // var helper = new THREE.SkeletonHelper( dog );
    // helper.material.linewidth = 3;
    // scene.add( helper );
  },
  // called when loading is in progresses
  function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

  },
  // called when loading has errors
  function ( error ) {

    console.log( 'An error happened' , error );

  }
);

camera.position.set( 0, 4, 15 );

function animate() {
  var time = Date.now() * 0.01;
  if (dog) {

    skele.bones[1].rotation.y = THREE.Math.degToRad( Math.sin(time) * 10 )
    skele.bones[2].rotation.y = THREE.Math.degToRad( Math.sin(time) * -20 )
    skele.bones[3].rotation.y = THREE.Math.degToRad( Math.sin(time) * -30 )

  }
  controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();