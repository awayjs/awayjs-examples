webpackJsonp([17],{

/***/ 23:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__ = __webpack_require__(2);






var AircraftDemo = function () {
    //}
    function AircraftDemo() {
        var _this = this;
        //{ state
        this._maxStates = 2;
        this._cameraIncrement = 0;
        this._rollIncrement = 0;
        this._loopIncrement = 0;
        this._state = 0;
        this._appTime = 0;
        this._seaInitialized = false;
        this._f14Initialized = false;
        this._skyboxInitialized = false;
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Debug"].LOG_PI_ERRORS = false;
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Debug"].THROW_ERRORS = false;
        this.initView();
        this.initLights();
        this.initAnimation();
        this.initParsers();
        this.loadAssets();
        window.onresize = function (event) {
            return _this.onResize(event);
        };
    }
    AircraftDemo.prototype.loadAssets = function () {
        this.loadAsset('assets/sea_normals.jpg');
        this.loadAsset('assets/f14/f14d.obj');
        this.loadAsset('assets/skybox/CubeTextureTest.cube');
    };
    AircraftDemo.prototype.loadAsset = function (path) {
        var _this = this;
        var session = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].getLoader();
        session.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        session.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"](path));
    };
    AircraftDemo.prototype.initParsers = function () {
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].enableParser(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__["OBJParser"]);
    };
    AircraftDemo.prototype.initAnimation = function () {
        this._timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.render, this);
    };
    AircraftDemo.prototype.initView = function () {
        this._view = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["View"]();
        this._view.camera.z = -500;
        this._view.camera.y = 250;
        this._view.camera.rotationX = 20;
        this._view.camera.projection.near = 0.5;
        this._view.camera.projection.far = 14000;
        this._view.backgroundColor = 0x2c2c32;
        this.onResize();
    };
    AircraftDemo.prototype.initializeScene = function () {
        if (this._skyboxImageCube && this._f14Geom && this._seaNormalImage) {
            this.initF14();
            this.initSea();
            this._timer.start();
        }
    };
    AircraftDemo.prototype.initLights = function () {
        var light = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["DirectionalLight"]();
        light.color = 0x974523;
        light.direction = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](-300, -300, -5000);
        light.ambient = 1;
        light.ambientColor = 0x7196ac;
        light.diffuse = 1.2;
        light.specular = 1.1;
        this._view.scene.addChild(light);
        this._lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([light]);
    };
    AircraftDemo.prototype.initF14 = function () {
        var _this = this;
        this._f14Initialized = true;
        var f14Material = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](this._seaNormalImage); // will be the cubemap
        f14Material.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true, false);
        f14Material.lightPicker = this._lightPicker;
        this._view.scene.addChild(this._f14Geom);
        this._f14Geom.transform.scaleTo(20, 20, 20);
        this._f14Geom.rotationX = 90;
        this._f14Geom.y = 200;
        this._view.camera.lookAt(this._f14Geom.transform.position);
        document.onmousedown = function (event) {
            return _this.onMouseDown(event);
        };
    };
    AircraftDemo.prototype.initSea = function () {
        this._seaMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](this._seaNormalImage); // will be the cubemap
        this._seaMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true, false);
        this._waterMethod = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["NormalSimpleWaterMethod"](new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](this._seaNormalImage), new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](this._seaNormalImage));
        var fresnelMethod = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["SpecularFresnelMethod"]();
        fresnelMethod.normalReflectance = .3;
        fresnelMethod.gloss = 10;
        fresnelMethod.strength = 1;
        this._seaMaterial.alphaBlending = true;
        this._seaMaterial.lightPicker = this._lightPicker;
        this._seaMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true);
        this._seaMaterial.animateUVs = true;
        this._seaMaterial.normalMethod = this._waterMethod;
        this._seaMaterial.addEffectMethod(new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["EffectEnvMapMethod"](new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["SingleCubeTexture"](this._skyboxImageCube)));
        this._seaMaterial.specularMethod = fresnelMethod;
        this._seaGeom = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitivePlanePrefab"](this._seaMaterial, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 50000, 50000, 1, 1, true, false);
        this._seaSprite = this._seaGeom.getNewObject();
        this._seaSprite.graphics.scaleUV(100, 100);
        this._seaSprite.style = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Style"]();
        this._seaSprite.style.uvMatrix = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Matrix"]();
        this._view.scene.addChild(new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Skybox"](this._skyboxImageCube));
        this._view.scene.addChild(this._seaSprite);
    };
    AircraftDemo.prototype.onResourceComplete = function (event) {
        var loader = event.target;
        var numAssets = loader.baseDependency.assets.length;
        var i = 0;
        switch (event.url) {
            case "assets/sea_normals.jpg":
                this._seaNormalImage = loader.baseDependency.assets[0];
                break;
            case 'assets/f14/f14d.obj':
                this._f14Geom = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["DisplayObjectContainer"]();
                for (i = 0; i < numAssets; ++i) {
                    var asset = loader.baseDependency.assets[i];
                    switch (asset.assetType) {
                        case __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Sprite"].assetType:
                            var sprite = asset;
                            this._f14Geom.addChild(sprite);
                            break;
                    }
                }
                break;
            case 'assets/skybox/CubeTextureTest.cube':
                this._skyboxImageCube = loader.baseDependency.assets[0];
                break;
        }
        this.initializeScene();
    };
    AircraftDemo.prototype.render = function (dt) {
        if (this._f14Geom) {
            this._rollIncrement += 0.02;
            switch (this._state) {
                case 0:
                    this._f14Geom.rotationZ = Math.sin(this._rollIncrement) * 25;
                    break;
                case 1:
                    this._loopIncrement += 0.05;
                    this._f14Geom.z += Math.cos(this._loopIncrement) * 20;
                    this._f14Geom.y += Math.sin(this._loopIncrement) * 20;
                    this._f14Geom.rotationX += -1 * (Math.PI / 180 * Math.atan2(this._f14Geom.z, this._f14Geom.y)); //* 20;
                    this._f14Geom.rotationZ = Math.sin(this._rollIncrement) * 25;
                    if (this._loopIncrement > Math.PI * 2) {
                        this._loopIncrement = 0;
                        this._state = 0;
                    }
                    break;
            }
        }
        if (this._f14Geom) {
            this._view.camera.lookAt(this._f14Geom.transform.position);
        }
        if (this._view.camera) {
            this._cameraIncrement += 0.01;
            this._view.camera.x = Math.cos(this._cameraIncrement) * 400;
            this._view.camera.z = Math.sin(this._cameraIncrement) * 400;
        }
        if (this._f14Geom) {
            this._view.camera.lookAt(this._f14Geom.transform.position);
        }
        if (this._seaMaterial) {
            this._seaSprite.style.uvMatrix.ty -= 0.04;
        }
        this._appTime += dt;
        this._view.render();
    };
    AircraftDemo.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    AircraftDemo.prototype.onMouseDown = function (event) {
        this._state++;
        if (this._state >= this._maxStates) this._state = 0;
    };
    return AircraftDemo;
}();
window.onload = function () {
    new AircraftDemo();
};

/***/ }

},[23]);
//# sourceMappingURL=AircraftDemo.js.map