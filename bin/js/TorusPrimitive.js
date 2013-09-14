///<reference path="Away3D/Away3D.next.d.ts" />
var examples;
(function (examples) {
    var TorusPrimitive = (function () {
        function TorusPrimitive() {
            var _this = this;
            this._view = new away.containers.View3D();
            this._view.backgroundColor = 0x000000;
            this._view.camera.lens = new away.cameras.PerspectiveLens(60);
            this._torus = new away.primitives.TorusGeometry(220, 80, 32, 16, false);

            this.loadResources();

            window.onresize = function () {
                return _this.resize();
            };
        }
        TorusPrimitive.prototype.loadResources = function () {
            var urlRequest = new away.net.URLRequest("assets/dots.png");

            var imgLoader = new away.net.IMGLoader();
            imgLoader.addEventListener(away.events.Event.COMPLETE, this.imageCompleteHandler, this);
            imgLoader.load(urlRequest);
        };

        TorusPrimitive.prototype.imageCompleteHandler = function (e) {
            var imageLoader = e.target;
            this._image = imageLoader.image;

            var ts = new away.textures.HTMLImageElementTexture(this._image, false);

            var light = new away.lights.DirectionalLight();
            light.ambientColor = 0xff0000;
            light.ambient = 0.3;
            light.diffuse = .7;
            light.specular = 1;

            this._view.scene.addChild(light);

            var lightPicker = new away.materials.StaticLightPicker([light]);

            var matTx = new away.materials.TextureMaterial(ts, true, true, false);
            matTx.lightPicker = lightPicker;

            this._mesh = new away.entities.Mesh(this._torus, matTx);

            this._view.scene.addChild(this._mesh);

            this.resize();

            this._raf = new away.utils.RequestAnimationFrame(this.render, this);
            this._raf.start();
        };

        TorusPrimitive.prototype.render = function (dt) {
            if (typeof dt === "undefined") { dt = null; }
            this._mesh.rotationY += 1;
            this._view.render();
        };

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
