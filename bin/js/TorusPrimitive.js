webpackJsonp([19],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Sampler2D_1 = __webpack_require__(72);
	var URLLoaderEvent_1 = __webpack_require__(108);
	var URLLoader_1 = __webpack_require__(105);
	var URLLoaderDataFormat_1 = __webpack_require__(106);
	var URLRequest_1 = __webpack_require__(3);
	var ParserUtils_1 = __webpack_require__(205);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var View_1 = __webpack_require__(9);
	var DirectionalLight_1 = __webpack_require__(210);
	var ElementsType_1 = __webpack_require__(224);
	var PrimitiveTorusPrefab_1 = __webpack_require__(231);
	var StaticLightPicker_1 = __webpack_require__(218);
	var DefaultRenderer_1 = __webpack_require__(116);
	var MethodMaterial_1 = __webpack_require__(256);
	var TorusPrimitive = (function () {
	    function TorusPrimitive() {
	        var _this = this;
	        this.initView();
	        this._raf = new RequestAnimationFrame_1.default(this.render, this);
	        this._raf.start();
	        this.loadResources();
	        window.onresize = function (event) { return _this.onResize(event); };
	        this.onResize();
	    }
	    /**
	     *
	     */
	    TorusPrimitive.prototype.initView = function () {
	        this._view = new View_1.default(new DefaultRenderer_1.default()); // Create the Away3D View
	        this._view.backgroundColor = 0x000000; // Change the background color to black
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.loadResources = function () {
	        var _this = this;
	        var imgLoader = new URLLoader_1.default();
	        imgLoader.dataFormat = URLLoaderDataFormat_1.default.BLOB;
	        imgLoader.addEventListener(URLLoaderEvent_1.default.LOAD_COMPLETE, function (event) { return _this.urlCompleteHandler(event); });
	        imgLoader.load(new URLRequest_1.default("assets/dots.png"));
	    };
	    /**
	     *
	     * @param event
	     */
	    TorusPrimitive.prototype.urlCompleteHandler = function (event) {
	        var _this = this;
	        this._image = ParserUtils_1.default.blobToImage(event.target.data);
	        this._image.onload = function (event) { return _this.imageCompleteHandler(event); };
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.initLights = function () {
	        this._light = new DirectionalLight_1.default();
	        this._light.diffuse = .7;
	        this._light.specular = 1;
	        this._view.scene.addChild(this._light);
	        this._lightPicker = new StaticLightPicker_1.default([this._light]);
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.initMaterial = function (image) {
	        this._material = new MethodMaterial_1.default(ParserUtils_1.default.imageToBitmapImage2D(image));
	        this._material.style.sampler = new Sampler2D_1.default(true, true, false);
	        this._material.lightPicker = this._lightPicker;
	    };
	    /**
	     *
	     */
	    TorusPrimitive.prototype.initTorus = function () {
	        this._torus = new PrimitiveTorusPrefab_1.default(this._material, ElementsType_1.default.TRIANGLE, 220, 80, 32, 16, false);
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