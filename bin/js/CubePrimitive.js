///<reference path="Away3D/Away3D.next.d.ts" />
var examples;
(function (examples) {
    var CubePrimitive = (function () {
        function CubePrimitive() {
            this._view = new away.containers.View3D();

            this._view.backgroundColor = 0x000000;
            this._view.camera.x = 130;
            this._view.camera.y = 0;
            this._view.camera.z = 0;
            this._cameraAxis = new away.geom.Vector3D(0, 0, 1);

            this._light = new away.lights.DirectionalLight();
            this._light.color = 0x683019;
            this._light.direction = new away.geom.Vector3D(1, 0, 0);
            this._light.ambient = 0.2;
            this._light.ambientColor = 0x85b2cd;
            this._light.diffuse = 2.8;
            this._light.specular = 1.8;

            this._lightPicker = new away.materials.StaticLightPicker([this._light]);

            this._view.camera.lens = new away.cameras.PerspectiveLens(120);
            this._cube = new away.primitives.CubeGeometry(20.0, 20.0, 20.0);
            this._torus = new away.primitives.TorusGeometry(150, 80, 32, 16, true);

            this.loadResources();
        }
        CubePrimitive.prototype.loadResources = function () {
            var urlRequest = new away.net.URLRequest("assets/spacy_texture.png");
            var imgLoader = new away.net.IMGLoader();

            imgLoader.addEventListener(away.events.Event.COMPLETE, this.imageCompleteHandler, this);
            imgLoader.load(urlRequest);
        };

        CubePrimitive.prototype.imageCompleteHandler = function (e) {
            var _this = this;
            var imageLoader = e.target;
            this._image = imageLoader.image;

            var ts = new away.textures.HTMLImageElementTexture(this._image, false);
            var matTx = new away.materials.TextureMaterial(ts, true, true, false);
            matTx.blendMode = away.display.BlendMode.ADD;
            matTx.bothSides = true;
            matTx.lightPicker = this._lightPicker;

            this._lightPicker;

            this._mesh = new away.entities.Mesh(this._torus, matTx);
            this._mesh2 = new away.entities.Mesh(this._cube, matTx);
            this._mesh2.x = 130;
            this._mesh2.z = 40;

            this._view.scene.addChild(this._mesh);
            this._view.scene.addChild(this._mesh2);

            this._raf = new away.utils.RequestAnimationFrame(this.render, this);
            this._raf.start();

            this.resize();

            window.onresize = function () {
                return _this.resize();
            };
        };

        CubePrimitive.prototype.render = function (dt) {
            if (typeof dt === "undefined") { dt = null; }
            this._view.camera.rotate(this._cameraAxis, 1);
            this._mesh.rotationY += 1;
            this._mesh2.rotationX += 0.4;
            this._mesh2.rotationY += 0.4;
            this._view.render();
        };

        CubePrimitive.prototype.resize = function () {
            this._view.y = 0;
            this._view.x = 0;

            this._view.width = window.innerWidth;
            this._view.height = window.innerHeight;
        };
        return CubePrimitive;
    })();
    examples.CubePrimitive = CubePrimitive;
})(examples || (examples = {}));

window.onload = function () {
    new examples.CubePrimitive();
};
//# sourceMappingURL=CubePrimitive.js.map
