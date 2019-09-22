import * as THREE from 'three';
import * as CANNON from "cannon";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import OrbitControls from 'three-orbitcontrols';



THREE.CannonDebugRenderer = function(scene, world, options){
    options = options || {};

    this.scene = scene;
    this.world = world;

    this._meshes = [];

    this._material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    this._sphereGeometry = new THREE.SphereGeometry(1);
    this._boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this._planeGeometry = new THREE.PlaneGeometry( 10, 10, 10, 10 );
    this._cylinderGeometry = new THREE.CylinderGeometry( 1, 1, 10, 10 );
};

THREE.CannonDebugRenderer.prototype = {

    tmpVec0: new CANNON.Vec3(),
    tmpVec1: new CANNON.Vec3(),
    tmpVec2: new CANNON.Vec3(),
    tmpQuat0: new CANNON.Vec3(),

    update: function(){

        var bodies = this.world.bodies;
        var meshes = this._meshes;
        var shapeWorldPosition = this.tmpVec0;
        var shapeWorldQuaternion = this.tmpQuat0;

        var meshIndex = 0;

        for (var i = 0; i !== bodies.length; i++) {
            var body = bodies[i];

            for (var j = 0; j !== body.shapes.length; j++) {
                var shape = body.shapes[j];

                this._updateMesh(meshIndex, body, shape);

                var mesh = meshes[meshIndex];

                if(mesh){

                    // Get world position
                    body.quaternion.vmult(body.shapeOffsets[j], shapeWorldPosition);
                    body.position.vadd(shapeWorldPosition, shapeWorldPosition);

                    // Get world quaternion
                    body.quaternion.mult(body.shapeOrientations[j], shapeWorldQuaternion);

                    // Copy to meshes
                    mesh.position.copy(shapeWorldPosition);
                    mesh.quaternion.copy(shapeWorldQuaternion);
                }

                meshIndex++;
            }
        }

        for(var i = meshIndex; i < meshes.length; i++){
            var mesh = meshes[i];
            if(mesh){
                this.scene.remove(mesh);
            }
        }

        meshes.length = meshIndex;
    },

    _updateMesh: function(index, body, shape){
        var mesh = this._meshes[index];
        if(!this._typeMatch(mesh, shape)){
            if(mesh){
                this.scene.remove(mesh);
            }
            mesh = this._meshes[index] = this._createMesh(shape);
        }
        this._scaleMesh(mesh, shape);
    },

    _typeMatch: function(mesh, shape){
        if(!mesh){
            return false;
        }
        var geo = mesh.geometry;
        return (
            (geo instanceof THREE.SphereGeometry && shape instanceof CANNON.Sphere) ||
            (geo instanceof THREE.BoxGeometry && shape instanceof CANNON.Box) ||
            (geo instanceof THREE.PlaneGeometry && shape instanceof CANNON.Plane) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.ConvexPolyhedron) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.Trimesh) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.Heightfield)
        );
    },

    _createMesh: function(shape){
        var mesh;
        var material = this._material;

        switch(shape.type){

        case CANNON.Shape.types.SPHERE:
            mesh = new THREE.Mesh(this._sphereGeometry, material);
            break;

        case CANNON.Shape.types.BOX:
            mesh = new THREE.Mesh(this._boxGeometry, material);
            break;

        case CANNON.Shape.types.PLANE:
            mesh = new THREE.Mesh(this._planeGeometry, material);
            break;

        case CANNON.Shape.types.CONVEXPOLYHEDRON:
            // Create mesh
            var geo = new THREE.Geometry();

            // Add vertices
            for (var i = 0; i < shape.vertices.length; i++) {
                var v = shape.vertices[i];
                geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
            }

            for(var i=0; i < shape.faces.length; i++){
                var face = shape.faces[i];

                // add triangles
                var a = face[0];
                for (var j = 1; j < face.length - 1; j++) {
                    var b = face[j];
                    var c = face[j + 1];
                    geo.faces.push(new THREE.Face3(a, b, c));
                }
            }
            geo.computeBoundingSphere();
            geo.computeFaceNormals();

            mesh = new THREE.Mesh(geo, material);
            shape.geometryId = geo.id;
            break;

        case CANNON.Shape.types.TRIMESH:
            var geometry = new THREE.Geometry();
            var v0 = this.tmpVec0;
            var v1 = this.tmpVec1;
            var v2 = this.tmpVec2;
            for (var i = 0; i < shape.indices.length / 3; i++) {
                shape.getTriangleVertices(i, v0, v1, v2);
                geometry.vertices.push(
                    new THREE.Vector3(v0.x, v0.y, v0.z),
                    new THREE.Vector3(v1.x, v1.y, v1.z),
                    new THREE.Vector3(v2.x, v2.y, v2.z)
                );
                var j = geometry.vertices.length - 3;
                geometry.faces.push(new THREE.Face3(j, j+1, j+2));
            }
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
            mesh = new THREE.Mesh(geometry, material);
            shape.geometryId = geometry.id;
            break;

        case CANNON.Shape.types.HEIGHTFIELD:
            var geometry = new THREE.Geometry();

            var v0 = this.tmpVec0;
            var v1 = this.tmpVec1;
            var v2 = this.tmpVec2;
            for (var xi = 0; xi < shape.data.length - 1; xi++) {
                for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
                    for (var k = 0; k < 2; k++) {
                        shape.getConvexTrianglePillar(xi, yi, k===0);
                        v0.copy(shape.pillarConvex.vertices[0]);
                        v1.copy(shape.pillarConvex.vertices[1]);
                        v2.copy(shape.pillarConvex.vertices[2]);
                        v0.vadd(shape.pillarOffset, v0);
                        v1.vadd(shape.pillarOffset, v1);
                        v2.vadd(shape.pillarOffset, v2);
                        geometry.vertices.push(
                            new THREE.Vector3(v0.x, v0.y, v0.z),
                            new THREE.Vector3(v1.x, v1.y, v1.z),
                            new THREE.Vector3(v2.x, v2.y, v2.z)
                        );
                        var i = geometry.vertices.length - 3;
                        geometry.faces.push(new THREE.Face3(i, i+1, i+2));
                    }
                }
            }
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
            mesh = new THREE.Mesh(geometry, material);
            shape.geometryId = geometry.id;
            break;
        }

        if(mesh){
            this.scene.add(mesh);
        }

        return mesh;
    },

    _scaleMesh: function(mesh, shape){
        switch(shape.type){

        case CANNON.Shape.types.SPHERE:
            var radius = shape.radius;
            mesh.scale.set(radius, radius, radius);
            break;

        case CANNON.Shape.types.BOX:
            mesh.scale.copy(shape.halfExtents);
            mesh.scale.multiplyScalar(2);
            break;

        case CANNON.Shape.types.CONVEXPOLYHEDRON:
            mesh.scale.set(1,1,1);
            break;

        case CANNON.Shape.types.TRIMESH:
            mesh.scale.copy(shape.scale);
            break;

        case CANNON.Shape.types.HEIGHTFIELD:
            mesh.scale.set(1,1,1);
            break;

        }
    }
};


