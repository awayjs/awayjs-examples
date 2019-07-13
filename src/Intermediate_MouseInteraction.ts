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

import {AssetEvent, Vector3D, AssetLibrary, Loader, URLRequest, Keyboard, RequestAnimationFrame} from "@awayjs/core";
import {BitmapImage2D} from "@awayjs/stage";
import {PickingCollision, BoundingVolumeType, RaycastPicker, BasicPartition, PickGroup} from "@awayjs/view";
import {ElementsType} from "@awayjs/graphics";
import {HoverController, Sprite, Scene, Camera, LineSegment, PrimitiveCubePrefab, PrimitiveCylinderPrefab, PrimitiveSpherePrefab, PrimitiveTorusPrefab, MouseEvent, DisplayObjectContainer} from "@awayjs/scene";
import {MethodMaterial, BasicMaterial, PointLight, StaticLightPicker} from "@awayjs/materials";
import {OBJParser} from "@awayjs/parsers";
import {View} from "@awayjs/view";
/**
 *
 */
class Intermediate_MouseInteraction
{
	//engine variables
	private _scene:Scene;
	private _camera:Camera;
	private _view:View;
	private _root:DisplayObjectContainer;
	private _session:Loader;
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
	private _pickingPositionTracer:Sprite;
	private _scenePositionTracer:Sprite;
	private _pickingNormalTracer:LineSegment;
	private _sceneNormalTracer:LineSegment;
	private _previoiusCollidingObject:PickingCollision;
	private _raycastPicker:RaycastPicker;
	private _head:Sprite;
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
		this._scene = new Scene();
		this._scene.forceMouseMove = true;
		this._camera = this._scene.camera;
		this._view = this._scene.view;
		this._root = this._scene.root;

		this._raycastPicker = PickGroup.getInstance(this._view).getRaycastPicker(this._scene.renderer.partition);
		this._raycastPicker.findClosestCollision = true;

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
		this._pickingPositionTracer = <Sprite> new PrimitiveSpherePrefab(new MethodMaterial(0x00FF00, 0.5), ElementsType.TRIANGLE, 2).getNewObject();
		this._pickingPositionTracer.visible = false;
		this._pickingPositionTracer.mouseEnabled = false;
		this._pickingPositionTracer.mouseChildren = false;
		this._root.addChild(this._pickingPositionTracer);

		this._scenePositionTracer = <Sprite> new PrimitiveSpherePrefab(new MethodMaterial(0x0000FF, 0.5), ElementsType.TRIANGLE, 2).getNewObject();
		this._scenePositionTracer.visible = false;
		this._scenePositionTracer.mouseEnabled = false;
		this._root.addChild(this._scenePositionTracer);


		// To trace picking normals.
		this._pickingNormalTracer = new LineSegment(new BasicMaterial(0xFFFFFF), new Vector3D(), new Vector3D(), 3);
		this._pickingNormalTracer.mouseEnabled = false;
		this._pickingNormalTracer.visible = false;
		this._root.addChild(this._pickingNormalTracer);

		this._sceneNormalTracer = new LineSegment(new BasicMaterial(0xFFFFFF), new Vector3D(), new Vector3D(), 3);
		this._sceneNormalTracer.mouseEnabled = false;
		this._sceneNormalTracer.visible = false;
		this._root.addChild(this._sceneNormalTracer);


		// Load a head model that we will be able to paint on on mouse down.
		this._session = AssetLibrary.getLoader();
		this._session.addEventListener(AssetEvent.ASSET_COMPLETE, (event:AssetEvent) => this.onAssetComplete(event));
		this._session.load(new URLRequest('assets/head.obj'), null, null, new OBJParser( 25 ));

		// Produce a bunch of objects to be around the scene.
		this.createABunchOfObjects();

