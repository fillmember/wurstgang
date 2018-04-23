var THREE = window.THREE;
var raycaster = new THREE.Raycaster();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 22, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( - 20, 2, - 20 );
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x1B8547 );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 0, 1, 0.5 );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.autoRotate = true;
controls.autoRotateSpeed = 0.033;
controls.enableDamping = true;
controls.rotateSpeed = 0.3;
controls.dampingFactor = 0.1;
controls.enablePan = false;
controls.enableZoom = false;

var dog, skele, bones;
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
var pose = {

	rest( lerp = 0.001 ) {

		const x = - 310;

		bones[ boneID.Pelvis ].position.y = THREE.Math.lerp( bones[ boneID.Pelvis ].position.y, x, lerp );
		bones[ boneID.Pelvis ].rotation.x = THREE.Math.lerp( bones[ boneID.Pelvis ].rotation.x, 0.125, lerp );

		var a = 0.7; // leg turning forward
		var ay = 0.45;
		var pz = 1;

		bones[ boneID.LegL_0 ].position.z = THREE.Math.lerp( bones[ boneID.LegL_0 ].position.z, pz, lerp );
		bones[ boneID.LegR_0 ].position.z = THREE.Math.lerp( bones[ boneID.LegR_0 ].position.z, pz, lerp );
		bones[ boneID.LegL_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegL_0 ].rotation.x, a, lerp );
		bones[ boneID.LegR_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegR_0 ].rotation.x, a, lerp );
		bones[ boneID.LegL_0 ].rotation.y = THREE.Math.lerp( bones[ boneID.LegL_0 ].rotation.y, ay, lerp );
		bones[ boneID.LegR_0 ].rotation.y = THREE.Math.lerp( bones[ boneID.LegR_0 ].rotation.y, - ay, lerp );

		var b = - 2;
		var by = 0.5;

		bones[ boneID.LegL_1 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegL_1 ].rotation.x, b, lerp );
		bones[ boneID.LegR_1 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegR_1 ].rotation.x, b, lerp );
		bones[ boneID.LegL_1 ].rotation.y = THREE.Math.lerp( bones[ boneID.LegL_1 ].rotation.y, by, lerp );
		bones[ boneID.LegR_1 ].rotation.y = THREE.Math.lerp( bones[ boneID.LegR_1 ].rotation.y, - by, lerp );

		var cx = - 1.1;
		var cy = 0.25;

		bones[ boneID.LegL_2 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegL_2 ].rotation.x, cx, lerp );
		bones[ boneID.LegR_2 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegR_2 ].rotation.x, cx, lerp );
		bones[ boneID.LegL_2 ].rotation.y = THREE.Math.lerp( bones[ boneID.LegL_2 ].rotation.y, cy, lerp );
		bones[ boneID.LegR_2 ].rotation.y = THREE.Math.lerp( bones[ boneID.LegR_2 ].rotation.y, - cy, lerp );

		var dx = 0;

		bones[ boneID.LegL_3 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegL_3 ].rotation.x, dx, lerp );
		bones[ boneID.LegR_3 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegR_3 ].rotation.x, dx, lerp );

		var e = - 0.25;

		bones[ boneID.ArmL_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.ArmL_0 ].rotation.x, e, lerp );
		bones[ boneID.ArmR_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.ArmR_0 ].rotation.x, e, lerp );

		var f = 0;

		bones[ boneID.ArmL_2 ].rotation.x = THREE.Math.lerp( bones[ boneID.ArmL_2 ].rotation.x, f, lerp );
		bones[ boneID.ArmR_2 ].rotation.x = THREE.Math.lerp( bones[ boneID.ArmR_2 ].rotation.x, f, lerp );

	},

	reset( lerp = 1 ) {

		bones.forEach( b=>{

			b.quaternion.slerp( b.userData.original.quaternion, lerp );
			b.position.lerp( b.userData.original.position, lerp );

		} );

	},

	vleg( lerp = 1 ) {

		var a = - 1.335; // leg turns towards belly
		var b = - 0.35; // body incline -- Pelvis
		var b2 = b * - 0.5; // body incline -- Shoulder
		var c = 0.3; // arm outward reach
		var d = - 0.65; // arm forward reach
		var e = 0.5; // elbow rotation
		var f = - 0.8; // paw upward rotation
		var g = - 0.2; // paw tilt

		bones[ boneID.Pelvis ].position.y = THREE.Math.lerp( bones[ boneID.Pelvis ].position.y, - 45.3435, lerp );
		bones[ boneID.LegL_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegL_0 ].rotation.x, a, lerp );
		bones[ boneID.LegR_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.LegR_0 ].rotation.x, a, lerp );
		bones[ boneID.Pelvis ].rotation.x = THREE.Math.lerp( bones[ boneID.Pelvis ].rotation.x, b, lerp );
		bones[ boneID.Shoulder ].rotation.x = THREE.Math.lerp( bones[ boneID.Shoulder ].rotation.x, b2, lerp );
		bones[ boneID.ArmL_0 ].rotation.y = THREE.Math.lerp( bones[ boneID.ArmL_0 ].rotation.y, c, lerp );
		bones[ boneID.ArmR_0 ].rotation.y = THREE.Math.lerp( bones[ boneID.ArmR_0 ].rotation.y, - c, lerp );
		bones[ boneID.ArmL_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.ArmL_0 ].rotation.x, d, lerp );
		bones[ boneID.ArmR_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.ArmR_0 ].rotation.x, d, lerp );
		bones[ boneID.ArmL_1 ].rotation.z = THREE.Math.lerp( bones[ boneID.ArmL_1 ].rotation.z, e, lerp );
		bones[ boneID.ArmR_1 ].rotation.z = THREE.Math.lerp( bones[ boneID.ArmR_1 ].rotation.z, - e, lerp );
		bones[ boneID.ArmL_2 ].rotation.x = THREE.Math.lerp( bones[ boneID.ArmL_2 ].rotation.x, f, lerp );
		bones[ boneID.ArmR_2 ].rotation.x = THREE.Math.lerp( bones[ boneID.ArmR_2 ].rotation.x, f, lerp );
		bones[ boneID.ArmL_2 ].rotation.z = THREE.Math.lerp( bones[ boneID.ArmL_2 ].rotation.z, g, lerp );
		bones[ boneID.ArmR_2 ].rotation.z = THREE.Math.lerp( bones[ boneID.ArmR_2 ].rotation.z, - g, lerp );

	},

	openMouth( lerp = 1 ) {

		bones[ boneID.JawL_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.JawL_0 ].rotation.x, - 1.0, lerp );
		bones[ boneID.JawU_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.JawU_0 ].rotation.x, - 0.1, lerp );
		constraints[ 4 ].offset.x = THREE.Math.lerp( constraints[ 4 ].offset.x, 0.1, lerp );

	},

	closeMouth( lerp = 1 ) {

		bones[ boneID.JawL_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.JawL_0 ].rotation.x, - 0.25, lerp );
		bones[ boneID.JawU_0 ].rotation.x = THREE.Math.lerp( bones[ boneID.JawU_0 ].rotation.x, - 0.22, lerp );
		constraints[ 4 ].offset.x = THREE.Math.lerp( constraints[ 4 ].offset.x, - 0.1, lerp );

	}
};
var constraints = [
	{
		bone: boneID.Pelvis,
		min: new THREE.Vector3( - 0.3, - 0.4, - 0.0 ),
		max: new THREE.Vector3( 0.3, 0.4, 0.0 ),
	},
	{
		bone: boneID.Spine,
		min: new THREE.Vector3( - 0.3, - 0.4, - 0.0 ),
		max: new THREE.Vector3( 0.3, 0.4, 0.0 ),
	},
	{
		bone: boneID.Shoulder,
		min: new THREE.Vector3( - 0.3, - 0.4, - 0.2 ),
		max: new THREE.Vector3( 0.3, 0.4, 0.2 ),
	},
	{
		bone: boneID.Neck,
		min: new THREE.Vector3( - 0.5, - 0.8, - 0.7 ),
		max: new THREE.Vector3( 0.5, 0.8, 0.7 ),
	},
	{
		bone: boneID.Head,
		min: new THREE.Vector3( - 0.3, - 0.1, - 0.3 ),
		max: new THREE.Vector3( 0.3, 0.1, 0.3 ),
		offset: new THREE.Vector3( - 0.1, 0, 0 )
	},
];

