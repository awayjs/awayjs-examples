webpackJsonp([15],{

/***/ 26:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__ = __webpack_require__(2);
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






var Basic_Load3DS = function () {
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
        this._view = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["View"]();
        //setup the camera for optimal shadow rendering
        this._view.camera.projection.far = 2100;
        //setup controller to be used on the camera
        this._cameraController = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["HoverController"](this._view.camera, null, 45, 20, 1000, 10);
    };
    /**
     * Initialise the lights
     */
    Basic_Load3DS.prototype.initLights = function () {
        this._light = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["DirectionalLight"](-1, -1, 1);
        this._light.castsShadows = true;
        this._direction = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](-1, -1, 1);
        this._lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([this._light]);
        this._view.scene.addChild(this._light);
    };
    /**
     * Initialise the materials
     */
    Basic_Load3DS.prototype.initMaterials = function () {
        this._groundMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"]();
        this._groundMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"]();
        this._groundMaterial.shadowMethod = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["ShadowSoftMethod"](this._light, 10, 5);
        this._groundMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true, true);
        this._groundMaterial.style.addSamplerAt(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true), this._light.shadowMapper.depthMap);
        this._groundMaterial.shadowMethod.epsilon = 0.2;
        this._groundMaterial.lightPicker = this._lightPicker;
        this._groundMaterial.specularMethod.strength = 0;
        //this._groundMaterial.mipmap = false;
    };
    /**
     * Initialise the scene objects
     */
    Basic_Load3DS.prototype.initObjects = function () {
        this._loader = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["LoaderContainer"]();
        this._loader.transform.scaleTo(300, 300, 300);
        this._loader.z = -200;
        this._view.scene.addChild(this._loader);
        this._plane = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitivePlanePrefab"](this._groundMaterial, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 1000, 1000);
        this._ground = this._plane.getNewObject();
        this._ground.castsShadows = false;
        this._view.scene.addChild(this._ground);
    };
    /**
     * Initialise the listeners
     */
    Basic_Load3DS.prototype.initListeners = function () {
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
        this.onResize();
        this._timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.onEnterFrame, this);
        this._timer.start();
        //setup the url map for textures in the 3ds file
        var loaderContext = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderContext"]();
        loaderContext.mapUrl("texture.jpg", "assets/soldier_ant.jpg");
        this._loader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetEvent"].ASSET_COMPLETE, function (event) {
            return _this.onAssetComplete(event);
        });
        this._loader.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/soldier_ant.3ds"), loaderContext, null, new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__["Max3DSParser"](false));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/CoarseRedSand.jpg"));
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
            case __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Sprite"].assetType:
                var sprite = event.asset;
                sprite.castsShadows = true;
                break;
            case __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"].assetType:
                var material = event.asset;
                material.shadowMethod = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["ShadowSoftMethod"](this._light, 10, 5);
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
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Basic_Load3DS;
}();
window.onload = function () {
    new Basic_Load3DS();
};

/***/ })

},[26]);
//# sourceMappingURL=Basic_Load3DS.js.map