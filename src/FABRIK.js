// ref: http://wiki.roblox.com/index.php?title=Inverse_kinematics#FABRIK

class FABRIK {

	constructor( jointsRef, targetRef, options = {} ) {

		const isTargetRefNull = targetRef === null || targetRef === undefined
		if ( isTargetRefNull ) {

			targetRef = new THREE.Object3D()
			targetRef.position.copy(
				jointsRef[ jointsRef.length - 1 ].getWorldPosition()
			)

		}

		const _joints = jointsRef.map( ( j )=>{

			const pos = j.getWorldPosition()
			const obj = new THREE.Vector3().copy( pos )
			return obj

		} )

		const _target = targetRef.getWorldPosition()

		const lengths = _joints.reduce( ( carry, v1, idx, arr )=>{

			const v0 = arr[ idx - 1 ]
			if ( v0 ) {

				carry.push( v1.distanceTo( v0 ) )

			}

			return carry

		}, [] )

		this.refs = {}
		this.refs.target = targetRef
		this.refs.joints = jointsRef
		this.refs.visualizers = _joints.map( j=>{

			const obj = new THREE.AxesHelper( 1 )
			obj.position.copy( j )
			return obj

		} )
		const _targetVis = new THREE.AxesHelper( 2 )
		_targetVis.position.copy( _target )
		this.refs.visualizers.push( _targetVis )

		this.n = _joints.length
		this.tolerance = 0.01

		this.target = _target

		this.joints = _joints
		this.origin = _joints[ 0 ].clone()

		this.lengths = lengths
		this.totalLength = lengths.reduce( ( c, l )=>c + l )

		// constraints

		this.constraints = {}

		this.constraints.enabled = false
		this.constraints.left =
		this.constraints.right =
		this.constraints.top =
		this.constraints.down = THREE.Math.degToRad( 89 )

		return this

	}

	visualize( scene ) {

		if ( scene ) this.refs.visualizers.forEach( v=>scene.add( v ) )

		this.refs.visualizers.forEach( ( v, index )=>{

			if ( index === this.n ) {

				v.position.copy( this.target )
				v.rotation.copy( this.refs.target.rotation )

			} else {

				v.position.copy( this.joints[ index ] )
				v.rotation.copy( this.refs.joints[ index ].rotation )

			}


		} )

		return this

	}

	apply( lerpAlpha = 0.8 ) {

		this.refs.joints.forEach( ( j, i )=>{

			let v = this.joints[ i + 1 ] || this.target
			const localChildPosition = j.parent.worldToLocal( v.clone() )
			const q = j.quaternion.clone()
			j.lookAt( localChildPosition )
			j.rotateY( 3.14159 )
			j.quaternion.slerp( q, 1 - lerpAlpha )

		} )

		return this

	}

