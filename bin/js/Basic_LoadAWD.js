webpackJsonp([6],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	
	AWD file loading example in Away3d
	
	Demonstrates:
	
	How to use the Loader3D object to load an embedded internal 3ds model.
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
	var AssetEvent_1 = __webpack_require__(1);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(296);
	var URLRequest_1 = __webpack_require__(3);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var View_1 = __webpack_require__(9);
	var DirectionalLight_1 = __webpack_require__(210);
	var Sprite_1 = __webpack_require__(57);
	var StaticLightPicker_1 = __webpack_require__(218);
	var DefaultRenderer_1 = __webpack_require__(116);
	var MethodMaterial_1 = __webpack_require__(256);
	var AWDParser_1 = __webpack_require__(201);
	var Basic_LoadAWD = (function () {
	    /**
	     * Constructor
	     */
	    function Basic_LoadAWD() {
	        this._time = 0;
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Basic_LoadAWD.prototype.init = function () {
	        this.initEngine();
	        this.initLights();
	        this.initMaterials();
	        this.initObjects();
	        this.initListeners();
	    };
	    /**
	     * Initialise the engine
	     */
	    Basic_LoadAWD.prototype.initEngine = function () {
	        this._view = new View_1.default(new DefaultRenderer_1.default());
	        //set the background of the view to something suitable
	        this._view.backgroundColor = 0x1e2125;
	        //position the camera
	        this._view.camera.z = -2000;
	    };
	    /**
	     * Initialise the entities
	     */
	    Basic_LoadAWD.prototype.initLights = function () {
	        //create the light for the scene
	        this._light = new DirectionalLight_1.default();
	        this._light.color = 0x683019;
	        this._light.direction = new Vector3D_1.default(1, 0, 0);
	        this._light.ambient = 0.5;
	        this._light.ambientColor = 0x30353b;
	        this._light.diffuse = 2.8;
	        this._light.specular = 1.8;
	        this._view.scene.addChild(this._light);
	        //create the light picker for the material
	        this._lightPicker = new StaticLightPicker_1.default([this._light]);
	    };
	    /**
	     * Initialise the materials
	     */
	    Basic_LoadAWD.prototype.initMaterials = function () {
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Basic_LoadAWD.prototype.initObjects = function () {
	    };
	    /**
	     * Initialise the listeners
	     */
	    Basic_LoadAWD.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this._timer.start();
	        AssetLibrary_1.default.enableParser(AWDParser_1.default);
	        AssetLibrary_1.default.addEventListener(AssetEvent_1.default.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
	        AssetLibrary_1.default.load(new URLRequest_1.default('assets/suzanne.awd'));
	    };
	    /**
	     * Navigation and render loop
	     */
	    Basic_LoadAWD.prototype.onEnterFrame = function (dt) {
	        this._time += dt;
	        if (this._suzanne)
	            this._suzanne.rotationY += 1;
	        this._view.render();
	    };
	    /**
	     * Listener function for asset complete event on loader
	     */
	    Basic_LoadAWD.prototype.onAssetComplete = function (event) {
	        var asset = event.asset;
	        switch (asset.assetType) {
	            case Sprite_1.default.assetType:
	                var sprite = asset;
	                sprite.y = -300;
	                sprite.transform.scaleTo(900, 900, 900);
	                this._suzanne = sprite;
	                this._view.scene.addChild(sprite);
	                break;
	            case MethodMaterial_1.default.assetType:
	                var material = asset;
	                material.lightPicker = this._lightPicker;
	                break;
	        }
	    };
	    /**
	     * stage listener for resize events
	     */
	    Basic_LoadAWD.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return Basic_LoadAWD;
	}());
	window.onload = function () {
	    new Basic_LoadAWD();
	};


/***/ }
]);
//# sourceMappingURL=Basic_LoadAWD.js.map