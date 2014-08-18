///<reference path="../libs/stagegl-extensions.next.d.ts" />
var examples;
(function (examples) {
    var BlendMode = away.base.BlendMode;

    var View = away.containers.View;

    var Vector3D = away.geom.Vector3D;
    var DirectionalLight = away.entities.DirectionalLight;
    var StaticLightPicker = away.materials.StaticLightPicker;
    var TriangleMethodMaterial = away.materials.TriangleMethodMaterial;
    var URLLoader = away.net.URLLoader;
    var URLLoaderDataFormat = away.net.URLLoaderDataFormat;
    var URLRequest = away.net.URLRequest;
    var ParserUtils = away.parsers.ParserUtils;
    var PrimitiveTorusPrefab = away.prefabs.PrimitiveTorusPrefab;
    var PrimitiveCubePrefab = away.prefabs.PrimitiveCubePrefab;
    var PerspectiveProjection = away.projections.PerspectiveProjection;
    var DefaultRenderer = away.render.DefaultRenderer;
    var ImageTexture = away.textures.ImageTexture;
    var RequestAnimationFrame = away.utils.RequestAnimationFrame;

    var CubePrimitive = (function () {
        function CubePrimitive() {
            this.initView();
            this.initCamera();
            this.initLights();
            this.initGeometry();
            this.loadResources();
        }
        /**
        *
        */
        CubePrimitive.prototype.initView = function () {
            this._view = new View(new DefaultRenderer());
            this._view.backgroundColor = 0x000000;
            this._view.camera.x = 130;
            this._view.camera.y = 0;
            this._view.camera.z = 0;
        };

        /**
        *
        */
        CubePrimitive.prototype.initGeometry = function () {
            this._cube = new PrimitiveCubePrefab(20.0, 20.0, 20.0);
            this._torus = new PrimitiveTorusPrefab(150, 80, 32, 16, true);

            this._mesh = this._torus.getNewObject();
            this._mesh2 = this._cube.getNewObject();
            this._mesh2.x = 130;
            this._mesh2.z = 40;
        };

        /**
        *
        */
        CubePrimitive.prototype.initLights = function () {
            this._light = new DirectionalLight();
            this._light.color = 0xffffff;
            this._light.direction = new Vector3D(1, 0, 0);
            this._light.ambient = 0.4;
            this._light.ambientColor = 0x85b2cd;
            this._light.diffuse = 2.8;
            this._light.specular = 1.8;

            this._lightPicker = new StaticLightPicker([this._light]);
        };

        /**
        *
        */
        CubePrimitive.prototype.initCamera = function () {
            this._cameraAxis = new Vector3D(0, 0, 1);
            this._view.camera.projection = new PerspectiveProjection(120);
            this._view.camera.projection.near = 0.1;
        };

        /**
        *
        */
        CubePrimitive.prototype.loadResources = function () {
            var _this = this;
            window.onresize = function (event) {
                return _this.onResize(event);
            };
            this.onResize();

            this._raf = new RequestAnimationFrame(this.render, this);
            this._raf.start();

            var urlRequest = new URLRequest("assets/spacy_texture.png");
            var imgLoader = new URLLoader();
            imgLoader.dataFormat = URLLoaderDataFormat.BLOB;

            imgLoader.addEventListener(away.events.Event.COMPLETE, function (event) {
                return _this.urlCompleteHandler(event);
            });
            imgLoader.load(urlRequest);
        };

        /**
        *
        * @param e
        */
        CubePrimitive.prototype.urlCompleteHandler = function (event) {
            var _this = this;
            var imageLoader = event.target;
            this._image = ParserUtils.blobToImage(imageLoader.data);
            this._image.onload = function (event) {
                return _this.imageCompleteHandler(event);
            };
        };

        /**
        *
        * @param e
        */
        CubePrimitive.prototype.imageCompleteHandler = function (event) {
            var ts = new ImageTexture(this._image, false);
            var matTx = new TriangleMethodMaterial(ts, true, true, false);
            matTx.blendMode = BlendMode.ADD;
            matTx.bothSides = true;
            matTx.lightPicker = this._lightPicker;

            this._mesh.material = matTx;
            this._mesh2.material = matTx;

            this._view.scene.addChild(this._mesh);
            this._view.scene.addChild(this._mesh2);
        };

        /**
        *
        * @param dt
        */
        CubePrimitive.prototype.render = function (dt) {
            if (typeof dt === "undefined") { dt = null; }
            this._view.camera.rotate(this._cameraAxis, 1);
            this._mesh.rotationY += 1;
            this._mesh2.rotationX += 0.4;
            this._mesh2.rotationY += 0.4;
            this._view.render();
        };

        /**
        *
        */
        CubePrimitive.prototype.onResize = function (event) {
            if (typeof event === "undefined") { event = null; }
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
