(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/AWD3Viewer.ts":[function(require,module,exports){
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
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var OrthographicProjection = require("awayjs-core/lib/projections/OrthographicProjection");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var Billboard = require("awayjs-display/lib/entities/Billboard");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var Loader = require("awayjs-display/lib/containers/Loader");
var Renderer2D = require("awayjs-player/lib/renderer/Renderer2D");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var Partition2D = require("awayjs-player/lib/partition/Partition2D");
var MovieClip = require("awayjs-player/lib/display/MovieClip");
var CoordinateSystem = require("awayjs-core/lib/projections/CoordinateSystem");
var PerspectiveProjection = require("awayjs-core/lib/projections/PerspectiveProjection");
var Camera = require("awayjs-display/lib/entities/Camera");
var TextField = require("awayjs-display/lib/entities/TextField");
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
        var _this = this;
        this.initEngine();
        var testSelector = document.createElement('div');
        testSelector.style.cssFloat = 'none';
        testSelector.style.position = 'absolute';
        testSelector.style.bottom = '30px';
        testSelector.style.width = '600px';
        testSelector.style.left = '50%';
        testSelector.style.marginLeft = '-300px';
        testSelector.style.padding = '20px';
        testSelector.style.textAlign = 'center';
        var testSelector2 = document.createElement('div');
        testSelector2.style.cssFloat = 'none';
        testSelector2.style.position = 'absolute';
        testSelector2.style.bottom = '0px';
        testSelector2.style.width = '600px';
        testSelector2.style.left = '50%';
        testSelector2.style.marginLeft = '-300px';
        testSelector2.style.padding = '20px';
        testSelector2.style.textAlign = 'center';
        this.loaded_display_objects = new Array();
        this.dropDown = document.createElement('select');
        this.dropDown.name = "selectTestDropDown";
        this.dropDown.id = "selectTest";
        this.previousBtn = document.createElement('button');
        this.previousBtn.innerHTML = '<<';
        this.previousBtn.id = 'previous';
        this.nextBtn = document.createElement('button');
        this.nextBtn.innerHTML = '>>';
        this.nextBtn.id = 'next';
        this.playBtn = document.createElement('button');
        this.playBtn.innerHTML = '||';
        this.playBtn.id = 'previous';
        this.stopBtn = document.createElement('button');
        this.stopBtn.innerHTML = 'stop';
        this.stopBtn.id = 'previous';
        testSelector.appendChild(this.previousBtn);
        testSelector.appendChild(this.dropDown);
        testSelector.appendChild(this.nextBtn);
        testSelector2.appendChild(this.playBtn);
        testSelector2.appendChild(this.stopBtn);
        document.body.appendChild(testSelector);
        document.body.appendChild(testSelector2);
        this.dropDown.onchange = function (e) { return _this.dropDownChange(e); };
        this.previousBtn.onclick = function () { return _this.nagigateBy(-1); };
        this.nextBtn.onclick = function () { return _this.nagigateBy(1); };
        this.playBtn.onclick = function () { return _this.toggle_playback(); };
        this.stopBtn.onclick = function () { return _this.stop_playback(); };
        this.initObjects();
        this.initListeners();
    };
    /*
     * Dropbox event handler
     *
     * @param e
     */
    AWD3Viewer.prototype.dropDownChange = function (e) {
        this.dropDown.options[this.dropDown.selectedIndex].value;
        this.counter = this.dropDown.selectedIndex;
        var dataIndex = parseInt(this.dropDown.options[this.dropDown.selectedIndex].value);
        if (!isNaN(dataIndex)) {
            this.navigateToSection(this.loaded_display_objects[dataIndex]);
        }
    };
    AWD3Viewer.prototype.stop_playback = function () {
        this.playBtn.innerHTML = "play";
        this._rootTimeLine.stop();
        this._rootTimeLine.currentFrameIndex = 0;
    };
    AWD3Viewer.prototype.toggle_playback = function () {
        if (this.playBtn.innerHTML == "||") {
            this.playBtn.innerHTML = "play";
            this._rootTimeLine.stop();
        }
        else if (this.playBtn.innerHTML == "play") {
            this.playBtn.innerHTML = "||";
            this._rootTimeLine.play();
        }
    };
    AWD3Viewer.prototype.nagigateBy = function (direction) {
        if (direction === void 0) { direction = 1; }
        var l = this.loaded_display_objects.length;
        var nextCounter = this.counter + direction;
        if (nextCounter < 0) {
            nextCounter = this.loaded_display_objects.length - 1;
        }
        else if (nextCounter > this.loaded_display_objects.length - 1) {
            nextCounter = 0;
        }
        var testData = this.loaded_display_objects[nextCounter];
        this.navigateToSection(testData);
        this.dropDown.selectedIndex = nextCounter;
        this.counter = nextCounter;
    };
    AWD3Viewer.prototype.navigateToSection = function (object) {
        this.playBtn.innerHTML = "||";
        console.log(object.name);
        var childcnt = this._view.scene.numChildren;
        while (childcnt--) {
            this._view.scene.removeChildAt(childcnt);
        }
        this._view.scene.addChild(object);
        object.visible = true;
        object.currentFrameIndex = 0;
        object.play();
        //todo: bounds object is not set
        //var bounds = object.getBounds(object);
        //object.x=-bounds.width/2;
        //object.y=-bounds.height/2;
        this._rootTimeLine = object;
        console.log("added child = ", object.name);
    };
    AWD3Viewer.prototype.init_dropDown = function () {
        for (var c = 0; c < this.loaded_display_objects.length; c++) {
            var option = new Option(this.loaded_display_objects[c].name, String(c));
            this.dropDown.add(option);
        }
        this.counter = this.loaded_display_objects.length - 1;
        this.dropDown.selectedIndex = this.loaded_display_objects.length - 1;
    };
    /**
     * Initialise the engine
     */
    AWD3Viewer.prototype.initEngine = function () {
        //create the view
        this._view = new View(new Renderer2D());
        this._view.backgroundColor = 0xffffff;
        this._stage_width = 550;
        this._stage_height = 400;
        //for plugin preview-runtime:
        this._view.backgroundColor = parseInt(document.getElementById("bgColor").innerHTML.replace("#", "0x"));
        this._stage_width = parseInt(document.getElementById("awdWidth").innerHTML);
        this._stage_height = parseInt(document.getElementById("awdHeight").innerHTML);
        this._isperspective = true;
        this._projection = new PerspectiveProjection();
        this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._projection.focalLength = 1000;
        this._projection.preserveFocalLength = true;
        this._projection.originX = 0.5;
        this._projection.originY = 0.5;
        this._camera_perspective = new Camera();
        this._camera_perspective.projection = this._projection;
        //this._projection.far = 500000;
        this._hoverControl = new HoverController(this._camera_perspective, null, 180, 0, 1000);
        this._ortho_projection = new OrthographicProjection(500);
        this._ortho_projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._ortho_projection.far = 500000;
        this._ortho_projection.near = 0.1;
        this._ortho_projection.originX = 0.5;
        this._ortho_projection.originY = 0.5;
        this._camera_ortho = new Camera();
        this._camera_ortho.projection = this._ortho_projection;
        this._view.camera = this._camera_perspective;
        this._camera_ortho.x = 0;
        this._camera_ortho.y = 0;
        this._camera_ortho.scaleY = -1;
        this._camera_ortho.z = 0;
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
        //for plugin preview-runtime:
        loader.load(new URLRequest(document.getElementById("awdPath").innerHTML));
        //loader.load(new URLRequest("assets/AWD3/AwayJEscher.awd"));
        //loader.load(new URLRequest("assets/AWD3/Simple_text_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/AwayJS_Ninja.awd"));
        //loader.load(new URLRequest("assets/AWD3/ComplexShape.awd"));
        //loader.load(new URLRequest("assets/AWD3/NestedTween.awd"));
        //loader.load(new URLRequest("assets/AWD3/Rectancle_blink_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow.awd"));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow_shape_debug.awd"));
        //loader.load(new URLRequest("assets/AWD3/simple_bitmap_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/Simple_mask_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/mask_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/text_test_2.awd"));
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
        if (event.asset.isAsset(TextField)) {
            var one_textfield = event.asset;
        }
        else if (event.asset.isAsset(Mesh)) {
            var one_mesh = event.asset;
        }
        else if (event.asset.isAsset(Billboard)) {
            var one_billboard = event.asset;
        }
        else if (event.asset.isAsset(MovieClip)) {
            var one_mc = event.asset;
            this.loaded_display_objects.push(one_mc);
            this._rootTimeLine = one_mc;
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
            this._rootTimeLine.x = -this._stage_width / 2;
            this._rootTimeLine.y = -this._stage_height / 2;
        }
        this.init_dropDown();
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
        console.log("keycode = " + event.keyCode);
        if (event.keyCode == 80) {
            this._isperspective = true;
            this._view.camera = this._camera_perspective;
        }
        if (event.keyCode == 79) {
            this._isperspective = false;
            this._view.camera = this._camera_ortho;
        }
        if (event.keyCode == 81) {
            if (this._isperspective) {
                this._hoverControl.distance += 5;
            }
            else {
                this._ortho_projection.projectionHeight += 5;
            }
        }
        else if (event.keyCode == 87) {
            if (this._isperspective) {
                this._hoverControl.distance -= 5;
            }
            else {
                this._ortho_projection.projectionHeight -= 5;
            }
        }
        if (event.keyCode == 65) {
            if (this._isperspective) {
                this._hoverControl.distance += 50;
            }
            else {
                this._ortho_projection.projectionHeight += 50;
            }
        }
        else if (event.keyCode == 83) {
            if (this._isperspective) {
                this._hoverControl.distance -= 50;
            }
            else {
                this._ortho_projection.projectionHeight -= 50;
            }
        }
    };
    AWD3Viewer.prototype.onMouseDown = function (event) {
        this._lastPanAngle = this._hoverControl.panAngle;
        this._lastTiltAngle = this._hoverControl.tiltAngle;
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
        this._move = true;
    };
    AWD3Viewer.prototype.onMouseUp = function (event) {
        this._move = false;
    };
    AWD3Viewer.prototype.onMouseMove = function (event) {
        if (this._move) {
            if (this._isperspective) {
                this._hoverControl.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
                this._hoverControl.tiltAngle = -0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
            }
            else {
                if (event.clientX > (this._lastMouseX + 10))
                    this._camera_ortho.x -= 10;
                else if (event.clientX > this._lastMouseX)
                    this._camera_ortho.x--;
                else if (event.clientX < (this._lastMouseX - 10))
                    this._camera_ortho.x += 10;
                else if (event.clientX < this._lastMouseX)
                    this._camera_ortho.x++;
                if (event.clientY > (this._lastMouseY + 10))
                    this._camera_ortho.y -= 10;
                else if (event.clientY > this._lastMouseY)
                    this._camera_ortho.y--;
                else if (event.clientY < (this._lastMouseY - 10))
                    this._camera_ortho.y += 10;
                else if (event.clientY < this._lastMouseY)
                    this._camera_ortho.y++;
                this._lastMouseX = event.clientX;
                this._lastMouseY = event.clientY;
            }
        }
    };
    AWD3Viewer.prototype.onMouseWheel = function (event) {
        if (this._isperspective) {
            this._hoverControl.distance -= event.wheelDelta * 5;
            if (this._hoverControl.distance < 100) {
                this._hoverControl.distance = 100;
            }
        }
        else {
            this._ortho_projection.projectionHeight -= event.wheelDelta * 5;
            if (this._ortho_projection.projectionHeight < 5) {
                this._ortho_projection.projectionHeight = 5;
            }
        }
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

},{"awayjs-core/lib/events/AssetEvent":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/projections/CoordinateSystem":undefined,"awayjs-core/lib/projections/OrthographicProjection":undefined,"awayjs-core/lib/projections/PerspectiveProjection":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Loader":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Billboard":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/TextField":undefined,"awayjs-parsers/lib/AWDParser":undefined,"awayjs-player/lib/display/MovieClip":undefined,"awayjs-player/lib/partition/Partition2D":undefined,"awayjs-player/lib/renderer/Renderer2D":undefined}]},{},["./src/AWD3Viewer.ts"])


//# sourceMappingURL=AWD3Viewer.js.map