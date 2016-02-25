(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/CubePrimitive.ts":[function(require,module,exports){
var Sampler2D = require("awayjs-core/lib/image/Sampler2D");
var BlendMode = require("awayjs-core/lib/image/BlendMode");
var URLLoaderEvent = require("awayjs-core/lib/events/URLLoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var URLLoader = require("awayjs-core/lib/net/URLLoader");
var URLLoaderDataFormat = require("awayjs-core/lib/net/URLLoaderDataFormat");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var ParserUtils = require("awayjs-core/lib/parsers/ParserUtils");
var PerspectiveProjection = require("awayjs-core/lib/projections/PerspectiveProjection");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/View");
var DirectionalLight = require("awayjs-display/lib/display/DirectionalLight");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitiveCubePrefab = require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");
var PrimitiveTorusPrefab = require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var ElementsType = require("awayjs-display/lib/graphics/ElementsType");
var CubePrimitive = (function () {
    function CubePrimitive() {
        this.initView();
        this.initCamera();
        this.initLights();
        this.loadResources();
    }
    /**
     *
     */
    CubePrimitive.prototype.initView = function () {
        this._view = new View(new DefaultRenderer());
        this._view.backgroundColor = 0x000000;
        this._view.camera.x = 130;
        this._view.camera.y = 0;
        this._view.camera.z = 0;
    };
    /**
     *
     */
    CubePrimitive.prototype.initLights = function () {
        this._light = new DirectionalLight();
        this._light.color = 0xffffff;
        this._light.direction = new Vector3D(1, 0, 0);
        this._light.ambient = 0.4;
        this._light.ambientColor = 0x85b2cd;
        this._light.diffuse = 2.8;
        this._light.specular = 1.8;
        this._lightPicker = new StaticLightPicker([this._light]);
    };
    /**
     *
     */
    CubePrimitive.prototype.initCamera = function () {
        this._cameraAxis = new Vector3D(0, 0, 1);
        this._view.camera.projection = new PerspectiveProjection(120);
        this._view.camera.projection.near = 0.1;
    };
    /**
     *
     */
    CubePrimitive.prototype.loadResources = function () {
        var _this = this;
        var urlRequest = new URLRequest("assets/spacy_texture.png");
        var imgLoader = new URLLoader();
        imgLoader.dataFormat = URLLoaderDataFormat.BLOB;
        imgLoader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, function (event) { return _this.urlCompleteHandler(event); });
        imgLoader.load(urlRequest);
    };
    /**
     *
     * @param event
     */
    CubePrimitive.prototype.urlCompleteHandler = function (event) {
        var _this = this;
        var imageLoader = event.target;
        this._image = ParserUtils.blobToImage(imageLoader.data);
        this._image.onload = function (event) { return _this.imageCompleteHandler(event); };
    };
    /**
     *
     * @param e
     */
    CubePrimitive.prototype.imageCompleteHandler = function (event) {
        var _this = this;
        var matTx = new MethodMaterial(ParserUtils.imageToBitmapImage2D(this._image));
        matTx.style.sampler = new Sampler2D(true, true);
        matTx.blendMode = BlendMode.ADD;
        matTx.bothSides = true;
        matTx.lightPicker = this._lightPicker;
        this._cube = new PrimitiveCubePrefab(matTx, ElementsType.TRIANGLE, 20.0, 20.0, 20.0);
        this._torus = new PrimitiveTorusPrefab(matTx, ElementsType.TRIANGLE, 150, 80, 32, 16, true);
        this._mesh = this._torus.getNewObject();
        this._mesh2 = this._cube.getNewObject();
        this._mesh2.x = 130;
        this._mesh2.z = 40;
        this._view.scene.addChild(this._mesh);
        this._view.scene.addChild(this._mesh2);
        this._raf = new RequestAnimationFrame(this.render, this);
        this._raf.start();
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
    };
    /**
     *
     * @param dt
     */
    CubePrimitive.prototype.render = function (dt) {
        if (dt === void 0) { dt = null; }
        this._view.camera.transform.rotate(this._cameraAxis, 1);
        this._mesh.rotationY += 1;
        this._mesh2.rotationX += 0.4;
        this._mesh2.rotationY += 0.4;
        this._view.render();
    };
    /**
     *
     */
    CubePrimitive.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return CubePrimitive;
})();
window.onload = function () {
    new CubePrimitive();
};

},{"awayjs-core/lib/events/URLLoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/image/BlendMode":undefined,"awayjs-core/lib/image/Sampler2D":undefined,"awayjs-core/lib/net/URLLoader":undefined,"awayjs-core/lib/net/URLLoaderDataFormat":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/parsers/ParserUtils":undefined,"awayjs-core/lib/projections/PerspectiveProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/View":undefined,"awayjs-display/lib/display/DirectionalLight":undefined,"awayjs-display/lib/graphics/ElementsType":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitiveCubePrefab":undefined,"awayjs-display/lib/prefabs/PrimitiveTorusPrefab":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/CubePrimitive.ts"])


//# sourceMappingURL=CubePrimitive.js.map