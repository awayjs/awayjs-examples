webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
	"use strict";
	var AssetEvent_1 = __webpack_require__(1);
	var URLRequest_1 = __webpack_require__(3);
	var LoaderEvent_1 = __webpack_require__(5);
	var ParserEvent_1 = __webpack_require__(6);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var View_1 = __webpack_require__(9);
	var Sprite_1 = __webpack_require__(57);
	var Billboard_1 = __webpack_require__(69);
	var HoverController_1 = __webpack_require__(98);
	var LoaderContainer_1 = __webpack_require__(101);
	var DefaultRenderer_1 = __webpack_require__(116);
	var AWDParser_1 = __webpack_require__(201);
	var SceneGraphPartition_1 = __webpack_require__(310);
	var MovieClip_1 = __webpack_require__(297);
	var CoordinateSystem_1 = __webpack_require__(49);
	var PerspectiveProjection_1 = __webpack_require__(48);
	var Camera_1 = __webpack_require__(45);
	var TextField_1 = __webpack_require__(298);
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
	        this._renderer = new DefaultRenderer_1.default();
	        this._renderer.renderableSorter = null; //new RenderableSort2D();
	        this._view = new View_1.default(this._renderer);
	        this._view.backgroundColor = 0x000000;
	        this._stage_width = 200;
	        this._stage_height = 200;
	        //for plugin preview-runtime:
	        /*
	                 this._view.backgroundColor = parseInt(document.getElementById("bgColor").innerHTML.replace("#", "0x"));
	                 this._stage_width = parseInt(document.getElementById("awdWidth").innerHTML);
	                 this._stage_height = parseInt(document.getElementById("awdHeight").innerHTML);
	        */
	        this._isperspective = true;
	        this._projection = new PerspectiveProjection_1.default();
	        this._projection.coordinateSystem = CoordinateSystem_1.default.RIGHT_HANDED;
	        this._projection.fieldOfView = 30;
	        this._projection.originX = 0;
	        this._projection.originY = 0;
	        var camera = new Camera_1.default();
	        camera.projection = this._projection;
	        this._hoverControl = new HoverController_1.default(camera, null, 180, 0, 1000);
	        this._view.camera = camera;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    AWD3ViewerMinimal.prototype.initObjects = function () {
	        var _this = this;
	        //kickoff asset loading
	        var loader = new LoaderContainer_1.default();
	        loader.addEventListener(AssetEvent_1.default.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
	        loader.addEventListener(LoaderEvent_1.default.LOAD_COMPLETE, function (event) { return _this.onRessourceComplete(event); });
	        loader.addEventListener(ParserEvent_1.default.PARSE_ERROR, function (event) { return _this.onParseError(event); });
	        //loader.addEventListener(IOErrorEvent.IO_ERROR, (event: ParserEvent) => this.onParseError(event));
	        //for plugin preview-runtime:
	        //loader.load(new URLRequest(document.getElementById("awdPath").innerHTML), null, null, new AWDParser(this._view));
	        loader.load(new URLRequest_1.default("assets/AWD3/TextTest.awd"), null, null, new AWDParser_1.default(this._view));
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
	        this._timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this._timer.start();
	    };
	    /**
	     * loader listener for asset complete events
	     */
	    AWD3ViewerMinimal.prototype.onAssetComplete = function (event) {
	        if (event.asset.isAsset(TextField_1.default)) {
	            var one_textfield = event.asset;
	        }
	        else if (event.asset.isAsset(Sprite_1.default)) {
	            var one_sprite = event.asset;
	            one_sprite.debugVisible = true;
	        }
	        else if (event.asset.isAsset(Billboard_1.default)) {
	            var one_billboard = event.asset;
	        }
	        else if (event.asset.isAsset(MovieClip_1.default)) {
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
	    AWD3ViewerMinimal.prototype.onParseError = function (event) {
	        console.log(event.message);
	    };
	    /**
	     * loader listener for asset complete events
	     */
	    AWD3ViewerMinimal.prototype.onRessourceComplete = function (event) {
	        if (this._rootTimeLine) {
	            this._rootTimeLine.partition = new SceneGraphPartition_1.default();
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
	        this._projection.fieldOfView = Math.atan(this._stage_height / 2000) * 360 / Math.PI;
	        this._projection.originX = (0.5 - 0.5 * (window.innerHeight / this._stage_height) * (this._stage_width / window.innerWidth));
	    };
	    return AWD3ViewerMinimal;
	}());
	window.onload = function () {
	    new AWD3ViewerMinimal();
	};


/***/ }
]);
//# sourceMappingURL=AWD3ViewerMinimal.js.map