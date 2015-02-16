(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*

AWD3 file loading example in AwayJS

Demonstrates:

How to use the Loader object to load an embedded internal awd model.

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
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetType = require("awayjs-core/lib/library/AssetType");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var OrthographicProjection = require("awayjs-core/lib/projections/OrthographicProjection");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var Loader = require("awayjs-display/lib/containers/Loader");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var AWD3Viewer = (function () {
    /**
     * Constructor
     */
    function AWD3Viewer() {
        this._time = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    AWD3Viewer.prototype.init = function () {
        this.initEngine();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    AWD3Viewer.prototype.initEngine = function () {
        //create the view
        this._view = new View(new DefaultRenderer(MethodRendererPool));
        this._view.backgroundColor = 0xffffff;
        this._view.camera.projection = new OrthographicProjection(500);
        this._view.camera.projection.far = 500000;
        this._view.camera.projection.near = 0.1;
        this._view.camera.x = 0;
        this._view.camera.y = 0;
        this._view.camera.z = 300;
        this._view.camera.rotationX = -180;
        this._view.camera.rotationY = 0;
        this._view.camera.rotationZ = -180;
        //create custom lens
        // this._view.camera.projection = new OrthographicOffCenterProjection(0, 550, -400, 0);
        //  this._view.camera.projection.far = 500000;
        //  this._view.camera.projection.near = 0.1;
        /*
            //setup controller to be used on the camera
            this._cameraController = new HoverController(this._view.camera, null, 0, 0, 300, 10, 90);
            this._cameraController.lookAtPosition = new Vector3D(0, 50, 0);
            this._cameraController.tiltAngle = 0;
            this._cameraController.panAngle = 0;
            this._cameraController.minTiltAngle = 5;
            this._cameraController.maxTiltAngle = 60;
            this._cameraController.autoUpdate = false;
        */
    };
    /**
     * Initialise the scene objects
     */
    AWD3Viewer.prototype.initObjects = function () {
        var _this = this;
        AssetLibrary.enableParser(AWDParser);
        //kickoff asset loading
        var loader = new Loader();
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onRessourceComplete(event); });
        /*
        var _cube:PrimitiveCubePrefab = new PrimitiveCubePrefab(20.0, 20.0, 20.0);
        var newmesh2:Mesh=< Mesh>_cube.getNewObject();
        // newmesh2.material=new ColorMaterial(0xff0000, 1.0);
        //newmesh2.material.bothSides=true;
        var matTx:MethodMaterial = new MethodMaterial (0xFF0000);
        matTx.bothSides = true;
        newmesh2.material=matTx;
        this._view.scene.addChild(newmesh2);
        console.log("LOADET A Geom name = ")*/
        loader.load(new URLRequest(document.getElementById("awdPath").innerHTML));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow.awd"));
        //loader.load(new URLRequest("assets/AWD3/NestedTween.awd"));
        //loader.load(new URLRequest("assets/AWD3/Simple_shape_new.awd"));
        // console.log("START LOADING");
        //this._view.scene.addChild(loader);
    };
    /**
     * Initialise the listeners
     */
    AWD3Viewer.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        document.onkeydown = function (event) { return _this.onKeyDown(event); };
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
        document.onmouseup = function (event) { return _this.onMouseUp(event); };
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        document.onmousewheel = function (event) { return _this.onMouseWheel(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * loader listener for asset complete events
     */
    AWD3Viewer.prototype.onAssetComplete = function (event) {
        if (event.asset.assetType == AssetType.TIMELINE) {
            this._rootTimeLine = event.asset;
        }
    };
    /**
     * loader listener for asset complete events
     */
    AWD3Viewer.prototype.onRessourceComplete = function (event) {
        if (this._rootTimeLine) {
            //console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
            this._view.scene.addChild(this._rootTimeLine);
        }
    };
    /**
     * Render loop
     */
    AWD3Viewer.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        //update camera controler
        // this._cameraController.update();
        if (this._rootTimeLine != undefined) {
            //console.log("RENDER = ");
            this._rootTimeLine.update(dt);
        }
        //console.log("RENDER = ");
        //update view
        this._view.render();
    };
    AWD3Viewer.prototype.onKeyDown = function (event) {
        if (event.keyCode == 109) {
            var test = this._view.camera.projection;
            test.projectionHeight += 5;
        }
        else if (event.keyCode == 107) {
            var test = this._view.camera.projection;
            test.projectionHeight -= 5;
        }
    };
    AWD3Viewer.prototype.onMouseDown = function (event) {
        /*  this._lastPanAngle = this._cameraController.panAngle;
          this._lastTiltAngle = this._cameraController.tiltAngle;
          this._move = true;*/
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
        this._move = true;
    };
    AWD3Viewer.prototype.onMouseUp = function (event) {
        this._move = false;
    };
    AWD3Viewer.prototype.onMouseMove = function (event) {
        if (this._move) {
            if (event.clientX > (this._lastMouseX + 10))
                this._view.camera.x += 10;
            else if (event.clientX > this._lastMouseX)
                this._view.camera.x++;
            else if (event.clientX < (this._lastMouseX - 10))
                this._view.camera.x -= 10;
            else if (event.clientX < this._lastMouseX)
                this._view.camera.x--;
            if (event.clientY > (this._lastMouseY + 10))
                this._view.camera.y += 10;
            else if (event.clientY > this._lastMouseY)
                this._view.camera.y++;
            else if (event.clientY < (this._lastMouseY - 10))
                this._view.camera.y -= 10;
            else if (event.clientY < this._lastMouseY)
                this._view.camera.y--;
            this._lastMouseX = event.clientX;
            this._lastMouseY = event.clientY;
        }
    };
    AWD3Viewer.prototype.onMouseWheel = function (event) {
        /* this._cameraController.distance -= event.wheelDelta * 5;
     
         if (this._cameraController.distance < 100) {
           this._cameraController.distance = 100;
         } else if (this._cameraController.distance > 2000) {
           this._cameraController.distance = 2000;
         }
         */
    };
    AWD3Viewer.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return AWD3Viewer;
})();
window.onload = function () {
    new AWD3Viewer();
};


},{"awayjs-core/lib/events/AssetEvent":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/library/AssetType":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/projections/OrthographicProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Loader":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-methodmaterials/lib/pool/MethodRendererPool":undefined,"awayjs-parsers/lib/AWDParser":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},[1])


//# sourceMappingURL=AWD3Viewer.js.map