/*

Shading example in Away3d

Demonstrates:

How to create multiple entitiesources in a scene.
How to apply specular maps, normals maps and diffuse texture maps to a material.

Code by Rob Bateman
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk

This code is distributed under the MIT License

Copyright (c) The Away Foundation http://www.theawayfoundation.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

import BitmapData					= require("awayjs-core/lib/data/BitmapData");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import IAsset						= require("awayjs-core/lib/library/IAsset");
import AssetLoaderToken				= require("awayjs-core/lib/library/AssetLoaderToken");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import BitmapTexture				= require("awayjs-core/lib/textures/BitmapTexture");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");
import Keyboard						= require("awayjs-core/lib/ui/Keyboard");

import Scene						= require("awayjs-display/lib/containers/Scene");
import Loader						= require("awayjs-display/lib/containers/Loader");
import View							= require("awayjs-display/lib/containers/View");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import BoundsType					= require("awayjs-display/lib/bounds/BoundsType");
import Camera						= require("awayjs-display/lib/entities/Camera");
import DirectionalLight				= require("awayjs-display/lib/entities/DirectionalLight");
import LineSegment					= require("awayjs-display/lib/entities/LineSegment");
import Mesh							= require("awayjs-display/lib/entities/Mesh");
import PointLight					= require("awayjs-display/lib/entities/PointLight");
import AwayMouseEvent				= require("awayjs-display/lib/events/MouseEvent");
import BasicMaterial				= require("awayjs-display/lib/materials/BasicMaterial");
import StaticLightPicker			= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
import PickingCollisionVO			= require("awayjs-display/lib/pick/PickingCollisionVO");
import RaycastPicker				= require("awayjs-display/lib/pick/RaycastPicker");
import PrimitiveCubePrefab			= require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");
import PrimitiveCylinderPrefab		= require("awayjs-display/lib/prefabs/PrimitiveCylinderPrefab");
import PrimitiveSpherePrefab		= require("awayjs-display/lib/prefabs/PrimitiveSpherePrefab");
import PrimitiveTorusPrefab			= require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");
import JSPickingCollider			= require("awayjs-renderergl/lib/pick/JSPickingCollider");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodRendererPool			= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");

import OBJParser					= require("awayjs-parsers/lib/OBJParser");

/**
 *
 */
class Intermediate_MouseInteraction
{
	//engine variables
	private _scene:Scene;
	private _camera:Camera;
	private _renderer:DefaultRenderer;
	private _view:View;
	private _token:AssetLoaderToken;
	private _cameraController:HoverController;

	private _timer:RequestAnimationFrame;
	private _time:number = 0;

	//material objects
	//private _painter:Sprite;
	private _blackMaterial:MethodMaterial;
	private _whiteMaterial:MethodMaterial;
	private _grayMaterial:MethodMaterial;
	private _blueMaterial:MethodMaterial;
	private _redMaterial:MethodMaterial;

	//light objects
	private _pointLight:PointLight;
	private _lightPicker:StaticLightPicker;

	//scene objects
	private _pickingPositionTracer:Mesh;
	private _scenePositionTracer:Mesh;
	private _pickingNormalTracer:LineSegment;
	private _sceneNormalTracer:LineSegment;
	private _previoiusCollidingObject:PickingCollisionVO;
	private _raycastPicker:RaycastPicker = new RaycastPicker(false);
	private _head:Mesh;
	private _cubePrefab:PrimitiveCubePrefab;
	private _spherePrefab:PrimitiveSpherePrefab;
	private _cylinderPrefab:PrimitiveCylinderPrefab;
	private _torusPrefab:PrimitiveTorusPrefab;

	//navigation variables
	private _move:boolean = false;
	private _lastPanAngle:number;
	private _lastTiltAngle:number;
	private _lastMouseX:number;
	private _lastMouseY:number;
	private _tiltSpeed:number = 4;
	private _panSpeed:number = 4;
	private _distanceSpeed:number = 4;
	private _tiltIncrement:number = 0;
	private _panIncrement:number = 0;
	private _distanceIncrement:number = 0;

	private static PAINT_TEXTURE_SIZE:number = 1024;

