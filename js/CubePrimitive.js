webpackJsonp([10],{

/***/ 30:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__ = __webpack_require__(2);





var CubePrimitive = function () {
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
        this._view = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__["View"]();
        this._view.backgroundColor = 0x000000;
        this._view.camera.x = 130;
        this._view.camera.y = 0;
        this._view.camera.z = 0;
    };
    /**
     *
     */
    CubePrimitive.prototype.initLights = function () {
        this._light = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["DirectionalLight"]();
        this._light.color = 0xffffff;
        this._light.direction = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](1, 0, 0);
        this._light.ambient = 0.4;
        this._light.ambientColor = 0x85b2cd;
        this._light.diffuse = 2.8;
        this._light.specular = 1.8;
        this._lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([this._light]);
    };
    /**
     *
     */
    CubePrimitive.prototype.initCamera = function () {
        this._cameraAxis = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](0, 0, 1);
        this._view.camera.projection = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["PerspectiveProjection"](120);
        this._view.camera.projection.near = 0.1;
    };
    /**
     *
     */
    CubePrimitive.prototype.loadResources = function () {
        var _this = this;
        var urlRequest = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/spacy_texture.png");
        var imgLoader = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLLoader"]();
        imgLoader.dataFormat = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLLoaderDataFormat"].BLOB;
        imgLoader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLLoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.urlCompleteHandler(event);
        });
        imgLoader.load(urlRequest);
    };
    /**
     *
     * @param event
     */
    CubePrimitive.prototype.urlCompleteHandler = function (event) {
        var _this = this;
        var imageLoader = event.target;
        this._image = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["ParserUtils"].blobToImage(imageLoader.data);
        this._image.onload = function (event) {
            return _this.imageCompleteHandler(event);
        };
    };
    /**
     *
     * @param e
     */
    CubePrimitive.prototype.imageCompleteHandler = function (event) {
        var _this = this;
        var matTx = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ImageUtils"].imageToBitmapImage2D(this._image));
        matTx.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true);
        matTx.blendMode = __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["BlendMode"].ADD;
        matTx.bothSides = true;
        matTx.lightPicker = this._lightPicker;
        this._cube = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveCubePrefab"](matTx, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 20.0, 20.0, 20.0);
        this._torus = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveTorusPrefab"](matTx, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 150, 80, 32, 16, true);
        this._sprite = this._torus.getNewObject();
        this._sprite2 = this._cube.getNewObject();
        this._sprite2.x = 130;
        this._sprite2.z = 40;
        this._view.scene.addChild(this._sprite);
        this._view.scene.addChild(this._sprite2);
        this._raf = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.render, this);
        this._raf.start();
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        this.onResize();
    };
    /**
     *
     * @param dt
     */
    CubePrimitive.prototype.render = function (dt) {
        if (dt === void 0) {
            dt = null;
        }
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
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return CubePrimitive;
}();
window.onload = function () {
    new CubePrimitive();
};

/***/ }

},[30]);
//# sourceMappingURL=CubePrimitive.js.map