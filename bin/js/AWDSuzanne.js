webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var LoaderEvent_1 = __webpack_require__(5);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(307);
	var URLRequest_1 = __webpack_require__(3);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var View_1 = __webpack_require__(9);
	var DirectionalLight_1 = __webpack_require__(221);
	var Sprite_1 = __webpack_require__(57);
	var JSPickingCollider_1 = __webpack_require__(326);
	var MouseEvent_1 = __webpack_require__(55);
	var StaticLightPicker_1 = __webpack_require__(229);
	var DefaultRenderer_1 = __webpack_require__(129);
	var MethodMaterial_1 = __webpack_require__(267);
	var AWDParser_1 = __webpack_require__(214);
	var AWDSuzanne = (function () {
	    function AWDSuzanne() {
	        var _this = this;
	        this._lookAtPosition = new Vector3D_1.default();
	        this._cameraIncrement = 0;
	        this._mouseOverMaterial = new MethodMaterial_1.default(0xFF0000);
	        this.initView();
	        this.loadAssets();
	        this.initLights();
	        window.onresize = function (event) { return _this.onResize(event); };
	        this.onResize();
	    }
	    /**
	     *
	     */
	    AWDSuzanne.prototype.initView = function () {
	        this._renderer = new DefaultRenderer_1.default();
	        this._view = new View_1.default(this._renderer);
	        this._view.camera.projection.far = 6000;
	        this._view.forceMouseMove = true;
	    };
	    /**
	     *
	     */
	    AWDSuzanne.prototype.loadAssets = function () {
	        var _this = this;
	        this._timer = new RequestAnimationFrame_1.default(this.render, this);
	        this._timer.start();
	        AssetLibrary_1.default.enableParser(AWDParser_1.default);
	        var session = AssetLibrary_1.default.getLoader();
	        session.addEventListener(LoaderEvent_1.default.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        session.load(new URLRequest_1.default('assets/suzanne.awd'));
	    };
	    /**
	     *
	     */
	    AWDSuzanne.prototype.initLights = function () {
	        this._light = new DirectionalLight_1.default();
	        this._light.color = 0x683019;
	        this._light.direction = new Vector3D_1.default(1, 0, 0);
	        this._light.ambient = 0.1;
	        this._light.ambientColor = 0x85b2cd;
	        this._light.diffuse = 2.8;
	        this._light.specular = 1.8;
	        this._view.scene.addChild(this._light);
	        this._lightPicker = new StaticLightPicker_1.default([this._light]);
	    };
	    /**
	     *
	     */
	    AWDSuzanne.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
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
	                case Sprite_1.default.assetType:
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
	                        clone.addEventListener(MouseEvent_1.default.MOUSE_OVER, function (event) { return _this.onMouseOver(event); });
	                        clone.addEventListener(MouseEvent_1.default.MOUSE_OUT, function (event) { return _this.onMouseOut(event); });
	                        this._view.scene.addChild(clone);
	                    }
	                    sprite.transform.scaleTo(500, 500, 500);
	                    sprite.pickingCollider = new JSPickingCollider_1.default();
	                    sprite.addEventListener(MouseEvent_1.default.MOUSE_OVER, function (event) { return _this.onMouseOver(event); });
	                    sprite.addEventListener(MouseEvent_1.default.MOUSE_OUT, function (event) { return _this.onMouseOut(event); });
	                    this._view.scene.addChild(sprite);
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
	}());
	window.onload = function () {
	    new AWDSuzanne();
	};


/***/ }
]);
//# sourceMappingURL=AWDSuzanne.js.map