	/**
	 * Constructor
	 */
	constructor()
	{
		this.init();
	}

	/**
	 * Global initialise function
	 */
	private init():void
	{
		this.initEngine();
		this.initLights();
		this.initMaterials();
		this.initObjects();
		this.initListeners();
	}

	/**
	 * Initialise the engine
	 */
	private initEngine():void
	{
		this._renderer = new DefaultRenderer(MethodRendererPool);
		this._view = new View(this._renderer);
		this._view.forceMouseMove = true;
		this._scene = this._view.scene;
		this._camera = this._view.camera;
		this._view.mousePicker = new RaycastPicker(true);

		//setup controller to be used on the camera
		this._cameraController = new HoverController(this._camera, null, 180, 20, 320, 5);
	}

	/**
	 * Initialise the lights
	 */
	private initLights():void
	{
		//create a light for the camera
		this._pointLight = new PointLight();
		this._scene.addChild(this._pointLight);
		this._lightPicker = new StaticLightPicker([this._pointLight]);
	}

	/**
	 * Initialise the material
	 */
	private initMaterials():void
	{
		// uv painter
		//this._painter = new Sprite();
		//this._painter.graphics.beginFill( 0xFF0000 );
		//this._painter.graphics.drawCircle( 0, 0, 10 );
		//this._painter.graphics.endFill();

		// locator materials
		this._whiteMaterial = new MethodMaterial( 0xFFFFFF );
		this._whiteMaterial.lightPicker = this._lightPicker;
		this._blackMaterial = new MethodMaterial( 0x333333 );
		this._blackMaterial.lightPicker = this._lightPicker;
		this._grayMaterial = new MethodMaterial( 0xCCCCCC );
		this._grayMaterial.lightPicker = this._lightPicker;
		this._blueMaterial = new MethodMaterial( 0x0000FF );
		this._blueMaterial.lightPicker = this._lightPicker;
		this._redMaterial = new MethodMaterial( 0xFF0000 );
		this._redMaterial.lightPicker = this._lightPicker;
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		// To trace mouse hit position.
		this._pickingPositionTracer = <Mesh> new PrimitiveSpherePrefab(2).getNewObject();
		this._pickingPositionTracer.material = new MethodMaterial(0x00FF00, 0.5);
		this._pickingPositionTracer.visible = false;
		this._pickingPositionTracer.mouseEnabled = false;
		this._pickingPositionTracer.mouseChildren = false;
		this._scene.addChild(this._pickingPositionTracer);

		this._scenePositionTracer = <Mesh> new PrimitiveSpherePrefab(2).getNewObject();
		this._pickingPositionTracer.material = new MethodMaterial(0x0000FF, 0.5);
		this._scenePositionTracer.visible = false;
		this._scenePositionTracer.mouseEnabled = false;
		this._scene.addChild(this._scenePositionTracer);


		// To trace picking normals.
		this._pickingNormalTracer = new LineSegment(new BasicMaterial(0xFFFFFF), new Vector3D(), new Vector3D(), 3);
		this._pickingNormalTracer.mouseEnabled = false;
		this._pickingNormalTracer.visible = false;
		this._view.scene.addChild(this._pickingNormalTracer);

		this._sceneNormalTracer = new LineSegment(new BasicMaterial(0xFFFFFF), new Vector3D(), new Vector3D(), 3);
		this._sceneNormalTracer.mouseEnabled = false;
		this._sceneNormalTracer.visible = false;
		this._view.scene.addChild(this._sceneNormalTracer);


		// Load a head model that we will be able to paint on on mouse down.
		this._token = AssetLibrary.load(new URLRequest('assets/head.obj'), null, null, new OBJParser( 25 ));
		this._token.addEventListener(AssetEvent.ASSET_COMPLETE, (event:AssetEvent) => this.onAssetComplete(event));

		// Produce a bunch of objects to be around the scene.
		this.createABunchOfObjects();

		this._raycastPicker.setIgnoreList([this._sceneNormalTracer, this._scenePositionTracer]);
		this._raycastPicker.onlyMouseEnabled = false;
	}

