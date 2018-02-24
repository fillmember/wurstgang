var THREE = window.THREE;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var dog,mesh,skele;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xFFFFFF);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var loader = new THREE.GLTFLoader();

loader.load(
  // resource URL
  'https://cdn.glitch.com/c03493ab-dd08-4537-a1ff-7a40876e881f%2Fwt.glb?1519485752419',
  // called when the resource is loaded
  function ( gltf ) {
    scene = gltf.scene;
    dog = scene.getObjectByName("Mesh");
    dog.position.z = -7
    dog.position.y = 0
    mesh = dog.getObjectByName("Mesh");
    skele = mesh.skeleton
    // set dog material
    var unlit = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      map: mesh.material.map
    });
    unlit.map.encoding = THREE.LinearEncoding
    unlit.needsUpdate = true;
    mesh.material = unlit;
    dog.rotateY(3.14159);
    // Skele Helper
    var helper = new THREE.SkeletonHelper( mesh );
    helper.material.linewidth = 3;
    scene.add( helper );
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

    dog.rotateY(-0.003);

  }
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();