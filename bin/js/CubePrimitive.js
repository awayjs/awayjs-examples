webpackJsonp([10],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Sampler2D_1 = __webpack_require__(72);
	var BlendMode_1 = __webpack_require__(97);
	var URLLoaderEvent_1 = __webpack_require__(122);
	var Vector3D_1 = __webpack_require__(18);
	var URLLoader_1 = __webpack_require__(119);
	var URLLoaderDataFormat_1 = __webpack_require__(120);
	var URLRequest_1 = __webpack_require__(3);
	var ParserUtils_1 = __webpack_require__(214);
	var PerspectiveProjection_1 = __webpack_require__(48);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var View_1 = __webpack_require__(9);
	var DirectionalLight_1 = __webpack_require__(218);
	var ElementsType_1 = __webpack_require__(232);
	var StaticLightPicker_1 = __webpack_require__(226);
	var PrimitiveCubePrefab_1 = __webpack_require__(236);
	var PrimitiveTorusPrefab_1 = __webpack_require__(239);
	var DefaultRenderer_1 = __webpack_require__(130);
	var MethodMaterial_1 = __webpack_require__(265);
	var CubePrimitive = (function () {
	    function CubePrimitive() {
	        this.initView();
	        this.initCamera();
	        this.initLights();
	        this.loadResources();
	    }
	    /**
	     *
	     */
	    CubePrimitive.prototype.initView = function () {
	        this._view = new View_1.View(new DefaultRenderer_1.DefaultRenderer());
	        this._view.backgroundColor = 0x000000;
	        this._view.camera.x = 130;
	        this._view.camera.y = 0;
	        this._view.camera.z = 0;
	    };
	    /**
	     *
	     */
	    CubePrimitive.prototype.initLights = function () {
	        this._light = new DirectionalLight_1.DirectionalLight();
	        this._light.color = 0xffffff;
	        this._light.direction = new Vector3D_1.Vector3D(1, 0, 0);
	        this._light.ambient = 0.4;
	        this._light.ambientColor = 0x85b2cd;
	        this._light.diffuse = 2.8;
	        this._light.specular = 1.8;
	        this._lightPicker = new StaticLightPicker_1.StaticLightPicker([this._light]);
	    };
	    /**
	     *
	     */
	    CubePrimitive.prototype.initCamera = function () {
	        this._cameraAxis = new Vector3D_1.Vector3D(0, 0, 1);
	        this._view.camera.projection = new PerspectiveProjection_1.PerspectiveProjection(120);
	        this._view.camera.projection.near = 0.1;
	    };
	    /**
	     *
	     */
	    CubePrimitive.prototype.loadResources = function () {
	        var _this = this;
	        var urlRequest = new URLRequest_1.URLRequest("assets/spacy_texture.png");
	        var imgLoader = new URLLoader_1.URLLoader();
	        imgLoader.dataFormat = URLLoaderDataFormat_1.URLLoaderDataFormat.BLOB;
	        imgLoader.addEventListener(URLLoaderEvent_1.URLLoaderEvent.LOAD_COMPLETE, function (event) { return _this.urlCompleteHandler(event); });
	        imgLoader.load(urlRequest);
	    };
	    /**
	     *
	     * @param event
	     */
	    CubePrimitive.prototype.urlCompleteHandler = function (event) {
	        var _this = this;
	        var imageLoader = event.target;
	        this._image = ParserUtils_1.ParserUtils.blobToImage(imageLoader.data);
	        this._image.onload = function (event) { return _this.imageCompleteHandler(event); };
	    };
	    /**
	     *
	     * @param e
	     */
	    CubePrimitive.prototype.imageCompleteHandler = function (event) {
	        var _this = this;
	        var matTx = new MethodMaterial_1.MethodMaterial(ParserUtils_1.ParserUtils.imageToBitmapImage2D(this._image));
	        matTx.style.sampler = new Sampler2D_1.Sampler2D(true, true);
	        matTx.blendMode = BlendMode_1.BlendMode.ADD;
	        matTx.bothSides = true;
	        matTx.lightPicker = this._lightPicker;
	        this._cube = new PrimitiveCubePrefab_1.PrimitiveCubePrefab(matTx, ElementsType_1.ElementsType.TRIANGLE, 20.0, 20.0, 20.0);
	        this._torus = new PrimitiveTorusPrefab_1.PrimitiveTorusPrefab(matTx, ElementsType_1.ElementsType.TRIANGLE, 150, 80, 32, 16, true);
	        this._sprite = this._torus.getNewObject();
	        this._sprite2 = this._cube.getNewObject();
	        this._sprite2.x = 130;
	        this._sprite2.z = 40;
	        this._view.scene.addChild(this._sprite);
	        this._view.scene.addChild(this._sprite2);
	        this._raf = new RequestAnimationFrame_1.RequestAnimationFrame(this.render, this);
	        this._raf.start();
	        window.onresize = function (event) { return _this.onResize(event); };
	        this.onResize();
	    };
	    /**
	     *
	     * @param dt
	     */
	    CubePrimitive.prototype.render = function (dt) {
	        if (dt === void 0) { dt = null; }
	        this._view.camera.transform.rotate(this._cameraAxis, 1);
	        this._sprite.rotationY += 1;
	        this._sprite2.rotationX += 0.4;
	        this._sprite2.rotationY += 0.4;
	        this._view.render();
	    };
	    /**
	     *
	     */
	    CubePrimitive.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return CubePrimitive;
	}());
	window.onload = function () {
	    new CubePrimitive();
	};


/***/ }
]);
//# sourceMappingURL=CubePrimitive.js.map