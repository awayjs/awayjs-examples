webpackJsonp([0],{

/***/ 40:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__ = __webpack_require__(2);





var TorusPrimitive = function () {
    function TorusPrimitive() {
        var _this = this;
        this.initView();
        this._raf = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.render, this);
        this._raf.start();
        this.loadResources();
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        this.onResize();
    }
    /**
     *
     */
    TorusPrimitive.prototype.initView = function () {
        this._view = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__["View"](); // Create the Away3D View
        this._view.backgroundColor = 0x000000; // Change the background color to black
    };
    /**
     *
     */
    TorusPrimitive.prototype.loadResources = function () {
        var _this = this;
        var imgLoader = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLLoader"]();
        imgLoader.dataFormat = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLLoaderDataFormat"].BLOB;
        imgLoader.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLLoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.urlCompleteHandler(event);
        });
        imgLoader.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/dots.png"));
    };
    /**
     *
     * @param event
     */
    TorusPrimitive.prototype.urlCompleteHandler = function (event) {
        var _this = this;
        this._image = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["ParserUtils"].blobToImage(event.target.data);
        this._image.onload = function (event) {
            return _this.imageCompleteHandler(event);
        };
    };
    /**
     *
     */
    TorusPrimitive.prototype.initLights = function () {
        this._light = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["DirectionalLight"]();
        this._light.diffuse = .7;
        this._light.specular = 1;
        this._view.scene.addChild(this._light);
        this._lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([this._light]);
    };
    /**
     *
     */
    TorusPrimitive.prototype.initMaterial = function (image) {
        this._material = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ImageUtils"].imageToBitmapImage2D(image));
        this._material.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true, false);
        this._material.lightPicker = this._lightPicker;
    };
    /**
     *
     */
    TorusPrimitive.prototype.initTorus = function () {
        this._torus = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveTorusPrefab"](this._material, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 220, 80, 32, 16, false);
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
        if (dt === void 0) {
            dt = null;
        }
        if (this._sprite) this._sprite.rotationY += 1;
        this._view.render();
    };
    /**
     *
     */
    TorusPrimitive.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return TorusPrimitive;
}();
window.onload = function () {
    new TorusPrimitive();
};

/***/ }

},[40]);
//# sourceMappingURL=TorusPrimitive.js.map