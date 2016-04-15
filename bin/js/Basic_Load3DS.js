webpackJsonp([5],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	
	3ds file loading example in Away3d
	
	Demonstrates:
	
	How to use the Loader object to load an embedded internal 3ds model.
	How to map an external asset reference inside a file to an internal embedded asset.
	How to extract material data and use it to set custom material properties on a model.
	
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
	var Sampler2D_1 = __webpack_require__(78);
	var AssetEvent_1 = __webpack_require__(1);
	var LoaderEvent_1 = __webpack_require__(5);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(307);
	var LoaderContext_1 = __webpack_require__(329);
	var URLRequest_1 = __webpack_require__(3);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var LoaderContainer_1 = __webpack_require__(114);
	var View_1 = __webpack_require__(9);
	var HoverController_1 = __webpack_require__(111);
	var DirectionalLight_1 = __webpack_require__(221);
	var Sprite_1 = __webpack_require__(57);
	var ElementsType_1 = __webpack_require__(235);
	var StaticLightPicker_1 = __webpack_require__(229);
	var PrimitivePlanePrefab_1 = __webpack_require__(240);
	var Single2DTexture_1 = __webpack_require__(103);
	var DefaultRenderer_1 = __webpack_require__(129);
	var MethodMaterial_1 = __webpack_require__(267);
	var ShadowSoftMethod_1 = __webpack_require__(303);
	var Max3DSParser_1 = __webpack_require__(356);
	var Basic_Load3DS = (function () {
	    /**
	     * Constructor
	     */
	    function Basic_Load3DS() {
	        this._time = 0;
	        this._move = false;
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Basic_Load3DS.prototype.init = function () {
	        this.initEngine();
	        this.initLights();
	        this.initMaterials();
	        this.initObjects();
	        this.initListeners();
	    };
	    /**
	     * Initialise the engine
	     */
	    Basic_Load3DS.prototype.initEngine = function () {
	        this._view = new View_1.default(new DefaultRenderer_1.default());
	        //setup the camera for optimal shadow rendering
	        this._view.camera.projection.far = 2100;
	        //setup controller to be used on the camera
	        this._cameraController = new HoverController_1.default(this._view.camera, null, 45, 20, 1000, 10);
	    };
	    /**
	     * Initialise the lights
	     */
	    Basic_Load3DS.prototype.initLights = function () {
	        this._light = new DirectionalLight_1.default(-1, -1, 1);
	        this._light.castsShadows = true;
	        this._direction = new Vector3D_1.default(-1, -1, 1);
	        this._lightPicker = new StaticLightPicker_1.default([this._light]);
	        this._view.scene.addChild(this._light);
	    };
	    /**
	     * Initialise the materials
	     */
	    Basic_Load3DS.prototype.initMaterials = function () {
	        this._groundMaterial = new MethodMaterial_1.default();
	        this._groundMaterial.ambientMethod.texture = new Single2DTexture_1.default();
	        this._groundMaterial.shadowMethod = new ShadowSoftMethod_1.default(this._light, 10, 5);
	        this._groundMaterial.style.sampler = new Sampler2D_1.default(true, true, true);
	        this._groundMaterial.style.addSamplerAt(new Sampler2D_1.default(true, true), this._light.shadowMapper.depthMap);
	        this._groundMaterial.shadowMethod.epsilon = 0.2;
	        this._groundMaterial.lightPicker = this._lightPicker;
	        this._groundMaterial.specularMethod.strength = 0;
	        //this._groundMaterial.mipmap = false;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Basic_Load3DS.prototype.initObjects = function () {
	        this._loader = new LoaderContainer_1.default();
	        this._loader.transform.scaleTo(300, 300, 300);
	        this._loader.z = -200;
	        this._view.scene.addChild(this._loader);
	        this._plane = new PrimitivePlanePrefab_1.default(this._groundMaterial, ElementsType_1.default.TRIANGLE, 1000, 1000);
	        this._ground = this._plane.getNewObject();
	        this._ground.castsShadows = false;
	        this._view.scene.addChild(this._ground);
	    };
	    /**
	     * Initialise the listeners
	     */
	    Basic_Load3DS.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        document.onmousedown = function (event) { return _this.onMouseDown(event); };
	        document.onmouseup = function (event) { return _this.onMouseUp(event); };
	        document.onmousemove = function (event) { return _this.onMouseMove(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this._timer.start();
	        //setup the url map for textures in the 3ds file
	        var loaderContext = new LoaderContext_1.default();
	        loaderContext.mapUrl("texture.jpg", "assets/soldier_ant.jpg");
	        this._loader.addEventListener(AssetEvent_1.default.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
	        this._loader.load(new URLRequest_1.default("assets/soldier_ant.3ds"), loaderContext, null, new Max3DSParser_1.default(false));
	        AssetLibrary_1.default.addEventListener(LoaderEvent_1.default.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/CoarseRedSand.jpg"));
	    };
	    /**
	     * Navigation and render loop
	     */
	    Basic_Load3DS.prototype.onEnterFrame = function (dt) {
	        this._time += dt;
	        this._direction.x = -Math.sin(this._time / 4000);
	        this._direction.z = -Math.cos(this._time / 4000);
	        this._light.direction = this._direction;
	        this._view.render();
	    };
	    /**
	     * Listener function for asset complete event on loader
	     */
	    Basic_Load3DS.prototype.onAssetComplete = function (event) {
	        var asset = event.asset;
	        switch (asset.assetType) {
	            case Sprite_1.default.assetType:
	                var sprite = event.asset;
	                sprite.castsShadows = true;
	                break;
	            case MethodMaterial_1.default.assetType:
	                var material = event.asset;
	                material.shadowMethod = new ShadowSoftMethod_1.default(this._light, 10, 5);
	                material.shadowMethod.epsilon = 0.2;
	                material.lightPicker = this._lightPicker;
	                material.specularMethod.gloss = 30;
	                material.specularMethod.strength = 1;
	                material.style.color = 0x303040;
	                material.diffuseMethod.multiply = false;
	                material.ambientMethod.strength = 1;
	                break;
	        }
	    };
	    /**
	     * Listener function for resource complete event on asset library
	     */
	    Basic_Load3DS.prototype.onResourceComplete = function (event) {
	        var assets = event.assets;
	        var length = assets.length;
	        for (var c = 0; c < length; c++) {
	            var asset = assets[c];
	            console.log(asset.name, event.url);
	            switch (event.url) {
	                //plane textures
	                case "assets/CoarseRedSand.jpg":
	                    this._groundMaterial.style.image = asset;
	                    break;
	            }
	        }
	    };
	    /**
	     * Mouse down listener for navigation
	     */
	    Basic_Load3DS.prototype.onMouseDown = function (event) {
	        this._lastPanAngle = this._cameraController.panAngle;
	        this._lastTiltAngle = this._cameraController.tiltAngle;
	        this._lastMouseX = event.clientX;
	        this._lastMouseY = event.clientY;
	        this._move = true;
	    };
	    /**
	     * Mouse up listener for navigation
	     */
	    Basic_Load3DS.prototype.onMouseUp = function (event) {
	        this._move = false;
	    };
	    Basic_Load3DS.prototype.onMouseMove = function (event) {
	        if (this._move) {
	            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
	            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
	        }
	    };
	    /**
	     * stage listener for resize events
	     */
	    Basic_Load3DS.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return Basic_Load3DS;
	}());
	window.onload = function () {
	    new Basic_Load3DS();
	};


/***/ }
]);
//# sourceMappingURL=Basic_Load3DS.js.map