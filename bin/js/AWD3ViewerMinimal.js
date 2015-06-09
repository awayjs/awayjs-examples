(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/AWD3ViewerMinimal.ts":[function(require,module,exports){
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
 of this software and associated documentation files (the �Software�), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED �AS IS�, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var ParserEvent = require("awayjs-core/lib/events/ParserEvent");
var OrthographicProjection = require("awayjs-core/lib/projections/OrthographicProjection");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var Billboard = require("awayjs-display/lib/entities/Billboard");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var Loader = require("awayjs-display/lib/containers/Loader");
var Renderer2D = require("awayjs-player/lib/renderer/Renderer2D");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var Partition2D = require("awayjs-player/lib/partition/Partition2D");
var MovieClip = require("awayjs-player/lib/display/MovieClip");
var CoordinateSystem = require("awayjs-core/lib/projections/CoordinateSystem");
var PerspectiveProjection = require("awayjs-core/lib/projections/PerspectiveProjection");
var Camera = require("awayjs-display/lib/entities/Camera");
var TextField = require("awayjs-display/lib/entities/TextField");
var AWD3ViewerMinimal = (function () {
    /**
     * Constructor
     */
    function AWD3ViewerMinimal() {
        this._time = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    AWD3ViewerMinimal.prototype.init = function () {
        this.initEngine();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    AWD3ViewerMinimal.prototype.initEngine = function () {
        //create the view
        this._view = new View(new Renderer2D());
        this._view.backgroundColor = 0x000000;
        this._stage_width = 550;
        this._stage_height = 400;
        //for plugin preview-runtime:
        /*
         this._view.backgroundColor = parseInt(document.getElementById("bgColor").innerHTML.replace("#", "0x"));
         this._stage_width = parseInt(document.getElementById("awdWidth").innerHTML);
         this._stage_height = parseInt(document.getElementById("awdHeight").innerHTML);
         */
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
    AWD3ViewerMinimal.prototype.initObjects = function () {
        var _this = this;
        AssetLibrary.enableParser(AWDParser);
        //kickoff asset loading
        var loader = new Loader();
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onRessourceComplete(event); });
        loader.addEventListener(ParserEvent.PARSE_ERROR, function (event) { return _this.onParseError(event); });
        //for plugin preview-runtime:
        //loader.load(new URLRequest(document.getElementById("awdPath").innerHTML));
        loader.load(new URLRequest("assets/AWD3/Icycle2_awd/icycle_2_awd.awd"));
        //loader.load(new URLRequest("assets/AWD3/Icycle2_Intro_2.awd"));
        //loader.load(new URLRequest("assets/AWD3/AwayJEscher.awd"));
        //loader.load(new URLRequest("assets/AWD3/SimpleSoundTest.awd"));
        //loader.load(new URLRequest("assets/AWD3/Simple_text_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/AwayJS_Ninja.awd"));
        //loader.load(new URLRequest("assets/AWD3/ComplexShape.awd"));
        //loader.load(new URLRequest("assets/AWD3/NestedTween.awd"));
        //loader.load(new URLRequest("assets/AWD3/Rectancle_blink_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow.awd"));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow_multi.awd"));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow_shape_debug.awd"));
        //loader.load(new URLRequest("assets/AWD3/simple_bitmap_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/Simple_mask_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/mask_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/text_test_2.awd"));
        //loader.load(new URLRequest("assets/AWD3/intro_icycle.awd"));
    };
    /**
     * Initialise the listeners
     */
    AWD3ViewerMinimal.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * loader listener for asset complete events
     */
    AWD3ViewerMinimal.prototype.onAssetComplete = function (event) {
        if (event.asset.isAsset(TextField)) {
            var one_textfield = event.asset;
        }
        else if (event.asset.isAsset(Mesh)) {
            var one_mesh = event.asset;
            one_mesh.debugVisible = true;
        }
        else if (event.asset.isAsset(Billboard)) {
            var one_billboard = event.asset;
        }
        else if (event.asset.isAsset(MovieClip)) {
            var one_mc = event.asset;
            this._rootTimeLine = one_mc;
            this._rootTimeLine.partition = new Partition2D(this._rootTimeLine);
        }
    };
    /**
     * loader listener for asset complete events
     */
    AWD3ViewerMinimal.prototype.onParseError = function (event) {
        console.log(event.message);
    };
    /**
     * loader listener for asset complete events
     */
    AWD3ViewerMinimal.prototype.onRessourceComplete = function (event) {
        if (this._rootTimeLine) {
            //console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
            this._view.scene.addChild(this._rootTimeLine);
            this._rootTimeLine.x = -this._stage_width / 2;
            this._rootTimeLine.y = -this._stage_height / 2;
        }
    };
    /**
     * Render loop
     */
    AWD3ViewerMinimal.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        //if (this._rootTimeLine)
        //	this._rootTimeLine.logHierarchy();
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
    AWD3ViewerMinimal.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return AWD3ViewerMinimal;
})();
window.onload = function () {
    new AWD3ViewerMinimal();
};

},{"awayjs-core/lib/events/AssetEvent":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/events/ParserEvent":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/projections/CoordinateSystem":undefined,"awayjs-core/lib/projections/OrthographicProjection":undefined,"awayjs-core/lib/projections/PerspectiveProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Loader":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Billboard":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/TextField":undefined,"awayjs-parsers/lib/AWDParser":undefined,"awayjs-player/lib/display/MovieClip":undefined,"awayjs-player/lib/partition/Partition2D":undefined,"awayjs-player/lib/renderer/Renderer2D":undefined}]},{},["./src/AWD3ViewerMinimal.ts"])


//# sourceMappingURL=AWD3ViewerMinimal.js.map