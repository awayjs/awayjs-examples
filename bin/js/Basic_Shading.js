(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Basic_Shading.ts":[function(require,module,exports){
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
var Sampler2D = require("awayjs-core/lib/image/Sampler2D");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Scene = require("awayjs-display/lib/containers/Scene");
var View = require("awayjs-display/lib/containers/View");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var Camera = require("awayjs-display/lib/entities/Camera");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var DefaultMaterialManager = require("awayjs-display/lib/managers/DefaultMaterialManager");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitiveCubePrefab = require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var PrimitiveSpherePrefab = require("awayjs-display/lib/prefabs/PrimitiveSpherePrefab");
var PrimitiveTorusPrefab = require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");
var Single2DTexture = require("awayjs-display/lib/textures/Single2DTexture");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
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
        this._scene = new Scene();
        this._camera = new Camera();
        this._view = new View(new DefaultRenderer());
        this._view.scene = this._scene;
        this._view.camera = this._camera;
        //setup controller to be used on the camera
        this._cameraController = new HoverController(this._camera);
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
        this._light1 = new DirectionalLight();
        this._light1.direction = new Vector3D(0, -1, 0);
        this._light1.ambient = 0.1;
        this._light1.diffuse = 0.7;
        this._scene.addChild(this._light1);
        this._light2 = new DirectionalLight();
        this._light2.direction = new Vector3D(0, -1, 0);
        this._light2.color = 0x00FFFF;
        this._light2.ambient = 0.1;
        this._light2.diffuse = 0.7;
        this._scene.addChild(this._light2);
        this._lightPicker = new StaticLightPicker([this._light1, this._light2]);
    };
    /**
     * Initialise the materials
     */
    Basic_Shading.prototype.initMaterials = function () {
        this._planeMaterial = new MethodMaterial(DefaultMaterialManager.getDefaultImage2D());
        this._planeMaterial.lightPicker = this._lightPicker;
        this._planeMaterial.style.sampler = new Sampler2D(true, true, true);
        this._sphereMaterial = new MethodMaterial(DefaultMaterialManager.getDefaultImage2D());
        this._sphereMaterial.lightPicker = this._lightPicker;
        this._cubeMaterial = new MethodMaterial(DefaultMaterialManager.getDefaultImage2D());
        this._cubeMaterial.lightPicker = this._lightPicker;
        this._cubeMaterial.style.sampler = new Sampler2D(true, true);
        this._torusMaterial = new MethodMaterial(DefaultMaterialManager.getDefaultImage2D());
        this._torusMaterial.lightPicker = this._lightPicker;
        this._torusMaterial.style.sampler = new Sampler2D(true, true, true);
    };
    /**
     * Initialise the scene objects
     */
    Basic_Shading.prototype.initObjects = function () {
        this._plane = new PrimitivePlanePrefab(1000, 1000).getNewObject();
        this._plane.material = this._planeMaterial;
        this._plane.geometry.scaleUV(2, 2);
        this._plane.y = -20;
        this._scene.addChild(this._plane);
        this._sphere = new PrimitiveSpherePrefab(150, 40, 20).getNewObject();
        this._sphere.material = this._sphereMaterial;
        this._sphere.x = 300;
        this._sphere.y = 160;
        this._sphere.z = 300;
        this._scene.addChild(this._sphere);
        this._cube = new PrimitiveCubePrefab(200, 200, 200, 1, 1, 1, false).getNewObject();
        this._cube.material = this._cubeMaterial;
        this._cube.x = 300;
        this._cube.y = 160;
        this._cube.z = -250;
        this._scene.addChild(this._cube);
        this._torus = new PrimitiveTorusPrefab(150, 60, 40, 20).getNewObject();
        this._torus.material = this._torusMaterial;
        this._torus.geometry.scaleUV(10, 5);
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
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
        AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onLoadComplete(event); });
        //plane textures
        AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
        AssetLibrary.load(new URLRequest("assets/floor_normal.jpg"));
        AssetLibrary.load(new URLRequest("assets/floor_specular.jpg"));
        //sphere textures
        AssetLibrary.load(new URLRequest("assets/beachball_diffuse.jpg"));
        AssetLibrary.load(new URLRequest("assets/beachball_specular.jpg"));
        //cube textures
        AssetLibrary.load(new URLRequest("assets/trinket_diffuse.jpg"));
        AssetLibrary.load(new URLRequest("assets/trinket_normal.jpg"));
        AssetLibrary.load(new URLRequest("assets/trinket_specular.jpg"));
        //torus textures
        AssetLibrary.load(new URLRequest("assets/weave_diffuse.jpg"));
        AssetLibrary.load(new URLRequest("assets/weave_normal.jpg"));
    };
    /**
     * Navigation and render loop
     */
    Basic_Shading.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        this._light1.direction = new Vector3D(Math.sin(this._time / 10000) * 150000, -1000, Math.cos(this._time / 10000) * 150000);
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
                case "assets/floor_diffuse.jpg":
                    this._planeMaterial.style.image = asset;
                    break;
                case "assets/floor_normal.jpg":
                    this._planeMaterial.normalMethod.texture = new Single2DTexture(asset);
                    break;
                case "assets/floor_specular.jpg":
                    this._planeMaterial.specularMethod.texture = new Single2DTexture(asset);
                    break;
                case "assets/beachball_diffuse.jpg":
                    this._sphereMaterial.style.image = asset;
                    break;
                case "assets/beachball_specular.jpg":
                    this._sphereMaterial.specularMethod.texture = new Single2DTexture(asset);
                    break;
                case "assets/trinket_diffuse.jpg":
                    this._cubeMaterial.style.image = asset;
                    break;
                case "assets/trinket_normal.jpg":
                    this._cubeMaterial.normalMethod.texture = new Single2DTexture(asset);
                    break;
                case "assets/trinket_specular.jpg":
                    this._cubeMaterial.specularMethod.texture = new Single2DTexture(asset);
                    break;
                case "assets/weave_diffuse.jpg":
                    this._torusMaterial.style.image = asset;
                    break;
                case "assets/weave_normal.jpg":
                    this._torusMaterial.normalMethod.texture = this._torusMaterial.specularMethod.texture = new Single2DTexture(asset);
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
})();
window.onload = function () {
    new Basic_Shading();
};

},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/image/Sampler2D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Scene":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/DirectionalLight":undefined,"awayjs-display/lib/managers/DefaultMaterialManager":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitiveCubePrefab":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-display/lib/prefabs/PrimitiveSpherePrefab":undefined,"awayjs-display/lib/prefabs/PrimitiveTorusPrefab":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/Basic_Shading.ts"])


//# sourceMappingURL=Basic_Shading.js.map