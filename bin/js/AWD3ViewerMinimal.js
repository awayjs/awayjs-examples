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
var Renderer2D = require("awayjs-player/lib/renderer/Renderer2D");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var Partition2D = require("awayjs-player/lib/partition/Partition2D");
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
            if (one_mc.name == "border" || one_mc.name == "dream" || one_mc.name == "IAP Menu" || one_mc.name == "shoptag_shapes" || one_mc.name == "shopttag_cliffedges") {
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
            this._rootTimeLine.partition = new Partition2D(this._rootTimeLine);
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
        if (this._rootTimeLine != undefined) {
            //console.log("RENDER = ");
            this._rootTimeLine.update(dt);
            if (!this._replaced_gettext) {
                // getText is defined on frame 4 of root-timeline.
                // once it has been defined by framescript, we want to replace it
                if (this._rootTimeLine.adapter.hasOwnProperty("getText")) {
                    console.log("function getText found");
                    this._rootTimeLine.adapter["getText"] = this.getText;
                    console.log("function getText replaced");
                    this._replaced_gettext = true;
                }
            }
            if (!this._updated_property) {
                // getText is defined on frame 1 of root-timeline.
                // once it has been defined by framescript, we want to control it
                if (this._rootTimeLine.adapter.hasOwnProperty("IAPAVAILABLE")) {
                    console.log("property IAPAVAILABLE found = " + this._rootTimeLine.adapter["IAPAVAILABLE"]);
                    this._rootTimeLine.adapter["IAPAVAILABLE"] = false;
                    console.log("property IAPAVAILABLE changed to = " + this._rootTimeLine.adapter["IAPAVAILABLE"]);
                    this._updated_property = true;
                }
            }
        }
        //console.log("RENDER = ");
        //update view
        if (this._time >= frameMarker) {
            this._time = 0;
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

},{"awayjs-core/lib/events/AssetEvent":undefined,"awayjs-core/lib/events/IOErrorEvent":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/events/ParserEvent":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/projections/CoordinateSystem":undefined,"awayjs-core/lib/projections/PerspectiveProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Loader":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Billboard":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/MovieClip":undefined,"awayjs-display/lib/entities/TextField":undefined,"awayjs-parsers/lib/AWDParser":undefined,"awayjs-player/lib/partition/Partition2D":undefined,"awayjs-player/lib/renderer/Renderer2D":undefined}]},{},["./src/AWD3ViewerMinimal.ts"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQVdEM1ZpZXdlck1pbmltYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtDRztBQUdILElBQU8sVUFBVSxXQUFpQixtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3ZFLElBQU8sVUFBVSxXQUFpQixnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3BFLElBQU8sV0FBVyxXQUFpQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3pFLElBQU8sV0FBVyxXQUFpQixvQ0FBb0MsQ0FBQyxDQUFDO0FBS3pFLElBQU8scUJBQXFCLFdBQWMsNkNBQTZDLENBQUMsQ0FBQztBQUN6RixJQUFPLFlBQVksV0FBYyxxQ0FBcUMsQ0FBQyxDQUFDO0FBRXhFLElBQU8sSUFBSSxXQUFtQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3BFLElBQU8sSUFBSSxXQUFtQixrQ0FBa0MsQ0FBQyxDQUFDO0FBQ2xFLElBQU8sU0FBUyxXQUFpQix1Q0FBdUMsQ0FBQyxDQUFDO0FBRTFFLElBQU8sZUFBZSxXQUFnQixnREFBZ0QsQ0FBQyxDQUFDO0FBQ3hGLElBQU8sTUFBTSxXQUFrQixzQ0FBc0MsQ0FBQyxDQUFDO0FBTXZFLElBQU8sVUFBVSxXQUFvQix1Q0FBdUMsQ0FBQyxDQUFDO0FBSTlFLElBQU8sU0FBUyxXQUFpQiw4QkFBOEIsQ0FBQyxDQUFDO0FBQ2pFLElBQU8sV0FBVyxXQUFpQix5Q0FBeUMsQ0FBQyxDQUFDO0FBQzlFLElBQU8sU0FBUyxXQUFpQix1Q0FBdUMsQ0FBQyxDQUFDO0FBRTFFLElBQU8sZ0JBQWdCLFdBQWdCLDhDQUE4QyxDQUFDLENBQUM7QUFDdkYsSUFBTyxxQkFBcUIsV0FBYyxtREFBbUQsQ0FBQyxDQUFDO0FBQy9GLElBQU8sTUFBTSxXQUFrQixvQ0FBb0MsQ0FBQyxDQUFDO0FBRXJFLElB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LEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQUVPLG9DQUFRLEdBQWhCLFVBQWlCLEtBQVk7UUFBWixxQkFBWSxHQUFaLFlBQVk7UUFFekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQVcsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFXLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFNLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDOUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBQyxHQUFHLENBQUMsR0FBQyxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUwsd0JBQUM7QUFBRCxDQWhRQSxBQWdRQyxJQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUNaLElBQUksaUJBQWlCLEVBQUUsQ0FBQztBQUU1QixDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcblxuIEFXRDMgZmlsZSBsb2FkaW5nIGV4YW1wbGUgaW5cblxuIERlbW9uc3RyYXRlczpcblxuIEhvdyB0byB1c2UgdGhlIExvYWRlciBvYmplY3QgdG8gbG9hZCBhbiBlbWJlZGRlZCBpbnRlcm5hbCBhd2QgbW9kZWwuXG5cbiBDb2RlIGJ5IFJvYiBCYXRlbWFuXG4gcm9iQGluZmluaXRldHVydGxlcy5jby51a1xuIGh0dHA6Ly93d3cuaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5cbiBUaGlzIGNvZGUgaXMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG5cbiBDb3B5cmlnaHQgKGMpIFRoZSBBd2F5IEZvdW5kYXRpb24gaHR0cDovL3d3dy50aGVhd2F5Zm91bmRhdGlvbi5vcmdcblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSDvv71Tb2Z0d2FyZe+/vSksIHRvIGRlYWxcbiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIO+/vUFTIElT77+9LCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuIFRIRSBTT0ZUV0FSRS5cblxuICovXG5cbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TGlicmFyeVwiKTtcbmltcG9ydCBBc3NldEV2ZW50XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0Fzc2V0RXZlbnRcIik7XG5pbXBvcnQgVVJMUmVxdWVzdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0xvYWRlckV2ZW50XCIpO1xuaW1wb3J0IFBhcnNlckV2ZW50XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL1BhcnNlckV2ZW50XCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1ZlY3RvcjNEXCIpO1xuaW1wb3J0IE9ydGhvZ3JhcGhpY09mZkNlbnRlclByb2plY3Rpb25cdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3Byb2plY3Rpb25zL09ydGhvZ3JhcGhpY09mZkNlbnRlclByb2plY3Rpb25cIik7XG5pbXBvcnQgT3J0aG9ncmFwaGljUHJvamVjdGlvblx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3Byb2plY3Rpb25zL09ydGhvZ3JhcGhpY1Byb2plY3Rpb25cIik7XG5pbXBvcnQgS2V5Ym9hcmRcdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3VpL0tleWJvYXJkXCIpO1xuaW1wb3J0IFJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcbmltcG9ydCBJT0Vycm9yRXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvSU9FcnJvckV2ZW50XCIpO1xuXG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL1ZpZXdcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9NZXNoXCIpO1xuaW1wb3J0IEJpbGxib2FyZFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0JpbGxib2FyZFwiKTtcbmltcG9ydCBDb250YWluZXJcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL0Rpc3BsYXlPYmplY3RDb250YWluZXJcIik7XG5pbXBvcnQgSG92ZXJDb250cm9sbGVyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRyb2xsZXJzL0hvdmVyQ29udHJvbGxlclwiKTtcbmltcG9ydCBMb2FkZXJcdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IENvbG9yTWF0ZXJpYWxcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL0Jhc2ljTWF0ZXJpYWxcIik7XG5pbXBvcnQgUmVuZGVyYWJsZU51bGxTb3J0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9zb3J0L1JlbmRlcmFibGVOdWxsU29ydFwiKTtcbmltcG9ydCBQcmltaXRpdmVDdWJlUHJlZmFiXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9wcmVmYWJzL1ByaW1pdGl2ZUN1YmVQcmVmYWJcIik7XG5pbXBvcnQgRGlzcGxheU9iamVjdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9iYXNlL0Rpc3BsYXlPYmplY3RcIik7XG5cbmltcG9ydCBSZW5kZXJlcjJEXHRcdFx0XHRcdFx0ICAgID0gcmVxdWlyZShcImF3YXlqcy1wbGF5ZXIvbGliL3JlbmRlcmVyL1JlbmRlcmVyMkRcIik7XG5cbmltcG9ydCBNZXRob2RNYXRlcmlhbFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL01ldGhvZE1hdGVyaWFsXCIpO1xuXG5pbXBvcnQgQVdEUGFyc2VyXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcGFyc2Vycy9saWIvQVdEUGFyc2VyXCIpO1xuaW1wb3J0IFBhcnRpdGlvbjJEXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcGxheWVyL2xpYi9wYXJ0aXRpb24vUGFydGl0aW9uMkRcIik7XG5pbXBvcnQgTW92aWVDbGlwXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTW92aWVDbGlwXCIpO1xuXG5pbXBvcnQgQ29vcmRpbmF0ZVN5c3RlbVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9wcm9qZWN0aW9ucy9Db29yZGluYXRlU3lzdGVtXCIpO1xuaW1wb3J0IFBlcnNwZWN0aXZlUHJvamVjdGlvblx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3Byb2plY3Rpb25zL1BlcnNwZWN0aXZlUHJvamVjdGlvblwiKTtcbmltcG9ydCBDYW1lcmFcdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcblxuaW1wb3J0IFRleHRGaWVsZFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1RleHRGaWVsZFwiKTtcbmltcG9ydCBUZXh0Rm9ybWF0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvdGV4dC9UZXh0Rm9ybWF0XCIpO1xuXG5jbGFzcyBBV0QzVmlld2VyTWluaW1hbFxue1xuICAgIHByaXZhdGUgX2ZwczpudW1iZXIgPSAzMDtcblxuICAgIC8vZW5naW5lIHZhcmlhYmxlc1xuICAgIHByaXZhdGUgX3ZpZXc6IFZpZXc7XG5cbiAgICBwcml2YXRlIF9yb290VGltZUxpbmU6IE1vdmllQ2xpcDtcblxuICAgIHByaXZhdGUgX3RpbWVyOiBSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgcHJpdmF0ZSBfdGltZTogbnVtYmVyID0gMDtcblxuICAgIC8vbmF2aWdhdGlvblxuICAgIHByaXZhdGUgX2xhc3RQYW5BbmdsZTogbnVtYmVyO1xuICAgIHByaXZhdGUgX2xhc3RUaWx0QW5nbGU6IG51bWJlcjtcbiAgICBwcml2YXRlIF9sYXN0TW91c2VYOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfbGFzdE1vdXNlWTogbnVtYmVyO1xuICAgIHByaXZhdGUgX21vdmU6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfaXNwZXJzcGVjdGl2ZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9wcm9qZWN0aW9uOiBQZXJzcGVjdGl2ZVByb2plY3Rpb247XG4gICAgcHJpdmF0ZSBfb3J0aG9fcHJvamVjdGlvbjogT3J0aG9ncmFwaGljUHJvamVjdGlvbjtcbiAgICBwcml2YXRlIF9ob3ZlckNvbnRyb2w6IEhvdmVyQ29udHJvbGxlcjtcbiAgICBwcml2YXRlIF9jYW1lcmFfcGVyc3BlY3RpdmU6IENhbWVyYTtcbiAgICBwcml2YXRlIF9jYW1lcmFfb3J0aG86IENhbWVyYTtcbiAgICBwcml2YXRlIF9zdGFnZV93aWR0aDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3N0YWdlX2hlaWdodDogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBjb3VudGVyOiBudW1iZXI7XG5cblxuICAgIHByaXZhdGUgX3JlcGxhY2VkX2dldHRleHQ6Ym9vbGVhbjtcbiAgICBwcml2YXRlIF91cGRhdGVkX3Byb3BlcnR5OmJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKClcbiAgICB7XG4gICAgICAgIHRoaXMuX3JlcGxhY2VkX2dldHRleHQ9ZmFsc2VcbiAgICAgICAgdGhpcy5fdXBkYXRlZF9wcm9wZXJ0eT1mYWxzZTtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2xvYmFsIGluaXRpYWxpc2UgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXQoKTogdm9pZFxuICAgIHtcblxuICAgICAgICB0aGlzLmluaXRFbmdpbmUoKTtcbiAgICAgICAgdGhpcy5pbml0T2JqZWN0cygpO1xuICAgICAgICB0aGlzLmluaXRMaXN0ZW5lcnMoKTtcblxuXG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXNlIHRoZSBlbmdpbmVcbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRFbmdpbmUoKTogdm9pZFxuICAgIHtcbiAgICAgICAgLy9jcmVhdGUgdGhlIHZpZXdcbiAgICAgICAgdGhpcy5fdmlldyA9IG5ldyBWaWV3KG5ldyBSZW5kZXJlcjJEKCkpO1xuICAgICAgICB0aGlzLl92aWV3LmJhY2tncm91bmRDb2xvciA9IDB4MDAwMDAwO1xuICAgICAgICB0aGlzLl9zdGFnZV93aWR0aCA9IDU1MDtcbiAgICAgICAgdGhpcy5fc3RhZ2VfaGVpZ2h0ID0gNDAwO1xuXG4gICAgICAgIC8vZm9yIHBsdWdpbiBwcmV2aWV3LXJ1bnRpbWU6XG4vKlxuICAgICAgICAgdGhpcy5fdmlldy5iYWNrZ3JvdW5kQ29sb3IgPSBwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJnQ29sb3JcIikuaW5uZXJIVE1MLnJlcGxhY2UoXCIjXCIsIFwiMHhcIikpO1xuICAgICAgICAgdGhpcy5fc3RhZ2Vfd2lkdGggPSBwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF3ZFdpZHRoXCIpLmlubmVySFRNTCk7XG4gICAgICAgICB0aGlzLl9zdGFnZV9oZWlnaHQgPSBwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF3ZEhlaWdodFwiKS5pbm5lckhUTUwpO1xuKi9cbiAgICAgICAgdGhpcy5faXNwZXJzcGVjdGl2ZT10cnVlO1xuICAgICAgICB0aGlzLl9wcm9qZWN0aW9uID0gbmV3IFBlcnNwZWN0aXZlUHJvamVjdGlvbigpO1xuICAgICAgICB0aGlzLl9wcm9qZWN0aW9uLmNvb3JkaW5hdGVTeXN0ZW0gPSBDb29yZGluYXRlU3lzdGVtLlJJR0hUX0hBTkRFRDtcbiAgICAgICAgdGhpcy5fcHJvamVjdGlvbi5maWVsZE9mVmlldyA9IDMwO1xuICAgICAgICB0aGlzLl9wcm9qZWN0aW9uLm9yaWdpblggPSAwO1xuICAgICAgICB0aGlzLl9wcm9qZWN0aW9uLm9yaWdpblkgPSAwO1xuICAgICAgICB0aGlzLl9jYW1lcmFfcGVyc3BlY3RpdmUgPSBuZXcgQ2FtZXJhKCk7XG4gICAgICAgIHRoaXMuX2NhbWVyYV9wZXJzcGVjdGl2ZS5wcm9qZWN0aW9uID0gdGhpcy5fcHJvamVjdGlvbjtcbiAgICAgICAgLy90aGlzLl9wcm9qZWN0aW9uLmZhciA9IDUwMDAwMDtcbiAgICAgICAgdGhpcy5faG92ZXJDb250cm9sID0gbmV3IEhvdmVyQ29udHJvbGxlcih0aGlzLl9jYW1lcmFfcGVyc3BlY3RpdmUsIG51bGwsIDE4MCwgMCwgMTAwMCk7XG4gICAgICAgIHRoaXMuX3ZpZXcuY2FtZXJhID0gdGhpcy5fY2FtZXJhX3BlcnNwZWN0aXZlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpc2UgdGhlIHNjZW5lIG9iamVjdHNcbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRPYmplY3RzKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIC8va2lja29mZiBhc3NldCBsb2FkaW5nXG4gICAgICAgIHZhciBsb2FkZXI6TG9hZGVyID0gbmV3IExvYWRlcigpO1xuICAgICAgICBsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihBc3NldEV2ZW50LkFTU0VUX0NPTVBMRVRFLCAoZXZlbnQ6IEFzc2V0RXZlbnQpID0+IHRoaXMub25Bc3NldENvbXBsZXRlKGV2ZW50KSk7XG4gICAgICAgIGxvYWRlci5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCAoZXZlbnQ6IExvYWRlckV2ZW50KSA9PiB0aGlzLm9uUmVzc291cmNlQ29tcGxldGUoZXZlbnQpKTtcbiAgICAgICAgbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoUGFyc2VyRXZlbnQuUEFSU0VfRVJST1IsIChldmVudDogUGFyc2VyRXZlbnQpID0+IHRoaXMub25QYXJzZUVycm9yKGV2ZW50KSk7XG4gICAgICAgIGxvYWRlci5hZGRFdmVudExpc3RlbmVyKElPRXJyb3JFdmVudC5JT19FUlJPUiwgKGV2ZW50OiBQYXJzZXJFdmVudCkgPT4gdGhpcy5vblBhcnNlRXJyb3IoZXZlbnQpKTtcblxuICAgICAgICAvL2ZvciBwbHVnaW4gcHJldmlldy1ydW50aW1lOlxuICAgICAgICAvL2xvYWRlci5sb2FkKG5ldyBVUkxSZXF1ZXN0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXdkUGF0aFwiKS5pbm5lckhUTUwpLCBudWxsLCBudWxsLCBuZXcgQVdEUGFyc2VyKHRoaXMuX3ZpZXcpKTtcblxuICAgICAgICBsb2FkZXIubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9BV0QzL01haW4uYXdkXCIpLCBudWxsLCBudWxsLCBuZXcgQVdEUGFyc2VyKHRoaXMuX3ZpZXcpKTtcbiAgICAgICAgLy9sb2FkZXIubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9BV0QzL0ljeWNsZTJfSW50cm9fMi5hd2RcIikpO1xuICAgICAgICAvL2xvYWRlci5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL0FXRDMvQXdheUpFc2NoZXIuYXdkXCIpKTtcbiAgICAgICAgLy9sb2FkZXIubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9BV0QzL1NpbXBsZVNvdW5kVGVzdC5hd2RcIikpO1xuICAgICAgICAvL2xvYWRlci5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL0FXRDMvU2ltcGxlX3RleHRfdGVzdC5hd2RcIikpO1xuICAgICAgICAvL2xvYWRlci5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL0FXRDMvQXdheUpTX05pbmphLmF3ZFwiKSk7XG4gICAgICAgIC8vbG9hZGVyLmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvQVdEMy9Db21wbGV4U2hhcGUuYXdkXCIpKTtcbiAgICAgICAgLy9sb2FkZXIubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9BV0QzL05lc3RlZFR3ZWVuLmF3ZFwiKSk7XG4gICAgICAgIC8vbG9hZGVyLmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvQVdEMy9SZWN0YW5jbGVfYmxpbmtfdGVzdC5hd2RcIikpO1xuICAgICAgICAvL2xvYWRlci5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL0FXRDMvU2NhcmVDcm93LmF3ZFwiKSk7XG4gICAgICAgIC8vbG9hZGVyLmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvQVdEMy9TY2FyZUNyb3dfbXVsdGkuYXdkXCIpKTtcbiAgICAgICAgLy9sb2FkZXIubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9BV0QzL1NjYXJlQ3Jvd19zaGFwZV9kZWJ1Zy5hd2RcIikpO1xuICAgICAgICAvL2xvYWRlci5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL0FXRDMvc2ltcGxlX2JpdG1hcF90ZXN0LmF3ZFwiKSk7XG4gICAgICAgIC8vbG9hZGVyLmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvQVdEMy9TaW1wbGVfbWFza190ZXN0LmF3ZFwiKSk7XG4gICAgICAgIC8vbG9hZGVyLmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvQVdEMy9tYXNrX3Rlc3QuYXdkXCIpKTtcbiAgICAgICAgLy9sb2FkZXIubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9BV0QzL3RleHRfdGVzdF8yLmF3ZFwiKSk7XG4gICAgICAgIC8vbG9hZGVyLmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvQVdEMy9pbnRyb19pY3ljbGUuYXdkXCIpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpc2UgdGhlIGxpc3RlbmVyc1xuICAgICAqL1xuICAgIHByaXZhdGUgaW5pdExpc3RlbmVycygpOiB2b2lkXG4gICAge1xuICAgICAgICB3aW5kb3cub25yZXNpemUgID0gKGV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xuXG4gICAgICAgIHRoaXMuX3RpbWVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyk7XG4gICAgICAgIHRoaXMuX3RpbWVyLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbG9hZGVyIGxpc3RlbmVyIGZvciBhc3NldCBjb21wbGV0ZSBldmVudHNcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uQXNzZXRDb21wbGV0ZShldmVudDogQXNzZXRFdmVudCk6IHZvaWRcbiAgICB7XG5cbiAgICAgICAgaWYoZXZlbnQuYXNzZXQuaXNBc3NldChUZXh0RmllbGQpKXtcbiAgICAgICAgICAgIHZhciBvbmVfdGV4dGZpZWxkOlRleHRGaWVsZD08VGV4dEZpZWxkPiBldmVudC5hc3NldDtcbiAgICAgICAgICAgIC8vdGhpcy5sb2FkZWRfZGlzcGxheV9vYmplY3RzLnB1c2gob25lX3RleHRmaWVsZCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwib3JnaW5hbCB0ZXh0ZmllbGRfdGV4dCA9IFwiK29uZV90ZXh0ZmllbGQudGV4dCk7XG4gICAgICAgICAgICAvL29uZV90ZXh0ZmllbGQudGV4dD1cIm5ldyB0ZXh0XCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihldmVudC5hc3NldC5pc0Fzc2V0KE1lc2gpKSB7XG4gICAgICAgICAgICB2YXIgb25lX21lc2g6TWVzaCA9IDxNZXNoPiBldmVudC5hc3NldDtcbiAgICAgICAgICAgIG9uZV9tZXNoLmRlYnVnVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAvL3RoaXMubG9hZGVkX2Rpc3BsYXlfb2JqZWN0cy5wdXNoKG9uZV9tZXNoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGV2ZW50LmFzc2V0LmlzQXNzZXQoQmlsbGJvYXJkKSkge1xuICAgICAgICAgICAgdmFyIG9uZV9iaWxsYm9hcmQ6QmlsbGJvYXJkID0gPEJpbGxib2FyZD4gZXZlbnQuYXNzZXQ7XG4gICAgICAgICAgICAvL3RoaXMubG9hZGVkX2Rpc3BsYXlfb2JqZWN0cy5wdXNoKG9uZV9iaWxsYm9hcmQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoZXZlbnQuYXNzZXQuaXNBc3NldChNb3ZpZUNsaXApKSB7XG4gICAgICAgICAgICB2YXIgb25lX21jOk1vdmllQ2xpcCA9IDxNb3ZpZUNsaXA+IGV2ZW50LmFzc2V0O1xuICAgICAgICAgICAgaWYgKG9uZV9tYy5uYW1lID09IFwiYm9yZGVyXCIgfHwgb25lX21jLm5hbWUgPT0gXCJkcmVhbVwiIHx8IG9uZV9tYy5uYW1lID09IFwiSUFQIE1lbnVcIiB8fCBvbmVfbWMubmFtZSA9PSBcInNob3B0YWdfc2hhcGVzXCIgfHwgb25lX21jLm5hbWUgPT0gXCJzaG9wdHRhZ19jbGlmZmVkZ2VzXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5BTUU6XCIsIG9uZV9tYy5uYW1lKVxuICAgICAgICAgICAgICAgIG9uZV9tYy5tb3VzZUVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBvbmVfbWMubW91c2VDaGlsZHJlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcm9vdFRpbWVMaW5lID0gb25lX21jO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBsb2FkZXIgbGlzdGVuZXIgZm9yIGFzc2V0IGNvbXBsZXRlIGV2ZW50c1xuICAgICAqL1xuICAgIHByaXZhdGUgb25Mb2FkRXJyb3IoZXZlbnQ6IElPRXJyb3JFdmVudCk6dm9pZFxuICAgIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJMb2FkRXJyb3JcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbG9hZGVyIGxpc3RlbmVyIGZvciBhc3NldCBjb21wbGV0ZSBldmVudHNcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uUGFyc2VFcnJvcihldmVudDogUGFyc2VyRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coZXZlbnQubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbG9hZGVyIGxpc3RlbmVyIGZvciBhc3NldCBjb21wbGV0ZSBldmVudHNcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uUmVzc291cmNlQ29tcGxldGUoZXZlbnQ6IExvYWRlckV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9yb290VGltZUxpbmUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3RUaW1lTGluZS5wYXJ0aXRpb24gPSBuZXcgUGFydGl0aW9uMkQodGhpcy5fcm9vdFRpbWVMaW5lKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJMT0FESU5HIEEgUk9PVCBuYW1lID0gXCIgKyB0aGlzLl9yb290VGltZUxpbmUubmFtZSArIFwiIGR1cmF0aW9uPVwiICsgdGhpcy5fcm9vdFRpbWVMaW5lLmR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQodGhpcy5fcm9vdFRpbWVMaW5lKTtcbiAgICAgICAgICAgIC8vdGhpcy5fcm9vdFRpbWVMaW5lLng9LXRoaXMuX3N0YWdlX3dpZHRoLzI7XG4gICAgICAgICAgICAvL3RoaXMuX3Jvb3RUaW1lTGluZS55PS10aGlzLl9zdGFnZV9oZWlnaHQvMjtcbiAgICAgICAgICAgIC8vIGF1dG9wbGF5IGxpa2UgaW4gRmxhc2hcbiAgICAgICAgICAgIC8vdGhpcy5fcm9vdFRpbWVMaW5lLnBsYXkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VGV4dChpbnB1dF9zdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcInRlc3QgZ2V0VGV4dFwiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbG9vcFxuICAgICAqL1xuICAgIHByaXZhdGUgb25FbnRlckZyYW1lKGR0OiBudW1iZXIpOiB2b2lkIHtcblxuICAgICAgICB2YXIgZnJhbWVNYXJrZXI6bnVtYmVyID0gTWF0aC5mbG9vcigxMDAwL3RoaXMuX2Zwcyk7XG5cbiAgICAgICAgdGhpcy5fdGltZSArPSBNYXRoLm1pbihkdCwgZnJhbWVNYXJrZXIpO1xuXG4gICAgICAgIC8vaWYgKHRoaXMuX3Jvb3RUaW1lTGluZSlcbiAgICAgICAgLy9cdHRoaXMuX3Jvb3RUaW1lTGluZS5sb2dIaWVyYXJjaHkoKTtcbiAgICAgICAgLy91cGRhdGUgY2FtZXJhIGNvbnRyb2xlclxuICAgICAgICAvLyB0aGlzLl9jYW1lcmFDb250cm9sbGVyLnVwZGF0ZSgpO1xuXG4gICAgICAgIGlmICh0aGlzLl9yb290VGltZUxpbmUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiUkVOREVSID0gXCIpO1xuICAgICAgICAgICAgdGhpcy5fcm9vdFRpbWVMaW5lLnVwZGF0ZShkdCk7XG4gICAgICAgICAgICBpZighdGhpcy5fcmVwbGFjZWRfZ2V0dGV4dCkge1xuICAgICAgICAgICAgICAgIC8vIGdldFRleHQgaXMgZGVmaW5lZCBvbiBmcmFtZSA0IG9mIHJvb3QtdGltZWxpbmUuXG4gICAgICAgICAgICAgICAgLy8gb25jZSBpdCBoYXMgYmVlbiBkZWZpbmVkIGJ5IGZyYW1lc2NyaXB0LCB3ZSB3YW50IHRvIHJlcGxhY2UgaXRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcm9vdFRpbWVMaW5lLmFkYXB0ZXIuaGFzT3duUHJvcGVydHkoXCJnZXRUZXh0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZnVuY3Rpb24gZ2V0VGV4dCBmb3VuZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcm9vdFRpbWVMaW5lLmFkYXB0ZXJbXCJnZXRUZXh0XCJdID0gdGhpcy5nZXRUZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZ1bmN0aW9uIGdldFRleHQgcmVwbGFjZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlcGxhY2VkX2dldHRleHQ9dHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZighdGhpcy5fdXBkYXRlZF9wcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIC8vIGdldFRleHQgaXMgZGVmaW5lZCBvbiBmcmFtZSAxIG9mIHJvb3QtdGltZWxpbmUuXG4gICAgICAgICAgICAgICAgLy8gb25jZSBpdCBoYXMgYmVlbiBkZWZpbmVkIGJ5IGZyYW1lc2NyaXB0LCB3ZSB3YW50IHRvIGNvbnRyb2wgaXRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcm9vdFRpbWVMaW5lLmFkYXB0ZXIuaGFzT3duUHJvcGVydHkoXCJJQVBBVkFJTEFCTEVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm9wZXJ0eSBJQVBBVkFJTEFCTEUgZm91bmQgPSBcIiArIHRoaXMuX3Jvb3RUaW1lTGluZS5hZGFwdGVyW1wiSUFQQVZBSUxBQkxFXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcm9vdFRpbWVMaW5lLmFkYXB0ZXJbXCJJQVBBVkFJTEFCTEVcIl0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwcm9wZXJ0eSBJQVBBVkFJTEFCTEUgY2hhbmdlZCB0byA9IFwiICsgdGhpcy5fcm9vdFRpbWVMaW5lLmFkYXB0ZXJbXCJJQVBBVkFJTEFCTEVcIl0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVkX3Byb3BlcnR5PXRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJSRU5ERVIgPSBcIik7XG4gICAgICAgIC8vdXBkYXRlIHZpZXdcbiAgICAgICAgaWYgKHRoaXMuX3RpbWUgPj0gZnJhbWVNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fdmlldy5yZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25SZXNpemUoZXZlbnQgPSBudWxsKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5fdmlldy55ICAgICAgICAgPSAwO1xuICAgICAgICB0aGlzLl92aWV3LnggICAgICAgICA9IDA7XG4gICAgICAgIHRoaXMuX3ZpZXcud2lkdGggICAgID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIHRoaXMuX3ZpZXcuaGVpZ2h0ICAgID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICB0aGlzLl9wcm9qZWN0aW9uLmZpZWxkT2ZWaWV3ID0gTWF0aC5hdGFuKDAuNDY0LzIpKjM2MC9NYXRoLlBJO1xuICAgICAgICB0aGlzLl9wcm9qZWN0aW9uLm9yaWdpblggPSAoMC41IC0gMC41Kih3aW5kb3cuaW5uZXJIZWlnaHQvNDY0KSooNzAwL3dpbmRvdy5pbm5lcldpZHRoKSk7XG4gICAgfVxuXG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgbmV3IEFXRDNWaWV3ZXJNaW5pbWFsKCk7XG5cbn07XG4iXX0=
