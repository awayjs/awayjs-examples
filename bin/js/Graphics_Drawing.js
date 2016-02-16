(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Graphics_Drawing.ts":[function(require,module,exports){
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
var AS2MovieClipAdapter = require("awayjs-player/lib/adapters/AS2MovieClipAdapter");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Graphics = require("awayjs-display/lib/draw/Graphics");
var View = require("awayjs-display/lib/containers/View");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var SceneGraphPartition = require("awayjs-display/lib/partition/SceneGraphPartition");
var MovieClip = require("awayjs-display/lib/entities/MovieClip");
var CoordinateSystem = require("awayjs-core/lib/projections/CoordinateSystem");
var PerspectiveProjection = require("awayjs-core/lib/projections/PerspectiveProjection");
var Camera = require("awayjs-display/lib/entities/Camera");
var Graphics_Drawing = (function () {
    /**
     * Constructor
     */
    function Graphics_Drawing() {
        this._time = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    Graphics_Drawing.prototype.init = function () {
        this.initEngine();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    Graphics_Drawing.prototype.initEngine = function () {
        //create the view
        this._renderer = new DefaultRenderer();
        this._renderer.renderableSorter = null; //new RenderableSort2D();
        this._view = new View(this._renderer);
        this._view.backgroundColor = 0x777777;
        this._stage_width = 550;
        this._stage_height = 400;
        this._isperspective = true;
        this._projection = new PerspectiveProjection();
        this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._projection.fieldOfView = 30;
        this._projection.originX = 0;
        this._projection.originY = 0;
        this._camera_perspective = new Camera();
        this._camera_perspective.projection = this._projection;
        //this._projection.far = 500000;
        this._hoverControl = new HoverController(this._camera_perspective, null, 180, 0, 1000);
        this._view.camera = this._camera_perspective;
    };
    /**
     * Initialise the scene objects
     */
    Graphics_Drawing.prototype.initObjects = function () {
        var root_timeline = new MovieClip();
        root_timeline.partition = new SceneGraphPartition();
        root_timeline.adapter = new AS2MovieClipAdapter(root_timeline, this._view);
        // Graphics is not wired into any Displayobjects yet.
        // to have it produce geometry, for now we have to pass it a mesh when constructing it
        var drawingMC = new Mesh(null);
        var drawingGraphics = new Graphics(drawingMC);
        // for now i did not find a way to activate this other than doing it in js (not in ts)
        // so for this example to work, after packaging the example, one have to go into the js file and activate follwing line:
        Graphics._tess_obj=new TESS();
        // color do not work yet
        drawingGraphics.beginFill(0xFF0000, 1);
        // strokes not at a showable state yet
        //drawingGraphics.lineStyle(10, 0x000000, 1);
        // draw some shape
        drawingGraphics.moveTo(100, 100);
        drawingGraphics.lineTo(200, 100);
        drawingGraphics.lineTo(200, 200);
        drawingGraphics.curveTo(150, 150, 100, 200);
        drawingGraphics.curveTo(0, 150, 100, 100);
        // draw a hole into the shape:
        drawingGraphics.moveTo(110, 110);
        drawingGraphics.lineTo(130, 110);
        drawingGraphics.lineTo(130, 130);
        drawingGraphics.lineTo(110, 130);
        drawingGraphics.moveTo(110, 110);
        drawingGraphics.beginFill(0xFF0000, 1);
        drawingGraphics.drawCircle(300, 150, 80);
        drawingGraphics.drawCircle(550, 150, 160);
        drawingGraphics.drawRect(100, 250, 50, 50);
        drawingGraphics.drawRoundRect(100, 350, 200, 100, 20);
        drawingGraphics.drawEllipse(550, 400, 200, 100);
        drawingGraphics.endFill();
        this._view.scene.addChild(drawingMC);
    };
    /**
     * Initialise the listeners
     */
    Graphics_Drawing.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * Render loop
     */
    Graphics_Drawing.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        //update camera controler
        // this._cameraController.update();
        //console.log("RENDER = ");
        //update view
        this._view.render();
    };
    Graphics_Drawing.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Graphics_Drawing;
})();
window.onload = function () {
    new Graphics_Drawing();
};

},{"awayjs-core/lib/projections/CoordinateSystem":undefined,"awayjs-core/lib/projections/PerspectiveProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/draw/Graphics":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/MovieClip":undefined,"awayjs-display/lib/partition/SceneGraphPartition":undefined,"awayjs-player/lib/adapters/AS2MovieClipAdapter":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/Graphics_Drawing.ts"])


//# sourceMappingURL=Graphics_Drawing.js.map