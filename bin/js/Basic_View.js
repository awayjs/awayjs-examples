///<reference path="../libs/Away3D.next.d.ts" />
/*
Basic 3D scene example in Away3D
Demonstrates:
How to setup a view and add 3D objects.
How to apply materials to a 3D object and dynamically load textures
How to create a frame tick that updates the contents of the scene
Code by Rob Bateman
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk
This code is distributed under the MIT License
Copyright (c) The Away Foundation http://www.theawayfoundation.org
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
var examples;
(function (examples) {
    var Basic_View = (function () {
        /**
        * Constructor
        */
        function Basic_View() {
            var _this = this;
            //setup the view
            this._view = new away.containers.View(new away.render.DefaultRenderer());

            //setup the camera
            this._view.camera.z = -600;
            this._view.camera.y = 500;
            this._view.camera.lookAt(new away.geom.Vector3D());

            //setup the materials
            this._planeMaterial = new away.materials.TextureMaterial();

            //setup the scene
            this._plane = new away.entities.Mesh(new away.primitives.PlaneGeometry(700, 700), this._planeMaterial);
            this._view.scene.addChild(this._plane);

            //setup the render loop
            window.onresize = function (event) {
                return _this.onResize(event);
            };

            this.onResize();

            this._timer = new away.utils.RequestAnimationFrame(this.onEnterFrame, this);
            this._timer.start();

            away.library.AssetLibrary.addEventListener(away.events.LoaderEvent.RESOURCE_COMPLETE, function (event) {
                return _this.onResourceComplete(event);
            });

            //plane textures
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/floor_diffuse.jpg"));
        }
        /**
        * render loop
        */
        Basic_View.prototype.onEnterFrame = function (dt) {
            this._plane.rotationY += 1;

            this._view.render();
        };

        /**
        * Listener function for resource complete event on asset library
        */
        Basic_View.prototype.onResourceComplete = function (event) {
            var assets = event.assets;
            var length = assets.length;

            for (var c = 0; c < length; c++) {
                var asset = assets[c];

                console.log(asset.name, event.url);

                switch (event.url) {
                    case "assets/floor_diffuse.jpg":
                        this._planeMaterial.texture = away.library.AssetLibrary.getAsset(asset.name);
                        break;
                }
            }
        };

        /**
        * stage listener for resize events
        */
        Basic_View.prototype.onResize = function (event) {
            if (typeof event === "undefined") { event = null; }
            this._view.y = 0;
            this._view.x = 0;
            this._view.width = window.innerWidth;
            this._view.height = window.innerHeight;
        };
        return Basic_View;
    })();
    examples.Basic_View = Basic_View;
})(examples || (examples = {}));

window.onload = function () {
    new examples.Basic_View();
};
//# sourceMappingURL=Basic_View.js.map