/* --------- Variables --------- */
let renderer, scene, camera, light, clock, world, sky, floor, wall, player, driver, components, checkpoints, finishLine, audio;

// Web Audio API
let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new window.AudioContext;

// DOMS from HTML
let body = document.querySelector("body");
let loading = document.querySelector(".loading");

// THREE TextureLoader
let loader = new THREE.TextureLoader();

// Helper
let axes, cannonDebugRenderer, box;

/* --- Track Data --- */
const map = [
  	{c:2}, {c:2}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2},
  	{c:2}, {c:1}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2},
  	{c:2}, {c:1}, {c:0}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:0}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:0}, {c:0}, {c:1, s:"ru"}, {c:1}, {c:1}, {c:1}, {c:2},
  	{c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1, s:"ld"}, {c:0}, {}, {c:1, s:"lu"}, {c:0}, {c:1, s:"rd"}, {}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1},
  	{c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:1, s:"ld"}, {c:0}, {c:0}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:0}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:1, s:"ld"}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:1, s:"ld"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:2}, {}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:4}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:4}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:1, s:"ru"}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:1, s:"ru"}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1},
  	{c:2}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:2}
  ]


/* -------------   Functions  ------------- */
/* ---  Initialize CANNON !  --- */
let initCannon = () => {
  world = new CANNON.World();
  world.gravity.set( 0, -9.82, 0 );
  world.broadphase = new CANNON.NaiveBroadphase();
}

/* ---  Initialize THREE !  --- */
let initThree = () => {
  // Initialize renderer
  renderer = new THREE.WebGLRenderer( { antialias:true } ); // renders the edges of shapes more smoothly
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( "black", 1 ); //sets our background to a light gray colour
  document.body.appendChild( renderer.domElement );

  // Initialize scene
  scene = new THREE.Scene();

  // Initialize camera
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.1, 3100); // first param -> the greater the amount of scene the camera will show
  scene.add(camera);
  camera.position.set(200, 0, 50); // move back a bit so we can see the whole obj

  // Initialize light
  scene.add( new THREE.AmbientLight( 0x666666 ) );
	let light = new THREE.DirectionalLight( 0xdfebff, 1 );
	light.position.set( 50, 1000, 100 );
	light.position.multiplyScalar( 1.3 );
	light.castShadow = true;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	let d = 300;
	light.shadow.camera.left = - d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = - d;
	light.shadow.camera.far = 1000;
	scene.add( light );

  // Add clock
  clock = new THREE.Clock();

  // Add helper
  axes = new THREE.AxisHelper(800);

  // scene.add(axes);
  // const controls = new OrbitControls(camera, renderer.domElement);
}

