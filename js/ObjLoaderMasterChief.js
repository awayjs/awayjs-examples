webpackJsonp([1],{

/***/ 39:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__ = __webpack_require__(2);






var ObjLoaderMasterChief = function () {
    function ObjLoaderMasterChief() {
        var _this = this;
        this.sprites = new Array();
        this.spartan = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["DisplayObjectContainer"]();
        this.spartanFlag = false;
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["Debug"].LOG_PI_ERRORS = false;
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["Debug"].THROW_ERRORS = false;
        this.view = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["View"]();
        this.view.camera.z = -50;
        this.view.camera.y = 20;
        this.view.camera.projection.near = 0.1;
        this.view.backgroundColor = 0xCEC8C6;
        this.raf = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["RequestAnimationFrame"](this.render, this);
        this.light = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["DirectionalLight"]();
        this.light.color = 0xc1582d;
        this.light.direction = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["Vector3D"](1, 0, 0);
        this.light.ambient = 0.4;
        this.light.ambientColor = 0x85b2cd;
        this.light.diffuse = 2.8;
        this.light.specular = 1.8;
        this.view.scene.addChild(this.light);
        this.spartan.transform.scaleTo(.25, .25, .25);
        this.spartan.y = 0;
        this.view.scene.addChild(this.spartan);
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].enableParser(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__["OBJParser"]);
        var session;
        session = __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].getLoader();
        session.addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        session.load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]('assets/Halo_3_SPARTAN4.obj'));
        session = __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].getLoader();
        session.addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        session.load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]('assets/terrain.obj'));
        session = __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].getLoader();
        session.addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        session.load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]('assets/masterchief_base.png'));
        session = __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].getLoader();
        session.addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        session.load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]('assets/stone_tx.jpg'));
        window.onresize = function (event) {
            return _this.onResize();
        };
        this.raf.start();
    }
    ObjLoaderMasterChief.prototype.render = function () {
        if (this.terrain) this.terrain.rotationY += 0.4;
        this.spartan.rotationY += 0.4;
        this.view.render();
    };
    ObjLoaderMasterChief.prototype.onResourceComplete = function (event) {
        var loader = event.target;
        var l = loader.baseDependency.assets.length;
        console.log('------------------------------------------------------------------------------');
        console.log('away.events.LoaderEvent.LOAD_COMPLETE', event, l, loader);
        console.log('------------------------------------------------------------------------------');
        var loader = event.target;
        var l = loader.baseDependency.assets.length;
        for (var c = 0; c < l; c++) {
            var d = loader.baseDependency.assets[c];
            console.log(d.name, event.url);
            switch (d.assetType) {
                case __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Sprite"].assetType:
                    if (event.url == 'assets/Halo_3_SPARTAN4.obj') {
                        var sprite = d;
                        this.spartan.addChild(sprite);
                        this.spartanFlag = true;
                        this.sprites.push(sprite);
                    } else if (event.url == 'assets/terrain.obj') {
                        this.terrain = d;
                        this.terrain.y = 98;
                        this.terrain.graphics.scaleUV(20, 20);
                        this.view.scene.addChild(this.terrain);
                    }
                    break;
                case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BitmapImage2D"].assetType:
                    if (event.url == 'assets/masterchief_base.png') {
                        this.mat = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](d);
                        this.mat.style.sampler = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Sampler2D"](true, true, false);
                        this.mat.lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([this.light]);
                    } else if (event.url == 'assets/stone_tx.jpg') {
                        this.terrainMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](d);
                        this.terrainMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Sampler2D"](true, true, false);
                        this.terrainMaterial.lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([this.light]);
                    }
                    break;
            }
        }
        if (this.terrain && this.terrainMaterial) this.terrain.material = this.terrainMaterial;
        if (this.mat && this.spartanFlag) for (var c = 0; c < this.sprites.length; c++) this.sprites[c].material = this.mat;
        this.onResize();
    };
    ObjLoaderMasterChief.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this.view.y = 0;
        this.view.x = 0;
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    };
    return ObjLoaderMasterChief;
}();
window.onload = function () {
    new ObjLoaderMasterChief(); // Start the demo
};

/***/ }

},[39]);
//# sourceMappingURL=ObjLoaderMasterChief.js.map