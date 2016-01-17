(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Basic_Skybox.ts":[function(require,module,exports){
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
var SamplerCube = require("awayjs-core/lib/image/SamplerCube");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var LoaderContext = require("awayjs-core/lib/library/LoaderContext");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var PerspectiveProjection = require("awayjs-core/lib/projections/PerspectiveProjection");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var Skybox = require("awayjs-display/lib/entities/Skybox");
var PrimitiveTorusPrefab = require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");
var SingleCubeTexture = require("awayjs-display/lib/textures/SingleCubeTexture");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var EffectEnvMapMethod = require("awayjs-methodmaterials/lib/methods/EffectEnvMapMethod");
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
        this._view = new View(new DefaultRenderer());
        //setup the camera
        this._view.camera.z = -600;
        this._view.camera.y = 0;
        this._view.camera.lookAt(new Vector3D());
        this._view.camera.projection = new PerspectiveProjection(90);
        this._view.backgroundColor = 0xFFFF00;
        this._mouseX = window.innerWidth / 2;
    };
    /**
     * Initialise the materials
     */
    Basic_SkyBox.prototype.initMaterials = function () {
        //setup the torus material
        this._torusMaterial = new MethodMaterial(0xFFFFFF, 1);
        this._torusMaterial.style.color = 0x111199;
        this._torusMaterial.style.sampler = new SamplerCube(true, true);
        this._torusMaterial.specularMethod.strength = 0.5;
        this._torusMaterial.ambientMethod.strength = 1;
    };
    /**
     * Initialise the scene objects
     */
    Basic_SkyBox.prototype.initObjects = function () {
        this._torus = new PrimitiveTorusPrefab(150, 60, 40, 20).getNewObject();
        this._torus.material = this._torusMaterial;
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
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
        AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        //setup the url map for textures in the cubemap file
        var loaderContext = new LoaderContext();
        loaderContext.dependencyBaseUrl = "assets/skybox/";
        //environment texture
        AssetLibrary.load(new URLRequest("assets/skybox/snow_texture.cube"), loaderContext);
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
                this._cubeTexture = new SingleCubeTexture(event.assets[0]);
                this._skyBox = new Skybox(event.assets[0]);
                this._view.scene.addChild(this._skyBox);
                this._torusMaterial.addEffectMethod(new EffectEnvMapMethod(this._cubeTexture, 1));
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
})();
window.onload = function () {
    new Basic_SkyBox();
};

},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/image/SamplerCube":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/library/LoaderContext":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/projections/PerspectiveProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/entities/Skybox":undefined,"awayjs-display/lib/prefabs/PrimitiveTorusPrefab":undefined,"awayjs-display/lib/textures/SingleCubeTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/methods/EffectEnvMapMethod":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/Basic_Skybox.ts"])


//# sourceMappingURL=Basic_Skybox.js.map