// Create Element to render on the screen
let createElement = (tag, atrs, parentElement) => {
  let obj = document.createElement(tag);
  if(atrs){setAttributes(obj, atrs);}
  if(parentElement instanceof Element){parentElement.appendChild(obj);}
	return obj;
}

let setAttributes = (obj, atrs) => {
  for(let key in atrs){
		obj[key] = atrs[key];
	}
	return obj;
}

/* -------------  Settings for World Objs !  ------------- */
// Car Obj with Car Model
function Car () {
  // Shape related
  this.cannonMaterial = new CANNON.Material();
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 5, 3, 13 ) );
  this.cannonBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(200, 15, 0),
    shape: this.cannonShape,
    material: this.cannonMaterial
  });

  // States
  this.movement = "stop";
  this.speedUp = false;
  this.finished = false;
  // Speed
  this.speed = 0;
  this.accelaration = 0.1; // nos 0.3  back -0.05
  this.decelaration = 0.03;
  this.brake = 0.05;
  this.maxSpeed = 4;  // nos 7  back -2
  // Meter
  this.meter = 134;
  this.meterAccelaration = 7.9; // nos 23.7  back 4
  this.meterDecelaration = 2.4;
  this.meterBrake = 4;
  this.maxMeter = 454; // nos 694  back 294
  // Num
  this.num = 0;
  this.numAccelaration = 2.5; // nos 7.5  back 1.25
  this.numDecelaration = 0.75;
  this.numBrake = 1.25;
  this.maxNum = 100;  // nos 175  back 50


  this.radian = 0;
  this.rotation = 0;

  // Method for loading car model
  this.loadModel = (path, mtl, obj) => {
  return new Promise( (resolve, reject) => {
    let mtlLoader = new MTLLoader();
    mtlLoader.setTexturePath(path);
    mtlLoader.setPath(path);
    mtlLoader.load(mtl, materials => {
      materials.preload();
      let objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(path);
      objLoader.load(obj, object => {
        object.scale.set(0.05, 0.05, 0.05);
          resolve(object);
        });
      });
    });
  };

  // Method for update the position of body and model
  this.updatePhysics = obj => {
    world.step( 1/60 );
    obj.position.copy(this.cannonBody.position);
    obj.quaternion.copy(this.cannonBody.quaternion);
  }

  // Method for returning Promise obj so we know the model has been loaded
  this.addCar = () => {
    this.cannonBody.quaternion.setFromAxisAngle( new CANNON.Vec3(0, 1, 0), 2*Math.PI/360*180 );
    world.add( this.cannonBody );

    let data = JSON.parse( localStorage.getItem("chosenCar") );

    this.car = this.loadModel(data.path, data.mtl, data.obj);
  }

  this.move = () => {

    if( this.finished ){
      this.movement = "stop";
    }

    // Run out of the time --> make car stop
    if( components.timeBar ){
      components.timeBarWidth = getComputedStyle(components.timeBar).width;
      if( components.timeBarWidth === "0px" ){
        this.movement = "stop";
      } else{
        components.runningTime();
      }
    } else{
      this.movement = "stop";
    }

    // use NOS -- SpeedUp -> true ----- change some states for nos
    if( this.speedUp ){
      this.accelaration = 0.3;
      this.maxSpeed = 7;
      this.meterAccelaration = 23.7;
      this.maxMeter = 694;
      this.numAccelaration = 7.5;
      this.maxNum = 175;
    } else if( this.speed < 0 || this.speed == 0 && this.movement === "back" ){
      this.accelaration = -0.05;
      this.maxSpeed = -2;
      this.meterAccelaration = 4;
      this.maxMeter = 294;
      this.numAccelaration = 1.25;
      this.maxNum = 50;
    } else {
      this.accelaration = 0.1;
      this.maxSpeed = 4;
      this.meterAccelaration = 7.9;
      this.maxMeter = 454;
      this.numAccelaration = 2.5;
      this.maxNum = 100;
    }

    switch (this.movement) {
      case "forward":
      if( this.speed >= 0 ){
        audio.play("startSound");
        this.speed += this.accelaration;
        this.meter += this.meterAccelaration;
        this.num += this.numAccelaration;
        if( this.speed > this.maxSpeed ){
          // audio.play("maxSound");
          this.speed = this.maxSpeed;
          this.meter = this.maxMeter;
          this.num = this.maxNum;
        }

      } else {
        this.speed += this.brake;
        this.meter -= this.meterBrake;
        this.num -= this.numBrake;
      }
      break;


      case "back":
      if( this.speed <= 0 ){
        console.log("back");
        this.speed += this.accelaration;
        this.meter += this.meterAccelaration;
        this.num += this.numAccelaration;
        if( this.speed < this.maxSpeed ){
          // audio.play("maxSound");
          this.speed = this.maxSpeed;
          this.meter = this.maxMeter;
          this.num = this.maxNum;
        }

      } else {
        console.log("brake");
        audio.play("slowSound");
        this.speed -= this.brake;
        this.meter -= this.meterBrake;
        this.num -= this.numBrake;
      }

      break;


      case "stop":
      // meter.setAttribute("class", "needle");
      if( this.speed > 0 ){
        audio.play("slowSound");
        this.speed -= this.decelaration;
        this.meter -= this.meterDecelaration;
        this.num -= this.numDecelaration;
        if( this.speed < 0 ){
          audio.play("stopSound");
          this.speed = 0;
          this.meter = 134;
          this.num = 0;
        }
      } else if( this.speed < 0 ){
        audio.play("slowSound");
        this.speed += this.decelaration;
        this.meter -= this.meterDecelaration;
        this.num -= this.numDecelaration;
        if( this.speed > 0 ){
          this.speed = 0;
          this.meter = 134;
          this.num = 0;
        }
      }

      break;
    }

    if( this.speed < 0 ){
      this.rotation -= this.radian;
    } else {
      this.rotation += this.radian;
    }

    // Update NosBarHeight
    components.nosBarHeight = getComputedStyle(components.nosBar).height;
    components.nosBarHeightNum = parseInt(components.nosBarHeight.match(/\d+/)[0]);

    if( !this.speedUp && components.nosBarHeightNum < 1  ){
      components.nosBar.setAttribute("class", "n-inner accumulation");
    } else if( !this.speedUp && components.nosBarHeightNum > 128 ){
      components.nosBar.style.setProperty("--bar-height", components.nosBarHeight);
    } else if( this.speedUp && components.nosBarHeightNum > 128 ){
      components.nosBar.style.removeProperty("--bar-height");
      components.nosBar.setAttribute("class", "n-inner speed-up");
    } else if( this.speedUp && components.nosBarHeightNum < 1 ){
      this.speedUp = false;
      components.nosBar.setAttribute("class", "n-inner accumulation");
    } else if( !this.speedUp && components.nosBarHeightNum > 1 && components.nosbarHeightNum < 128 ){
      components.nosBar.setAttribute("class", "n-inner accumulation");
    }

    if( this.speed === 0 ){
      components.nosBar.classList.remove("accumulation");
      if( !this.speedUp ){
        components.nosBar.style.setProperty("--bar-height", components.nosBarHeight);
      } else if( this.speedUp && components.nosBarHeightNum > 128 ){
        components.nosBar.style.removeProperty("--bar-height");
        components.nosBar.setAttribute("class", "n-inner speed-up");
      } else if( this.speedUp && components.nosBarHeightNum < 1 ){
        this.speedUp = false;
        components.nosBar.setAttribute("class", "n-inner accumulation");
      }
      return;
    }
    // else{ stopSound.pause(); }


    let x = Math.sin(this.rotation) * this.speed;
    let z = Math.cos(this.rotation) * this.speed;

    // Update Car position
    this.cannonBody.quaternion.setFromAxisAngle( new CANNON.Vec3(0, 1, 0), 2*Math.PI/360*180 + this.rotation);
    this.cannonBody.position.z -= z;  //driver
    this.cannonBody.position.x -= x;  //driver

    // Update Camera position
    camera.rotation.y = this.rotation;
    camera.position.x = driver.position.x + Math.sin(this.rotation)*50;
    camera.position.z = driver.position.z + Math.cos(this.rotation)*50;

    // Update the Meter
    components.needle.style.transform = `rotate(${this.meter}deg)`;

    // Update needle transformed degree
    // components.needleR = components.getNeedleDeg();
    components.needle.style.setProperty("--needle-rotation", `${this.meter}deg`);
    // Update the Number
    components.speedNum.textContent = Math.floor( Math.abs( this.num ) );

    if( this.meter === this.maxMeter ){
      // console.log(this.meter);
      components.needle.style.setProperty("--needle-vibrant", `${this.meter + 5}deg`);
      components.needle.setAttribute("class", "needle vibrant");

      let randomMax = Math.random() * 25 / 16;
      components.speedNum.textContent = Math.floor( Math.abs( this.num + randomMax ) );

    } else {
      components.needle.setAttribute("class", "needle");
    }

  }


}