	/**
	 * Listener for asset complete event on loader
	 */
	private onAssetComplete(event:AssetEvent):void
	{
		if (event.asset.isAsset(Mesh)) {
			this.initializeHeadModel(<Mesh> event.asset);
		}
	}

	private initializeHeadModel( model:Mesh ):void
	{
		this._head = model;

		// Apply a bitmap material that can be painted on.
		var bmd:BitmapData = new BitmapData(Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, false, 0xCCCCCC);
		//bmd.perlinNoise(50, 50, 8, 1, false, true, 7, true);
		var bitmapTexture:BitmapTexture = new BitmapTexture(bmd);
		var textureMaterial:MethodMaterial = new MethodMaterial(bitmapTexture);
		textureMaterial.lightPicker = this._lightPicker;
		model.material = textureMaterial;
		model.pickingCollider = new JSPickingCollider(this._renderer.stage);

		// Apply mouse interactivity.
		model.mouseEnabled = model.mouseChildren = true;
		this.enableMeshMouseListeners(model);

		this._view.scene.addChild(model);
	}

	private createABunchOfObjects():void
	{
		this._cubePrefab = new PrimitiveCubePrefab( 25, 50, 25 );
		this._spherePrefab = new PrimitiveSpherePrefab(12);
		this._cylinderPrefab = new PrimitiveCylinderPrefab( 12, 12, 25 );
		this._torusPrefab = new PrimitiveTorusPrefab( 12, 12 );

		for(var i:number = 0; i < 40; i++) {

			// Create object.
			var object:Mesh = this.createSimpleObject();

			// Random orientation.
			//object.rotationX = 360*Math.random();
			//object.rotationY = 360*Math.random();
			object.rotationZ = 360*Math.random();

			// Random position.
			var r:number = 200 + 100*Math.random();
			var azimuth:number = 2*Math.PI*Math.random();
			var elevation:number = 0.25 * Math.PI*Math.random();
			object.x = r*Math.cos(elevation)*Math.sin(azimuth);
			object.y = r*Math.sin(elevation);
			object.z = r*Math.cos(elevation)*Math.cos(azimuth);
		}
	}

	private createSimpleObject():Mesh
	{

		var mesh:Mesh;
		var boundsType:string;

		// Chose a random mesh.
		var randGeometry:number = Math.random();
		if( randGeometry > 0.75 ) {
			mesh = <Mesh> this._cubePrefab.getNewObject();
		}
		else if( randGeometry > 0.5 ) {
			mesh = <Mesh> this._spherePrefab.getNewObject();
			boundsType = BoundsType.SPHERE; // better on spherical meshes with bound picking colliders
		}
		else if( randGeometry > 0.25 ) {
			mesh = <Mesh> this._cylinderPrefab.getNewObject();

		}
		else {
			mesh = <Mesh> this._torusPrefab.getNewObject();
		}

		if (boundsType)
			mesh.boundsType = boundsType;

		// Randomly decide if the mesh has a triangle collider.
		var usesTriangleCollider:boolean = Math.random() > 0.5;
		if( usesTriangleCollider ) {
			// AS3 triangle pickers for meshes with low poly counts are faster than pixel bender ones.
			//				mesh.pickingCollider = PickingColliderType.BOUNDS_ONLY; // this is the default value for all meshes
			mesh.pickingCollider = new JSPickingCollider(this._renderer.stage);
			//				mesh.pickingCollider = PickingColliderType.AS3_BEST_HIT; // slower and more accurate, best for meshes with folds
			//				mesh.pickingCollider = PickingColliderType.AUTO_FIRST_ENCOUNTERED; // automatically decides when to use pixel bender or actionscript
		}

		// Enable mouse interactivity?
		var isMouseEnabled:boolean = Math.random() > 0.25;
		mesh.mouseEnabled = mesh.mouseChildren = isMouseEnabled;

		// Enable mouse listeners?
		var listensToMouseEvents:boolean = Math.random() > 0.25;
		if( isMouseEnabled && listensToMouseEvents ) {
			this.enableMeshMouseListeners(mesh);
		}

		// Apply material according to the random setup of the object.
		this.choseMeshMaterial(mesh);

		// Add to scene and store.
		this._view.scene.addChild(mesh);

		return mesh;
	}

