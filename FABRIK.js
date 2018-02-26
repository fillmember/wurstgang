// ref: http://wiki.roblox.com/index.php?title=Inverse_kinematics#FABRIK

class FABRIK {

	constructor( jointsRef, targetRef, options = {} ) {

		const isTargetRefNull = targetRef === null || targetRef === undefined;
		if ( isTargetRefNull ) {

			targetRef = new THREE.Object3D();
			targetRef.position.copy(
				jointsRef[ jointsRef.length - 1 ].getWorldPosition()
			);

		}

		const _joints = jointsRef.map( ( j )=>{

			const pos = j.getWorldPosition();
			const obj = new THREE.Vector3().copy( pos );
			return obj;

		} );

		const _target = targetRef.getWorldPosition();

		const lengths = _joints.reduce( ( carry, v1, idx, arr )=>{

			const v0 = arr[ idx - 1 ];
			if ( v0 ) {

				carry.push( v1.distanceTo( v0 ) );

			}

			return carry;

		}, [] );

		this.refs = {};
		this.refs.target = targetRef;
		this.refs.joints = jointsRef;
		this.refs.visualizers = _joints.map( j=>{

			const obj = new THREE.AxesHelper( 1 );
			obj.position.copy( j );
			return obj;

		} );
		const _targetVis = new THREE.AxesHelper( 2 );
		_targetVis.position.copy( _target );
		this.refs.visualizers.push( _targetVis );

		this.n = _joints.length;
		this.tolerance = 0.01;

		this.target = _target;

		this.joints = _joints;
		this.origin = _joints[ 0 ].clone();

		this.lengths = lengths;
		this.totalLength = lengths.reduce( ( c, l )=>c + l );

		// constraints

		this.constraints = {};

		this.constraints.enabled = false;
		this.constraints.left =
		this.constraints.right =
		this.constraints.top =
		this.constraints.down = THREE.Math.degToRad( 89 );

		return this;

	}

	visualize( scene ) {

		if ( scene ) this.refs.visualizers.forEach( v=>scene.add( v ) );

		this.refs.visualizers.forEach( ( v, index )=>{

			if ( index === this.n ) {

				v.position.copy( this.target );
				v.rotation.copy( this.refs.target.rotation );

			} else {

				v.position.copy( this.joints[ index ] );
				v.rotation.copy( this.refs.joints[ index ].rotation );

			}


		} );

	}

	apply() {

		this.refs.joints.forEach( ( j, i )=>{

			let v = this.joints[ i + 1 ] || this.target;
			const localChildPosition = j.parent.worldToLocal( v.clone() );
			const q = j.quaternion.clone();
			j.lookAt( localChildPosition );
			j.rotateY( 3.14159 );
			j.quaternion.slerp( q, 0.2 );

		} );

	}

	solve() {

		// get target reference's position
		this.target.copy( this.refs.target.getWorldPosition() );

		// distance
		const vector = new THREE.Vector3().subVectors( this.target, this.joints[ 0 ] );
		const distance = vector.length();
		const outOfRange = distance > this.totalLength;

		if ( outOfRange ) {

			let a = 0;

			const v = vector.clone().normalize().multiplyScalar( this.totalLength );

			this.joints.forEach( ( joint, index )=>{

				if ( index === 0 ) {

					return;

				}

				a += this.lengths[ index - 1 ] / this.totalLength;

				joint.addVectors( this.joints[ 0 ], v.clone().multiplyScalar( a ) );

			} );

		} else {

			let count = 0;
			let diff = this.joints[ this.n - 1 ].distanceTo( this.target );

			while ( diff > this.tolerance && count < 2 ) {

				this.backward();
				this.forward();
				diff = this.joints[ this.n - 1 ].distanceTo( this.target );
				count += 1;

			}

		}

	}
	backward() {

		this.joints[ this.n - 1 ].copy( this.target );

		const min = 0;
		for ( let i = this.n - 2; i >= min; i -- ) {

			const r = this.joints[ i + 1 ].distanceTo( this.joints[ i ] );
			const l = this.lengths[ i ] / r;
			const pos = this.joints[ i + 1 ].clone()
				.multiplyScalar( 1 - l )
				.add( this.joints[ i ].clone().multiplyScalar( l ) );

			this.joints[ i ].copy( pos );

		}

	}
	forward() {

		this.joints[ 0 ].copy( this.origin );

		const max = this.n - 2;
		for ( let i = 0; i <= max; i ++ ) {

			const r = this.joints[ i + 1 ].distanceTo( this.joints[ i ] );
			const l = this.lengths[ i ] / r;

			const pos = this.joints[ i ].clone().multiplyScalar( 1 - l )
				.add( this.joints[ i + 1 ].clone().multiplyScalar( l ) );

			this.joints[ i + 1 ].copy( pos );

		}

	}

}

THREE.FABRIK = FABRIK;
