webpackJsonp([21],{

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_view__ = __webpack_require__(2);
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







var AWD3ViewerMinimal = function () {
    /**
     * Constructor
     */
    function AWD3ViewerMinimal() {
        this._fps = 30;
        this._time = 0;
        this._shapes = new Array();
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
        this._renderer = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["DefaultRenderer"]();
        this._renderer.renderableSorter = null; //new RenderableSort2D();
        this._view = new __WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_view__["View"](this._renderer);
        this._view.backgroundColor = 0x000000;
        this._stage_width = 550;
        this._stage_height = 400;
        //for plugin preview-runtime:
        /*
                 this._view.backgroundColor = parseInt(document.getElementById("bgColor").innerHTML.replace("#", "0x"));
                 this._stage_width = parseInt(document.getElementById("awdWidth").innerHTML);
                 this._stage_height = parseInt(document.getElementById("awdHeight").innerHTML);
        */
        this._projection = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["PerspectiveProjection"]();
        this._projection.coordinateSystem = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["CoordinateSystem"].RIGHT_HANDED;
        this._projection.fieldOfView = 30;
        this._projection.originX = 0;
        this._projection.originY = 0;
        var camera = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Camera"]();
        camera.projection = this._projection;
        this._hoverControl = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["HoverController"](camera, null, 180, 0, 1000);
        this._view.camera = camera;
    };
    /**
     * Initialise the scene objects
     */
    AWD3ViewerMinimal.prototype.initObjects = function () {
        var _this = this;
        //kickoff asset loading
        var loader = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["LoaderContainer"]();
        loader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetEvent"].ASSET_COMPLETE, function (event) {
            return _this.onAssetComplete(event);
        });
        loader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onRessourceComplete(event);
        });
        loader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["ParserEvent"].PARSE_ERROR, function (event) {
            return _this.onParseError(event);
        });
        //loader.addEventListener(IOErrorEvent.IO_ERROR, (event: ParserEvent) => this.onParseError(event));
        //for plugin preview-runtime:
        //loader.load(new URLRequest(document.getElementById("awdPath").innerHTML), null, null, new AWDParser(this._view));
        loader.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/AWD3/MagnifyGlass.awd"), null, null, new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__["AWDParser"](this._view));
        //loader.load(new URLRequest("assets/AWD3/TextConstructionTest.awd"), null, null, new AWDParser(this._view));
        //loader.load(new URLRequest("assets/AWD3/scarecrow_zoom_demo.awd"), null, null, new AWDParser(this._view));
        //loader.load(new URLRequest("assets/AWD3/BigBenClock.awd"));
        this._material = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](0x000001);
        this._material.style.color = 0x000001;
    };
    /**
     * Initialise the listeners
     */
    AWD3ViewerMinimal.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        this.onResize();
        this._timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * loader listener for asset complete events
     */
    AWD3ViewerMinimal.prototype.onAssetComplete = function (event) {
        console.log("graphic: " + event.asset.assetType);
        if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Graphics"])) {
            var one_graphics = event.asset;
            for (var i = 0; i < one_graphics.count; i++) {
                this._shapes.push(one_graphics.getShapeAt(i));
            }
        } else if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["TextField"])) {
            var one_textfield = event.asset;
        } else if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Sprite"])) {
            var one_sprite = event.asset;
        } else if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Billboard"])) {
            var one_billboard = event.asset;
        } else if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["MovieClip"])) {
            var movieClip = event.asset;
            if (movieClip.name == "border" || movieClip.name == "dream" || movieClip.name == "IAP Menu" || movieClip.name == "language flag" || movieClip.name == "shoptag_shapes" || movieClip.name == "shoptag_cliffedges" || movieClip.name == "languages baked" || movieClip.name == "Character" || movieClip.name == "free") {
                movieClip.mouseEnabled = false;
                movieClip.mouseChildren = false;
            }
            this._rootTimeLine = movieClip;
        }
    };
    /**
     * loader listener for asset complete events
     */
    /*
    private onLoadError(event: IOErrorEvent):void
    {
        console.log("LoadError");
    }
    */
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
            for (var i = 0; i < this._shapes.length; i++) {}
            this._view.setPartition(this._rootTimeLine, new __WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_view__["SceneGraphPartition"](this._rootTimeLine));
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
            if (this._rootTimeLine != undefined) this._rootTimeLine.update();
            this._view.render();
        }
    };
    AWD3ViewerMinimal.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
        var newHeight = this._stage_height;
        this._projection.fieldOfView = Math.atan(newHeight / 1000 / 2) * 360 / Math.PI;
        this._projection.originX = 0.5 - 0.5 * (window.innerHeight / newHeight) * (this._stage_width / window.innerWidth);
    };
    return AWD3ViewerMinimal;
}();
window.onload = function () {
    document.getElementsByTagName("BODY")[0].style.overflow = "hidden";
    new AWD3ViewerMinimal();
};

/***/ }

},[19]);
//# sourceMappingURL=AWD3ViewerMinimal.js.map