	private choseMeshMaterial(mesh:Mesh):void
	{
		if( !mesh.mouseEnabled ) {
			mesh.material = this._blackMaterial;
		}
		else {
			if( !mesh.hasEventListener( AwayMouseEvent.MOUSE_MOVE ) ) {
				mesh.material = this._grayMaterial;
			}
			else {
				if( mesh.pickingCollider != null ) {
					mesh.material = this._redMaterial;
				}
				else {
					mesh.material = this._blueMaterial;
				}
			}
		}
	}

	/**
	 * Initialise the listeners
	 */
	private initListeners():void
	{
		window.onresize  = (event:UIEvent) => this.onResize(event);

		document.onmousedown = (event:MouseEvent) => this.onMouseDown(event);
		document.onmouseup = (event:MouseEvent) => this.onMouseUp(event);
		document.onmousemove = (event:MouseEvent) => this.onMouseMove(event);
		document.onmousewheel = (event:MouseWheelEvent) => this.onMouseWheel(event);
		document.onkeydown = (event:KeyboardEvent) => this.onKeyDown(event);
		document.onkeyup = (event:KeyboardEvent) => this.onKeyUp(event);

		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		// Move light with camera.
		this._pointLight.transform.position = this._camera.transform.position;

		var collidingObject:PickingCollisionVO = this._raycastPicker.getSceneCollision(this._camera.transform.position, this._view.camera.transform.forwardVector, this._view.scene);
		//var mesh:Mesh;

		if (this._previoiusCollidingObject && this._previoiusCollidingObject != collidingObject) { //equivalent to mouse out
			this._scenePositionTracer.visible = this._sceneNormalTracer.visible = false;
			this._scenePositionTracer.transform.position = new Vector3D();
		}

		if (collidingObject) {
			// Show tracers.
			this._scenePositionTracer.visible = this._sceneNormalTracer.visible = true;

			// Update position tracer.
			this._scenePositionTracer.transform.position = collidingObject.displayObject.sceneTransform.transformVector(collidingObject.localPosition);

			// Update normal tracer.
			this._sceneNormalTracer.transform.position = this._scenePositionTracer.transform.position;
			var normal:Vector3D = collidingObject.displayObject.sceneTransform.deltaTransformVector(collidingObject.localNormal);
			normal.normalize();
			normal.scaleBy( 25 );
			this._sceneNormalTracer.endPosition = normal.clone();
		}


		this._previoiusCollidingObject = collidingObject;

		// Render 3D.
		this._view.render();
	}

	/**
	 * Key down listener for camera control
	 */
	private onKeyDown(event:KeyboardEvent):void
	{
		switch (event.keyCode) {
			case Keyboard.UP:
			case Keyboard.W:
				this._tiltIncrement = this._tiltSpeed;
				break;
			case Keyboard.DOWN:
			case Keyboard.S:
				this._tiltIncrement = -this._tiltSpeed;
				break;
			case Keyboard.LEFT:
			case Keyboard.A:
				this._panIncrement = this._panSpeed;
				break;
			case Keyboard.RIGHT:
			case Keyboard.D:
				this._panIncrement = -this._panSpeed;
				break;
			case Keyboard.Z:
				this._distanceIncrement = this._distanceSpeed;
				break;
			case Keyboard.X:
				this._distanceIncrement = -this._distanceSpeed;
				break;
		}
	}

	/**
	 * Key up listener for camera control
	 */
	private onKeyUp(event:KeyboardEvent):void
	{
		switch (event.keyCode) {
			case Keyboard.UP:
			case Keyboard.W:
			case Keyboard.DOWN:
			case Keyboard.S:
				this._tiltIncrement = 0;
				break;
			case Keyboard.LEFT:
			case Keyboard.A:
			case Keyboard.RIGHT:
			case Keyboard.D:
				this._panIncrement = 0;
				break;
			case Keyboard.Z:
			case Keyboard.X:
				this._distanceIncrement = 0;
				break;
		}
	}

