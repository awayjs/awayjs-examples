webpackJsonp([20],{

/***/ 21:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_player__ = __webpack_require__(13);
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






var AWDBasicTests = function () {
    /**
     * Constructor
     */
    function AWDBasicTests() {
        var _this = this;
        this._fps = 30;
        this._time = 0;
        this._awd_names = [];
        this._awd_descriptions = [];
        this._currentAWDIdx = 0;
        this._awd_names[this._currentAWDIdx] = "01_SimpleShape.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a simple white square,<br>that is centered on the stage";
        this._awd_names[this._currentAWDIdx] = "02_NeighbourRectangles.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see 2 simple rectangles that are touching each other,<br>left rectangle should be green, right rectangle should be blue.";
        this._awd_names[this._currentAWDIdx] = "03_curves.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a bunch of white circular shapes that were cutted into pieces,<br>there should be no straight line in the shapes";
        this._awd_names[this._currentAWDIdx] = "04_awaylogo.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see the away3d logo.<br>This is a test for linear gradients";
        this._awd_names[this._currentAWDIdx] = "05_Billboard.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see the away3d logo on a billboard.<br>This should look exactly like the next test.";
        this._awd_names[this._currentAWDIdx] = "06_bitmap_fill.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see the away3d logo on a shape (bitmap-fill).<br>This should look exactly like the previous test.";
        this._awd_names[this._currentAWDIdx] = "07_3logos.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see 3 versions of the away3d logo.<br>\
            left: billboard, center: linear gradients on shape, right: bitmapfill on shapes.<br>";
        this._awd_names[this._currentAWDIdx] = "08_EscherTimelineAnim.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a pattern of fish-shapes (red/yellow),<br>that is animated on scale, rotation and position";
        this._awd_names[this._currentAWDIdx] = "09_NinjaShape.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a ninja. <br>Rendering is not perfect because of missing blendmodes on timeline.";
        this._awd_names[this._currentAWDIdx] = "10_CheckDisplaySize.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a blue rectangle that fills the stage with a margin of 10px to each side.";
        this._awd_names[this._currentAWDIdx] = "11_DepthTestTimeline.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a bunch of overlapping rectangles animated timeline.<br>This is to test depth sorting in exporter. Open the fla to compare the results";
        this._awd_names[this._currentAWDIdx] = "12_HelloWorldScript.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a simple rectangle on stage<br>\
            in the console you should get a 'Hello World' message.";
        this._awd_names[this._currentAWDIdx] = "13_alpha_shadesofgrey.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a rectangle on stage that is cloned 10 times.<br>\
            The rectangle is white with a alpha of 10%, and the clones keep overlapping, so you should see all shades of grey between 10% white and 100% white.<br>\
            Alpha is not working atm, so right now we only see a white rectangle";
        this._awd_names[this._currentAWDIdx] = "14_simple_textfield.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a simple red textfield.";
        this._awd_names[this._currentAWDIdx] = "15_simple_textfields.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a timeline thats animated to show different textfields.";
        this._awd_names[this._currentAWDIdx] = "16_colortransforms.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a 5 rectangles that are tinted in different colors";
        this._awd_names[this._currentAWDIdx] = "17_blinking_rectangle.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a white rectangle that is constantly removed and added to the timeline";
        this._awd_names[this._currentAWDIdx] = "18_masking_circles.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a bunch of circles. Open the Fla document to compare";
        this._awd_names[this._currentAWDIdx] = "19_nested_tweens.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a nested tween animation. Open the Fla document to compare";
        this._awd_names[this._currentAWDIdx] = "20_simple_mask.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should see a simple object that is masked";
        this._awd_names[this._currentAWDIdx] = "21_simple_button.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "Simple button";
        this._awd_names[this._currentAWDIdx] = "22_button_htiAreas.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "This is a test to inspect the hitTest behaviour of buttons.<br>\
            There is a as3 version of the fla, so that we can compare to the expected flash behaviour.";
        this._awd_names[this._currentAWDIdx] = "23_single_scarecrow_death.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "Simple frame by frame animation of a dying scarecrow";
        this._awd_names[this._currentAWDIdx] = "24_scarecrow_no_anim.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "The animation of the previous test, but here we have all shapes on same frame (spritesheet like)";
        this._awd_names[this._currentAWDIdx] = "25_simple_sound.awd";
        this._awd_descriptions[this._currentAWDIdx++] = "You should here a phone ring.";
        var testSelector = document.createElement('div');
        testSelector.style.cssFloat = 'none';
        testSelector.style.position = 'absolute';
        testSelector.style.bottom = '10px';
        testSelector.style.width = '800px';
        testSelector.style.left = '50%';
        testSelector.style.marginLeft = '-400px';
        testSelector.style.padding = '20px';
        testSelector.style.textAlign = 'center';
        testSelector.style.backgroundColor = "rgba(0,0,0,0.7)";
        //testSelector.style.opacity    = '0.7';
        testSelector.style.color = '#ffffff';
        this.thisDiv = document.createElement('div');
        /*
        this.thisDiv.style.cssFloat     = 'none';
        this.thisDiv.style.position     = 'absolute';
        this.thisDiv.style.bottom       = '10px';
        this.thisDiv.style.width        = '800px';
        this.thisDiv.style.left         = '50%';
        this.thisDiv.style.marginLeft   = '-400px';
        this.thisDiv.style.padding    = '20px';
        this.thisDiv.style.backgroundColor    = '#000000';
         this.thisDiv.style.backgroundColor    = '#000000';
        this.thisDiv.style.color    = '#ffffff';
        this.thisDiv.style.textAlign    = 'center';
        this.thisDiv.style.zIndex    = '999999999';
        */
        this.dropDown = document.createElement('select');
        this.dropDown.name = "selectTestDropDown";
        this.dropDown.id = "selectTest";
        this.dropDown.style.marginTop = "20px";
        this.thisDiv.innerHTML = "Choose a AWDFile in the select box,<br>or use the left and right keys to skip through the tests";
        testSelector.appendChild(this.thisDiv);
        testSelector.appendChild(this.dropDown);
        var option = new Option("Choose a AWD File", "");
        this.dropDown.add(option);
        for (var c = 0; c < this._awd_names.length; c++) {
            var option = new Option(this._awd_names[c], String(c));
            this.dropDown.add(option);
        }
        this.dropDown.selectedIndex = 0;
        this.dropDown.onchange = function (e) {
            return _this.dropDownChange(e);
        };
        this.init();
        document.body.appendChild(testSelector);
    }
    AWDBasicTests.prototype.dropDownChange = function (e) {
        if (this.dropDown.selectedIndex == 0) {
            if (this._rootTimeLine) this._view.scene.removeChild(this._rootTimeLine);
            this._rootTimeLine = null;
            this._currentAWDIdx = this._awd_names.length;
            this.thisDiv.innerHTML = "Choose a AWDFile in the select box,<br>or use the left and right keys to skip through the tests";
            return;
        }
        this._currentAWDIdx = this.dropDown.selectedIndex - 2;
        if (this._currentAWDIdx < 0) {
            this._currentAWDIdx = this._awd_names.length;
        }
        this.loadNext();
        console.log("changed " + this._currentAWDIdx);
    };
    /**
     * Global initialise function
     */
    AWDBasicTests.prototype.init = function () {
        this._loader = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["LoaderContainer"]();
        this.initEngine();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    AWDBasicTests.prototype.initEngine = function () {
        //create the view
        this._renderer = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["DefaultRenderer"]();
        this._renderer.renderableSorter = null; //new RenderableSort2D();
        this._view = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__["View"](this._renderer);
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
        this._projection = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["PerspectiveProjection"]();
        this._projection.coordinateSystem = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["CoordinateSystem"].RIGHT_HANDED;
        this._projection.fieldOfView = 60;
        this._projection.originX = 0;
        this._projection.originY = 0;
        var camera = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["Camera"]();
        camera.projection = this._projection;
        this._hoverControl = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["HoverController"](camera, null, 180, 0, 1000);
        this._view.camera = camera;
    };
    /**
     * Initialise the scene objects
     */
    AWDBasicTests.prototype.initObjects = function () {
        var _this = this;
        //kickoff asset loading
        this._loader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetEvent"].ASSET_COMPLETE, function (event) {
            return _this.onAssetComplete(event);
        });
        this._loader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onRessourceComplete(event);
        });
        this._loader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["ParserEvent"].PARSE_ERROR, function (event) {
            return _this.onParseError(event);
        });
        //loader.addEventListener(IOErrorEvent.IO_ERROR, (event: ParserEvent) => this.onParseError(event));
        //this.loadNext();
        //for plugin preview-runtime:
        //loader.load(new URLRequest(document.getElementById("awdPath").innerHTML), null, null, new AWDParser(this._view));
    };
    /**
     * Initialise the listeners
     */
    AWDBasicTests.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        this.onResize();
        document.onkeyup = function (event) {
            return _this.onKeyUp(event);
        };
        this._timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * loader listener for asset complete events
     */
    AWDBasicTests.prototype.onAssetComplete = function (event) {
        if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["MovieClip"])) {
            this._rootTimeLine = event.asset;
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
    AWDBasicTests.prototype.onParseError = function (event) {
        console.log(event.message);
    };
    /**
     * loader listener for asset complete events
     */
    AWDBasicTests.prototype.onRessourceComplete = function (event) {
        this.thisDiv.innerHTML = this._awd_descriptions[this._currentAWDIdx];
        if (this._rootTimeLine) {
            this._view.setPartition(this._rootTimeLine, new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__["SceneGraphPartition"](this._rootTimeLine));
            //console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
            this._view.scene.addChild(this._rootTimeLine);
        }
    };
    AWDBasicTests.prototype.clear_scene = function () {};
    AWDBasicTests.prototype.loadNext = function () {
        if (this._rootTimeLine) this._view.scene.removeChild(this._rootTimeLine);
        this._rootTimeLine = null;
        this._currentAWDIdx++;
        if (this._currentAWDIdx >= this._awd_names.length) {
            this._currentAWDIdx = 0;
        }
        this.thisDiv.innerHTML = "loading AWD";
        this.dropDown.selectedIndex = this._currentAWDIdx + 1;
        this._loader.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/AWD3/BasicTests/" + this._awd_names[this._currentAWDIdx]), null, null, new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_parsers__["AWDParser"](new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_player__["AS2SceneGraphFactory"](this._view)));
    };
    AWDBasicTests.prototype.loadPrev = function () {
        if (this._rootTimeLine) this._view.scene.removeChild(this._rootTimeLine);
        this._rootTimeLine = null;
        this._currentAWDIdx--;
        if (this._currentAWDIdx < 0) {
            this._currentAWDIdx = this._awd_names.length - 1;
        }
        this.thisDiv.innerHTML = "loading AWD";
        this.dropDown.selectedIndex = this._currentAWDIdx + 1;
        this._loader.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/AWD3/BasicTests/" + this._awd_names[this._currentAWDIdx]), null, null, new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_parsers__["AWDParser"](new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_player__["AS2SceneGraphFactory"](this._view)));
    };
    /**
     * Key down listener for animation
     */
    AWDBasicTests.prototype.onKeyUp = function (event) {
        switch (event.keyCode) {
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].LEFT:
                if (document.activeElement != this.dropDown) this.loadPrev();
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].RIGHT:
                if (document.activeElement != this.dropDown) this.loadNext();
                break;
        }
    };
    /**
     * Render loop
     */
    AWDBasicTests.prototype.onEnterFrame = function (dt) {
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
    AWDBasicTests.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
        this._projection.fieldOfView = Math.atan(this._stage_height / 2000) * 360 / Math.PI;
        this._projection.originX = 0.5 - 0.5 * (window.innerHeight / this._stage_height) * (this._stage_width / window.innerWidth);
    };
    return AWDBasicTests;
}();
window.onload = function () {
    new AWDBasicTests();
};

/***/ })

},[21]);
//# sourceMappingURL=AWDBasicTests.js.map