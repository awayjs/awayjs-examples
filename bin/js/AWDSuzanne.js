(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/AWDSuzanne.ts":[function(require,module,exports){
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var JSPickingCollider = require("awayjs-display/lib/pick/JSPickingCollider");
var MouseEvent = require("awayjs-display/lib/events/MouseEvent");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var AWDSuzanne = (function () {
    function AWDSuzanne() {
        var _this = this;
        this._lookAtPosition = new Vector3D();
        this._cameraIncrement = 0;
        this._mouseOverMaterial = new MethodMaterial(0xFF0000);
        this.initView();
        this.loadAssets();
        this.initLights();
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
    }
    /**
     *
     */
    AWDSuzanne.prototype.initView = function () {
        this._renderer = new DefaultRenderer();
        this._view = new View(this._renderer);
        this._view.camera.projection.far = 6000;
        this._view.forceMouseMove = true;
    };
    /**
     *
     */
    AWDSuzanne.prototype.loadAssets = function () {
        var _this = this;
        this._timer = new RequestAnimationFrame(this.render, this);
        this._timer.start();
        AssetLibrary.enableParser(AWDParser);
        var session = AssetLibrary.getLoader();
        session.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        session.load(new URLRequest('assets/suzanne.awd'));
    };
    /**
     *
     */
    AWDSuzanne.prototype.initLights = function () {
        this._light = new DirectionalLight();
        this._light.color = 0x683019;
        this._light.direction = new Vector3D(1, 0, 0);
        this._light.ambient = 0.1;
        this._light.ambientColor = 0x85b2cd;
        this._light.diffuse = 2.8;
        this._light.specular = 1.8;
        this._view.scene.addChild(this._light);
        this._lightPicker = new StaticLightPicker([this._light]);
    };
    /**
     *
     */
    AWDSuzanne.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    /**
     *
     * @param dt
     */
    AWDSuzanne.prototype.render = function (dt) {
        if (this._view.camera) {
            this._view.camera.lookAt(this._lookAtPosition);
            this._cameraIncrement += 0.01;
            this._view.camera.x = Math.cos(this._cameraIncrement) * 1400;
            this._view.camera.z = Math.sin(this._cameraIncrement) * 1400;
            this._light.x = Math.cos(this._cameraIncrement) * 1400;
            this._light.y = Math.sin(this._cameraIncrement) * 1400;
        }
        this._view.render();
    };
    /**
     *
     * @param e
     */
    AWDSuzanne.prototype.onResourceComplete = function (e) {
        var _this = this;
        var loader = e.target;
        var numAssets = loader.baseDependency.assets.length;
        for (var i = 0; i < numAssets; ++i) {
            var asset = loader.baseDependency.assets[i];
            switch (asset.assetType) {
                case Mesh.assetType:
                    var mesh = asset;
                    this._suzane = mesh;
                    this._suzane.material.lightPicker = this._lightPicker;
                    this._suzane.y = -100;
                    this._mouseOutMaterial = this._suzane.material;
                    for (var c = 0; c < 80; c++) {
                        var clone = mesh.clone();
                        var scale = this.getRandom(50, 200);
                        clone.x = this.getRandom(-2000, 2000);
                        clone.y = this.getRandom(-2000, 2000);
                        clone.z = this.getRandom(-2000, 2000);
                        clone.transform.scaleTo(scale, scale, scale);
                        clone.rotationY = this.getRandom(0, 360);
                        clone.addEventListener(MouseEvent.MOUSE_OVER, function (event) { return _this.onMouseOver(event); });
                        clone.addEventListener(MouseEvent.MOUSE_OUT, function (event) { return _this.onMouseOut(event); });
                        this._view.scene.addChild(clone);
                    }
                    mesh.transform.scaleTo(500, 500, 500);
                    mesh.pickingCollider = new JSPickingCollider();
                    mesh.addEventListener(MouseEvent.MOUSE_OVER, function (event) { return _this.onMouseOver(event); });
                    mesh.addEventListener(MouseEvent.MOUSE_OUT, function (event) { return _this.onMouseOut(event); });
                    this._view.scene.addChild(mesh);
                    break;
            }
        }
    };
    AWDSuzanne.prototype.onMouseOver = function (event) {
        event.object.material = this._mouseOverMaterial;
        console.log("mouseover");
    };
    AWDSuzanne.prototype.onMouseOut = function (event) {
        event.object.material = this._mouseOutMaterial;
        console.log("mouseout");
    };
    /**
     *
     * @param min
     * @param max
     * @returns {number}
     */
    AWDSuzanne.prototype.getRandom = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    return AWDSuzanne;
})();
window.onload = function () {
    new AWDSuzanne();
};

},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/entities/DirectionalLight":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/events/MouseEvent":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/pick/JSPickingCollider":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-parsers/lib/AWDParser":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/AWDSuzanne.ts"])


//# sourceMappingURL=AWDSuzanne.js.map