"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ref: http://wiki.roblox.com/index.php?title=Inverse_kinematics#FABRIK

var FABRIK = function () {
	function FABRIK(jointsRef, targetRef) {
		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		_classCallCheck(this, FABRIK);

		var isTargetRefNull = targetRef === null || targetRef === undefined;
		if (isTargetRefNull) {

			targetRef = new THREE.Object3D();
			targetRef.position.copy(jointsRef[jointsRef.length - 1].getWorldPosition());
		}

		var _joints = jointsRef.map(function (j) {

			var pos = j.getWorldPosition();
			var obj = new THREE.Vector3().copy(pos);
			return obj;
		});

		var _target = targetRef.getWorldPosition();

		var lengths = _joints.reduce(function (carry, v1, idx, arr) {

			var v0 = arr[idx - 1];
			if (v0) {

				carry.push(v1.distanceTo(v0));
			}

			return carry;
		}, []);

		this.refs = {};
		this.refs.target = targetRef;
		this.refs.joints = jointsRef;
		this.refs.visualizers = _joints.map(function (j) {

			var obj = new THREE.AxesHelper(1);
			obj.position.copy(j);
			return obj;
		});
		var _targetVis = new THREE.AxesHelper(2);
		_targetVis.position.copy(_target);
		this.refs.visualizers.push(_targetVis);

		this.n = _joints.length;
		this.tolerance = 0.01;

		this.target = _target;

		this.joints = _joints;
		this.origin = _joints[0].clone();

		this.lengths = lengths;
		this.totalLength = lengths.reduce(function (c, l) {
			return c + l;
		});

		// constraints

		this.constraints = {};

		this.constraints.enabled = false;
		this.constraints.left = this.constraints.right = this.constraints.top = this.constraints.down = THREE.Math.degToRad(89);

		return this;
	}

	_createClass(FABRIK, [{
		key: "visualize",
		value: function visualize(scene) {
			var _this = this;

			if (scene) this.refs.visualizers.forEach(function (v) {
				return scene.add(v);
			});

			this.refs.visualizers.forEach(function (v, index) {

				if (index === _this.n) {

					v.position.copy(_this.target);
					v.rotation.copy(_this.refs.target.rotation);
				} else {

					v.position.copy(_this.joints[index]);
					v.rotation.copy(_this.refs.joints[index].rotation);
				}
			});

			return this;
		}
	}, {
		key: "apply",
		value: function apply() {
			var _this2 = this;

			var lerpAlpha = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.8;


			this.refs.joints.forEach(function (j, i) {

				var v = _this2.joints[i + 1] || _this2.target;
				var localChildPosition = j.parent.worldToLocal(v.clone());
				var q = j.quaternion.clone();
				j.lookAt(localChildPosition);
				j.rotateY(3.14159);
				j.quaternion.slerp(q, 1 - lerpAlpha);
			});

			return this;
		}
	}, {
		key: "solve",
		value: function solve() {
			var _this3 = this;

			// get target reference's position
			this.target.copy(this.refs.target.getWorldPosition());

			// distance
			var vector = new THREE.Vector3().subVectors(this.target, this.joints[0]);
			var distance = vector.length();
			var outOfRange = distance > this.totalLength;

			if (outOfRange) {

				var a = 0;

				var v = vector.clone().normalize().multiplyScalar(this.totalLength);

				this.joints.forEach(function (joint, index) {

					if (index === 0) {

						return;
					}

					a += _this3.lengths[index - 1] / _this3.totalLength;

					joint.addVectors(_this3.joints[0], v.clone().multiplyScalar(a));
				});
			} else {

				var count = 0;
				var diff = this.joints[this.n - 1].distanceTo(this.target);

				while (diff > this.tolerance && count < 2) {

					this.backward();
					this.forward();
					diff = this.joints[this.n - 1].distanceTo(this.target);
					count += 1;
				}
			}

			return this;
		}
	}, {
		key: "backward",
		value: function backward() {

			this.joints[this.n - 1].copy(this.target);

			var min = 0;
			for (var i = this.n - 2; i >= min; i--) {

				var r = this.joints[i + 1].distanceTo(this.joints[i]);
				var l = this.lengths[i] / r;
				var pos = this.joints[i + 1].clone().multiplyScalar(1 - l).add(this.joints[i].clone().multiplyScalar(l));

				this.joints[i].copy(pos);
			}

			return this;
		}
	}, {
		key: "forward",
		value: function forward() {

			this.joints[0].copy(this.origin);

			var max = this.n - 2;
			for (var i = 0; i <= max; i++) {

				var r = this.joints[i + 1].distanceTo(this.joints[i]);
				var l = this.lengths[i] / r;

				var pos = this.joints[i].clone().multiplyScalar(1 - l).add(this.joints[i + 1].clone().multiplyScalar(l));

				this.joints[i + 1].copy(pos);
			}

			return this;
		}
	}, {
		key: "refresh",
		value: function refresh() {
			var _this4 = this;

			this.refs.joints.forEach(function (j, i) {

				var pos = j.getWorldPosition();
				_this4.joints[i].copy(pos);
			});
			this.origin = this.joints[0].clone();
			this.target = this.refs.target.getWorldPosition();
		}
	}, {
		key: "constrain",
		value: function constrain(calc, cone) {

			// calc : calculated of result form FABRIK algorithm
			// line : cone's center axis
			// cone : the cone matrix

			var line = new THREE.Vector3(0, 0, 1).applyMatrix4(cone);
			var scalar = calc.dot(line) / line.length();
			var proj = line.clone().normalize().multiplyScalar(scalar);

			// get axis that are closest
			var ups = [new THREE.Vector3(0, 1, 0).applyMatrix4(cone), new THREE.Vector3(0, -1, 0).applyMatrix4(cone)];
			var downs = [new THREE.Vector3(1, 0, 0).applyMatrix4(cone), new THREE.Vector3(-1, 0, 0).applyMatrix4(cone)];

			var sortFn = function sortFn(a, b) {

				var _a = a.clone().sub(calc).length();
				var _b = b.clone().sub(calc).length();
				return _a - _b;
			};
			var upvec = ups.sort(sortFn)[0];
			var rightvec = downs.sort(sortFn)[0];

			// get the vector from the projection to the calculated vector
			var adjust = new THREE.Vector3().subVectors(calc, proj);
			scalar < 0 && proj.negate();

			// get the 2D components
			var xaspect = adjust.dot(rightvec);
			var yaspect = adjust.dot(upvec);

			// get the cross section of the cone
			var left = -proj.length() * Math.tan(this.constraints.left);
			var right = proj.length() * Math.tan(this.constraints.right);
			var up = proj.length() * Math.tan(this.constraints.top);
			var down = -proj.length() * Math.tan(this.constraints.down);

			// find the quadrant
			var xbound = xaspect >= 0 && right || left;
			var ybound = yaspect >= 0 && up || down;

			var f = calc.clone();

			// check if in 2D point lies in the ellipse
			var ellipse = Math.pow(xaspect, 2) / Math.pow(xbound, 2) + Math.pow(yaspect, 2) / Math.pow(ybound, 2);
			var inbounds = ellipse <= 1 && scalar >= 0;

			if (!inbounds) {

				// get the angle of our out of ellipse point
				var a = Math.atan2(yaspect, xaspect);
				// find the nearest point
				var x = xbound * Math.cos(a);
				var y = ybound * Math.sin(a);
				// convert back to 3D
				f.copy(proj.clone().add(rightvec.clone().multiplyScalar(x)).add(upvec.clone().multiplyScalar(y)).normalize().multiplyScalar(calc.length()));
			}

			return f;
		}
	}]);

	return FABRIK;
}();

THREE.FABRIK = FABRIK;
