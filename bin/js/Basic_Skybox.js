webpackJsonp([8],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	
	SkyBox example in Away3d
	
	Demonstrates:
	
	How to use a CubeTexture to create a SkyBox object.
	How to apply a CubeTexture to a material as an environment map.
	
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
	var SamplerCube_1 = __webpack_require__(228);
	var LoaderEvent_1 = __webpack_require__(5);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(305);
	var LoaderContext_1 = __webpack_require__(327);
	var URLRequest_1 = __webpack_require__(3);
	var PerspectiveProjection_1 = __webpack_require__(48);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var View_1 = __webpack_require__(9);
	var Skybox_1 = __webpack_require__(96);
	var ElementsType_1 = __webpack_require__(232);
	var PrimitiveTorusPrefab_1 = __webpack_require__(239);
	var SingleCubeTexture_1 = __webpack_require__(99);
	var DefaultRenderer_1 = __webpack_require__(130);
	var MethodMaterial_1 = __webpack_require__(265);
	var EffectEnvMapMethod_1 = __webpack_require__(284);
	var Basic_SkyBox = (function () {
	    /**
	     * Constructor
	     */
	    function Basic_SkyBox() {
	        this._time = 0;
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Basic_SkyBox.prototype.init = function () {
	        this.initEngine();
	        this.initMaterials();
	        this.initObjects();
	        this.initListeners();
	    };
	    /**
	     * Initialise the engine
	     */
	    Basic_SkyBox.prototype.initEngine = function () {
	        //setup the view
	        this._view = new View_1.View(new DefaultRenderer_1.DefaultRenderer());
	        //setup the camera
	        this._view.camera.z = -600;
	        this._view.camera.y = 0;
	        this._view.camera.lookAt(new Vector3D_1.Vector3D());
	        this._view.camera.projection = new PerspectiveProjection_1.PerspectiveProjection(90);
	        this._view.backgroundColor = 0xFFFF00;
	        this._mouseX = window.innerWidth / 2;
	    };
	    /**
	     * Initialise the materials
	     */
	    Basic_SkyBox.prototype.initMaterials = function () {
	        //setup the torus material
	        this._torusMaterial = new MethodMaterial_1.MethodMaterial(0xFFFFFF, 1);
	        this._torusMaterial.style.color = 0x111199;
	        this._torusMaterial.style.sampler = new SamplerCube_1.SamplerCube(true, true);
	        this._torusMaterial.specularMethod.strength = 0.5;
	        this._torusMaterial.ambientMethod.strength = 1;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Basic_SkyBox.prototype.initObjects = function () {
	        this._torus = new PrimitiveTorusPrefab_1.PrimitiveTorusPrefab(this._torusMaterial, ElementsType_1.ElementsType.TRIANGLE, 150, 60, 40, 20).getNewObject();
	        this._torus.debugVisible = true;
	        this._view.scene.addChild(this._torus);
	    };
	    /**
	     * Initialise the listeners
	     */
	    Basic_SkyBox.prototype.initListeners = function () {
	        var _this = this;
	        document.onmousemove = function (event) { return _this.onMouseMove(event); };
	        window.onresize = function (event) { return _this.onResize(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.RequestAnimationFrame(this.onEnterFrame, this);
	        this._timer.start();
	        AssetLibrary_1.AssetLibrary.addEventListener(LoaderEvent_1.LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        //setup the url map for textures in the cubemap file
	        var loaderContext = new LoaderContext_1.LoaderContext();
	        loaderContext.dependencyBaseUrl = "assets/skybox/";
	        //environment texture
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/skybox/snow_texture.cube"), loaderContext);
	    };
	    /**
	     * Navigation and render loop
	     */
	    Basic_SkyBox.prototype.onEnterFrame = function (dt) {
	        this._torus.rotationX += 2;
	        this._torus.rotationY += 1;
	        this._view.camera.transform.moveTo(0, 0, 0);
	        this._view.camera.rotationY += 0.5 * (this._mouseX - window.innerWidth / 2) / 800;
	        this._view.camera.transform.moveBackward(600);
	        this._view.render();
	    };
	    /**
	     * Listener function for resource complete event on asset library
	     */
	    Basic_SkyBox.prototype.onResourceComplete = function (event) {
	        switch (event.url) {
	            case 'assets/skybox/snow_texture.cube':
	                this._cubeTexture = new SingleCubeTexture_1.SingleCubeTexture(event.assets[0]);
	                this._skyBox = new Skybox_1.Skybox(event.assets[0]);
	                this._view.scene.addChild(this._skyBox);
	                this._torusMaterial.addEffectMethod(new EffectEnvMapMethod_1.EffectEnvMapMethod(this._cubeTexture, 1));
	                break;
	        }
	    };
	    /**
	     * Mouse move listener for navigation
	     */
	    Basic_SkyBox.prototype.onMouseMove = function (event) {
	        this._mouseX = event.clientX;
	        this._mouseY = event.clientY;
	    };
	    /**
	     * window listener for resize events
	     */
	    Basic_SkyBox.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return Basic_SkyBox;
	}());
	window.onload = function () {
	    new Basic_SkyBox();
	};


/***/ }
]);
//# sourceMappingURL=Basic_Skybox.js.map