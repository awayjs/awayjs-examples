///<reference path="../libs/stagegl-extensions.next.d.ts" />
var examples;
(function (examples) {
    var View = away.containers.View;
    var DirectionalLight = away.entities.DirectionalLight;

    var StaticLightPicker = away.materials.StaticLightPicker;
    var TriangleMethodMaterial = away.materials.TriangleMethodMaterial;
    var URLLoader = away.net.URLLoader;
    var URLLoaderDataFormat = away.net.URLLoaderDataFormat;
    var URLRequest = away.net.URLRequest;
    var PrimitiveTorusPrefab = away.prefabs.PrimitiveTorusPrefab;

    var DefaultRenderer = away.render.DefaultRenderer;
    var ImageTexture = away.textures.ImageTexture;
    var RequestAnimationFrame = away.utils.RequestAnimationFrame;

    var TorusPrimitive = (function () {
        function TorusPrimitive() {
            var _this = this;
            this.initView();

            this._raf = new RequestAnimationFrame(this.render, this);
            this._raf.start(); // Start the frame loop ( request animation frame )

            this.loadResources(); // Start loading the resources
            window.onresize = function (event) {
                return _this.resize(event);
            }; // Add event handler for window resize

            this.resize();
        }
        /**
        *
        */
        TorusPrimitive.prototype.initView = function () {
            this._view = new View(new DefaultRenderer()); // Create the Away3D View
            this._view.backgroundColor = 0x000000; // Change the background color to black
        };

        /**
        *
        */
        TorusPrimitive.prototype.loadResources = function () {
            var _this = this;
            var urlRequest = new URLRequest("assets/dots.png");
            var imgLoader = new URLLoader();
            imgLoader.dataFormat = URLLoaderDataFormat.BLOB;

            imgLoader.addEventListener(away.events.Event.COMPLETE, function (event) {
                return _this.urlCompleteHandler(event);
            }); // Add event listener for image complete
            imgLoader.load(urlRequest); // start loading
        };

        /**
        *
        * @param event
        */
        TorusPrimitive.prototype.urlCompleteHandler = function (event) {
            var _this = this;
            var imageLoader = event.target;
            this._image = away.parsers.ParserUtils.blobToImage(imageLoader.data);
            this._image.onload = function (event) {
                return _this.imageCompleteHandler(event);
            };
        };

        /**
        *
        */
        TorusPrimitive.prototype.initLights = function () {
            this._light = new DirectionalLight(); // Create a directional light
            this._light.diffuse = .7;
            this._light.specular = 1;
            this._view.scene.addChild(this._light);
            this._lightPicker = new StaticLightPicker([this._light]); // Create a light picker
        };

        /**
        *
        */
        TorusPrimitive.prototype.initMaterial = function (image) {
            this._texture = new ImageTexture(image, false); // Create a texture
            this._material = new TriangleMethodMaterial(this._texture, true, true, false); // Create a material
            this._material.lightPicker = this._lightPicker; // assign the lights to the material
        };

        /**
        *
        */
        TorusPrimitive.prototype.initTorus = function () {
            this._torus = new PrimitiveTorusPrefab(220, 80, 32, 16, false); // Create the Torus prefab
            this._mesh = this._torus.getNewObject(); //Create the mesh
            this._mesh.material = this._material; //apply the material
            this._view.scene.addChild(this._mesh); // Add the mesh to the scene
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
            if (typeof dt === "undefined") { dt = null; }
            if (this._mesh)
                this._mesh.rotationY += 1;

            this._view.render();
        };

        /**
        *
        */
        TorusPrimitive.prototype.resize = function (event) {
            if (typeof event === "undefined") { event = null; }
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
    new examples.TorusPrimitive(); // Start the demo
};
//# sourceMappingURL=TorusPrimitive.js.map