// SkyBox Obj
function Skybox () {
  this.textures = [];
  this.imgs = [
    "asset/skybox/clouds1_west.bmp", "asset/skybox/clouds1_east.bmp", "asset/skybox/clouds1_up.bmp",
    "asset/skybox/clouds1_down.bmp", "asset/skybox/clouds1_south.bmp", "asset/skybox/clouds1_north.bmp"
  ];
  this.geometry = new THREE.BoxGeometry( 3000, 3000, 3000 );
  this.addSky = () => {
    this.imgs.forEach( img => {
      this.side = loader.load(img);
      this.textures.push( new THREE.MeshBasicMaterial({ map: this.side  }) );
    });
    for(let i = 0; i < 6; i++){
      this.textures[i].side = THREE.BackSide;
    }
    this.sky = new THREE.Mesh( this.geometry, this.textures );
    this.sky.position.y = 300;
    scene.add( this.sky );
  }
}

// Floor Obj
function Floor () {
  // CANNON Part
  this.cannonShape = new CANNON.Plane();
  this.cannonMaterial = new CANNON.Material();
  this.cannonBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -8, 0),
    shape: this.cannonShape,
    material: this.cannonMaterial
  });
  this.cannonBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1, 0, 0), -2*Math.PI/360*90 );
  // THREE part
  this.threeTexture = loader.load("asset/imgs/tarmac_light.png");
  this.threeTexture.wrapS = this.threeTexture.wrapT = THREE.RepeatWrapping;
  this.threeTexture.repeat.set( 500, 500 );
  this.threeTexture.anisotropy = 16;
  this.threeMaterial = new THREE.MeshLambertMaterial( { map: this.threeTexture } );
  this.floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 4000, 4000 ), this.threeMaterial );
  this.floor.position.y = - 10;
  this.floor.rotation.x = - Math.PI / 2;
  this.floor.receiveShadow = true;
  // Method
  this.addFloor = () => {
    world.add( this.cannonBody );
    scene.add( this.floor );
  }
}

