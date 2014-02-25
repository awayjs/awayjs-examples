///<reference path="../libs/away3d.next.d.ts" />
var examples;
(function (examples) {
    var TorusPrimitive = (function () {
        function TorusPrimitive() {
            var _this = this;
            this.initView();
            this.loadResources(); // Start loading the resources
            window.onresize = function () {
                return _this.resize();
            }; // Add event handler for window resize
        }
        /**
        *
        */
        TorusPrimitive.prototype.initView = function () {
            this._view = new away.containers.View(new away.render.DefaultRenderer()); // Create the Away3D View
            this._view.backgroundColor = 0x000000; // Change the background color to black
        };

        /**
        *
        */
        TorusPrimitive.prototype.loadResources = function () {
            var _this = this;
            var urlRequest = new away.net.URLRequest("assets/dots.png");
            var imgLoader = new away.net.URLLoader();
            imgLoader.dataFormat = away.net.URLLoaderDataFormat.BLOB;

            imgLoader.addEventListener(away.events.Event.COMPLETE, function (event) {
                return _this.urlCompleteHandler(event);
            }); // Add event listener for image complete
            imgLoader.load(urlRequest); // start loading
        };

        /**
        *
        * @param e
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
            this._light = new away.lights.DirectionalLight(); // Create a directional light
            this._light.diffuse = .7;
            this._light.specular = 1;
            this._view.scene.addChild(this._light);
            this._lightPicker = new away.materials.StaticLightPicker([this._light]); // Create a light picker
        };

        /**
        *
        */
        TorusPrimitive.prototype.initMaterial = function (image) {
            this._texture = new away.textures.ImageTexture(image, false); // Create a texture
            this._material = new away.materials.TextureMaterial(this._texture, true, true, false); // Create a material
            this._material.lightPicker = this._lightPicker; // assign the lights to the material
        };

        /**
        *
        */
        TorusPrimitive.prototype.initTorus = function () {
            this._torus = new away.primitives.TorusGeometry(220, 80, 32, 16, false); // Create the TorusGeometry
            this._mesh = new away.entities.Mesh(this._torus, this._material); // Create the mesh with the TorusGeometry
            this._view.scene.addChild(this._mesh); // Add the mesh to the scene
        };

        /**
        *
        */
        TorusPrimitive.prototype.startRAF = function () {
            this._raf = new away.utils.RequestAnimationFrame(this.render, this);
            this._raf.start(); // Start the frame loop ( request animation frame )
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
    new examples.TorusPrimitive(); // Start the demo
};
//# sourceMappingURL=TorusPrimitive.js.map
