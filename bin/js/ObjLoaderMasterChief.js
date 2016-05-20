webpackJsonp([19],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var BitmapImage2D_1 = __webpack_require__(74);
	var Sampler2D_1 = __webpack_require__(72);
	var LoaderEvent_1 = __webpack_require__(5);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(305);
	var URLRequest_1 = __webpack_require__(3);
	var Debug_1 = __webpack_require__(331);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var DisplayObjectContainer_1 = __webpack_require__(12);
	var View_1 = __webpack_require__(9);
	var DirectionalLight_1 = __webpack_require__(218);
	var Sprite_1 = __webpack_require__(57);
	var StaticLightPicker_1 = __webpack_require__(226);
	var DefaultRenderer_1 = __webpack_require__(130);
	var MethodMaterial_1 = __webpack_require__(265);
	var OBJParser_1 = __webpack_require__(332);
	var ObjLoaderMasterChief = (function () {
	    function ObjLoaderMasterChief() {
	        var _this = this;
	        this.sprites = new Array();
	        this.spartan = new DisplayObjectContainer_1.DisplayObjectContainer();
	        this.spartanFlag = false;
	        Debug_1.Debug.LOG_PI_ERRORS = false;
	        Debug_1.Debug.THROW_ERRORS = false;
	        this.view = new View_1.View(new DefaultRenderer_1.DefaultRenderer());
	        this.view.camera.z = -50;
	        this.view.camera.y = 20;
	        this.view.camera.projection.near = 0.1;
	        this.view.backgroundColor = 0xCEC8C6;
	        this.raf = new RequestAnimationFrame_1.RequestAnimationFrame(this.render, this);
	        this.light = new DirectionalLight_1.DirectionalLight();
	        this.light.color = 0xc1582d;
	        this.light.direction = new Vector3D_1.Vector3D(1, 0, 0);
	        this.light.ambient = 0.4;
	        this.light.ambientColor = 0x85b2cd;
	        this.light.diffuse = 2.8;
	        this.light.specular = 1.8;
	        this.view.scene.addChild(this.light);
	        this.spartan.transform.scaleTo(.25, .25, .25);
	        this.spartan.y = 0;
	        this.view.scene.addChild(this.spartan);
	        AssetLibrary_1.AssetLibrary.enableParser(OBJParser_1.OBJParser);
	        var session;
	        session = AssetLibrary_1.AssetLibrary.getLoader();
	        session.addEventListener(LoaderEvent_1.LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        session.load(new URLRequest_1.URLRequest('assets/Halo_3_SPARTAN4.obj'));
	        session = AssetLibrary_1.AssetLibrary.getLoader();
	        session.addEventListener(LoaderEvent_1.LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        session.load(new URLRequest_1.URLRequest('assets/terrain.obj'));
	        session = AssetLibrary_1.AssetLibrary.getLoader();
	        session.addEventListener(LoaderEvent_1.LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        session.load(new URLRequest_1.URLRequest('assets/masterchief_base.png'));
	        session = AssetLibrary_1.AssetLibrary.getLoader();
	        session.addEventListener(LoaderEvent_1.LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        session.load(new URLRequest_1.URLRequest('assets/stone_tx.jpg'));
	        window.onresize = function (event) { return _this.onResize(); };
	        this.raf.start();
	    }
	    ObjLoaderMasterChief.prototype.render = function () {
	        if (this.terrain)
	            this.terrain.rotationY += 0.4;
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
	                case Sprite_1.Sprite.assetType:
	                    if (event.url == 'assets/Halo_3_SPARTAN4.obj') {
	                        var sprite = d;
	                        this.spartan.addChild(sprite);
	                        this.spartanFlag = true;
	                        this.sprites.push(sprite);
	                    }
	                    else if (event.url == 'assets/terrain.obj') {
	                        this.terrain = d;
	                        this.terrain.y = 98;
	                        this.terrain.graphics.scaleUV(20, 20);
	                        this.view.scene.addChild(this.terrain);
	                    }
	                    break;
	                case BitmapImage2D_1.BitmapImage2D.assetType:
	                    if (event.url == 'assets/masterchief_base.png') {
	                        this.mat = new MethodMaterial_1.MethodMaterial(d);
	                        this.mat.style.sampler = new Sampler2D_1.Sampler2D(true, true, false);
	                        this.mat.lightPicker = new StaticLightPicker_1.StaticLightPicker([this.light]);
	                    }
	                    else if (event.url == 'assets/stone_tx.jpg') {
	                        this.terrainMaterial = new MethodMaterial_1.MethodMaterial(d);
	                        this.terrainMaterial.style.sampler = new Sampler2D_1.Sampler2D(true, true, false);
	                        this.terrainMaterial.lightPicker = new StaticLightPicker_1.StaticLightPicker([this.light]);
	                    }
	                    break;
	            }
	        }
	        if (this.terrain && this.terrainMaterial)
	            this.terrain.material = this.terrainMaterial;
	        if (this.mat && this.spartanFlag)
	            for (var c = 0; c < this.sprites.length; c++)
	                this.sprites[c].material = this.mat;
	        this.onResize();
	    };
	    ObjLoaderMasterChief.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this.view.y = 0;
	        this.view.x = 0;
	        this.view.width = window.innerWidth;
	        this.view.height = window.innerHeight;
	    };
	    return ObjLoaderMasterChief;
	}());
	window.onload = function () {
	    new ObjLoaderMasterChief(); // Start the demo
	};


/***/ }
]);
//# sourceMappingURL=ObjLoaderMasterChief.js.map