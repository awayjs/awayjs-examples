(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/AWD3ViewerMinimal.ts":[function(require,module,exports){
/*

 AWD3 file loading example in

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
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var ParserEvent = require("awayjs-core/lib/events/ParserEvent");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var IOErrorEvent = require("awayjs-core/lib/events/IOErrorEvent");
var View = require("awayjs-display/lib/containers/View");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var Billboard = require("awayjs-display/lib/entities/Billboard");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var Loader = require("awayjs-display/lib/containers/Loader");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var SceneGraphPartition = require("awayjs-display/lib/partition/SceneGraphPartition");
var MovieClip = require("awayjs-display/lib/entities/MovieClip");
var CoordinateSystem = require("awayjs-core/lib/projections/CoordinateSystem");
var PerspectiveProjection = require("awayjs-core/lib/projections/PerspectiveProjection");
var Camera = require("awayjs-display/lib/entities/Camera");
var TextField = require("awayjs-display/lib/entities/TextField");
var AWD3ViewerMinimal = (function () {
    /**
     * Constructor
     */
    function AWD3ViewerMinimal() {
        this._fps = 30;
        this._time = 0;
        this._replaced_gettext = false;
        this._updated_property = false;
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
        this._renderer = new DefaultRenderer();
        this._renderer.renderableSorter = null; //new RenderableSort2D();
        this._view = new View(this._renderer);
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
    AWD3ViewerMinimal.prototype.initObjects = function () {
        var _this = this;
        //kickoff asset loading
        var loader = new Loader();
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onRessourceComplete(event); });
        loader.addEventListener(ParserEvent.PARSE_ERROR, function (event) { return _this.onParseError(event); });
        loader.addEventListener(IOErrorEvent.IO_ERROR, function (event) { return _this.onParseError(event); });
        //for plugin preview-runtime:
        //loader.load(new URLRequest(document.getElementById("awdPath").innerHTML), null, null, new AWDParser(this._view));
        loader.load(new URLRequest("assets/AWD3/Main.awd"), null, null, new AWDParser(this._view));
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
            if (one_textfield.name == "language_btn_tf" || one_textfield.name == "flag") {
                console.log("NAME:", one_textfield.name);
                one_textfield.mouseEnabled = false;
                one_textfield.mouseChildren = false;
            }
        }
        else if (event.asset.isAsset(Mesh)) {
            var one_mesh = event.asset;
        }
        else if (event.asset.isAsset(Billboard)) {
            var one_billboard = event.asset;
        }
        else if (event.asset.isAsset(MovieClip)) {
            var one_mc = event.asset;
            if (one_mc.name == "border" || one_mc.name == "dream" || one_mc.name == "IAP Menu" || one_mc.name == "language flag" || one_mc.name == "shoptag_shapes" || one_mc.name == "shoptag_cliffedges") {
                console.log("NAME:", one_mc.name);
                one_mc.mouseEnabled = false;
                one_mc.mouseChildren = false;
            }
            this._rootTimeLine = one_mc;
        }
    };
    /**
     * loader listener for asset complete events
     */
    AWD3ViewerMinimal.prototype.onLoadError = function (event) {
        console.log("LoadError");
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
            this._rootTimeLine.partition = new SceneGraphPartition(this._rootTimeLine);
            //console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
            this._view.scene.addChild(this._rootTimeLine);
        }
    };
    AWD3ViewerMinimal.prototype.getText = function (input_string) {
        return "test getText";
    };
    /**
     * Render loop
     */
    AWD3ViewerMinimal.prototype.onEnterFrame = function (dt) {
        var frameMarker = Math.floor(1000 / this._fps);
        this._time += Math.min(dt, frameMarker);
        //if (this._rootTimeLine)
        //	this._rootTimeLine.logHierarchy();
        //update camera controler
        // this._cameraController.update();
        if (this._time >= frameMarker) {
            this._time -= frameMarker;
            if (this._rootTimeLine != undefined)
                this._rootTimeLine.update();
            this._view.render();
        }
    };
    AWD3ViewerMinimal.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
        this._projection.fieldOfView = Math.atan(0.464 / 2) * 360 / Math.PI;
        this._projection.originX = (0.5 - 0.5 * (window.innerHeight / 464) * (700 / window.innerWidth));
    };
    return AWD3ViewerMinimal;
})();
window.onload = function () {
    new AWD3ViewerMinimal();
};

},{"awayjs-core/lib/events/AssetEvent":undefined,"awayjs-core/lib/events/IOErrorEvent":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/events/ParserEvent":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/projections/CoordinateSystem":undefined,"awayjs-core/lib/projections/PerspectiveProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Loader":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Billboard":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/MovieClip":undefined,"awayjs-display/lib/entities/TextField":undefined,"awayjs-display/lib/partition/SceneGraphPartition":undefined,"awayjs-parsers/lib/AWDParser":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/AWD3ViewerMinimal.ts"])


//# sourceMappingURL=AWD3ViewerMinimal.js.map