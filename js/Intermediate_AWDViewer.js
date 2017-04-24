webpackJsonp([8],{

/***/ 32:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_stage__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_renderer__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_view__ = __webpack_require__(2);
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







var Intermediate_AWDViewer = function () {
    /**
     * Constructor
     */
    function Intermediate_AWDViewer() {
        this._time = 0;
        this._stateTransition = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_renderer__["CrossfadeTransition"](0.5);
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
        this._view = new __WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_view__["View"]();
        this._view.backgroundColor = 0x333338;
        //create custom lens
        this._view.camera.projection = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["PerspectiveProjection"](70);
        this._view.camera.projection.far = 5000;
        this._view.camera.projection.near = 1;
        //setup controller to be used on the camera
        this._cameraController = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["HoverController"](this._view.camera, null, 0, 0, 150, 10, 90);
        this._cameraController.lookAtPosition = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](0, 60, 0);
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
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].enableParser(__WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_parsers__["AWDParser"]);
        //kickoff asset loading
        var loader = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["LoaderContainer"]();
        loader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetEvent"].ASSET_COMPLETE, function (event) {
            return _this.onAssetComplete(event);
        });
        loader.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/shambler.awd"));
        this._view.scene.addChild(loader);
    };
    /**
     * Initialise the listeners
     */
    Intermediate_AWDViewer.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        document.onmousedown = function (event) {
            return _this.onMouseDown(event);
        };
        document.onmouseup = function (event) {
            return _this.onMouseUp(event);
        };
        document.onmousemove = function (event) {
            return _this.onMouseMove(event);
        };
        document.onmousewheel = function (event) {
            return _this.onMouseWheel(event);
        };
        document.onkeydown = function (event) {
            return _this.onKeyDown(event);
        };
        this.onResize();
        this._timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * loader listener for asset complete events
     */
    Intermediate_AWDViewer.prototype.onAssetComplete = function (event) {
        var _this = this;
        if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_stage__["AnimatorBase"])) {
            this._animator = event.asset;
            this._animator.play(Intermediate_AWDViewer.IDLE_NAME);
        } else if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["AnimationNodeBase"])) {
            var node = event.asset;
            if (node.name == Intermediate_AWDViewer.IDLE_NAME) {
                node.looping = true;
            } else {
                node.looping = false;
                node.addEventListener(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_renderer__["AnimationStateEvent"].PLAYBACK_COMPLETE, function (event) {
                    return _this.onPlaybackComplete(event);
                });
            }
        }
    };
    /**
     * Key down listener for animation
     */
    Intermediate_AWDViewer.prototype.onKeyDown = function (event) {
        switch (event.keyCode) {
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_1:
                this.playAction("attack01");
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_2:
                this.playAction("attack02");
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_3:
                this.playAction("attack03");
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_4:
                this.playAction("attack04");
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_5:
                this.playAction("attack05");
        }
    };
    Intermediate_AWDViewer.prototype.playAction = function (name) {
        this._animator.play(name, this._stateTransition, 0);
    };
    Intermediate_AWDViewer.prototype.onPlaybackComplete = function (event) {
        if (this._animator.activeState != event.animationState) return;
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
        if (this._cameraController.distance < 100) this._cameraController.distance = 100;else if (this._cameraController.distance > 2000) this._cameraController.distance = 2000;
    };
    /**
     * window listener for resize events
     */
    Intermediate_AWDViewer.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Intermediate_AWDViewer;
}();
Intermediate_AWDViewer.IDLE_NAME = "idle";
window.onload = function () {
    new Intermediate_AWDViewer();
};

/***/ }

},[32]);
//# sourceMappingURL=Intermediate_AWDViewer.js.map