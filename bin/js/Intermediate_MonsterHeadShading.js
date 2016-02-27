(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Intermediate_MonsterHeadShading.ts":[function(require,module,exports){
/*

Monster Head example in Away3d

Demonstrates:

How to use the AssetLibrary to load an internal AWD model.
How to set custom material methods on a model.
How to setup soft shadows and multiple lightsources with a multipass texture
How to use a diffuse gradient method as a cheap way to simulate sub-surface scattering

Code by Rob Bateman & David Lenaerts
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk
david.lenaerts@gmail.com
http://www.derschmale.com

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
var SpecularImage2D = require("awayjs-core/lib/image/SpecularImage2D");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var URLLoaderEvent = require("awayjs-core/lib/events/URLLoaderEvent");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var LoaderContext = require("awayjs-core/lib/library/LoaderContext");
var URLLoader = require("awayjs-core/lib/net/URLLoader");
var URLLoaderDataFormat = require("awayjs-core/lib/net/URLLoaderDataFormat");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var ParserUtils = require("awayjs-core/lib/parsers/ParserUtils");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Scene = require("awayjs-display/lib/display/Scene");
var View = require("awayjs-display/lib/View");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var Camera = require("awayjs-display/lib/display/Camera");
var DirectionalLight = require("awayjs-display/lib/display/DirectionalLight");
var PointLight = require("awayjs-display/lib/display/PointLight");
var Sprite = require("awayjs-display/lib/display/Sprite");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var Single2DTexture = require("awayjs-display/lib/textures/Single2DTexture");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodMaterialMode = require("awayjs-methodmaterials/lib/MethodMaterialMode");
var SpecularFresnelMethod = require("awayjs-methodmaterials/lib/methods/SpecularFresnelMethod");
var ShadowSoftMethod = require("awayjs-methodmaterials/lib/methods/ShadowSoftMethod");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var Intermediate_MonsterHeadShading = (function () {
    /**
     * Constructor
     */
    function Intermediate_MonsterHeadShading() {
        //textures
        this._textureStrings = Array("monsterhead_diffuse.jpg", "monsterhead_specular.jpg", "monsterhead_normals.jpg");
        this._textureDictionary = new Object();
        this._advancedMethod = true;
        //loading variables
        this._numTextures = 0;
        this._currentTexture = 0;
        this._n = 0;
        //root filepath for asset loading
        this._assetsRoot = "assets/monsterhead/";
        //navigation variables
        this._move = false;
        this.time = 0;
        this._shadowRange = 3;
        this._lightDirection = 120 * Math.PI / 180;
        this._lightElevation = 30 * Math.PI / 180;
        this.init();
    }
    /**
     * Global initialise function
     */
    Intermediate_MonsterHeadShading.prototype.init = function () {
        this.initEngine();
        this.initLights();
        this.initListeners();
        //kickoff asset loading
        this._n = 0;
        this._numTextures = this._textureStrings.length;
        this.load(this._textureStrings[this._n]);
    };
    /**
     * Initialise the engine
     */
    Intermediate_MonsterHeadShading.prototype.initEngine = function () {
        this._scene = new Scene();
        this._camera = new Camera();
        this._camera.projection.near = 20;
        this._camera.projection.far = 1000;
        this._view = new View(new DefaultRenderer(), this._scene, this._camera);
        //setup controller to be used on the camera
        this._cameraController = new HoverController(this._camera, null, 225, 10, 800);
        this._cameraController.yFactor = 1;
    };
    /**
     * Initialise the lights in a scene
     */
    Intermediate_MonsterHeadShading.prototype.initLights = function () {
        //var initialAzimuth:number = .6;
        //var initialArc:number = 2;
        var x = Math.sin(this._lightElevation) * Math.cos(this._lightDirection);
        var y = -Math.cos(this._lightElevation);
        var z = Math.sin(this._lightElevation) * Math.sin(this._lightDirection);
        // main light casting the shadows
        this._directionalLight = new DirectionalLight(x, y, z);
        this._directionalLight.color = 0xffeedd;
        this._directionalLight.ambient = 1;
        this._directionalLight.specular = .3;
        this._directionalLight.ambientColor = 0x101025;
        this._directionalLight.castsShadows = true;
        this._directionalLight.shadowMapper.lightOffset = 1000;
        this._scene.addChild(this._directionalLight);
        // blue point light coming from the right
        this._blueLight = new PointLight();
        this._blueLight.color = 0x4080ff;
        this._blueLight.x = 3000;
        this._blueLight.z = 700;
        this._blueLight.y = 20;
        this._scene.addChild(this._blueLight);
        // red light coming from the left
        this._redLight = new PointLight();
        this._redLight.color = 0x802010;
        this._redLight.x = -2000;
        this._redLight.z = 800;
        this._redLight.y = -400;
        this._scene.addChild(this._redLight);
        this._lightPicker = new StaticLightPicker([this._directionalLight, this._blueLight, this._redLight]);
    };
    /**
     * Initialise the listeners
     */
    Intermediate_MonsterHeadShading.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
        document.onmouseup = function (event) { return _this.onMouseUp(event); };
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        this.onResize();
        this.parseAWDDelegate = function (event) { return _this.parseAWD(event); };
        this.parseBitmapDelegate = function (event) { return _this.parseBitmap(event); };
        this.loadProgressDelegate = function (event) { return _this.loadProgress(event); };
        this.onBitmapCompleteDelegate = function (event) { return _this.onBitmapComplete(event); };
        this.onAssetCompleteDelegate = function (event) { return _this.onAssetComplete(event); };
        this.onResourceCompleteDelegate = function (event) { return _this.onResourceComplete(event); };
        this.timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this.timer.start();
    };
    /**
     * Updates the direction of the directional lightsource
     */
    Intermediate_MonsterHeadShading.prototype.updateDirection = function () {
        this._directionalLight.direction = new Vector3D(Math.sin(this._lightElevation) * Math.cos(this._lightDirection), -Math.cos(this._lightElevation), Math.sin(this._lightElevation) * Math.sin(this._lightDirection));
    };
    Intermediate_MonsterHeadShading.prototype.updateRange = function () {
        this._softShadowMethod.range = this._shadowRange;
    };
    /**
     * Global binary file loader
     */
    Intermediate_MonsterHeadShading.prototype.load = function (url) {
        var loader = new URLLoader();
        switch (url.substring(url.length - 3)) {
            case "AWD":
            case "awd":
                loader.dataFormat = URLLoaderDataFormat.ARRAY_BUFFER;
                this._loadingText = "Loading Model";
                loader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, this.parseAWDDelegate);
                break;
            case "png":
            case "jpg":
                loader.dataFormat = URLLoaderDataFormat.BLOB;
                this._currentTexture++;
                this._loadingText = "Loading Textures";
                loader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, this.parseBitmapDelegate);
                break;
        }
        loader.addEventListener(URLLoaderEvent.LOAD_PROGRESS, this.loadProgressDelegate);
        loader.load(new URLRequest(this._assetsRoot + url));
    };
    /**
     * Display current load
     */
    Intermediate_MonsterHeadShading.prototype.loadProgress = function (event) {
        //TODO work out why the casting on URLLoaderEvent fails for bytesLoaded and bytesTotal properties
        var P = Math.floor(event["bytesLoaded"] / event["bytesTotal"] * 100);
        if (P != 100) {
            console.log(this._loadingText + '\n' + ((this._loadingText == "Loading Model") ? Math.floor((event["bytesLoaded"] / 1024) << 0) + 'kb | ' + Math.floor((event["bytesTotal"] / 1024) << 0) + 'kb' : this._currentTexture + ' | ' + this._numTextures));
        }
    };
    /**
     * Parses the Bitmap file
     */
    Intermediate_MonsterHeadShading.prototype.parseBitmap = function (event) {
        var urlLoader = event.target;
        var image = ParserUtils.blobToImage(urlLoader.data);
        image.onload = this.onBitmapCompleteDelegate;
        urlLoader.removeEventListener(URLLoaderEvent.LOAD_COMPLETE, this.parseBitmapDelegate);
        urlLoader.removeEventListener(URLLoaderEvent.LOAD_PROGRESS, this.loadProgressDelegate);
        urlLoader = null;
    };
    /**
     * Parses the AWD file
     */
    Intermediate_MonsterHeadShading.prototype.parseAWD = function (event) {
        console.log("Parsing Data");
        var urlLoader = event.target;
        //setup parser
        AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
        AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, this.onResourceCompleteDelegate);
        AssetLibrary.loadData(urlLoader.data, new LoaderContext(false), null, new AWDParser());
        urlLoader.removeEventListener(URLLoaderEvent.LOAD_PROGRESS, this.loadProgressDelegate);
        urlLoader.removeEventListener(URLLoaderEvent.LOAD_COMPLETE, this.parseAWDDelegate);
        urlLoader = null;
    };
    /**
     * Listener for bitmap complete event on loader
     */
    Intermediate_MonsterHeadShading.prototype.onBitmapComplete = function (event) {
        var image = event.target;
        image.onload = null;
        //create bitmap texture in dictionary
        if (!this._textureDictionary[this._textureStrings[this._n]])
            this._textureDictionary[this._textureStrings[this._n]] = new Single2DTexture((this._n == 1) ? new SpecularImage2D(ParserUtils.imageToBitmapImage2D(image)) : ParserUtils.imageToBitmapImage2D(image));
        this._n++;
        //switch to next teture set
        if (this._n < this._textureStrings.length) {
            this.load(this._textureStrings[this._n]);
        }
        else {
            this.load("MonsterHead.awd");
        }
    };
    /**
     * Navigation and render loop
     */
    Intermediate_MonsterHeadShading.prototype.onEnterFrame = function (dt) {
        this._view.render();
    };
    /**
     * Listener for asset complete event on loader
     */
    Intermediate_MonsterHeadShading.prototype.onAssetComplete = function (event) {
        if (event.asset.isAsset(Sprite)) {
            this._headModel = event.asset;
            this._headModel.graphics.scale(4);
            this._headModel.y = -20;
            this._scene.addChild(this._headModel);
        }
    };
    /**
     * Triggered once all resources are loaded
     */
    Intermediate_MonsterHeadShading.prototype.onResourceComplete = function (e) {
        var _this = this;
        AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
        AssetLibrary.removeEventListener(LoaderEvent.LOAD_COMPLETE, this.onResourceCompleteDelegate);
        var material = new MethodMaterial(this._textureDictionary["monsterhead_diffuse.jpg"]);
        material.shadowMethod = new ShadowSoftMethod(this._directionalLight, 10, 5);
        material.shadowMethod.epsilon = 0.2;
        material.lightPicker = this._lightPicker;
        material.specularMethod.gloss = 30;
        material.specularMethod.strength = 1;
        material.style.color = 0x303040;
        material.ambientMethod.strength = 1;
        //setup custom multipass material
        this._headMaterial = new MethodMaterial();
        this._headMaterial.ambientMethod.texture = this._textureDictionary["monsterhead_diffuse.jpg"];
        this._headMaterial.mode = MethodMaterialMode.MULTI_PASS;
        this._headMaterial.style.sampler = new Sampler2D(true, true);
        this._headMaterial.normalMethod.texture = this._textureDictionary["monsterhead_normals.jpg"];
        this._headMaterial.lightPicker = this._lightPicker;
        this._headMaterial.style.color = 0x303040;
        this._headMaterial.diffuseMethod.multiply = false;
        // create soft shadows with a lot of samples for best results. With the current method setup, any more samples would fail to compile
        this._softShadowMethod = new ShadowSoftMethod(this._directionalLight, 20);
        this._softShadowMethod.range = this._shadowRange; // the sample radius defines the softness of the shadows
        this._softShadowMethod.epsilon = .1;
        this._headMaterial.shadowMethod = this._softShadowMethod;
        // create specular reflections that are stronger from the sides
        this._fresnelMethod = new SpecularFresnelMethod(true);
        this._fresnelMethod.fresnelPower = 3;
        this._headMaterial.specularMethod = this._fresnelMethod;
        this._headMaterial.specularMethod.texture = this._textureDictionary["monsterhead_specular.jpg"];
        this._headMaterial.specularMethod.strength = 3;
        this._headMaterial.specularMethod.gloss = 10;
        //apply material to head model
        var len = this._headModel.graphics.count;
        for (var i = 0; i < len; i++)
            this._headModel.graphics.getGraphicAt(i).material = this._headMaterial;
        AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onExtraResourceComplete(event); });
        //diffuse gradient texture
        AssetLibrary.load(new URLRequest("assets/diffuseGradient.jpg"));
    };
    /**
     * Triggered once extra resources are loaded
     */
    Intermediate_MonsterHeadShading.prototype.onExtraResourceComplete = function (event) {
        switch (event.url) {
            case "assets/diffuseGradient.jpg":
                break;
        }
    };
    /**
     * Mouse down listener for navigation
     */
    Intermediate_MonsterHeadShading.prototype.onMouseDown = function (event) {
        this._lastPanAngle = this._cameraController.panAngle;
        this._lastTiltAngle = this._cameraController.tiltAngle;
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
        this._move = true;
    };
    /**
     * Mouse up listener for navigation
     */
    Intermediate_MonsterHeadShading.prototype.onMouseUp = function (event) {
        this._move = false;
    };
    /**
     * Mouse move listener for mouseLock
     */
    Intermediate_MonsterHeadShading.prototype.onMouseMove = function (event) {
        if (this._move) {
            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
        }
    };
    /**
     * window listener for resize events
     */
    Intermediate_MonsterHeadShading.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Intermediate_MonsterHeadShading;
})();
window.onload = function () {
    new Intermediate_MonsterHeadShading();
};

},{"awayjs-core/lib/events/AssetEvent":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/events/URLLoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/image/Sampler2D":undefined,"awayjs-core/lib/image/SpecularImage2D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/library/LoaderContext":undefined,"awayjs-core/lib/net/URLLoader":undefined,"awayjs-core/lib/net/URLLoaderDataFormat":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/parsers/ParserUtils":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/display/Camera":undefined,"awayjs-display/lib/display/DirectionalLight":undefined,"awayjs-display/lib/display/PointLight":undefined,"awayjs-display/lib/display/Scene":undefined,"awayjs-display/lib/display/Sprite":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/MethodMaterialMode":undefined,"awayjs-methodmaterials/lib/methods/ShadowSoftMethod":undefined,"awayjs-methodmaterials/lib/methods/SpecularFresnelMethod":undefined,"awayjs-parsers/lib/AWDParser":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/Intermediate_MonsterHeadShading.ts"])


//# sourceMappingURL=Intermediate_MonsterHeadShading.js.map