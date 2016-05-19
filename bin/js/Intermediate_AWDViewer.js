webpackJsonp([12],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	
	AWD file loading example in Away3d
	
	Demonstrates:
	
	How to use the LoaderContainer object to load an embedded internal awd model.
	
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
	var AssetLibrary_1 = __webpack_require__(305);
	var URLRequest_1 = __webpack_require__(3);
	var Keyboard_1 = __webpack_require__(328);
	var PerspectiveProjection_1 = __webpack_require__(48);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var AnimationNodeBase_1 = __webpack_require__(258);
	var LoaderContainer_1 = __webpack_require__(115);
	var View_1 = __webpack_require__(9);
	var HoverController_1 = __webpack_require__(112);
	var AnimatorBase_1 = __webpack_require__(246);
	var CrossfadeTransition_1 = __webpack_require__(354);
	var AnimationStateEvent_1 = __webpack_require__(253);
	var DefaultRenderer_1 = __webpack_require__(130);
	var AWDParser_1 = __webpack_require__(211);
	var Intermediate_AWDViewer = (function () {
	    /**
	     * Constructor
	     */
	    function Intermediate_AWDViewer() {
	        this._time = 0;
	        this._stateTransition = new CrossfadeTransition_1.default(0.5);
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Intermediate_AWDViewer.prototype.init = function () {
	        this.initEngine();
	        this.initObjects();
	        this.initListeners();
	    };
	    /**
	     * Initialise the engine
	     */
	    Intermediate_AWDViewer.prototype.initEngine = function () {
	        //create the view
	        this._view = new View_1.default(new DefaultRenderer_1.default());
	        this._view.backgroundColor = 0x333338;
	        //create custom lens
	        this._view.camera.projection = new PerspectiveProjection_1.default(70);
	        this._view.camera.projection.far = 5000;
	        this._view.camera.projection.near = 1;
	        //setup controller to be used on the camera
	        this._cameraController = new HoverController_1.default(this._view.camera, null, 0, 0, 150, 10, 90);
	        this._cameraController.lookAtPosition = new Vector3D_1.default(0, 60, 0);
	        this._cameraController.tiltAngle = 0;
	        this._cameraController.panAngle = 0;
	        this._cameraController.minTiltAngle = 5;
	        this._cameraController.maxTiltAngle = 60;
	        this._cameraController.autoUpdate = false;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Intermediate_AWDViewer.prototype.initObjects = function () {
	        var _this = this;
	        AssetLibrary_1.default.enableParser(AWDParser_1.default);
	        //kickoff asset loading
	        var loader = new LoaderContainer_1.default();
	        loader.addEventListener(AssetEvent_1.default.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
	        loader.load(new URLRequest_1.default("assets/shambler.awd"));
	        this._view.scene.addChild(loader);
	    };
	    /**
	     * Initialise the listeners
	     */
	    Intermediate_AWDViewer.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        document.onmousedown = function (event) { return _this.onMouseDown(event); };
	        document.onmouseup = function (event) { return _this.onMouseUp(event); };
	        document.onmousemove = function (event) { return _this.onMouseMove(event); };
	        document.onmousewheel = function (event) { return _this.onMouseWheel(event); };
	        document.onkeydown = function (event) { return _this.onKeyDown(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this._timer.start();
	    };
	    /**
	     * loader listener for asset complete events
	     */
	    Intermediate_AWDViewer.prototype.onAssetComplete = function (event) {
	        var _this = this;
	        if (event.asset.isAsset(AnimatorBase_1.default)) {
	            this._animator = event.asset;
	            this._animator.play(Intermediate_AWDViewer.IDLE_NAME);
	        }
	        else if (event.asset.isAsset(AnimationNodeBase_1.default)) {
	            var node = event.asset;
	            if (node.name == Intermediate_AWDViewer.IDLE_NAME) {
	                node.looping = true;
	            }
	            else {
	                node.looping = false;
	                node.addEventListener(AnimationStateEvent_1.default.PLAYBACK_COMPLETE, function (event) { return _this.onPlaybackComplete(event); });
	            }
	        }
	    };
	    /**
	     * Key down listener for animation
	     */
	    Intermediate_AWDViewer.prototype.onKeyDown = function (event) {
	        switch (event.keyCode) {
	            case Keyboard_1.default.NUMBER_1:
	                this.playAction("attack01");
	                break;
	            case Keyboard_1.default.NUMBER_2:
	                this.playAction("attack02");
	                break;
	            case Keyboard_1.default.NUMBER_3:
	                this.playAction("attack03");
	                break;
	            case Keyboard_1.default.NUMBER_4:
	                this.playAction("attack04");
	                break;
	            case Keyboard_1.default.NUMBER_5:
	                this.playAction("attack05");
	        }
	    };
	    Intermediate_AWDViewer.prototype.playAction = function (name) {
	        this._animator.play(name, this._stateTransition, 0);
	    };
	    Intermediate_AWDViewer.prototype.onPlaybackComplete = function (event) {
	        if (this._animator.activeState != event.animationState)
	            return;
	        this._animator.play(Intermediate_AWDViewer.IDLE_NAME, this._stateTransition);
	    };
	    /**
	     * Render loop
	     */
	    Intermediate_AWDViewer.prototype.onEnterFrame = function (dt) {
	        this._time += dt;
	        //update camera controler
	        this._cameraController.update();
	        //update view
	        this._view.render();
	    };
	    /**
	     * Mouse down listener for navigation
	     */
	    Intermediate_AWDViewer.prototype.onMouseDown = function (event) {
	        this._lastPanAngle = this._cameraController.panAngle;
	        this._lastTiltAngle = this._cameraController.tiltAngle;
	        this._lastMouseX = event.clientX;
	        this._lastMouseY = event.clientY;
	        this._move = true;
	    };
	    /**
	     * Mouse up listener for navigation
	     */
	    Intermediate_AWDViewer.prototype.onMouseUp = function (event) {
	        this._move = false;
	    };
	    Intermediate_AWDViewer.prototype.onMouseMove = function (event) {
	        if (this._move) {
	            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
	            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
	        }
	    };
	    /**
	     * Mouse wheel listener for navigation
	     */
	    Intermediate_AWDViewer.prototype.onMouseWheel = function (event) {
	        this._cameraController.distance -= event.wheelDelta * 5;
	        if (this._cameraController.distance < 100)
	            this._cameraController.distance = 100;
	        else if (this._cameraController.distance > 2000)
	            this._cameraController.distance = 2000;
	    };
	    /**
	     * window listener for resize events
	     */
	    Intermediate_AWDViewer.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    Intermediate_AWDViewer.IDLE_NAME = "idle";
	    return Intermediate_AWDViewer;
	}());
	window.onload = function () {
	    new Intermediate_AWDViewer();
	};


/***/ }
]);
//# sourceMappingURL=Intermediate_AWDViewer.js.map