var loader = new THREE.GLTFLoader();
loader.load(
	'./wt.glb',
	// 'https://cdn.glitch.com/c03493ab-dd08-4537-a1ff-7a40876e881f%2Fwt.glb?1519729859002',
	function ( gltf ) {

		scene = gltf.scene;
		// floor = new THREE.Mesh( new THREE.PlaneGeometry( 8, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xFFFFFF, side: THREE.DoubleSide } ) ); // 0x1B8547
		// floor.position.y = - 4.1;
		// floor.rotateX( Math.PI / - 2 );
		// scene.add( floor );
		scene.add( light );
		dog = scene.getObjectByName( "Mesh" );
		dog.position.y = - 0.4;
		skele = dog.skeleton;
		bones = skele.bones;
		bones.forEach( b=>{

			b.userData.original = {
				position: b.position.clone(),
				quaternion: b.quaternion.clone()
			};

		} );

		// Correct material
		dog.material.map.encoding = THREE.LinearEncoding;
		var mat = new THREE.MeshLambertMaterial( {
			color: 0x444444,
			map: dog.material.map,
			skinning: true,
			emissive: 0xFFFFFF,
			emissiveMap: dog.material.map,
			// side: THREE.BackSide
		} );
		dog.material = mat;

		// scene.add( new THREE.SkeletonHelper( dog ) );

		// IK
		scene.updateMatrixWorld();
		iks.head = new THREE.FABRIK( [
			bones[ boneID.Neck ],
			bones[ boneID.Head ]
		] );

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

		// calculate target
		iks.head.refs.target.position.lerp(
			camera.position.clone().add(
				new THREE.Vector3(
					mouse.x * 5 * camera.aspect,
					mouse.y * 5,
					- 25
				).applyQuaternion( camera.quaternion )
			),
			0.1
		);

		const v = new THREE.Vector3().subVectors( iks.head.target, iks.head.joints[ 0 ] );
		const v2 = new THREE.Vector3().subVectors( iks.head.target, bones[ boneID.Spine ].getWorldPosition() );
		const dBody = Math.min( v2.length(), v.length() );

		// neck-head IK
		iks.head.refresh();
		iks.head.solve();
		iks.head.apply( THREE.Math.clamp( THREE.Math.mapLinear( dBody, 1, 10, 0.2, 0 ), 0, 0.2 ) );

		// Bone limits
		constraints.forEach( set=>{

			const bone = bones[ set.bone ];

			if ( set.min ) {

				const min = set.min;
				bone.rotation.x = Math.max( min.x, bone.rotation.x );
				bone.rotation.y = Math.max( min.y, bone.rotation.y );
				bone.rotation.z = Math.max( min.z, bone.rotation.z );

			}
			if ( set.max ) {

				const max = set.max;
				bone.rotation.x = Math.min( max.x, bone.rotation.x );
				bone.rotation.y = Math.min( max.y, bone.rotation.y );
				bone.rotation.z = Math.min( max.z, bone.rotation.z );

			}
			if ( set.offset ) {

				const o = set.offset;
				bone.rotateX( o.x );
				bone.rotateY( o.y );
				bone.rotateZ( o.z );

			}

		} );

		if ( mouse.isDown && dBody < 6 ) {

			pose.openMouth( 0.35 );

		}

		if ( v.y < - 0.5 && v.z < 1 && v.length() < 5 ) {

			pose.vleg( 0.10 );

		} else if ( v.y > 0.7 ) {

			pose.reset( 0.1 );

		}

		let waggingAmount = THREE.Math.clamp( THREE.Math.mapLinear( dBody, 3, 9, 1, 0 ), 0, 1 );
		let waggingTimeFactor = 1;

		if ( mouse.isDown ) {

			// raycast
			raycaster.setFromCamera( mouse, camera );
			const intersects = raycaster.intersectObject( dog, true );
			const intersect = intersects[ 0 ];

			if ( intersect ) {

				const p = intersect.point;

				if ( bones[ boneID.Tail_2 ].getWorldPosition().distanceTo( p ) < 3 ) {

					waggingAmount *= 1.8;
					waggingTimeFactor *= 1.8;

				}

				if ( bones[ boneID.EarL_0 ].getWorldPosition().distanceTo( p ) < 1 ) {

					bones[ boneID.EarL_0 ].rotation.y = 0.596 + THREE.Math.degToRad( Math.cos( time * 4 ) * 10 );

				} else if ( bones[ boneID.EarR_0 ].getWorldPosition().distanceTo( p ) < 1 ) {

					bones[ boneID.EarR_0 ].rotation.y = - 0.596 - THREE.Math.degToRad( Math.cos( time * 4 ) * 10 );

				}

			}

		} else {

			pose.closeMouth( 0.35 );

		}

		// Wagging
		bones[ boneID.Tail_0 ].rotation.y = THREE.Math.lerp( bones[ boneID.Tail_0 ].rotation.y, THREE.Math.degToRad( Math.sin( time * waggingTimeFactor ) * 5 * waggingAmount ), 0.2 );
		bones[ boneID.Tail_1 ].rotation.y = THREE.Math.lerp( bones[ boneID.Tail_1 ].rotation.y, THREE.Math.degToRad( Math.sin( time * waggingTimeFactor ) * - 20 * waggingAmount ), 0.2 );
		bones[ boneID.Tail_2 ].rotation.y = THREE.Math.lerp( bones[ boneID.Tail_2 ].rotation.y, THREE.Math.degToRad( Math.sin( time * waggingTimeFactor ) * - 30 * waggingAmount ), 0.2 );

	}
	controls.update();
	renderer.render( scene, camera );
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
var mouse = { x: 0, y: 0, isDown: false };
window.addEventListener( "mousemove", function ( evt ) {

	mouse.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( evt.clientY / window.innerHeight ) * 2 + 1;

} );
window.addEventListener( "mousedown", function ( evt ) {

	mouse.isDown = true;

} );
window.addEventListener( "mouseup", function ( evt ) {

	mouse.isDown = false;

} );
window.addEventListener( "touchstart", function ( evt ) {

	mouse.isDown = true;

} );
window.addEventListener( "touchend", function ( evt ) {

	mouse.isDown = false;

} );
window.addEventListener( "mouseout", function ( evt ) {

	mouse.isDown = false;

} );