// Wall Obj
function Wall () {
  // data
  this.map = map;
  this.axis = new CANNON.Vec3(0, 1, 0);
  this.rotatedAngle = 2*Math.PI/360*45;
  this.x = this.z = -1450;
  this.coordinateDone = false;

  // CANNON part
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 50, 22.5, 50 ) );
  this.cannonShapeS = new CANNON.Box( new CANNON.Vec3( 50*Math.sqrt(2), 22.5, 50*Math.sqrt(2) ) );
  this.cannonMaterial = new CANNON.Material();

  // THREE part
  this.textures = [];
  this.imgs = [
    "asset/imgs/wall.png", "asset/imgs/wall.png", "asset/imgs/wall.png",
    "asset/imgs/wall.png", "asset/imgs/wall.png", "asset/imgs/wall.png"
  ];
  this.geometry = new THREE.BoxGeometry( 100, 45, 100 );
  this.geometryS = new THREE.BoxGeometry( 100*Math.sqrt(2), 45, 100*Math.sqrt(2) );

  // Method for sticking the textures to the wall
  this.stickTextures = () => {
    this.imgs.forEach( img => {
      this.side = new THREE.TextureLoader().load( img );
      this.textures.push( new THREE.MeshBasicMaterial({ map: this.side  }) );
    });
  }

  // Methed for creating the THREE wall in right size
  this.createWall = s => {
    switch(s){
      case "lu": //|| "rd" || "ld" || "ru":
      this.wall = new THREE.Mesh( this.geometryS, this.textures );
      break;
      case "rd":
      this.wall = new THREE.Mesh( this.geometryS, this.textures );
      break;
      case "ld":
      this.wall = new THREE.Mesh( this.geometryS, this.textures );
      break;
      case "ru":
      this.wall = new THREE.Mesh( this.geometryS, this.textures );
      break;

      default:
      this.wall = new THREE.Mesh( this.geometry, this.textures );
    }
    return this.wall;
  }

  // Method for creating the CANNON wall in right size
  this.createBody = (s, x, z) => {
    switch(s){
      case "lu":
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x-50, 0, z-50),
        shape: this.cannonShapeS,
        material: this.cannonMaterial
      });
      this.body.quaternion.setFromAxisAngle( this.axis, this.rotatedAngle );
      break;
      case "rd":
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x+50, 0, z+50),
        shape: this.cannonShapeS,
        material: this.cannonMaterial
      });
      this.body.quaternion.setFromAxisAngle( this.axis, this.rotatedAngle );
      break;
      case "ld":
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x-50, 0, z+50),
        shape: this.cannonShapeS,
        material: this.cannonMaterial
      });
      this.body.quaternion.setFromAxisAngle( this.axis, this.rotatedAngle );
      break;
      case "ru":
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x+50, 0, z-50),
        shape: this.cannonShapeS,
        material: this.cannonMaterial
      });
      this.body.quaternion.setFromAxisAngle( this.axis, this.rotatedAngle );
      break;

      default:
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x, 0, z),
        shape: this.cannonShape,
        material: this.cannonMaterial
      });
    }
    return this.body;
  }

  this.updatePhysics = (mesh, body) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }


  // Method for add walls to scene/world
  this.addWall = () => {
    this.map.forEach( mesh => {
      if( this.x < 1451 ){
    			mesh.x = this.x;
    			mesh.z = this.z;
    			this.x += 100;
    		} else{
    			this.x = -1450;
    			this.z += 100;
    			mesh.x = this.x;
    			mesh.z = this.z;
    			this.x += 100;
    		}

        if( this.x === 1450 && this.z === 1450 ){
          this.coordinateDone = true;
        }
    });
    if( this.coordinateDone ){
      this.map.forEach( mesh => {
        if(mesh.c === 1){
          let wall = this.createWall(mesh.s);
          let body = this.createBody(mesh.s, mesh.x, mesh.z);
          scene.add( wall );
          world.add( body );
          this.updatePhysics(wall, body);
        }
      });
    }
  }
}

