(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/ObjLoaderMasterChief.ts":[function(require,module,exports){
var BitmapImage2D = require("awayjs-core/lib/image/BitmapImage2D");
var Sampler2D = require("awayjs-core/lib/image/Sampler2D");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var Debug = require("awayjs-core/lib/utils/Debug");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var DisplayObjectContainer = require("awayjs-display/lib/containers/DisplayObjectContainer");
var View = require("awayjs-display/lib/containers/View");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var OBJParser = require("awayjs-parsers/lib/OBJParser");
var ObjLoaderMasterChief = (function () {
    function ObjLoaderMasterChief() {
        var _this = this;
        this.meshes = new Array();
        this.spartan = new DisplayObjectContainer();
        this.spartanFlag = false;
        Debug.LOG_PI_ERRORS = false;
        Debug.THROW_ERRORS = false;
        this.view = new View(new DefaultRenderer());
        this.view.camera.z = -50;
        this.view.camera.y = 20;
        this.view.camera.projection.near = 0.1;
        this.view.backgroundColor = 0xCEC8C6;
        this.raf = new RequestAnimationFrame(this.render, this);
        this.light = new DirectionalLight();
        this.light.color = 0xc1582d;
        this.light.direction = new Vector3D(1, 0, 0);
        this.light.ambient = 0.4;
        this.light.ambientColor = 0x85b2cd;
        this.light.diffuse = 2.8;
        this.light.specular = 1.8;
        this.view.scene.addChild(this.light);
        this.spartan.transform.scaleTo(.25, .25, .25);
        this.spartan.y = 0;
        this.view.scene.addChild(this.spartan);
        AssetLibrary.enableParser(OBJParser);
        var session;
        session = AssetLibrary.getLoader();
        session.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        session.load(new URLRequest('assets/Halo_3_SPARTAN4.obj'));
        session = AssetLibrary.getLoader();
        session.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        session.load(new URLRequest('assets/terrain.obj'));
        session = AssetLibrary.getLoader();
        session.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        session.load(new URLRequest('assets/masterchief_base.png'));
        session = AssetLibrary.getLoader();
        session.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        session.load(new URLRequest('assets/stone_tx.jpg'));
        window.onresize = function (event) { return _this.onResize(); };
        this.raf.start();
    }
    ObjLoaderMasterChief.prototype.render = function () {
        if (this.terrain)
            this.terrain.rotationY += 0.4;
        this.spartan.rotationY += 0.4;
        this.view.render();
    };
    ObjLoaderMasterChief.prototype.onResourceComplete = function (event) {
        var loader = event.target;
        var l = loader.baseDependency.assets.length;
        console.log('------------------------------------------------------------------------------');
        console.log('away.events.LoaderEvent.LOAD_COMPLETE', event, l, loader);
        console.log('------------------------------------------------------------------------------');
        var loader = event.target;
        var l = loader.baseDependency.assets.length;
        for (var c = 0; c < l; c++) {
            var d = loader.baseDependency.assets[c];
            console.log(d.name, event.url);
            switch (d.assetType) {
                case Mesh.assetType:
                    if (event.url == 'assets/Halo_3_SPARTAN4.obj') {
                        var mesh = d;
                        this.spartan.addChild(mesh);
                        this.spartanFlag = true;
                        this.meshes.push(mesh);
                    }
                    else if (event.url == 'assets/terrain.obj') {
                        this.terrain = d;
                        this.terrain.y = 98;
                        this.terrain.graphics.scaleUV(20, 20);
                        this.view.scene.addChild(this.terrain);
                    }
                    break;
                case BitmapImage2D.assetType:
                    if (event.url == 'assets/masterchief_base.png') {
                        this.mat = new MethodMaterial(d);
                        this.mat.style.sampler = new Sampler2D(true, true, false);
                        this.mat.lightPicker = new StaticLightPicker([this.light]);
                    }
                    else if (event.url == 'assets/stone_tx.jpg') {
                        this.terrainMaterial = new MethodMaterial(d);
                        this.terrainMaterial.style.sampler = new Sampler2D(true, true, false);
                        this.terrainMaterial.lightPicker = new StaticLightPicker([this.light]);
                    }
                    break;
            }
        }
        if (this.terrain && this.terrainMaterial)
            this.terrain.material = this.terrainMaterial;
        if (this.mat && this.spartanFlag)
            for (var c = 0; c < this.meshes.length; c++)
                this.meshes[c].material = this.mat;
        this.onResize();
    };
    ObjLoaderMasterChief.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this.view.y = 0;
        this.view.x = 0;
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    };
    return ObjLoaderMasterChief;
})();
window.onload = function () {
    new ObjLoaderMasterChief(); // Start the demo
};

},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/image/BitmapImage2D":undefined,"awayjs-core/lib/image/Sampler2D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/Debug":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/DisplayObjectContainer":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/entities/DirectionalLight":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-parsers/lib/OBJParser":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/ObjLoaderMasterChief.ts"])


//# sourceMappingURL=ObjLoaderMasterChief.js.map