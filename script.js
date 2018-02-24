var THREE = window.THREE;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var dog = null;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xFFFFFF);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var loader = new THREE.GLTFLoader();

loader.load(
  // resource URL
  'https://cdn.glitch.com/c03493ab-dd08-4537-a1ff-7a40876e881f%2Fwt.glb?1519484412264',
  // called when the resource is loaded
  function ( gltf ) {
    scene.add( gltf.scene );
    dog = scene.getObjectByName("Root_Wurstgang");
    dog.position.z = -10
    dog.position.y = 0
    var mesh = dog.getObjectByName("Mesh");
    // set dog material
    var unlit = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      map: mesh.material.map
    });
    mesh.material = unlit;
    dog.rotateY(3.14159);
    console.log(scene.getObjectByName("ArmL_0"))
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

function animate() {
  if (dog) {
    // dog.rotateY(-0.001);
    // scene.getObjectByName("ArmL-0")
  }
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();