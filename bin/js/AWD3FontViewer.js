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
var Geometry = require("awayjs-core/lib/data/Geometry");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var OrthographicProjection = require("awayjs-core/lib/projections/OrthographicProjection");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var Loader = require("awayjs-display/lib/containers/Loader");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var MovieClip = require("awayjs-player/lib/display/MovieClip");
var CoordinateSystem = require("awayjs-core/lib/projections/CoordinateSystem");
var PerspectiveProjection = require("awayjs-core/lib/projections/PerspectiveProjection");
var Camera = require("awayjs-display/lib/entities/Camera");
var Font = require("awayjs-display/lib/text/Font");
var AWD3FontViewer = (function () {
    /**
     * Constructor
     */
    function AWD3FontViewer() {
        this._time = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    AWD3FontViewer.prototype.init = function () {
        this.initEngine();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    AWD3FontViewer.prototype.initEngine = function () {
        //create the view
        this._view = new View(new DefaultRenderer());
        //this._view.renderer.renderableSorter = new RenderableNullSort();
        this._view.backgroundColor = 0xffffff;
        this._stage_width = 550;
        this._stage_height = 400;
        this._isperspective = true;
        this._projection = new PerspectiveProjection();
        this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._projection.focalLength = 1000;
        this._projection.preserveFocalLength = true;
        this._projection.originX = 0.5;
        this._projection.originY = 0.5;
        this._camera_perspective = new Camera();
        this._camera_perspective.projection = this._projection;
        //this._projection.far = 500000;
        this._hoverControl = new HoverController(this._camera_perspective, null, 180, 0, 1000);
        this._ortho_projection = new OrthographicProjection(500);
        this._ortho_projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._ortho_projection.far = 500000;
        this._ortho_projection.near = 0.1;
        this._ortho_projection.originX = 0.5;
        this._ortho_projection.originY = 0.5;
        this._camera_ortho = new Camera();
        this._camera_ortho.projection = this._ortho_projection;
        this._view.camera = this._camera_perspective;
        this._camera_ortho.x = 0;
        this._camera_ortho.y = 0;
        this._camera_ortho.scaleY = -1;
        this._camera_ortho.z = 0;
    };
    /**
     * Initialise the scene objects
     */
    AWD3FontViewer.prototype.initObjects = function () {
        var _this = this;
        AssetLibrary.enableParser(AWDParser);
        //kickoff asset loading
        var loader = new Loader();
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onRessourceComplete(event); });
        loader.load(new URLRequest("assets/AWD3/Fonttable_test.awd"));
    };
    /**
     * Initialise the listeners
     */
    AWD3FontViewer.prototype.initListeners = function () {
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
    AWD3FontViewer.prototype.onAssetComplete = function (event) {
        if (event.asset.isAsset(Font)) {
            console.log("Font finished!!! ");
            var thisfont = event.asset;
            var thisfonttable = thisfont.get_font_table("RegularStyle");
            var font_chars = thisfonttable.get_font_chars();
            var charcnt_sqr = Math.sqrt(font_chars.length);
            var font_em_size = thisfonttable.get_font_em_size() / 100;
            var position_x = -(charcnt_sqr / 2) * font_em_size;
            var position_y = -(charcnt_sqr / 2) * font_em_size;
            var k = 0;
            var pos_x = position_x;
            var pos_y = position_y;
            for (var i = 0; i < font_chars.length; i++) {
                var newmesh = new Mesh(new Geometry());
                if (k >= charcnt_sqr) {
                    k = 0;
                    pos_x = position_x;
                    pos_y += font_em_size;
                }
                k++;
                var thischar = font_chars[i];
                if (thischar != null) {
                    var thisGeom = thischar.subgeom;
                    if (thisGeom != null) {
                        newmesh.geometry.addSubGeometry(thisGeom);
                    }
                }
                //thischar.applyTransformation(transMatrix);
                pos_x += font_em_size;
                newmesh.x = pos_x;
                newmesh.y = pos_y;
                newmesh.scaleX = newmesh.scaleY = newmesh.scaleZ = 0.01;
                //console.log("Font x = ", newmesh.x, "Font y = ", newmesh.y);
                this._view.scene.addChild(newmesh);
            }
        }
        if (event.asset.isAsset(MovieClip)) {
        }
    };
    /**
     * loader listener for asset complete events
     */
    AWD3FontViewer.prototype.onRessourceComplete = function (event) {
        if (this._rootTimeLine) {
        }
    };
    /**
     * Render loop
     */
    AWD3FontViewer.prototype.onEnterFrame = function (dt) {
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
    AWD3FontViewer.prototype.onKeyDown = function (event) {
        console.log("keycode = " + event.keyCode);
        if (event.keyCode == 80) {
            this._isperspective = true;
            this._view.camera = this._camera_perspective;
        }
        if (event.keyCode == 79) {
            this._isperspective = false;
            this._view.camera = this._camera_ortho;
        }
        if (event.keyCode == 81) {
            if (this._isperspective) {
                this._hoverControl.distance += 5;
            }
            else {
                this._ortho_projection.projectionHeight += 5;
            }
        }
        else if (event.keyCode == 87) {
            if (this._isperspective) {
                this._hoverControl.distance -= 5;
            }
            else {
                this._ortho_projection.projectionHeight -= 5;
            }
        }
        if (event.keyCode == 65) {
            if (this._isperspective) {
                this._hoverControl.distance += 50;
            }
            else {
                this._ortho_projection.projectionHeight += 50;
            }
        }
        else if (event.keyCode == 83) {
            if (this._isperspective) {
                this._hoverControl.distance -= 50;
            }
            else {
                this._ortho_projection.projectionHeight -= 50;
            }
        }
    };
    AWD3FontViewer.prototype.onMouseDown = function (event) {
        this._lastPanAngle = this._hoverControl.panAngle;
        this._lastTiltAngle = this._hoverControl.tiltAngle;
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
        this._move = true;
    };
    AWD3FontViewer.prototype.onMouseUp = function (event) {
        this._move = false;
    };
    AWD3FontViewer.prototype.onMouseMove = function (event) {
        if (this._move) {
            if (this._isperspective) {
                this._hoverControl.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
                this._hoverControl.tiltAngle = -0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
            }
            else {
                if (event.clientX > (this._lastMouseX + 10))
                    this._camera_ortho.x -= 10;
                else if (event.clientX > this._lastMouseX)
                    this._camera_ortho.x--;
                else if (event.clientX < (this._lastMouseX - 10))
                    this._camera_ortho.x += 10;
                else if (event.clientX < this._lastMouseX)
                    this._camera_ortho.x++;
                if (event.clientY > (this._lastMouseY + 10))
                    this._camera_ortho.y -= 10;
                else if (event.clientY > this._lastMouseY)
                    this._camera_ortho.y--;
                else if (event.clientY < (this._lastMouseY - 10))
                    this._camera_ortho.y += 10;
                else if (event.clientY < this._lastMouseY)
                    this._camera_ortho.y++;
                this._lastMouseX = event.clientX;
                this._lastMouseY = event.clientY;
            }
        }
    };
    AWD3FontViewer.prototype.onMouseWheel = function (event) {
        if (this._isperspective) {
            this._hoverControl.distance -= event.wheelDelta * 5;
            if (this._hoverControl.distance < 100) {
                this._hoverControl.distance = 100;
            }
        }
        else {
            this._ortho_projection.projectionHeight -= event.wheelDelta * 5;
            if (this._ortho_projection.projectionHeight < 5) {
                this._ortho_projection.projectionHeight = 5;
            }
        }
    };
    AWD3FontViewer.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return AWD3FontViewer;
})();
window.onload = function () {
    new AWD3FontViewer();
};


},{"awayjs-core/lib/data/Geometry":undefined,"awayjs-core/lib/events/AssetEvent":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/projections/CoordinateSystem":undefined,"awayjs-core/lib/projections/OrthographicProjection":undefined,"awayjs-core/lib/projections/PerspectiveProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Loader":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/text/Font":undefined,"awayjs-parsers/lib/AWDParser":undefined,"awayjs-player/lib/display/MovieClip":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},[1])


//# sourceMappingURL=AWD3FontViewer.js.map