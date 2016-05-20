webpackJsonp([9],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	
	Basic 3D scene example in Away3D
	
	Demonstrates:
	
	How to setup a view and add 3D objects.
	How to apply materials to a 3D object and dynamically load textures
	How to create a frame tick that updates the contents of the scene
	
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
	var LoaderEvent_1 = __webpack_require__(5);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(305);
	var URLRequest_1 = __webpack_require__(3);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var View_1 = __webpack_require__(9);
	var PrimitivePlanePrefab_1 = __webpack_require__(237);
	var Single2DTexture_1 = __webpack_require__(104);
	var DefaultRenderer_1 = __webpack_require__(130);
	var BasicMaterial_1 = __webpack_require__(102);
	var ElementsType_1 = __webpack_require__(232);
	var Basic_View = (function () {
	    /**
	     * Constructor
	     */
	    function Basic_View() {
	        var _this = this;
	        //setup the view
	        this._view = new View_1.View(new DefaultRenderer_1.DefaultRenderer());
	        //setup the camera
	        this._view.camera.z = -600;
	        this._view.camera.y = 500;
	        this._view.camera.lookAt(new Vector3D_1.Vector3D());
	        //setup the materials
	        this._planeMaterial = new BasicMaterial_1.BasicMaterial();
	        //setup the scene
	        this._plane = new PrimitivePlanePrefab_1.PrimitivePlanePrefab(this._planeMaterial, ElementsType_1.ElementsType.TRIANGLE, 700, 700).getNewObject();
	        this._view.scene.addChild(this._plane);
	        //setup the render loop
	        window.onresize = function (event) { return _this.onResize(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.RequestAnimationFrame(this.onEnterFrame, this);
	        this._timer.start();
	        AssetLibrary_1.AssetLibrary.addEventListener(LoaderEvent_1.LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        //plane textures
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/floor_diffuse.jpg"));
	    }
	    /**
	     * render loop
	     */
	    Basic_View.prototype.onEnterFrame = function (dt) {
	        this._plane.rotationY += 1;
	        this._view.render();
	    };
	    /**
	     * Listener function for resource complete event on asset library
	     */
	    Basic_View.prototype.onResourceComplete = function (event) {
	        var assets = event.assets;
	        var length = assets.length;
	        for (var c = 0; c < length; c++) {
	            var asset = assets[c];
	            console.log(asset.name, event.url);
	            switch (event.url) {
	                //plane textures
	                case "assets/floor_diffuse.jpg":
	                    this._planeMaterial.texture = new Single2DTexture_1.Single2DTexture(asset);
	                    break;
	            }
	        }
	    };
	    /**
	     * stage listener for resize events
	     */
	    Basic_View.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return Basic_View;
	}());
	window.onload = function () {
	    new Basic_View();
	};


/***/ }
]);
//# sourceMappingURL=Basic_View.js.map