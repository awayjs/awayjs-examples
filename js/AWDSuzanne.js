webpackJsonp([19],{

/***/ 22:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__ = __webpack_require__(2);





var AWDSuzanne = function () {
    function AWDSuzanne() {
        var _this = this;
        this._lookAtPosition = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"]();
        this._cameraIncrement = 0;
        this._mouseOverMaterial = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_materials__["MethodMaterial"](0xFF0000);
        this.initView();
        this.loadAssets();
        this.initLights();
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        this.onResize();
    }
    /**
     *
     */
    AWDSuzanne.prototype.initView = function () {
        this._view = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__["View"]();
        this._view.camera.projection.far = 6000;
        this._view.forceMouseMove = true;
    };
    /**
     *
     */
    AWDSuzanne.prototype.loadAssets = function () {
        var _this = this;
        this._timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.render, this);
        this._timer.start();
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].enableParser(__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_parsers__["AWDParser"]);
        var session = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].getLoader();
        session.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        session.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]('assets/suzanne.awd'));
    };
    /**
     *
     */
    AWDSuzanne.prototype.initLights = function () {
        this._light = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["DirectionalLight"]();
        this._light.color = 0x683019;
        this._light.direction = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](1, 0, 0);
        this._light.ambient = 0.1;
        this._light.ambientColor = 0x85b2cd;
        this._light.diffuse = 2.8;
        this._light.specular = 1.8;
        this._view.scene.addChild(this._light);
        this._lightPicker = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["StaticLightPicker"]([this._light]);
    };
    /**
     *
     */
    AWDSuzanne.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    /**
     *
     * @param dt
     */
    AWDSuzanne.prototype.render = function (dt) {
        if (this._view.camera) {
            this._view.camera.lookAt(this._lookAtPosition);
            this._cameraIncrement += 0.01;
            this._view.camera.x = Math.cos(this._cameraIncrement) * 1400;
            this._view.camera.z = Math.sin(this._cameraIncrement) * 1400;
            this._light.x = Math.cos(this._cameraIncrement) * 1400;
            this._light.y = Math.sin(this._cameraIncrement) * 1400;
        }
        this._view.render();
    };
    /**
     *
     * @param e
     */
    AWDSuzanne.prototype.onResourceComplete = function (e) {
        var _this = this;
        var loader = e.target;
        var numAssets = loader.baseDependency.assets.length;
        for (var i = 0; i < numAssets; ++i) {
            var asset = loader.baseDependency.assets[i];
            switch (asset.assetType) {
                case __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["Sprite"].assetType:
                    var sprite = asset;
                    this._suzane = sprite;
                    this._suzane.material.lightPicker = this._lightPicker;
                    this._suzane.y = -100;
                    this._mouseOutMaterial = this._suzane.material;
                    for (var c = 0; c < 80; c++) {
                        var clone = sprite.clone();
                        var scale = this.getRandom(50, 200);
                        clone.x = this.getRandom(-2000, 2000);
                        clone.y = this.getRandom(-2000, 2000);
                        clone.z = this.getRandom(-2000, 2000);
                        clone.transform.scaleTo(scale, scale, scale);
                        clone.rotationY = this.getRandom(0, 360);
                        clone.addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["MouseEvent"].MOUSE_OVER, function (event) {
                            return _this.onMouseOver(event);
                        });
                        clone.addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["MouseEvent"].MOUSE_OUT, function (event) {
                            return _this.onMouseOut(event);
                        });
                        this._view.scene.addChild(clone);
                    }
                    sprite.transform.scaleTo(500, 500, 500);
                    sprite.addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["MouseEvent"].MOUSE_OVER, function (event) {
                        return _this.onMouseOver(event);
                    });
                    sprite.addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_scene__["MouseEvent"].MOUSE_OUT, function (event) {
                        return _this.onMouseOut(event);
                    });
                    this._view.scene.addChild(sprite);
                    this._view.setCollider(sprite, new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__["JSPickingCollider"]());
                    break;
            }
        }
    };
    AWDSuzanne.prototype.onMouseOver = function (event) {
        event.entity.material = this._mouseOverMaterial;
        console.log("mouseover");
    };
    AWDSuzanne.prototype.onMouseOut = function (event) {
        event.entity.material = this._mouseOutMaterial;
        console.log("mouseout");
    };
    /**
     *
     * @param min
     * @param max
     * @returns {number}
     */
    AWDSuzanne.prototype.getRandom = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    return AWDSuzanne;
}();
window.onload = function () {
    new AWDSuzanne();
};

/***/ })

},[22]);
//# sourceMappingURL=AWDSuzanne.js.map