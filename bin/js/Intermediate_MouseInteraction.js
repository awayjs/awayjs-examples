webpackJsonp([16],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
	"use strict";
	var BitmapImage2D_1 = __webpack_require__(80);
	var AssetEvent_1 = __webpack_require__(1);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(307);
	var URLRequest_1 = __webpack_require__(3);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var Keyboard_1 = __webpack_require__(330);
	var View_1 = __webpack_require__(9);
	var HoverController_1 = __webpack_require__(111);
	var BoundsType_1 = __webpack_require__(31);
	var LineSegment_1 = __webpack_require__(365);
	var Sprite_1 = __webpack_require__(57);
	var PointLight_1 = __webpack_require__(227);
	var MouseEvent_1 = __webpack_require__(55);
	var ElementsType_1 = __webpack_require__(235);
	var BasicMaterial_1 = __webpack_require__(101);
	var StaticLightPicker_1 = __webpack_require__(229);
	var RaycastPicker_1 = __webpack_require__(44);
	var JSPickingCollider_1 = __webpack_require__(326);
	var PrimitiveCubePrefab_1 = __webpack_require__(239);
	var PrimitiveCylinderPrefab_1 = __webpack_require__(238);
	var PrimitiveSpherePrefab_1 = __webpack_require__(241);
	var PrimitiveTorusPrefab_1 = __webpack_require__(242);
	var DefaultRenderer_1 = __webpack_require__(129);
	var MethodMaterial_1 = __webpack_require__(267);
	var OBJParser_1 = __webpack_require__(334);
	/**
	 *
	 */
	var Intermediate_MouseInteraction = (function () {
	    /**
	     * Constructor
	     */
	    function Intermediate_MouseInteraction() {
	        this._time = 0;
	        this._raycastPicker = new RaycastPicker_1.default(false);
	        //navigation variables
	        this._move = false;
	        this._tiltSpeed = 4;
	        this._panSpeed = 4;
	        this._distanceSpeed = 4;
	        this._tiltIncrement = 0;
	        this._panIncrement = 0;
	        this._distanceIncrement = 0;
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Intermediate_MouseInteraction.prototype.init = function () {
	        this.initEngine();
	        this.initLights();
	        this.initMaterials();
	        this.initObjects();
	        this.initListeners();
	    };
	    /**
	     * Initialise the engine
	     */
	    Intermediate_MouseInteraction.prototype.initEngine = function () {
	        this._renderer = new DefaultRenderer_1.default();
	        this._view = new View_1.default(this._renderer);
	        this._view.forceMouseMove = true;
	        this._scene = this._view.scene;
	        this._camera = this._view.camera;
	        this._view.mousePicker = new RaycastPicker_1.default(true);
	        //setup controller to be used on the camera
	        this._cameraController = new HoverController_1.default(this._camera, null, 180, 20, 320, 5);
	    };
	    /**
	     * Initialise the lights
	     */
	    Intermediate_MouseInteraction.prototype.initLights = function () {
	        //create a light for the camera
	        this._pointLight = new PointLight_1.default();
	        this._scene.addChild(this._pointLight);
	        this._lightPicker = new StaticLightPicker_1.default([this._pointLight]);
	    };
	    /**
	     * Initialise the material
	     */
	    Intermediate_MouseInteraction.prototype.initMaterials = function () {
	        // uv painter
	        //this._painter = new Sprite();
	        //this._painter.graphics.beginFill( 0xFF0000 );
	        //this._painter.graphics.drawCircle( 0, 0, 10 );
	        //this._painter.graphics.endFill();
	        // locator materials
	        this._whiteMaterial = new MethodMaterial_1.default(0xFFFFFF);
	        this._whiteMaterial.lightPicker = this._lightPicker;
	        this._blackMaterial = new MethodMaterial_1.default(0x333333);
	        this._blackMaterial.lightPicker = this._lightPicker;
	        this._grayMaterial = new MethodMaterial_1.default(0xCCCCCC);
	        this._grayMaterial.lightPicker = this._lightPicker;
	        this._blueMaterial = new MethodMaterial_1.default(0x0000FF);
	        this._blueMaterial.lightPicker = this._lightPicker;
	        this._redMaterial = new MethodMaterial_1.default(0xFF0000);
	        this._redMaterial.lightPicker = this._lightPicker;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Intermediate_MouseInteraction.prototype.initObjects = function () {
	        var _this = this;
	        // To trace mouse hit position.
	        this._pickingPositionTracer = new PrimitiveSpherePrefab_1.default(new MethodMaterial_1.default(0x00FF00, 0.5), ElementsType_1.default.TRIANGLE, 2).getNewObject();
	        this._pickingPositionTracer.visible = false;
	        this._pickingPositionTracer.mouseEnabled = false;
	        this._pickingPositionTracer.mouseChildren = false;
	        this._scene.addChild(this._pickingPositionTracer);
	        this._scenePositionTracer = new PrimitiveSpherePrefab_1.default(new MethodMaterial_1.default(0x0000FF, 0.5), ElementsType_1.default.TRIANGLE, 2).getNewObject();
	        this._scenePositionTracer.visible = false;
	        this._scenePositionTracer.mouseEnabled = false;
	        this._scene.addChild(this._scenePositionTracer);
	        // To trace picking normals.
	        this._pickingNormalTracer = new LineSegment_1.default(new BasicMaterial_1.default(0xFFFFFF), new Vector3D_1.default(), new Vector3D_1.default(), 3);
	        this._pickingNormalTracer.mouseEnabled = false;
	        this._pickingNormalTracer.visible = false;
	        this._view.scene.addChild(this._pickingNormalTracer);
	        this._sceneNormalTracer = new LineSegment_1.default(new BasicMaterial_1.default(0xFFFFFF), new Vector3D_1.default(), new Vector3D_1.default(), 3);
	        this._sceneNormalTracer.mouseEnabled = false;
	        this._sceneNormalTracer.visible = false;
	        this._view.scene.addChild(this._sceneNormalTracer);
	        // Load a head model that we will be able to paint on on mouse down.
	        this._session = AssetLibrary_1.default.getLoader();
	        this._session.addEventListener(AssetEvent_1.default.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
	        this._session.load(new URLRequest_1.default('assets/head.obj'), null, null, new OBJParser_1.default(25));
	        // Produce a bunch of objects to be around the scene.
	        this.createABunchOfObjects();
	        this._raycastPicker.setIgnoreList([this._sceneNormalTracer, this._scenePositionTracer]);
	        this._raycastPicker.onlyMouseEnabled = false;
	    };
	    /**
	     * Listener for asset complete event on loader
	     */
	    Intermediate_MouseInteraction.prototype.onAssetComplete = function (event) {
	        if (event.asset.isAsset(Sprite_1.default)) {
	            this.initializeHeadModel(event.asset);
	        }
	    };
	    Intermediate_MouseInteraction.prototype.initializeHeadModel = function (model) {
	        this._head = model;
	        // Apply a bitmap material that can be painted on.
	        var bmd = new BitmapImage2D_1.default(Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, false, 0xCCCCCC);
	        //bmd.perlinNoise(50, 50, 8, 1, false, true, 7, true);
	        var textureMaterial = new MethodMaterial_1.default(bmd);
	        textureMaterial.lightPicker = this._lightPicker;
	        model.material = textureMaterial;
	        model.pickingCollider = new JSPickingCollider_1.default();
	        // Apply mouse interactivity.
	        model.mouseEnabled = model.mouseChildren = true;
	        this.enableSpriteMouseListeners(model);
	        this._view.scene.addChild(model);
	    };
	    Intermediate_MouseInteraction.prototype.createABunchOfObjects = function () {
	        this._cubePrefab = new PrimitiveCubePrefab_1.default(null, ElementsType_1.default.TRIANGLE, 25, 50, 25);
	        this._spherePrefab = new PrimitiveSpherePrefab_1.default(null, ElementsType_1.default.TRIANGLE, 12);
	        this._cylinderPrefab = new PrimitiveCylinderPrefab_1.default(null, ElementsType_1.default.TRIANGLE, 12, 12, 25);
	        this._torusPrefab = new PrimitiveTorusPrefab_1.default(null, ElementsType_1.default.TRIANGLE, 12, 12);
	        for (var i = 0; i < 40; i++) {
	            // Create object.
	            var object = this.createSimpleObject();
	            // Random orientation.
	            //object.rotationX = 360*Math.random();
	            //object.rotationY = 360*Math.random();
	            object.rotationZ = 360 * Math.random();
	            // Random position.
	            var r = 200 + 100 * Math.random();
	            var azimuth = 2 * Math.PI * Math.random();
	            var elevation = 0.25 * Math.PI * Math.random();
	            object.x = r * Math.cos(elevation) * Math.sin(azimuth);
	            object.y = r * Math.sin(elevation);
	            object.z = r * Math.cos(elevation) * Math.cos(azimuth);
	        }
	    };
	    Intermediate_MouseInteraction.prototype.createSimpleObject = function () {
	        var sprite;
	        var boundsType;
	        // Chose a random sprite.
	        var randGeometry = Math.random();
	        if (randGeometry > 0.75) {
	            sprite = this._cubePrefab.getNewObject();
	        }
	        else if (randGeometry > 0.5) {
	            sprite = this._spherePrefab.getNewObject();
	            boundsType = BoundsType_1.default.SPHERE; // better on spherical sprites with bound picking colliders
	        }
	        else if (randGeometry > 0.25) {
	            sprite = this._cylinderPrefab.getNewObject();
	        }
	        else {
	            sprite = this._torusPrefab.getNewObject();
	        }
	        if (boundsType)
	            sprite.boundsType = boundsType;
	        // Randomly decide if the sprite has a triangle collider.
	        var usesTriangleCollider = Math.random() > 0.5;
	        if (usesTriangleCollider) {
	            // AS3 triangle pickers for sprites with low poly counts are faster than pixel bender ones.
	            //				sprite.pickingCollider = PickingColliderType.BOUNDS_ONLY; // this is the default value for all sprites
	            sprite.pickingCollider = new JSPickingCollider_1.default();
	        }
	        // Enable mouse interactivity?
	        var isMouseEnabled = Math.random() > 0.25;
	        sprite.mouseEnabled = sprite.mouseChildren = isMouseEnabled;
	        // Enable mouse listeners?
	        var listensToMouseEvents = Math.random() > 0.25;
	        if (isMouseEnabled && listensToMouseEvents) {
	            this.enableSpriteMouseListeners(sprite);
	        }
	        // Apply material according to the random setup of the object.
	        this.choseSpriteMaterial(sprite);
	        // Add to scene and store.
	        this._view.scene.addChild(sprite);
	        return sprite;
	    };
	    Intermediate_MouseInteraction.prototype.choseSpriteMaterial = function (sprite) {
	        if (!sprite.mouseEnabled) {
	            sprite.material = this._blackMaterial;
	        }
	        else {
	            if (!sprite.hasEventListener(MouseEvent_1.default.MOUSE_MOVE)) {
	                sprite.material = this._grayMaterial;
	            }
	            else {
	                if (sprite.pickingCollider != null) {
	                    sprite.material = this._redMaterial;
	                }
	                else {
	                    sprite.material = this._blueMaterial;
	                }
	            }
	        }
	    };
	    /**
	     * Initialise the listeners
	     */
	    Intermediate_MouseInteraction.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        document.onmousedown = function (event) { return _this.onMouseDown(event); };
	        document.onmouseup = function (event) { return _this.onMouseUp(event); };
	        document.onmousemove = function (event) { return _this.onMouseMove(event); };
	        document.onmousewheel = function (event) { return _this.onMouseWheel(event); };
	        document.onkeydown = function (event) { return _this.onKeyDown(event); };
	        document.onkeyup = function (event) { return _this.onKeyUp(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this._timer.start();
	    };
	    /**
	     * Navigation and render loop
	     */
	    Intermediate_MouseInteraction.prototype.onEnterFrame = function (dt) {
	        // Move light with camera.
	        var pos = this._camera.transform.position;
	        this._pointLight.transform.moveTo(pos.x, pos.y, pos.y);
	        var collidingObject = this._raycastPicker.getSceneCollision(this._camera.transform.position, this._view.camera.transform.forwardVector, this._view.scene);
	        //var sprite:Sprite;
	        if (this._previoiusCollidingObject && this._previoiusCollidingObject != collidingObject) {
	            this._scenePositionTracer.visible = this._sceneNormalTracer.visible = false;
	            this._scenePositionTracer.transform.moveTo(0, 0, 0);
	        }
	        if (collidingObject) {
	            // Show tracers.
	            this._scenePositionTracer.visible = this._sceneNormalTracer.visible = true;
	            // Update position tracer.
	            pos = collidingObject.entity.sceneTransform.transformVector(collidingObject.position);
	            this._scenePositionTracer.transform.moveTo(pos.x, pos.y, pos.z);
	            // Update normal tracer.
	            pos = this._scenePositionTracer.transform.position;
	            this._sceneNormalTracer.transform.moveTo(pos.x, pos.y, pos.z);
	            var normal = collidingObject.entity.sceneTransform.deltaTransformVector(collidingObject.normal);
	            normal.normalize();
	            normal.scaleBy(25);
	            this._sceneNormalTracer.endPosition = normal.clone();
	        }
	        this._previoiusCollidingObject = collidingObject;
	        // Render 3D.
	        this._view.render();
	    };
	    /**
	     * Key down listener for camera control
	     */
	    Intermediate_MouseInteraction.prototype.onKeyDown = function (event) {
	        switch (event.keyCode) {
	            case Keyboard_1.default.UP:
	            case Keyboard_1.default.W:
	                this._tiltIncrement = this._tiltSpeed;
	                break;
	            case Keyboard_1.default.DOWN:
	            case Keyboard_1.default.S:
	                this._tiltIncrement = -this._tiltSpeed;
	                break;
	            case Keyboard_1.default.LEFT:
	            case Keyboard_1.default.A:
	                this._panIncrement = this._panSpeed;
	                break;
	            case Keyboard_1.default.RIGHT:
	            case Keyboard_1.default.D:
	                this._panIncrement = -this._panSpeed;
	                break;
	            case Keyboard_1.default.Z:
	                this._distanceIncrement = this._distanceSpeed;
	                break;
	            case Keyboard_1.default.X:
	                this._distanceIncrement = -this._distanceSpeed;
	                break;
	        }
	    };
	    /**
	     * Key up listener for camera control
	     */
	    Intermediate_MouseInteraction.prototype.onKeyUp = function (event) {
	        switch (event.keyCode) {
	            case Keyboard_1.default.UP:
	            case Keyboard_1.default.W:
	            case Keyboard_1.default.DOWN:
	            case Keyboard_1.default.S:
	                this._tiltIncrement = 0;
	                break;
	            case Keyboard_1.default.LEFT:
	            case Keyboard_1.default.A:
	            case Keyboard_1.default.RIGHT:
	            case Keyboard_1.default.D:
	                this._panIncrement = 0;
	                break;
	            case Keyboard_1.default.Z:
	            case Keyboard_1.default.X:
	                this._distanceIncrement = 0;
	                break;
	        }
	    };
	    // ---------------------------------------------------------------------
	    // 3D mouse event handlers.
	    // ---------------------------------------------------------------------
	    Intermediate_MouseInteraction.prototype.enableSpriteMouseListeners = function (sprite) {
	        var _this = this;
	        sprite.addEventListener(MouseEvent_1.default.MOUSE_OVER, function (event) { return _this.onSpriteMouseOver(event); });
	        sprite.addEventListener(MouseEvent_1.default.MOUSE_OUT, function (event) { return _this.onSpriteMouseOut(event); });
	        sprite.addEventListener(MouseEvent_1.default.MOUSE_MOVE, function (event) { return _this.onSpriteMouseMove(event); });
	        sprite.addEventListener(MouseEvent_1.default.MOUSE_DOWN, function (event) { return _this.onSpriteMouseDown(event); });
	    };
	    /**
	     * sprite listener for mouse down interaction
	     */
	    Intermediate_MouseInteraction.prototype.onSpriteMouseDown = function (event) {
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
	    };
	    /**
	     * sprite listener for mouse over interaction
	     */
	    Intermediate_MouseInteraction.prototype.onSpriteMouseOver = function (event) {
	        var sprite = event.entity;
	        sprite.debugVisible = true;
	        if (sprite != this._head)
	            sprite.material = this._whiteMaterial;
	        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
	        this.onSpriteMouseMove(event);
	    };
	    /**
	     * sprite listener for mouse out interaction
	     */
	    Intermediate_MouseInteraction.prototype.onSpriteMouseOut = function (event) {
	        var sprite = event.entity;
	        sprite.debugVisible = false;
	        if (sprite != this._head)
	            this.choseSpriteMaterial(sprite);
	        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = false;
	        this._pickingPositionTracer.transform.moveTo(0, 0, 0);
	    };
	    /**
	     * sprite listener for mouse move interaction
	     */
	    Intermediate_MouseInteraction.prototype.onSpriteMouseMove = function (event) {
	        var pos;
	        // Show tracers.
	        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
	        // Update position tracer.
	        pos = event.scenePosition;
	        this._pickingPositionTracer.transform.moveTo(pos.x, pos.y, pos.z);
	        // Update normal tracer.
	        pos = this._pickingPositionTracer.transform.position;
	        this._pickingNormalTracer.transform.moveTo(pos.x, pos.y, pos.z);
	        var normal = event.sceneNormal.clone();
	        normal.scaleBy(25);
	        this._pickingNormalTracer.endPosition = normal.clone();
	    };
	    /**
	     * Mouse down listener for navigation
	     */
	    Intermediate_MouseInteraction.prototype.onMouseDown = function (event) {
	        this._lastPanAngle = this._cameraController.panAngle;
	        this._lastTiltAngle = this._cameraController.tiltAngle;
	        this._lastMouseX = event.clientX;
	        this._lastMouseY = event.clientY;
	        this._move = true;
	    };
	    /**
	     * Mouse up listener for navigation
	     */
	    Intermediate_MouseInteraction.prototype.onMouseUp = function (event) {
	        this._move = false;
	    };
	    /**
	     * Mouse move listener for navigation
	     */
	    Intermediate_MouseInteraction.prototype.onMouseMove = function (event) {
	        if (this._move) {
	            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
	            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
	        }
	    };
	    /**
	     * Mouse wheel listener for navigation
	     */
	    Intermediate_MouseInteraction.prototype.onMouseWheel = function (event) {
	        this._cameraController.distance -= event.wheelDelta;
	        if (this._cameraController.distance < 100)
	            this._cameraController.distance = 100;
	        else if (this._cameraController.distance > 2000)
	            this._cameraController.distance = 2000;
	    };
	    /**
	     * window listener for resize events
	     */
	    Intermediate_MouseInteraction.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE = 1024;
	    return Intermediate_MouseInteraction;
	}());
	window.onload = function () {
	    new Intermediate_MouseInteraction();
	};


/***/ }
]);
//# sourceMappingURL=Intermediate_MouseInteraction.js.map