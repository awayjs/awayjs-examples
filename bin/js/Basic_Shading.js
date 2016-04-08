webpackJsonp([7],[
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
	var Sampler2D_1 = __webpack_require__(72);
	var LoaderEvent_1 = __webpack_require__(5);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(296);
	var URLRequest_1 = __webpack_require__(3);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var Scene_1 = __webpack_require__(11);
	var View_1 = __webpack_require__(9);
	var HoverController_1 = __webpack_require__(98);
	var Camera_1 = __webpack_require__(45);
	var DirectionalLight_1 = __webpack_require__(210);
	var DefaultMaterialManager_1 = __webpack_require__(71);
	var StaticLightPicker_1 = __webpack_require__(218);
	var PrimitiveCubePrefab_1 = __webpack_require__(228);
	var PrimitivePlanePrefab_1 = __webpack_require__(229);
	var PrimitiveSpherePrefab_1 = __webpack_require__(230);
	var PrimitiveTorusPrefab_1 = __webpack_require__(231);
	var Single2DTexture_1 = __webpack_require__(96);
	var DefaultRenderer_1 = __webpack_require__(116);
	var MethodMaterial_1 = __webpack_require__(256);
	var ElementsType_1 = __webpack_require__(224);
	/**
	 *
	 */
	var Basic_Shading = (function () {
	    /**
	     * Constructor
	     */
	    function Basic_Shading() {
	        this._time = 0;
	        this._move = false;
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Basic_Shading.prototype.init = function () {
	        this.initEngine();
	        this.initLights();
	        this.initMaterials();
	        this.initObjects();
	        this.initListeners();
	    };
	    /**
	     * Initialise the engine
	     */
	    Basic_Shading.prototype.initEngine = function () {
	        this._scene = new Scene_1.default();
	        this._camera = new Camera_1.default();
	        this._view = new View_1.default(new DefaultRenderer_1.default());
	        this._view.scene = this._scene;
	        this._view.camera = this._camera;
	        //setup controller to be used on the camera
	        this._cameraController = new HoverController_1.default(this._camera);
	        this._cameraController.distance = 1000;
	        this._cameraController.minTiltAngle = 0;
	        this._cameraController.maxTiltAngle = 90;
	        this._cameraController.panAngle = 45;
	        this._cameraController.tiltAngle = 20;
	    };
	    /**
	     * Initialise the entities
	     */
	    Basic_Shading.prototype.initLights = function () {
	        this._light1 = new DirectionalLight_1.default();
	        this._light1.direction = new Vector3D_1.default(0, -1, 0);
	        this._light1.ambient = 0.1;
	        this._light1.diffuse = 0.7;
	        this._scene.addChild(this._light1);
	        this._light2 = new DirectionalLight_1.default();
	        this._light2.direction = new Vector3D_1.default(0, -1, 0);
	        this._light2.color = 0x00FFFF;
	        this._light2.ambient = 0.1;
	        this._light2.diffuse = 0.7;
	        this._scene.addChild(this._light2);
	        this._lightPicker = new StaticLightPicker_1.default([this._light1, this._light2]);
	    };
	    /**
	     * Initialise the materials
	     */
	    Basic_Shading.prototype.initMaterials = function () {
	        this._planeMaterial = new MethodMaterial_1.default(DefaultMaterialManager_1.default.getDefaultImage2D());
	        this._planeMaterial.lightPicker = this._lightPicker;
	        this._planeMaterial.style.sampler = new Sampler2D_1.default(true, true, true);
	        this._sphereMaterial = new MethodMaterial_1.default(DefaultMaterialManager_1.default.getDefaultImage2D());
	        this._sphereMaterial.lightPicker = this._lightPicker;
	        this._cubeMaterial = new MethodMaterial_1.default(DefaultMaterialManager_1.default.getDefaultImage2D());
	        this._cubeMaterial.lightPicker = this._lightPicker;
	        this._cubeMaterial.style.sampler = new Sampler2D_1.default(true, true);
	        this._torusMaterial = new MethodMaterial_1.default(DefaultMaterialManager_1.default.getDefaultImage2D());
	        this._torusMaterial.lightPicker = this._lightPicker;
	        this._torusMaterial.style.sampler = new Sampler2D_1.default(true, true, true);
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Basic_Shading.prototype.initObjects = function () {
	        this._plane = new PrimitivePlanePrefab_1.default(this._planeMaterial, ElementsType_1.default.TRIANGLE, 1000, 1000).getNewObject();
	        this._plane.graphics.scaleUV(2, 2);
	        this._plane.y = -20;
	        this._scene.addChild(this._plane);
	        this._sphere = new PrimitiveSpherePrefab_1.default(this._sphereMaterial, ElementsType_1.default.TRIANGLE, 150, 40, 20).getNewObject();
	        this._sphere.x = 300;
	        this._sphere.y = 160;
	        this._sphere.z = 300;
	        this._scene.addChild(this._sphere);
	        this._cube = new PrimitiveCubePrefab_1.default(this._cubeMaterial, ElementsType_1.default.TRIANGLE, 200, 200, 200, 1, 1, 1, false).getNewObject();
	        this._cube.x = 300;
	        this._cube.y = 160;
	        this._cube.z = -250;
	        this._scene.addChild(this._cube);
	        this._torus = new PrimitiveTorusPrefab_1.default(this._torusMaterial, ElementsType_1.default.TRIANGLE, 150, 60, 40, 20).getNewObject();
	        this._torus.graphics.scaleUV(10, 5);
	        this._torus.x = -250;
	        this._torus.y = 160;
	        this._torus.z = -250;
	        this._scene.addChild(this._torus);
	    };
	    /**
	     * Initialise the listeners
	     */
	    Basic_Shading.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        document.onmousedown = function (event) { return _this.onMouseDown(event); };
	        document.onmouseup = function (event) { return _this.onMouseUp(event); };
	        document.onmousemove = function (event) { return _this.onMouseMove(event); };
	        document.onmousewheel = function (event) { return _this.onMouseWheel(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this._timer.start();
	        AssetLibrary_1.default.addEventListener(LoaderEvent_1.default.LOAD_COMPLETE, function (event) { return _this.onLoadComplete(event); });
	        //plane textures
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/floor_diffuse.jpg"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/floor_normal.jpg"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/floor_specular.jpg"));
	        //sphere textures
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/beachball_diffuse.jpg"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/beachball_specular.jpg"));
	        //cube textures
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/trinket_diffuse.jpg"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/trinket_normal.jpg"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/trinket_specular.jpg"));
	        //torus textures
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/weave_diffuse.jpg"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/weave_normal.jpg"));
	    };
	    /**
	     * Navigation and render loop
	     */
	    Basic_Shading.prototype.onEnterFrame = function (dt) {
	        this._time += dt;
	        this._light1.direction = new Vector3D_1.default(Math.sin(this._time / 10000) * 150000, -1000, Math.cos(this._time / 10000) * 150000);
	        this._view.render();
	    };
	    /**
	     * Listener function for resource complete event on asset library
	     */
	    Basic_Shading.prototype.onLoadComplete = function (event) {
	        var assets = event.assets;
	        var length = assets.length;
	        for (var c = 0; c < length; c++) {
	            var asset = assets[c];
	            console.log(asset.name, event.url);
	            switch (event.url) {
	                //plane textures
	                case "assets/floor_diffuse.jpg":
	                    this._planeMaterial.style.image = asset;
	                    break;
	                case "assets/floor_normal.jpg":
	                    this._planeMaterial.normalMethod.texture = new Single2DTexture_1.default(asset);
	                    break;
	                case "assets/floor_specular.jpg":
	                    this._planeMaterial.specularMethod.texture = new Single2DTexture_1.default(asset);
	                    break;
	                //sphere textures
	                case "assets/beachball_diffuse.jpg":
	                    this._sphereMaterial.style.image = asset;
	                    break;
	                case "assets/beachball_specular.jpg":
	                    this._sphereMaterial.specularMethod.texture = new Single2DTexture_1.default(asset);
	                    break;
	                //cube textures
	                case "assets/trinket_diffuse.jpg":
	                    this._cubeMaterial.style.image = asset;
	                    break;
	                case "assets/trinket_normal.jpg":
	                    this._cubeMaterial.normalMethod.texture = new Single2DTexture_1.default(asset);
	                    break;
	                case "assets/trinket_specular.jpg":
	                    this._cubeMaterial.specularMethod.texture = new Single2DTexture_1.default(asset);
	                    break;
	                //torus textures
	                case "assets/weave_diffuse.jpg":
	                    this._torusMaterial.style.image = asset;
	                    break;
	                case "assets/weave_normal.jpg":
	                    this._torusMaterial.normalMethod.texture = this._torusMaterial.specularMethod.texture = new Single2DTexture_1.default(asset);
	                    break;
	            }
	        }
	    };
	    /**
	     * Mouse down listener for navigation
	     */
	    Basic_Shading.prototype.onMouseDown = function (event) {
	        this._lastPanAngle = this._cameraController.panAngle;
	        this._lastTiltAngle = this._cameraController.tiltAngle;
	        this._lastMouseX = event.clientX;
	        this._lastMouseY = event.clientY;
	        this._move = true;
	    };
	    /**
	     * Mouse up listener for navigation
	     */
	    Basic_Shading.prototype.onMouseUp = function (event) {
	        this._move = false;
	    };
	    /**
	     * Mouse move listener for navigation
	     */
	    Basic_Shading.prototype.onMouseMove = function (event) {
	        if (this._move) {
	            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
	            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
	        }
	    };
	    /**
	     * Mouse wheel listener for navigation
	     */
	    Basic_Shading.prototype.onMouseWheel = function (event) {
	        this._cameraController.distance -= event.wheelDelta;
	        if (this._cameraController.distance < 100)
	            this._cameraController.distance = 100;
	        else if (this._cameraController.distance > 2000)
	            this._cameraController.distance = 2000;
	    };
	    /**
	     * window listener for resize events
	     */
	    Basic_Shading.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return Basic_Shading;
	}());
	window.onload = function () {
	    new Basic_Shading();
	};


/***/ }
]);
//# sourceMappingURL=Basic_Shading.js.map