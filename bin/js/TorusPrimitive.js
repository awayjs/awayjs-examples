///<reference path="../libs/Away3D.next.d.ts" />
var examples;
(function (examples) {
    var TorusPrimitive = (function () {
        function TorusPrimitive() {
            var _this = this;
            this.initView();
            this.loadResources();
            window.onresize = function () {
                return _this.resize();
            };
        }
        /**
        *
        */
        TorusPrimitive.prototype.initView = function () {
            this._view = new away.containers.View3D();
            this._view.backgroundColor = 0x000000;
        };

        /**
        *
        */
        TorusPrimitive.prototype.loadResources = function () {
            var urlRequest = new away.net.URLRequest("assets/dots.png");
            var imgLoader = new away.net.IMGLoader();
            imgLoader.addEventListener(away.events.Event.COMPLETE, this.imageCompleteHandler, this);
            imgLoader.load(urlRequest);
        };

        /**
        *
        */
        TorusPrimitive.prototype.initLights = function () {
            this._light = new away.lights.DirectionalLight();
            this._light.diffuse = .7;
            this._light.specular = 1;
            this._view.scene.addChild(this._light);
            this._lightPicker = new away.materials.StaticLightPicker([this._light]);
        };

        /**
        *
        */
        TorusPrimitive.prototype.initMaterial = function (imageLoader) {
            this._image = imageLoader.image;
            this._texture = new away.textures.HTMLImageElementTexture(this._image, false);
            this._material = new away.materials.TextureMaterial(this._texture, true, true, false);
            this._material.lightPicker = this._lightPicker;
        };

        /**
        *
        */
        TorusPrimitive.prototype.initTorus = function () {
            this._torus = new away.primitives.TorusGeometry(220, 80, 32, 16, false);
            this._mesh = new away.entities.Mesh(this._torus, this._material);
            this._view.scene.addChild(this._mesh);
        };

        /**
        *
        */
        TorusPrimitive.prototype.startRAF = function () {
            this._raf = new away.utils.RequestAnimationFrame(this.render, this);
            this._raf.start();
        };

        /**
        *
        */
        TorusPrimitive.prototype.imageCompleteHandler = function (e) {
            this.initLights();
            this.initMaterial(e.target);
            this.initTorus();
            this.resize();
            this.startRAF();
        };

        /**
        *
        */
        TorusPrimitive.prototype.render = function (dt) {
            if (typeof dt === "undefined") { dt = null; }
            this._mesh.rotationY += 1;
            this._view.render();
        };

        /**
        *
        */
        TorusPrimitive.prototype.resize = function () {
            this._view.y = 0;
            this._view.x = 0;
            this._view.width = window.innerWidth;
            this._view.height = window.innerHeight;
        };
        return TorusPrimitive;
    })();
    examples.TorusPrimitive = TorusPrimitive;
})(examples || (examples = {}));

window.onload = function () {
    new examples.TorusPrimitive();
};
//# sourceMappingURL=TorusPrimitive.js.map