// Add some elements
function Components () {

  this.meter = createElement("div", { className: "meter" }, body);
  this.needle = createElement("div", { className: "needle" }, this.meter);

  this.speedNum = createElement("div", { className: "meter-number", textContent: 0 }, body);
  this.speedNumUnit = createElement("div", { className: "meter-unit", textContent: "KM/H" }, body);

  this.nosWrapper = createElement("div", { className: "n-outer" }, body);
  this.nosLightning = createElement("img", { className: "lightning", src: "asset/imgs/lightning.png" }, this.nosWrapper);
  this.nosBar = createElement("div", { className: "n-inner" }, this.nosWrapper);
  this.nosBarHeight = getComputedStyle(this.nosBar).height;
  this.nosbarHeightNum = parseInt(this.nosBarHeight.match(/\d+/)[0]);

  this.timeCount = createElement("div", { className: "running-time", textContent: `00:00:00` }, body);

  // Method for creating running time
  this.runningTime = () => {
    // Initialize the start time
    if( !this.startTime ){
      this.startTime = Date.now();
    }
    let ms = Math.floor( Date.now() - this.startTime );
    let s = Math.floor( ms / 1000 );
    let m = Math.floor( s / 60 );

    ms = parseInt(ms.toString().slice(ms.toString().length-2)); // Take the last two positions of the integer
    if( s > 59 ){
      s = s % 60;
    }
    s = parseInt(s.toString().slice(s.toString().length-2));
    m = parseInt(m.toString().slice(m.toString().length-2));

    let timeArr = [ms, s, m];
    let timeShow = [];
    for(let i = 0; i < timeArr.length; i++){
      if(timeArr[i].toString().length < 2){
        timeShow[i] = `0${timeArr[i]}`;
      } else{
        timeShow[i] = timeArr[i];
      }
    }
    this.timeCount.textContent = `${timeShow[2]}:${timeShow[1]}:${timeShow[0]}`;
  }

  // Time Bar Wrapper
  this.timeWrapper = createElement("div", { className: "fuel-outer" }, body);

}

// Add the Checkpoints
function Checkpoints () {
  // coordinates of Checkpoints
  this.data = [
    {x: 200, z: -100, t: 30},
    {x: 1350, z: -850, t: 20},
    {x: 1350, z: 950, t: 20},
    {s: 90, x: 50, z: 1350, t: 20},
    {s: 90, x: -1050, z: 1050, t: 20},
    {x: -1350, z: 50, t: 25},
    {x: -350, z: -1150, t: 30},
    {s: 45, x: -150, z: 550, t: 30, last: true},
  ];
  this.checkpoints = [];
  this.aniNum = 0;
  this.axis = new CANNON.Vec3(0, 1, 0);

  // CANNON Part
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 100, 13, 3 ) );

  // THREE part
  this.threeGeometry = new THREE.TorusGeometry(15, 2, 12, 16);
  this.threeMaterial = new THREE.MeshLambertMaterial({color: 0xffd306});

  // Methed for creating the THREE Checkpoint
  this.createCheckpoint = () => {
    this.checkpoint = new THREE.Mesh( this.threeGeometry, this.threeMaterial );
    return this.checkpoint;
  }

  // Method for creating the CANNON Checkpoint
  this.createBody = (s, x, z, t, last) => {
    switch (s) {
      case 90:
      this.cannonBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3( x, 10, z ),
        shape: this.cannonShape,
      });
      this.cannonBody.quaternion.setFromAxisAngle( this.axis, 2*Math.PI/360*90 );
      break;
      case 45:
      this.cannonBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3( x, 10, z ),
        shape: this.cannonShape,
      });
      this.cannonBody.quaternion.setFromAxisAngle( this.axis, 2*Math.PI/360*45 );
      break;

      default:
      this.cannonBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3( x, 10, z ),
        shape: this.cannonShape,
      });
    }
    this.cannonBody.collisionResponse = false;
    this.cannonBody.time = t;
    if(last){
      this.cannonBody.last = last;
    }
    this.cannonBody.addEventListener("collide", this.collision);
    return this.cannonBody;
  }

  this.updatePhysics = (mesh, body) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }

  // Method for detect the collision
  this.collision = (e) => {
    console.log("colliding!!!");
    components.timeBar.remove();
    components.timeBar = createElement("div", { className: "fuel-inner" }, components.timeWrapper);
    components.timeBar.style.setProperty("--left-time", `${e.target.time}s`);
    if( e.target.last ){
      finishLine.addLine();
    }
    e.target.removeEventListener("collide", this.collision);
  }

  // Method for adding checkpoints to the world
  this.addCheckpoint = () => {
    this.data.forEach( mesh => {
      let checkpoint = this.createCheckpoint();
      let body = this.createBody(mesh.s, mesh.x, mesh.z, mesh.t, mesh.last);
      world.add( body );
      scene.add( checkpoint );
      this.checkpoints.push( checkpoint );
      this.updatePhysics(checkpoint, body);
    });
  }

  this.animation = n => {
    this.checkpoints.forEach( mesh => {
      mesh.scale.y = Math.abs( Math.sin(n) );
    });
  }
}

