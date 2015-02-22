/*

AWD3 file loading example in AwayJS

Demonstrates:

How to use the Loader object to load an embedded internal awd model.

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
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetType = require("awayjs-core/lib/library/AssetType");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var OrthographicProjection = require("awayjs-core/lib/projections/OrthographicProjection");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var Loader = require("awayjs-display/lib/containers/Loader");
var RenderableNullSort = require("awayjs-display/lib/sort/RenderableNullSort");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var Partition2D = require("awayjs-player/lib/fl/partition/Partition2D");
var AWD3Viewer = (function () {
    /**
     * Constructor
     */
    function AWD3Viewer() {
        this._time = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    AWD3Viewer.prototype.init = function () {
        this.initEngine();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    AWD3Viewer.prototype.initEngine = function () {
        //create the view
        this._view = new View(new DefaultRenderer(MethodRendererPool));
        this._view.renderer.renderableSorter = new RenderableNullSort();
        this._view.backgroundColor = 0xffffff;
        this._view.camera.projection = new OrthographicProjection(500);
        this._view.camera.projection.far = 500000;
        this._view.camera.projection.near = 0.1;
        this._view.camera.x = 0;
        this._view.camera.y = 0;
        this._view.camera.z = 300;
        this._view.camera.rotationX = -180;
        this._view.camera.rotationY = 0;
        this._view.camera.rotationZ = -180;
        //create custom lens
        // this._view.camera.projection = new OrthographicOffCenterProjection(0, 550, -400, 0);
        //  this._view.camera.projection.far = 500000;
        //  this._view.camera.projection.near = 0.1;
        /*
            //setup controller to be used on the camera
            this._cameraController = new HoverController(this._view.camera, null, 0, 0, 300, 10, 90);
            this._cameraController.lookAtPosition = new Vector3D(0, 50, 0);
            this._cameraController.tiltAngle = 0;
            this._cameraController.panAngle = 0;
            this._cameraController.minTiltAngle = 5;
            this._cameraController.maxTiltAngle = 60;
            this._cameraController.autoUpdate = false;
        */
    };
    /**
     * Initialise the scene objects
     */
    AWD3Viewer.prototype.initObjects = function () {
        var _this = this;
        AssetLibrary.enableParser(AWDParser);
        //kickoff asset loading
        var loader = new Loader();
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onRessourceComplete(event); });
        //loader.load(new URLRequest(document.getElementById("awdPath").innerHTML));
        loader.load(new URLRequest("assets/AWD3/ScareCrow.awd"));
        //loader.load(new URLRequest("assets/AWD3/NestedTween.awd"));
        //loader.load(new URLRequest("assets/AWD3/SimpleShape.awd"));
        //loader.load(new URLRequest("assets/AWD3/ComplexShape.awd"));
        //loader.load(new URLRequest("assets/AWD3/Simple_mask_test.awd"));
    };
    /**
     * Initialise the listeners
     */
    AWD3Viewer.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        document.onkeydown = function (event) { return _this.onKeyDown(event); };
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
        document.onmouseup = function (event) { return _this.onMouseUp(event); };
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        document.onmousewheel = function (event) { return _this.onMouseWheel(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * loader listener for asset complete events
     */
    AWD3Viewer.prototype.onAssetComplete = function (event) {
        if (event.asset.assetType == AssetType.TIMELINE) {
            this._rootTimeLine = event.asset;
            this._rootTimeLine.partition = new Partition2D(this._rootTimeLine);
        }
    };
    /**
     * loader listener for asset complete events
     */
    AWD3Viewer.prototype.onRessourceComplete = function (event) {
        if (this._rootTimeLine) {
            //console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
            this._view.scene.addChild(this._rootTimeLine);
        }
    };
    /**
     * Render loop
     */
    AWD3Viewer.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        //update camera controler
        // this._cameraController.update();
        if (this._rootTimeLine != undefined) {
            //console.log("RENDER = ");
            this._rootTimeLine.update(dt);
        }
        //console.log("RENDER = ");
        //update view
        this._view.render();
    };
    AWD3Viewer.prototype.onKeyDown = function (event) {
        if (event.keyCode == 109) {
            var test = this._view.camera.projection;
            test.projectionHeight += 5;
        }
        else if (event.keyCode == 107) {
            var test = this._view.camera.projection;
            test.projectionHeight -= 5;
        }
    };
    AWD3Viewer.prototype.onMouseDown = function (event) {
        /*  this._lastPanAngle = this._cameraController.panAngle;
          this._lastTiltAngle = this._cameraController.tiltAngle;
          this._move = true;*/
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
        this._move = true;
    };
    AWD3Viewer.prototype.onMouseUp = function (event) {
        this._move = false;
    };
    AWD3Viewer.prototype.onMouseMove = function (event) {
        if (this._move) {
            if (event.clientX > (this._lastMouseX + 10))
                this._view.camera.x += 10;
            else if (event.clientX > this._lastMouseX)
                this._view.camera.x++;
            else if (event.clientX < (this._lastMouseX - 10))
                this._view.camera.x -= 10;
            else if (event.clientX < this._lastMouseX)
                this._view.camera.x--;
            if (event.clientY > (this._lastMouseY + 10))
                this._view.camera.y += 10;
            else if (event.clientY > this._lastMouseY)
                this._view.camera.y++;
            else if (event.clientY < (this._lastMouseY - 10))
                this._view.camera.y -= 10;
            else if (event.clientY < this._lastMouseY)
                this._view.camera.y--;
            this._lastMouseX = event.clientX;
            this._lastMouseY = event.clientY;
        }
    };
    AWD3Viewer.prototype.onMouseWheel = function (event) {
        /* this._cameraController.distance -= event.wheelDelta * 5;
     
         if (this._cameraController.distance < 100) {
           this._cameraController.distance = 100;
         } else if (this._cameraController.distance > 2000) {
           this._cameraController.distance = 2000;
         }
         */
    };
    AWD3Viewer.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return AWD3Viewer;
})();
window.onload = function () {
    new AWD3Viewer();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9BV0QzVmlld2VyLnRzIl0sIm5hbWVzIjpbIkFXRDNWaWV3ZXIiLCJBV0QzVmlld2VyLmNvbnN0cnVjdG9yIiwiQVdEM1ZpZXdlci5pbml0IiwiQVdEM1ZpZXdlci5pbml0RW5naW5lIiwiQVdEM1ZpZXdlci5pbml0T2JqZWN0cyIsIkFXRDNWaWV3ZXIuaW5pdExpc3RlbmVycyIsIkFXRDNWaWV3ZXIub25Bc3NldENvbXBsZXRlIiwiQVdEM1ZpZXdlci5vblJlc3NvdXJjZUNvbXBsZXRlIiwiQVdEM1ZpZXdlci5vbkVudGVyRnJhbWUiLCJBV0QzVmlld2VyLm9uS2V5RG93biIsIkFXRDNWaWV3ZXIub25Nb3VzZURvd24iLCJBV0QzVmlld2VyLm9uTW91c2VVcCIsIkFXRDNWaWV3ZXIub25Nb3VzZU1vdmUiLCJBV0QzVmlld2VyLm9uTW91c2VXaGVlbCIsIkFXRDNWaWV3ZXIub25SZXNpemUiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBa0NFO0FBRUYsSUFBTyxZQUFZLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQUMxRSxJQUFPLFNBQVMsV0FBZSxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3BFLElBQU8sVUFBVSxXQUFlLG1DQUFtQyxDQUFDLENBQUM7QUFDckUsSUFBTyxVQUFVLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUNsRSxJQUFPLFdBQVcsV0FBZSxvQ0FBb0MsQ0FBQyxDQUFDO0FBR3ZFLElBQU8sc0JBQXNCLFdBQVksb0RBQW9ELENBQUMsQ0FBQztBQUUvRixJQUFPLHFCQUFxQixXQUFZLDZDQUE2QyxDQUFDLENBQUM7QUFFdkYsSUFBTyxJQUFJLFdBQWlCLG9DQUFvQyxDQUFDLENBQUM7QUFLbEUsSUFBTyxNQUFNLFdBQWdCLHNDQUFzQyxDQUFDLENBQUM7QUFFckUsSUFBTyxrQkFBa0IsV0FBYSw0Q0FBNEMsQ0FBQyxDQUFDO0FBR3BGLElBQU8sZUFBZSxXQUFjLHVDQUF1QyxDQUFDLENBQUM7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QUFFQSxDQUFDQTtZQUN2QkEsRUFBRUEsQ0FBQ0EsQ0FBRUEsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFFQSxFQUFFQSxDQUFDQTtZQUN6QkEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7Z0JBQ3hDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUN2QkEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzdDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFFQSxFQUFFQSxDQUFDQTtZQUN6QkEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7Z0JBQ3hDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUN2QkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBO1FBR2xDQSxDQUFDQTtJQUNBQSxDQUFDQTtJQUVPWixpQ0FBWUEsR0FBcEJBLFVBQXFCQSxLQUFLQTtRQUd6QmE7Ozs7Ozs7V0FPQUE7SUFDREEsQ0FBQ0E7SUFFT2IsNkJBQVFBLEdBQWhCQSxVQUFpQkEsS0FBWUE7UUFBWmMscUJBQVlBLEdBQVpBLFlBQVlBO1FBRTlCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQU9BLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFNQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFFSGQsaUJBQUNBO0FBQURBLENBL05BLEFBK05DQSxJQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUNmLElBQUksVUFBVSxFQUFFLENBQUM7QUFDbEIsQ0FBQyxDQUFDIiwiZmlsZSI6IkFXRDNWaWV3ZXIuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzQ29udGVudCI6W251bGxdfQ==