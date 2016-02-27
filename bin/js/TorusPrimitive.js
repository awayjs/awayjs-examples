(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/TorusPrimitive.ts":[function(require,module,exports){
var Sampler2D = require("awayjs-core/lib/image/Sampler2D");
var URLLoaderEvent = require("awayjs-core/lib/events/URLLoaderEvent");
var URLLoader = require("awayjs-core/lib/net/URLLoader");
var URLLoaderDataFormat = require("awayjs-core/lib/net/URLLoaderDataFormat");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var ParserUtils = require("awayjs-core/lib/parsers/ParserUtils");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/View");
var DirectionalLight = require("awayjs-display/lib/display/DirectionalLight");
var PrimitiveTorusPrefab = require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var ElementsType = require("awayjs-display/lib/graphics/ElementsType");
var TorusPrimitive = (function () {
    function TorusPrimitive() {
        var _this = this;
        this.initView();
        this._raf = new RequestAnimationFrame(this.render, this);
        this._raf.start();
        this.loadResources();
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
    }
    /**
     *
     */
    TorusPrimitive.prototype.initView = function () {
        this._view = new View(new DefaultRenderer()); // Create the Away3D View
        this._view.backgroundColor = 0x000000; // Change the background color to black
    };
    /**
     *
     */
    TorusPrimitive.prototype.loadResources = function () {
        var _this = this;
        var imgLoader = new URLLoader();
        imgLoader.dataFormat = URLLoaderDataFormat.BLOB;
        imgLoader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, function (event) { return _this.urlCompleteHandler(event); });
        imgLoader.load(new URLRequest("assets/dots.png"));
    };
    /**
     *
     * @param event
     */
    TorusPrimitive.prototype.urlCompleteHandler = function (event) {
        var _this = this;
        this._image = ParserUtils.blobToImage(event.target.data);
        this._image.onload = function (event) { return _this.imageCompleteHandler(event); };
    };
    /**
     *
     */
    TorusPrimitive.prototype.initLights = function () {
        this._light = new DirectionalLight();
        this._light.diffuse = .7;
        this._light.specular = 1;
        this._view.scene.addChild(this._light);
        this._lightPicker = new StaticLightPicker([this._light]);
    };
    /**
     *
     */
    TorusPrimitive.prototype.initMaterial = function (image) {
        this._material = new MethodMaterial(ParserUtils.imageToBitmapImage2D(image));
        this._material.style.sampler = new Sampler2D(true, true, false);
        this._material.lightPicker = this._lightPicker;
    };
    /**
     *
     */
    TorusPrimitive.prototype.initTorus = function () {
        this._torus = new PrimitiveTorusPrefab(this._material, ElementsType.TRIANGLE, 220, 80, 32, 16, false);
        this._sprite = this._torus.getNewObject();
        this._view.scene.addChild(this._sprite);
    };
    /**
     *
     */
    TorusPrimitive.prototype.imageCompleteHandler = function (event) {
        this.initLights();
        this.initMaterial(event.target);
        this.initTorus();
    };
    /**
     *
     */
    TorusPrimitive.prototype.render = function (dt) {
        if (dt === void 0) { dt = null; }
        if (this._sprite)
            this._sprite.rotationY += 1;
        this._view.render();
    };
    /**
     *
     */
    TorusPrimitive.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return TorusPrimitive;
})();
window.onload = function () {
    new TorusPrimitive();
};

},{"awayjs-core/lib/events/URLLoaderEvent":undefined,"awayjs-core/lib/image/Sampler2D":undefined,"awayjs-core/lib/net/URLLoader":undefined,"awayjs-core/lib/net/URLLoaderDataFormat":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/parsers/ParserUtils":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/View":undefined,"awayjs-display/lib/display/DirectionalLight":undefined,"awayjs-display/lib/graphics/ElementsType":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitiveTorusPrefab":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/TorusPrimitive.ts"])


//# sourceMappingURL=TorusPrimitive.js.map