function FinishLine () {

  this.finished = e => {
    player.finished = true;
    finishLine.showFinishWindow();
    e.target.removeEventListener("collide", this.finished);
  }

  // CANNON Part
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 100, 13, 3 ) );
  this.cannonBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3( 200, 10, -50 ),
    shape: this.cannonShape,
  });
  this.cannonBody.collisionResponse = false;
  this.cannonBody.addEventListener("collide", this.finished );

  // THREE part
  this.threeTexture = loader.load("asset/imgs/finishline.png");
  this.threeTexture.wrapS = this.threeTexture.wrapT = THREE.RepeatWrapping;
  this.threeTexture.repeat.set( 1, 6 );
  this.threeMaterial = new THREE.MeshLambertMaterial( { map: this.threeTexture } );
  this.line = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 20 ), this.threeMaterial );
  this.line.position.set( 200 , - 10, -50 );
  this.line.rotation.x = - Math.PI / 2;
  this.line.receiveShadow = true;

  this.addLine = () => {
    world.add( this.cannonBody );
    scene.add( this.line );
  }

  // Finish PopUp Window
  this.showFinishWindow = () => {
    let finishWrapper = createElement("div", {className: "finish-wrapper"}, body);
    let recordWrapper = createElement("div", {className: "record-wrapper"}, finishWrapper);

    let playerRecordWrapper = createElement("div", {className: "player-record-wrapper"}, recordWrapper);
    createElement("div", {className: "player-record", textContent: "YOUR BEST RECORD"}, playerRecordWrapper);
    createElement("div", {className: "player-record", textContent: components.timeCount.textContent}, playerRecordWrapper);

    let records = createElement("div", {className: "records"}, recordWrapper);

    let finishOptions = createElement("div", {className: "finish-options"}, recordWrapper);
    let restart = createElement("div", {className: "finish-option", textContent: "RESTART"}, finishOptions);
    let exit = createElement("div", {className: "finish-option", textContent: "EXIT"}, finishOptions);

    restart.addEventListener("click", e => {
      location.reload();
    });

    exit.addEventListener("click", e => {
      location.href = "./";
    });

  }

}

// Add audios
function Audio () {
  // Audio files
  this.data = [
    "asset/audio/eminem_feat_ludacris_lil_wayne_second_chance.mp3",
    "asset/audio/startnew.mp3",
    "asset/audio/stopnew.ogg",
    "asset/audio/maxdrive.mp3",
    "asset/audio/slowdownnew.mp3"
  ];

  // Store decoded audios for future use
  this.audioNodesBuffer = [];
  this.audioNodesData = [];
  this.audioNames = [
    "startSound",
    "slowSound",
    "maxSound",
    "stopSound",
    "themeSong"
  ];

  // The data for the startSound to loop the max speed period
  this.loopStart = 1.018;
  this.loopEnd = 1.037;

  // Method for comparing the audios length for sorting them out
  this.compare = (a, b) => {
    let audioA = a.duration;
    let audioB = b.duration;
    let comparison = 0;
    if( audioA > audioB ){
      comparison = 1;
    } else if( audioA < audioB ){
      comparison = -1;
    }
    return comparison;
  }

  // Create Audio Objs
  function Obj ( buffer, name ) {
    this.buffer = buffer;
    this.playing = false;
    this.name = name
  }

  //
  this.countdownSound = () => {
    let countdownSound = audioContext.createOscillator();
    countdownSound.type = "triangle";
    countdownSound.frequency.value = 280;
    countdownSound.connect(audioContext.destination);
    return countdownSound;
  }


  // Method for decoding the audios
  this.decode = (audio) => {
    return new Promise( (resolve, reject) => {
      audioContext.decodeAudioData( audio, buffer =>{
        resolve(buffer);
      },
      e => { console.log("Error with decoding the audio", e.err); });
    });
  }

  // Methed to get Audio Data
  this.getData = this.data.forEach( url => {
    let xhr = new XMLHttpRequest();

    xhr.open( "GET", url, true );
    xhr.responseType = "arraybuffer";
    xhr.onload = () => {
      let audioData = xhr.response;
      let xhrDone = this.decode(audioData);
      xhrDone.then( buffer => {
        this.audioNodesBuffer.push(buffer);
        let n = 0;
        if( this.audioNodesBuffer.length === this.data.length ){
          console.log(this.audioNodesData)
          this.audioNodesBuffer.sort(this.compare);
          this.audioNodesBuffer.forEach( buffer => {
            let audioData = new Obj( buffer, this.audioNames[n] );
            this.audioNodesData.push(audioData);
            n++;
          });
          console.log(this.audioNodesData); //////
        }
      });
    }
    xhr.send();
  });

  this.startPlay = (buffer, loopStart, loopEnd, realTime) => {
    let audio = audioContext.createBufferSource();
    audio.buffer = buffer;
    audio.connect(audioContext.destination);
    audio.loopStart = loopStart;
    audio.loopEnd = loopEnd;
    audio.loop = true;
    audio.start(0, realTime);
    return audio;
  }

  // for calculating the start point of engine sound
  this.realTime = 0;
  this.ratio = 0;

  // Method for replaying the audios since BufferSourceNode can only be used once --> create a new one BufferSourceNode using the same buffer
  this.play = (currentAudio) => {
    this.ratio = player.speed / player.maxSpeed;

    if( currentAudio === "startSound" ){
      this.realTime = 1.037 * this.ratio;
    } else if( currentAudio === "slowSound" ){
      this.realTime = 1.037 / 10 * 3 * (1 - this.ratio);
    }

    this.loopStart = currentAudio === "startSound" ? 1.018 : 0;

    for( let i = 0; i < this.audioNodesData.length - 1; i++ ){
      this.loopEnd = currentAudio === "startSound" ? 1.037 : this.audioNodesData[i].buffer.duration;

      if( this.audioNodesData[i].name === currentAudio && this.audioNodesData[i].playing === false ){
        console.log(this.realTime);
        this[this.audioNodesData[i].name] = this.startPlay( this.audioNodesData[i].buffer, this.loopStart, this.loopEnd, this.realTime );
        this.audioNodesData[i].playing = true;
      } else if( this.audioNodesData[i].name !== currentAudio && this.audioNodesData[i].playing === true ){
        this[this.audioNodesData[i].name].disconnect(audioContext);
        this.audioNodesData[i].playing = false;
      }
    }
  }


}


