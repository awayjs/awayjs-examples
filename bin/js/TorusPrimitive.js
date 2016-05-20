webpackJsonp([21],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Sampler2D_1 = __webpack_require__(72);
	var URLLoaderEvent_1 = __webpack_require__(122);
	var URLLoader_1 = __webpack_require__(119);
	var URLLoaderDataFormat_1 = __webpack_require__(120);
	var URLRequest_1 = __webpack_require__(3);
	var ParserUtils_1 = __webpack_require__(214);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var View_1 = __webpack_require__(9);
	var DirectionalLight_1 = __webpack_require__(218);
	var ElementsType_1 = __webpack_require__(232);
	var PrimitiveTorusPrefab_1 = __webpack_require__(239);
	var StaticLightPicker_1 = __webpack_require__(226);
	var DefaultRenderer_1 = __webpack_require__(130);
	var MethodMaterial_1 = __webpack_require__(265);
	var TorusPrimitive = (function () {
	    function TorusPrimitive() {
	        var _this = this;
	        this.initView();
	        this._raf = new RequestAnimationFrame_1.RequestAnimationFrame(this.render, this);
	        this._raf.start();
	        this.loadResources();
	        window.onresize = function (event) { return _this.onResize(event); };
	        this.onResize();
	    }
	    /**
	     *
	     */
	    TorusPrimitive.prototype.initView = function () {
	        this._view = new View_1.View(new DefaultRenderer_1.DefaultRenderer()); // Create the Away3D View
	        this._view.backgroundColor = 0x000000; // Change the background color to black
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.loadResources = function () {
	        var _this = this;
	        var imgLoader = new URLLoader_1.URLLoader();
	        imgLoader.dataFormat = URLLoaderDataFormat_1.URLLoaderDataFormat.BLOB;
	        imgLoader.addEventListener(URLLoaderEvent_1.URLLoaderEvent.LOAD_COMPLETE, function (event) { return _this.urlCompleteHandler(event); });
	        imgLoader.load(new URLRequest_1.URLRequest("assets/dots.png"));
	    };
	    /**
	     *
	     * @param event
	     */
	    TorusPrimitive.prototype.urlCompleteHandler = function (event) {
	        var _this = this;
	        this._image = ParserUtils_1.ParserUtils.blobToImage(event.target.data);
	        this._image.onload = function (event) { return _this.imageCompleteHandler(event); };
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.initLights = function () {
	        this._light = new DirectionalLight_1.DirectionalLight();
	        this._light.diffuse = .7;
	        this._light.specular = 1;
	        this._view.scene.addChild(this._light);
	        this._lightPicker = new StaticLightPicker_1.StaticLightPicker([this._light]);
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.initMaterial = function (image) {
	        this._material = new MethodMaterial_1.MethodMaterial(ParserUtils_1.ParserUtils.imageToBitmapImage2D(image));
	        this._material.style.sampler = new Sampler2D_1.Sampler2D(true, true, false);
	        this._material.lightPicker = this._lightPicker;
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.initTorus = function () {
	        this._torus = new PrimitiveTorusPrefab_1.PrimitiveTorusPrefab(this._material, ElementsType_1.ElementsType.TRIANGLE, 220, 80, 32, 16, false);
	        this._sprite = this._torus.getNewObject();
	        this._view.scene.addChild(this._sprite);
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.imageCompleteHandler = function (event) {
	        this.initLights();
	        this.initMaterial(event.target);
	        this.initTorus();
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.render = function (dt) {
	        if (dt === void 0) { dt = null; }
	        if (this._sprite)
	            this._sprite.rotationY += 1;
	        this._view.render();
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return TorusPrimitive;
	}());
	window.onload = function () {
	    new TorusPrimitive();
	};


/***/ }
]);
//# sourceMappingURL=TorusPrimitive.js.map