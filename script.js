var THREE = window.THREE;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 22, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0, 2, - 30 );
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x1B8547 );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 0, 1, 0.5 );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
// controls.autoRotate = true;
// controls.autoRotateSpeed = 0.033;
controls.enableDamping = true;
controls.rotateSpeed = 0.3;
controls.dampingFactor = 0.1;
controls.enablePan = false;
controls.enableZoom = false;

function smoothMove( current, target ) {

	return current + ( target - current ) * 0.1;

}

var dog, skele, bones, headTarget;
var iks = {};

var boneID = {
	"Pelvis": 0,
	"Tail_0": 1, "Tail_1": 2, "Tail_2": 3, "Tail_3": 4,
	"Spine": 5,
	"Shoulder": 6, "Neck": 7, "Head": 8,
	"JawU_0": 9, "JawU_1": 10,
	"JawL_0": 11, "JawL_1": 12,
	"EarL_0": 13, "EarL_1": 14,
	"EarR_0": 15, "EarR_1": 16,
	"ArmL_0": 17, "ArmL_1": 18, "ArmL_2": 19, "ArmL_3": 20,
	"ArmR_0": 21, "ArmR_1": 22, "ArmR_2": 23, "ArmR_3": 24,
	"LegL_0": 25, "LegL_1": 26, "LegL_2": 27, "LegL_3": 28, "LegL_4": 29,
	"LegR_0": 30, "LegR_1": 31, "LegR_2": 32, "LegR_3": 33, "LegR_4": 34
};

var loader = new THREE.GLTFLoader();
loader.load(
	'./wt.glb',
	function ( gltf ) {

		scene = gltf.scene;
		scene.add( light );
		dog = scene.getObjectByName( "Mesh" );
		dog.position.y = - 0.4;
		skele = dog.skeleton;
		bones = skele.bones;
		// Correct material
		dog.material.map.encoding = THREE.LinearEncoding;
		var mat = new THREE.MeshLambertMaterial( {
			color: 0x444444,
			map: dog.material.map,
			skinning: true,
			emissive: 0xFFFFFF,
			emissiveMap: dog.material.map,
			// side: THREE.BackSide,
			// wireframe: true
		} );
		dog.material = mat;

		// LEG IK?
		scene.updateMatrixWorld();

		iks.head = new THREE.FABRIK( [
			bones[ boneID.Neck ],
			bones[ boneID.Head ]
		], null );
		// iks.head.visualize( scene );

	},
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	function ( error ) {

		console.log( 'An error happened', error );

	}
);

// onEnterFrame

function animate() {

	var time = Date.now() * 0.01;
	if ( dog ) {

		// Wagging
		bones[ 1 ].rotation.y = THREE.Math.degToRad( Math.sin( time ) * 5 );
		bones[ 2 ].rotation.y = THREE.Math.degToRad( Math.sin( time ) * - 20 );
		bones[ 3 ].rotation.y = THREE.Math.degToRad( Math.sin( time ) * - 30 );
		//

		iks.head.refs.target.position.lerp(
			camera.position.clone().add(
				new THREE.Vector3(
					mousePosition.x * 5 * camera.aspect,
					mousePosition.y * 5,
					- 25
				).applyQuaternion( camera.quaternion )
			),
			0.1
		);

		iks.head.solve();
		// iks.head.visualize();
		iks.head.apply();
		bones[ boneID.Head ].rotateX( - 0.05 );

	}
	controls.update();
	renderer.render( scene, camera );
	//
	requestAnimationFrame( animate );

}
animate();

// resize

window.addEventListener( "resize", function () {

	var w = window.innerWidth;
	var h = window.innerHeight;
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
	renderer.setSize( w, h );

} );

// mouse
var mousePosition = { x: 0, y: 0 };
window.addEventListener( "mousemove", function ( evt ) {

	mousePosition.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
	mousePosition.y = - ( evt.clientY / window.innerHeight ) * 2 + 1;

} );