/* --------- Render it !  --------- */
  let render = () => {
    player.move();

    cannonDebugRenderer.update();
    box.update();

    // Keep player's car updated
    player.updatePhysics(driver);

    // Checkpoints Animation
    checkpoints.aniNum += 0.05;
    checkpoints.animation( checkpoints.aniNum );

    requestAnimationFrame(render);
    renderer.render( scene, camera );

  }

/* ---------  Create WORLD !  --------- */
let initWorld = () => {
  initCannon();
  initThree();

  ////// Helper
  cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world );


  // Load Car
  player = new Car;
  player.addCar();

  // Load Audio
  audio = new Audio;

  // Add SkyBox
  sky = new Skybox;
  sky.addSky();

  // Add Floor
  floor = new Floor;
  floor.addFloor();

  // Add Wall
  wall = new Wall;
  wall.stickTextures();
  wall.addWall();

  // Add Checkpoints
  checkpoints = new Checkpoints;
  checkpoints.addCheckpoint();

  // Add Some Elements
  components = new Components;

  // Create FinishLine Obj
  finishLine = new FinishLine;

  // Add Car
  player.car.then( obj => {
    driver = obj;
    scene.add(obj);
    player.updatePhysics(obj);

    /// Box helper
    box = new THREE.BoxHelper( driver, 0x000000 );
  	scene.add( box );

    // Set loading div to display none when content has loaded
    loading.style.display = "none";

    // Countdown so player can be ready to play
    let n = 3;
    let countdown = setInterval( ()=>{
      let countdownSound = audio.countdownSound();
      countdownSound.start();
      countdownSound.stop(0.5);
      if( n === 3 ){
        components.countdown = createElement("div", { className: "countdown", textContent: n }, body);
      }else {
        components.countdown.textContent = n;
      }
      n -= 1;
      if(n < 0 ){
        // audio.audioNodes[4].start(); // ths longest one -> background music
        console.log("play");
        components.countdown.textContent = "";
        components.timeBar = createElement("div", { className: "fuel-inner" }, components.timeWrapper);
        clearInterval(countdown);
        return;
      }
    }, 1000 );

    // Render world after loading car model
    render();
  });

}

initWorld();

/*  ---------  Controls  ---------  */
document.body.addEventListener( "keydown", e => {
    switch( e.keyCode ){
    case 38: // ^
    player.movement = "forward";
    break;
    case 37: // <-
    player.radian = 2 * Math.PI / 360 * 1.5;
    break;
    case 40: // ˇ
    player.movement = "back";
    break;
    case 39: // ->
    player.radian = -2 * Math.PI / 360 * 1.5;
    break;

    case 32: // spacebar
    if( components.nosBarHeightNum > 128 ){
      player.speedUp = true;
    }
    break;

    case 73: // I for test
    // player.speedUp = false;
    // components.showFinishWindow();
    finishLine.addLine();
    break;
  }
} );
document.body.addEventListener( "keyup", e => {
    switch( e.keyCode ){
    case 38: // ^
    player.movement = "stop";
    break;
    case 37: // <-
    player.radian = 0;
    break;
    case 40: // ->
    player.movement = "stop";
    break;
    case 39: // ˇ
    player.radian = 0;
    break;
  }
} );
