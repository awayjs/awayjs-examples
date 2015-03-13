(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Basic_View.ts":[function(require,module,exports){
/*

Basic 3D scene example in Away3D

Demonstrates:

How to setup a view and add 3D objects.
How to apply materials to a 3D object and dynamically load textures
How to create a frame tick that updates the contents of the scene

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
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
var Basic_View = (function () {
    /**
     * Constructor
     */
    function Basic_View() {
        var _this = this;
        //setup the view
        this._view = new View(new DefaultRenderer(MethodRendererPool));
        //setup the camera
        this._view.camera.z = -600;
        this._view.camera.y = 500;
        this._view.camera.lookAt(new Vector3D());
        //setup the materials
        this._planeMaterial = new MethodMaterial();
        //setup the scene
        this._plane = new PrimitivePlanePrefab(700, 700).getNewObject();
        this._plane.material = this._planeMaterial;
        this._view.scene.addChild(this._plane);
        //setup the render loop
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
        AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        //plane textures
        AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
    }
    /**
     * render loop
     */
    Basic_View.prototype.onEnterFrame = function (dt) {
        this._plane.rotationY += 1;
        this._view.render();
    };
    /**
     * Listener function for resource complete event on asset library
     */
    Basic_View.prototype.onResourceComplete = function (event) {
        var assets = event.assets;
        var length = assets.length;
        for (var c = 0; c < length; c++) {
            var asset = assets[c];
            console.log(asset.name, event.url);
            switch (event.url) {
                case "assets/floor_diffuse.jpg":
                    this._planeMaterial.texture = asset;
                    break;
            }
        }
    };
    /**
     * stage listener for resize events
     */
    Basic_View.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Basic_View;
})();
window.onload = function () {
    new Basic_View();
};

},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/pool/MethodRendererPool":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/Basic_View.ts"])


//# sourceMappingURL=Basic_View.js.map