	// ---------------------------------------------------------------------
	// 3D mouse event handlers.
	// ---------------------------------------------------------------------

	private enableMeshMouseListeners(mesh:Mesh):void
	{
		mesh.addEventListener(AwayMouseEvent.MOUSE_OVER, (event:AwayMouseEvent) => this.onMeshMouseOver(event));
		mesh.addEventListener(AwayMouseEvent.MOUSE_OUT, (event:AwayMouseEvent) => this.onMeshMouseOut(event));
		mesh.addEventListener(AwayMouseEvent.MOUSE_MOVE, (event:AwayMouseEvent) => this.onMeshMouseMove(event));
		mesh.addEventListener(AwayMouseEvent.MOUSE_DOWN, (event:AwayMouseEvent) => this.onMeshMouseDown(event));
	}

	/**
	 * mesh listener for mouse down interaction
	 */
	private onMeshMouseDown(event:AwayMouseEvent):void
	{
		//var mesh:Mesh = <Mesh> event.object;
		//// Paint on the head's material.
		//if( mesh == this._head ) {
		//	var uv:Point = event.uv;
		//	var textureMaterial:MethodMaterial = (<MethodMaterial> (<Mesh> event.object).material);
		//	var bmd:BitmapData = BitmapTexture( textureMaterial.texture ).bitmapData;
		//	var x:number = Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE*uv.x;
		//	var y:number = Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE*uv.y;
		//	var matrix:Matrix = new Matrix();
		//	matrix.translate(x, y);
		//	bmd.draw(this._painter, matrix);
		//	BitmapTexture(textureMaterial.texture).invalidateContent();
		//}
	}

	/**
	 * mesh listener for mouse over interaction
	 */
	private onMeshMouseOver(event:AwayMouseEvent):void
	{
		var mesh:Mesh = <Mesh> event.object;
		mesh.debugVisible = true;
		if( mesh != this._head ) mesh.material = this._whiteMaterial;
		this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
		this.onMeshMouseMove(event);
	}

	/**
	 * mesh listener for mouse out interaction
	 */
	private onMeshMouseOut(event:AwayMouseEvent):void
	{
		var mesh:Mesh = <Mesh> event.object;
		mesh.debugVisible = false;
		if( mesh != this._head ) this.choseMeshMaterial( mesh );
		this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = false;
		this._pickingPositionTracer.transform.position = new Vector3D();
	}

	/**
	 * mesh listener for mouse move interaction
	 */
	private onMeshMouseMove(event:AwayMouseEvent):void
	{
		// Show tracers.
		this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
	
		// Update position tracer.
		this._pickingPositionTracer.transform.position = event.scenePosition;
	
		// Update normal tracer.
		this._pickingNormalTracer.transform.position = this._pickingPositionTracer.transform.position;
		var normal:Vector3D = event.sceneNormal.clone();
		normal.scaleBy( 25 );
		this._pickingNormalTracer.endPosition = normal.clone();
	}

	/**
	 * Mouse down listener for navigation
	 */
	private onMouseDown(event:MouseEvent):void
	{
		this._lastPanAngle = this._cameraController.panAngle;
		this._lastTiltAngle = this._cameraController.tiltAngle;
		this._lastMouseX = event.clientX;
		this._lastMouseY = event.clientY;
		this._move = true;
	}

	/**
	 * Mouse up listener for navigation
	 */
	private onMouseUp(event:MouseEvent):void
	{
		this._move = false;
	}

	/**
	 * Mouse move listener for navigation
	 */
	private onMouseMove(event:MouseEvent)
	{
		if (this._move) {
			this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		}
	}

	/**
	 * Mouse wheel listener for navigation
	 */
	private onMouseWheel(event:MouseWheelEvent)
	{
		this._cameraController.distance -= event.wheelDelta;

		if (this._cameraController.distance < 100)
			this._cameraController.distance = 100;
		else if (this._cameraController.distance > 2000)
			this._cameraController.distance = 2000;
	}

	/**
	 * window listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this._view.y = 0;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}

window.onload = function()
{
	new Intermediate_MouseInteraction();
}