		this._scene.mousePicker.setIgnoreList([this._pickingNormalTracer, this._pickingPositionTracer, this._sceneNormalTracer, this._scenePositionTracer]);
		this._raycastPicker.setIgnoreList([this._pickingNormalTracer, this._pickingPositionTracer, this._sceneNormalTracer, this._scenePositionTracer]);
		//this._raycastPicker.onlyMouseEnabled = false;
	}

	/**
	 * Listener for asset complete event on loader
	 */
	private onAssetComplete(event:AssetEvent):void
	{
		if (event.asset.isAsset(Sprite)) {
			this.initializeHeadModel(<Sprite> event.asset);
		}
	}

	private initializeHeadModel( model:Sprite ):void
	{
		this._head = model;

		// Apply a bitmap material that can be painted on.
		var bmd:BitmapImage2D = new BitmapImage2D(Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, false, 0xCCCCCC);
		//bmd.perlinNoise(50, 50, 8, 1, false, true, 7, true);
		var textureMaterial:MethodMaterial = new MethodMaterial(bmd);
		textureMaterial.lightPicker = this._lightPicker;
		model.material = textureMaterial;

		// Apply mouse interactivity.
		model.mouseEnabled = model.mouseChildren = true;
		model.partition = new BasicPartition(model);

		this.enableSpriteMouseListeners(model);

		this._root.addChild(model);
		this._scene.renderer.renderGroup.pickGroup.getAbstraction(model).shapeFlag = true;
	}

	private createABunchOfObjects():void
	{
		this._cubePrefab = new PrimitiveCubePrefab(null, ElementsType.TRIANGLE, 25, 50, 25 );
		this._spherePrefab = new PrimitiveSpherePrefab(null, ElementsType.TRIANGLE, 12);
		this._cylinderPrefab = new PrimitiveCylinderPrefab(null, ElementsType.TRIANGLE, 12, 12, 25 );
		this._torusPrefab = new PrimitiveTorusPrefab(null, ElementsType.TRIANGLE, 12, 12 );

		for(var i:number = 0; i < 40; i++) {

			// Create object.
			var object:Sprite = this.createSimpleObject();

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

	private createSimpleObject():Sprite
	{

		var sprite:Sprite;

		// Chose a random sprite.
		var randGeometry:number = Math.random();
		if( randGeometry > 0.75 ) {
			sprite = <Sprite> this._cubePrefab.getNewObject();
		}
		else if( randGeometry > 0.5 ) {
			sprite = <Sprite> this._spherePrefab.getNewObject();
			sprite.defaultBoundingVolume = BoundingVolumeType.SPHERE; // better on spherical sprites with bound picking colliders
		}
		else if( randGeometry > 0.25 ) {
			sprite = <Sprite> this._cylinderPrefab.getNewObject();

		}
		else {
			sprite = <Sprite> this._torusPrefab.getNewObject();
		}

		// Enable mouse interactivity?
		var isMouseEnabled:boolean = Math.random() > 0.25;
		sprite.mouseEnabled = sprite.mouseChildren = isMouseEnabled;

		if (isMouseEnabled)
			sprite.partition = new BasicPartition(sprite);

		// Enable mouse listeners?
		var listensToMouseEvents:boolean = Math.random() > 0.25;
		if( isMouseEnabled && listensToMouseEvents ) {
			this.enableSpriteMouseListeners(sprite);
		}

		// Add to scene and store.
		this._root.addChild(sprite);

		// Randomly decide if the sprite has a triangle collider.
		this._scene.renderer.renderGroup.pickGroup.getAbstraction(sprite).shapeFlag = Boolean(Math.random() > 0.5);

		// Apply material according to the random setup of the object.
		this.choseSpriteMaterial(sprite);

		return sprite;
	}

	private choseSpriteMaterial(sprite:Sprite):void
	{
		if (!sprite.mouseEnabled) {
			sprite.material = this._blackMaterial;
		} else {
			if (!sprite.hasEventListener(MouseEvent.MOUSE_MOVE)) {
				sprite.material = this._grayMaterial;
			} else {
				sprite.material = this._scene.renderer.renderGroup.pickGroup.getAbstraction(sprite).shapeFlag? this._redMaterial : this._blueMaterial;
			}
		}
	}

	/**
	 * Initialise the listeners
	 */
	private initListeners():void
	{
		window.onresize  = (event:UIEvent) => this.onResize(event);

		document.onmousedown = (event) => this.onMouseDown(event);
		document.onmouseup = (event) => this.onMouseUp(event);
		document.onmousemove = (event) => this.onMouseMove(event);
		document.onmousewheel = (event:WheelEvent) => this.onMouseWheel(event);
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
		var pos:Vector3D = this._camera.transform.position;
		this._pointLight.transform.moveTo(pos.x, pos.y, pos.z);

		var collidingObject:PickingCollision = this._raycastPicker.getCollision(this._camera.transform.position, this._scene.camera.transform.forwardVector);
		//var sprite:Sprite;

		if (this._previoiusCollidingObject && this._previoiusCollidingObject != collidingObject) { //equivalent to mouse out
			this._scenePositionTracer.visible = this._sceneNormalTracer.visible = false;
			this._scenePositionTracer.transform.moveTo(0, 0, 0);
		}

		if (collidingObject) {
			// Show tracers.
			this._scenePositionTracer.visible = this._sceneNormalTracer.visible = true;

			// Update position tracer.
			pos = collidingObject.entity.transform.concatenatedMatrix3D.transformVector(collidingObject.position);
			this._scenePositionTracer.transform.moveTo(pos.x, pos.y, pos.z);

			// Update normal tracer.
			pos = this._scenePositionTracer.transform.position;
			this._sceneNormalTracer.transform.moveTo(pos.x, pos.y, pos.z);
			var normal:Vector3D = collidingObject.entity.transform.concatenatedMatrix3D.deltaTransformVector(collidingObject.normal);
			normal.normalize();
			normal.scaleBy( 25 );
			this._sceneNormalTracer.endPosition = normal.clone();
		}


		this._previoiusCollidingObject = collidingObject;

		// Render 3D.
		this._scene.render();
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

	private enableSpriteMouseListeners(sprite:Sprite):void
	{
		sprite.addEventListener(MouseEvent.MOUSE_OVER, (event:MouseEvent) => this.onSpriteMouseOver(event));
		sprite.addEventListener(MouseEvent.MOUSE_OUT, (event:MouseEvent) => this.onSpriteMouseOut(event));
		sprite.addEventListener(MouseEvent.MOUSE_MOVE, (event:MouseEvent) => this.onSpriteMouseMove(event));
		sprite.addEventListener(MouseEvent.MOUSE_DOWN, (event:MouseEvent) => this.onSpriteMouseDown(event));
	}

	/**
	 * sprite listener for mouse down interaction
	 */
	private onSpriteMouseDown(event:MouseEvent):void
	{
		//var sprite:Sprite = <Sprite> event.object;
		//// Paint on the head's material.
		//if( sprite == this._head ) {
		//	var uv:Point = event.uv;
		//	var textureMaterial:MethodMaterial = (<MethodMaterial> (<Sprite> event.object).material);
		//	var bmd:BitmapData = Single2DTexture( textureMaterial.texture ).bitmapData;
		//	var x:number = Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE*uv.x;
		//	var y:number = Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE*uv.y;
		//	var matrix:Matrix = new Matrix();
		//	matrix.translate(x, y);
		//	bmd.draw(this._painter, matrix);
		//	Single2DTexture(textureMaterial.texture).invalidateContent();
		//}
	}

	/**
	 * sprite listener for mouse over interaction
	 */
	private onSpriteMouseOver(event:MouseEvent):void
	{
		var sprite:Sprite = <Sprite> event.entity;
		sprite.boundsVisible = true;
		if( sprite != this._head ) sprite.material = this._whiteMaterial;
		this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
		this.onSpriteMouseMove(event);
	}

	/**
	 * sprite listener for mouse out interaction
	 */
	private onSpriteMouseOut(event:MouseEvent):void
	{
		var sprite:Sprite = <Sprite> event.entity;
		sprite.boundsVisible = false;
		if( sprite != this._head ) this.choseSpriteMaterial( sprite );
		this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = false;
		this._pickingPositionTracer.transform.moveTo(0, 0, 0);
	}

	/**
	 * sprite listener for mouse move interaction
	 */
	private onSpriteMouseMove(event:MouseEvent):void
	{
		var pos:Vector3D;

		// Show tracers.
		this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
	
		// Update position tracer.
		pos = event.scenePosition;
		this._pickingPositionTracer.transform.moveTo(pos.x, pos.y, pos.z);
	
		// Update normal tracer.
		pos = this._pickingPositionTracer.transform.position;
		this._pickingNormalTracer.transform.moveTo(pos.x, pos.y, pos.z);
		var normal:Vector3D = event.sceneNormal.clone();
		normal.scaleBy( 25 );
		this._pickingNormalTracer.endPosition = normal.clone();
	}

	/**
	 * Mouse down listener for navigation
	 */
	private onMouseDown(event):void
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
	private onMouseUp(event):void
	{
		this._move = false;
	}

	/**
	 * Mouse move listener for navigation
	 */
	private onMouseMove(event)
	{
		if (this._move) {
			this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		}
	}

	/**
	 * Mouse wheel listener for navigation
	 */
	private onMouseWheel(event:WheelEvent)
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