	solve() {

		// get target reference's position
		this.target.copy( this.refs.target.getWorldPosition() )

		// distance
		const vector = new THREE.Vector3().subVectors( this.target, this.joints[ 0 ] )
		const distance = vector.length()
		const outOfRange = distance > this.totalLength

		if ( outOfRange ) {

			let a = 0

			const v = vector.clone().normalize().multiplyScalar( this.totalLength )

			this.joints.forEach( ( joint, index )=>{

				if ( index === 0 ) {

					return

				}

				a += this.lengths[ index - 1 ] / this.totalLength

				joint.addVectors( this.joints[ 0 ], v.clone().multiplyScalar( a ) )

			} )

		} else {

			let count = 0
			let diff = this.joints[ this.n - 1 ].distanceTo( this.target )

			while ( diff > this.tolerance && count < 2 ) {

				this.backward()
				this.forward()
				diff = this.joints[ this.n - 1 ].distanceTo( this.target )
				count += 1

			}

		}

		return this

	}
	backward() {

		this.joints[ this.n - 1 ].copy( this.target )

		const min = 0
		for ( let i = this.n - 2; i >= min; i -- ) {

			const r = this.joints[ i + 1 ].distanceTo( this.joints[ i ] )
			const l = this.lengths[ i ] / r
			const pos = this.joints[ i + 1 ].clone()
				.multiplyScalar( 1 - l )
				.add( this.joints[ i ].clone().multiplyScalar( l ) )

			this.joints[ i ].copy( pos )

		}

		return this

	}
	forward() {

		this.joints[ 0 ].copy( this.origin )

		const max = this.n - 2
		for ( let i = 0; i <= max; i ++ ) {

			const r = this.joints[ i + 1 ].distanceTo( this.joints[ i ] )
			const l = this.lengths[ i ] / r

			const pos = this.joints[ i ].clone().multiplyScalar( 1 - l )
				.add( this.joints[ i + 1 ].clone().multiplyScalar( l ) )

			this.joints[ i + 1 ].copy( pos )

		}

		return this

	}
	refresh() {

		this.refs.joints.forEach( ( j, i )=>{

			const pos = j.getWorldPosition()
			this.joints[ i ].copy( pos )

		} )
		this.origin = this.joints[ 0 ].clone()
		this.target = this.refs.target.getWorldPosition()

	}
	constrain( calc, cone ) {

		// calc : calculated of result form FABRIK algorithm
		// line : cone's center axis
		// cone : the cone matrix

		const line = new THREE.Vector3( 0, 0, 1 ).applyMatrix4( cone )
		const scalar = calc.dot( line ) / line.length()
		const proj = line.clone().normalize().multiplyScalar( scalar )

		// get axis that are closest
		const ups = [
			new THREE.Vector3( 0, 1, 0 ).applyMatrix4( cone ),
			new THREE.Vector3( 0, - 1, 0 ).applyMatrix4( cone )
		]
		const downs = [
			new THREE.Vector3( 1, 0, 0 ).applyMatrix4( cone ),
			new THREE.Vector3( - 1, 0, 0 ).applyMatrix4( cone )
		]

		const sortFn = ( a, b )=>{

			const _a = a.clone().sub( calc ).length()
			const _b = b.clone().sub( calc ).length()
			return _a - _b

		}
		const upvec = ups.sort( sortFn )[ 0 ]
		const rightvec = downs.sort( sortFn )[ 0 ]

		// get the vector from the projection to the calculated vector
		const adjust = new THREE.Vector3().subVectors( calc, proj )
		scalar < 0 && proj.negate()

		// get the 2D components
		const xaspect = adjust.dot( rightvec )
		const yaspect = adjust.dot( upvec )

		// get the cross section of the cone
		const left = - proj.length() * Math.tan( this.constraints.left )
		const right = proj.length() * Math.tan( this.constraints.right )
		const up = proj.length() * Math.tan( this.constraints.top )
		const down = - proj.length() * Math.tan( this.constraints.down )

		// find the quadrant
		const xbound = xaspect >= 0 && right || left
		const ybound = yaspect >= 0 && up || down

		const f = calc.clone()

		// check if in 2D point lies in the ellipse
		const ellipse = Math.pow( xaspect, 2 ) / Math.pow( xbound, 2 )
					  + Math.pow( yaspect, 2 ) / Math.pow( ybound, 2 )
		const inbounds = ellipse <= 1 && scalar >= 0

		if ( ! inbounds ) {

			// get the angle of our out of ellipse point
			const a = Math.atan2( yaspect, xaspect )
			// find the nearest point
			const x = xbound * Math.cos( a )
			const y = ybound * Math.sin( a )
			// convert back to 3D
			f.copy(
				proj.clone()
					.add( rightvec.clone().multiplyScalar( x ) )
					.add( upvec.clone().multiplyScalar( y ) )
					.normalize()
					.multiplyScalar( calc.length() )
			)

		}

		return f

	}

}

THREE.FABRIK = FABRIK
