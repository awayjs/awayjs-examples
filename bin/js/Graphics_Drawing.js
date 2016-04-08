webpackJsonp([11],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
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
	var AS2MovieClipAdapter_1 = __webpack_require__(296);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var Graphics_1 = __webpack_require__(348);
	var View_1 = __webpack_require__(9);
	var Sprite_1 = __webpack_require__(57);
	var HoverController_1 = __webpack_require__(98);
	var DefaultRenderer_1 = __webpack_require__(116);
	var SceneGraphPartition_1 = __webpack_require__(311);
	var MovieClip_1 = __webpack_require__(298);
	var CoordinateSystem_1 = __webpack_require__(49);
	var PerspectiveProjection_1 = __webpack_require__(48);
	var Camera_1 = __webpack_require__(45);
	var Graphics_Drawing = (function () {
	    /**
	     * Constructor
	     */
	    function Graphics_Drawing() {
	        this._time = 0;
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Graphics_Drawing.prototype.init = function () {
	        this.initEngine();
	        this.initObjects();
	        this.initListeners();
	    };
	    /**
	     * Initialise the engine
	     */
	    Graphics_Drawing.prototype.initEngine = function () {
	        //create the view
	        this._renderer = new DefaultRenderer_1.default();
	        this._renderer.renderableSorter = null; //new RenderableSort2D();
	        this._view = new View_1.default(this._renderer);
	        this._view.backgroundColor = 0x777777;
	        this._stage_width = 550;
	        this._stage_height = 400;
	        this._isperspective = true;
	        this._projection = new PerspectiveProjection_1.default();
	        this._projection.coordinateSystem = CoordinateSystem_1.default.RIGHT_HANDED;
	        this._projection.fieldOfView = 30;
	        this._projection.originX = 0;
	        this._projection.originY = 0;
	        this._camera_perspective = new Camera_1.default();
	        this._camera_perspective.projection = this._projection;
	        //this._projection.far = 500000;
	        this._hoverControl = new HoverController_1.default(this._camera_perspective, null, 180, 0, 1000);
	        this._view.camera = this._camera_perspective;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Graphics_Drawing.prototype.initObjects = function () {
	        var root_timeline = new MovieClip_1.default();
	        root_timeline.partition = new SceneGraphPartition_1.default();
	        root_timeline.adapter = new AS2MovieClipAdapter_1.default(root_timeline, this._view);
	        // Graphics is not wired into any Displayobjects yet.
	        // to have it produce geometry, for now we have to pass it a sprite when constructing it
	        var drawingMC = new Sprite_1.default(null);
	        var drawingGraphics = new Graphics_1.default(drawingMC);
	        // for now i did not find a way to activate this other than doing it in js (not in ts)
	        // so for this example to work, after packaging the example, one have to go into the js file and activate follwing line:
	        //Graphics._tess_obj=new TESS();
	        // color do not work yet
	        drawingGraphics.beginFill(0xFF0000, 1);
	        // strokes not at a showable state yet
	        //drawingGraphics.lineStyle(10, 0x000000, 1);
	        // draw some shape
	        drawingGraphics.moveTo(100, 100);
	        drawingGraphics.lineTo(200, 100);
	        drawingGraphics.lineTo(200, 200);
	        drawingGraphics.curveTo(150, 150, 100, 200);
	        drawingGraphics.curveTo(0, 150, 100, 100);
	        // draw a hole into the shape:
	        drawingGraphics.moveTo(110, 110);
	        drawingGraphics.lineTo(130, 110);
	        drawingGraphics.lineTo(130, 130);
	        drawingGraphics.lineTo(110, 130);
	        drawingGraphics.moveTo(110, 110);
	        drawingGraphics.beginFill(0xFF0000, 1);
	        drawingGraphics.drawCircle(300, 150, 80);
	        drawingGraphics.drawCircle(550, 150, 160);
	        drawingGraphics.drawRect(100, 250, 50, 50);
	        drawingGraphics.drawRoundRect(100, 350, 200, 100, 20);
	        drawingGraphics.drawEllipse(550, 400, 200, 100);
	        drawingGraphics.endFill();
	        this._view.scene.addChild(drawingMC);
	    };
	    /**
	     * Initialise the listeners
	     */
	    Graphics_Drawing.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this._timer.start();
	    };
	    /**
	     * Render loop
	     */
	    Graphics_Drawing.prototype.onEnterFrame = function (dt) {
	        this._time += dt;
	        //update camera controler
	        // this._cameraController.update();
	        //console.log("RENDER = ");
	        //update view
	        this._view.render();
	    };
	    Graphics_Drawing.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return Graphics_Drawing;
	}());
	window.onload = function () {
	    new Graphics_Drawing();
	};


/***/ },

/***/ 296:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var AssetEvent_1 = __webpack_require__(1);
	var Point_1 = __webpack_require__(26);
	var AssetLibrary_1 = __webpack_require__(297);
	var MovieClip_1 = __webpack_require__(298);
	var MouseEvent_1 = __webpack_require__(55);
	var AS2SymbolAdapter_1 = __webpack_require__(302);
	var AS2MCSoundProps_1 = __webpack_require__(303);
	var includeString = 'var Color			from "awayjs-player/lib/adapters/AS2ColorAdapter";\n' +
	    'var System				from "awayjs-player/lib/adapters/AS2SystemAdapter";\n' +
	    'var Sound				from "awayjs-player/lib/adapters/AS2SoundAdapter";\n' +
	    'var Key				from "awayjs-player/lib/adapters/AS2KeyAdapter";\n' +
	    'var Mouse				from "awayjs-player/lib/adapters/AS2MouseAdapter";\n' +
	    'var Stage				from "awayjs-player/lib/adapters/AS2StageAdapter";\n' +
	    'var SharedObject		from "awayjs-player/lib/adapters/AS2SharedObjectAdapter";\n' +
	    'var int = function(value) {return Math.floor(value) | 0;}\n' +
	    'var string = function(value) {return value.toString();}\n' +
	    'var getURL = function(value) {return value;}\n';
	var AS2MovieClipAdapter = (function (_super) {
	    __extends(AS2MovieClipAdapter, _super);
	    function AS2MovieClipAdapter(adaptee, view) {
	        // create an empty MovieClip if none is passed
	        _super.call(this, adaptee || new MovieClip_1.default(), view);
	        this.__pSoundProps = new AS2MCSoundProps_1.default();
	    }
	    AS2MovieClipAdapter.prototype.dispose = function () {
	        _super.prototype.dispose.call(this);
	        this.__pSoundProps.dispose();
	        this.__pSoundProps = null;
	    };
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "_framesloaded", {
	        get: function () {
	            // not loading frame by frame?
	            return this.adaptee.numFrames;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "_currentframe", {
	        get: function () {
	            return this.adaptee.currentFrameIndex + 1;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "_totalframes", {
	        get: function () {
	            return this.adaptee.numFrames;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "enabled", {
	        get: function () {
	            return this.adaptee.mouseEnabled;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AS2MovieClipAdapter.prototype.evalScript = function (str) {
	        try {
	            var tag = document.createElement('script');
	            tag.text = includeString + 'var __framescript__ = function() {\n' + str + '\n}';
	            //add and remove script tag to dom to trigger compilation
	            var sibling = document.scripts[0];
	            sibling.parentNode.insertBefore(tag, sibling).parentNode.removeChild(tag);
	            var script = __framescript__;
	            delete window['__framescript__'];
	        }
	        catch (err) {
	            console.log("Syntax error in script:\n", str);
	            console.log(err.message);
	            throw err;
	        }
	        return script;
	    };
	    //attachAudio(id: AS2SoundAdapter):void {	}
	    //attachBitmap(bmp: BitmapImage2D, depth: Number, pixelSnapping: String = null, smoothing: boolean = false):void { }
	    AS2MovieClipAdapter.prototype.attachMovie = function (id, name, depth, initObject) {
	        if (initObject === void 0) { initObject = null; }
	        var attached_mc = AssetLibrary_1.default.getAsset(id);
	        var cloned_mc = attached_mc.clone();
	        var adapter = new AS2MovieClipAdapter(cloned_mc, this._view);
	        this.adaptee.addChildAtDepth(adapter.adaptee, depth);
	        adapter.adaptee.name = name;
	        this.registerScriptObject(adapter.adaptee);
	        return attached_mc;
	        // todo: apply object from initObject to attached_mc
	    };
	    //beginBitmapFill(bmp: BitmapImage2D, matrix: Matrix = null, repeat: boolean = false, smoothing: boolean = false):void {}
	    //beginFill(rgb: Number, alpha: number = 1.0):void {}
	    //beginGradientFill(fillType: string, colors: Array, alphas: Array, ratios: Array, matrix: Object, spreadMethod: string = null, interpolationMethod: string  = null, focalPointRatio: number  = null):void {}
	    //clear():void {}
	    AS2MovieClipAdapter.prototype.createEmptyMovieClip = function (name, depth) {
	        var mc = new MovieClip_1.default();
	        mc.adapter = new AS2MovieClipAdapter(mc, this._view);
	        mc.name = name;
	        this.adaptee.addChildAtDepth(mc, depth);
	        this.registerScriptObject(mc);
	        return mc.adapter;
	    };
	    //createTextField(instanceName: String, depth: Number, x: Number, y: Number, width: Number, height: Number):TextField {}
	    //curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number):void {}
	    AS2MovieClipAdapter.prototype.duplicateMovieClip = function (name, depth, initObject) {
	        var duplicate = this.adaptee.clone().adapter;
	        duplicate.adaptee.name = name;
	        if (initObject)
	            for (var key in initObject)
	                if (duplicate.hasOwnProperty(key))
	                    duplicate[key] = initObject[key];
	        this.adaptee.parent.addChildAtDepth(duplicate.adaptee, depth);
	        return duplicate;
	    };
	    //endFill():void {}
	    //getBounds(bounds: Object):Object { return null; }
	    // not applicable?
	    AS2MovieClipAdapter.prototype.getBytesLoaded = function () { return 1; };
	    // not applicable?
	    AS2MovieClipAdapter.prototype.getBytesTotal = function () { return 1; };
	    AS2MovieClipAdapter.prototype.getInstanceAtDepth = function (depth) {
	        return this.adaptee.getChildAtDepth(depth);
	    };
	    AS2MovieClipAdapter.prototype.getNextHighestDepth = function () {
	        return this.adaptee.getNextHighestDepth();
	    };
	    //getRect(bounds: Object):Object { return null; }
	    //getSWFVersion():number { return 0; }
	    //getTextSnapshot():TextSnapshot {}
	    //getURL(url: string, window: string, method: string):void {}
	    AS2MovieClipAdapter.prototype.globalToLocal = function (pt) {
	        var newPoint = this.adaptee.globalToLocal(new Point_1.default(pt.x, pt.y));
	        pt.x = newPoint.x;
	        pt.y = newPoint.y;
	    };
	    AS2MovieClipAdapter.prototype.gotoAndPlay = function (frame) {
	        if (frame == null)
	            return;
	        this.play();
	        this._gotoFrame(frame);
	    };
	    AS2MovieClipAdapter.prototype.gotoAndStop = function (frame) {
	        if (frame == null)
	            return;
	        this.stop();
	        this._gotoFrame(frame);
	    };
	    AS2MovieClipAdapter.prototype.play = function () {
	        this.adaptee.play();
	    };
	    AS2MovieClipAdapter.prototype.stop = function () {
	        this.adaptee.stop();
	    };
	    AS2MovieClipAdapter.prototype.hitTest = function (x, y, shapeFlag) {
	        if (shapeFlag === void 0) { shapeFlag = false; }
	        return this.adaptee.hitTestPoint(x, y, shapeFlag);
	    };
	    //lineGradientStyle(fillType: string, colors: array, alphas: array, ratios: array, matrix: Object, spreadMethod: string = null, interpolationMethod: string, focalPointRatio: number):void {}
	    //lineStyle(thickness: number, rgb: number, alpha: number, pixelHinting: boolean, noScale: string, capsStyle: string, jointStyle: string, miterLimit: number):void {}
	    //lineTo(x: number, y: number):void {}
	    //loadMovie(url: string, method: string = null):void {}
	    //loadVariables(url: string, method: string = null):void {}
	    AS2MovieClipAdapter.prototype.localToGlobal = function (pt) {
	        var newPoint = this.adaptee.localToGlobal(new Point_1.default(pt.x, pt.y));
	        pt.x = newPoint.x;
	        pt.y = newPoint.y;
	    };
	    //moveTo(x: number, y: number):void {}
	    AS2MovieClipAdapter.prototype.nextFrame = function () {
	        ++this.adaptee.currentFrameIndex;
	    };
	    AS2MovieClipAdapter.prototype.prevFrame = function () {
	        --this.adaptee.currentFrameIndex;
	    };
	    //removeMovieClip():void {}
	    AS2MovieClipAdapter.prototype.setMask = function (mc) {
	        this.adaptee.masks = [mc];
	    };
	    //startDrag(lockCenter: boolean = false, left: number = 0, top: number = 0, right: number = 0, bottom: number = 0):void {}
	    //stopDrag():void {}
	    AS2MovieClipAdapter.prototype.swapDepths = function (target) {
	        var parent = this.adaptee.parent;
	        if (parent != null && target.parent == parent)
	            parent.swapChildren(this.adaptee, target);
	    };
	    //unloadMovie():void {}
	    AS2MovieClipAdapter.prototype.clone = function (newAdaptee) {
	        return new AS2MovieClipAdapter(newAdaptee, this._view);
	    };
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "onEnterFrame", {
	        /**
	         *
	         */
	        get: function () {
	            return this._onEnterFrame;
	        },
	        set: function (value) {
	            this._onEnterFrame = this._replaceEventListener(AssetEvent_1.default.ENTER_FRAME, this._onEnterFrame, value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "onRollOut", {
	        /**
	         *
	         */
	        get: function () {
	            return this._onRollOut;
	        },
	        set: function (value) {
	            this._onRollOut = this._replaceEventListener(MouseEvent_1.default.MOUSE_OUT, this._onRollOut, value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "onRollOver", {
	        /**
	         *
	         */
	        get: function () {
	            return this._onRollOver;
	        },
	        set: function (value) {
	            this._onRollOver = this._replaceEventListener(MouseEvent_1.default.MOUSE_OVER, this._onRollOver, value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "onRelease", {
	        /**
	         *
	         */
	        get: function () {
	            return this._onRelease;
	        },
	        set: function (value) {
	            this._onRelease = this._replaceEventListener(MouseEvent_1.default.MOUSE_UP, this._onRelease, value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "onPress", {
	        /**
	         *
	         */
	        get: function () {
	            return this._onPress;
	        },
	        set: function (value) {
	            this._onPress = this._replaceEventListener(MouseEvent_1.default.MOUSE_DOWN, this._onPress, value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "onMouseDown", {
	        /**
	         *
	         */
	        get: function () {
	            return this._onMouseDown;
	        },
	        set: function (value) {
	            this._onMouseDown = this._replaceEventListener(MouseEvent_1.default.MOUSE_DOWN, this._onMouseDown, value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MovieClipAdapter.prototype, "onMouseUp", {
	        /**
	         *
	         */
	        get: function () {
	            return this._onMouseUp;
	        },
	        set: function (value) {
	            this._onMouseUp = this._replaceEventListener(MouseEvent_1.default.MOUSE_UP, this._onMouseUp, value);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AS2MovieClipAdapter.prototype.registerScriptObject = function (child) {
	        if (child.name)
	            this[child.name] = child.adapter ? child.adapter : child;
	    };
	    AS2MovieClipAdapter.prototype.unregisterScriptObject = function (child) {
	        delete this[child.name];
	        if (child.isAsset(MovieClip_1.default))
	            child.removeButtonListeners();
	    };
	    AS2MovieClipAdapter.prototype._gotoFrame = function (frame) {
	        var mc = this.adaptee;
	        if (typeof frame === "string")
	            mc.jumpToLabel(frame);
	        else
	            mc.currentFrameIndex = frame - 1;
	    };
	    AS2MovieClipAdapter.prototype._replaceEventListener = function (eventType, currentListener, newListener) {
	        var mc = this.adaptee;
	        if (currentListener)
	            mc.removeEventListener(eventType, currentListener);
	        if (newListener) {
	            var self = this;
	            var delegate = function () { return newListener.call(self); };
	            mc.addEventListener(eventType, delegate);
	        }
	        return delegate;
	    };
	    return AS2MovieClipAdapter;
	}(AS2SymbolAdapter_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AS2MovieClipAdapter;


/***/ },

/***/ 302:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ColorTransform_1 = __webpack_require__(19);
	var HierarchicalProperties_1 = __webpack_require__(30);
	var FrameScriptManager_1 = __webpack_require__(56);
	// also contains global AS2 gunctions
	var AS2SymbolAdapter = (function () {
	    function AS2SymbolAdapter(adaptee, view) {
	        this.__quality = "high";
	        this._adaptee = adaptee;
	        this._view = view;
	        this._blockedByScript = false;
	        if (AS2SymbolAdapter.REFERENCE_TIME === -1)
	            AS2SymbolAdapter.REFERENCE_TIME = new Date().getTime();
	    }
	    AS2SymbolAdapter.prototype.isBlockedByScript = function () { return this._blockedByScript; };
	    AS2SymbolAdapter.prototype.isVisibilityByScript = function () { return this._visibilityByScript; };
	    AS2SymbolAdapter.prototype.freeFromScript = function () { this._blockedByScript = false; this._visibilityByScript = false; };
	    AS2SymbolAdapter.prototype.dispose = function () {
	        this._adaptee = null;
	        this._view = null;
	    };
	    AS2SymbolAdapter.prototype.getVersion = function () {
	        return 0;
	    };
	    Object.defineProperty(AS2SymbolAdapter.prototype, "adaptee", {
	        get: function () {
	            return this._adaptee;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_height", {
	        get: function () {
	            return this._adaptee.height;
	        },
	        set: function (value) {
	            this._adaptee.height = value;
	            this._blockedByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_name", {
	        get: function () {
	            return this._adaptee.name;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_rotation", {
	        get: function () {
	            return this._adaptee.rotationZ;
	        },
	        set: function (value) {
	            this._adaptee.rotationZ = value;
	            this._blockedByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_x", {
	        get: function () {
	            return this._adaptee.x;
	        },
	        set: function (value) {
	            this._adaptee.x = value;
	            this._blockedByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_xmouse", {
	        get: function () {
	            return this._view.getLocalMouseX(this._adaptee);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_y", {
	        get: function () {
	            return this._adaptee.y;
	        },
	        set: function (value) {
	            this._adaptee.y = value;
	            this._blockedByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_ymouse", {
	        get: function () {
	            return this._view.getLocalMouseY(this._adaptee);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_xscale", {
	        get: function () {
	            return this._adaptee.scaleX * 100;
	        },
	        set: function (value) {
	            this._adaptee.scaleX = value / 100;
	            this._blockedByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_yscale", {
	        get: function () {
	            return this._adaptee.scaleY * 100;
	        },
	        set: function (value) {
	            this._adaptee.scaleY = value / 100;
	            this._blockedByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_visible", {
	        get: function () {
	            return this._adaptee.visible;
	        },
	        set: function (value) {
	            this._adaptee.visible = value;
	            this._visibilityByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_width", {
	        get: function () {
	            return this._adaptee.width;
	        },
	        set: function (value) {
	            this._adaptee.width = value;
	            this._blockedByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_touchpoints", {
	        get: function () {
	            return this._view.getLocalTouchPoints(this._adaptee);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AS2SymbolAdapter.prototype.getDepth = function () {
	        return this._adaptee.z;
	    };
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_quality", {
	        // just assure consistency for scripts, doesn't actually effect rendering.
	        get: function () {
	            return this.__quality;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "quality", {
	        set: function (value) {
	            this.__quality = value;
	            // this._blockedByScript=true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AS2SymbolAdapter.prototype.trace = function (message) {
	        console.log(message);
	    };
	    // may need proper high-def timer mechanism
	    AS2SymbolAdapter.prototype.getTimer = function () {
	        return new Date().getTime() - AS2SymbolAdapter.REFERENCE_TIME;
	    };
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_alpha", {
	        get: function () {
	            return this.adaptee.transform.colorTransform ? (this.adaptee.transform.colorTransform.alphaMultiplier * 100) : 100;
	        },
	        set: function (value) {
	            if (!this.adaptee.transform.colorTransform)
	                this.adaptee.transform.colorTransform = new ColorTransform_1.default();
	            this.adaptee.transform.colorTransform.alphaMultiplier = value / 100;
	            this.adaptee.pInvalidateHierarchicalProperties(HierarchicalProperties_1.default.COLOR_TRANSFORM);
	            this._blockedByScript = true;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_url", {
	        get: function () {
	            return document.URL;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_global", {
	        get: function () {
	            return null;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_level0", {
	        get: function () {
	            return this._root;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AS2SymbolAdapter.prototype.clearInterval = function (handle) {
	        FrameScriptManager_1.default.clearInterval(handle); //window.clearInterval(handle);
	        return;
	    };
	    AS2SymbolAdapter.prototype.setInterval = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        var scope;
	        var func;
	        if (typeof (args[0]) == "function") {
	            scope = this;
	            func = args[0];
	        }
	        else {
	            //remove scope variable from args
	            scope = args.shift();
	            //reformat function string to actual function variable in the scope
	            func = scope[args[0]];
	        }
	        //wrap function to maintain scope
	        args[0] = function () { func.apply(scope, arguments); };
	        return FrameScriptManager_1.default.setInterval(args[0]); // window.setInterval.apply(window, args);
	    };
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_level10301", {
	        // temporary:
	        get: function () {
	            return this._root;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_root", {
	        get: function () {
	            if (!this.__root) {
	                var p = this._parent;
	                // parents are always MovieClips
	                this.__root = p ? p._root : this;
	            }
	            return this.__root;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AS2SymbolAdapter.prototype.random = function (range) {
	        return Math.floor(Math.random() * range);
	    };
	    Object.defineProperty(AS2SymbolAdapter.prototype, "_parent", {
	        get: function () {
	            var parent = this.adaptee.parent;
	            return parent ? parent.adapter : null;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AS2SymbolAdapter.REFERENCE_TIME = -1;
	    return AS2SymbolAdapter;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AS2SymbolAdapter;


/***/ },

/***/ 303:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var AssetEvent_1 = __webpack_require__(1);
	var AssetBase_1 = __webpack_require__(27);
	var AS2MCSoundProps = (function (_super) {
	    __extends(AS2MCSoundProps, _super);
	    function AS2MCSoundProps() {
	        _super.call(this);
	        this._volume = 1;
	        this._pan = 1;
	        this._changeEvent = new AssetEvent_1.default(AssetEvent_1.default.INVALIDATE, this);
	    }
	    AS2MCSoundProps.prototype.dispose = function () {
	        this._audio = null;
	        this._changeEvent = null;
	    };
	    Object.defineProperty(AS2MCSoundProps.prototype, "volume", {
	        get: function () {
	            return this._volume;
	        },
	        set: function (value) {
	            if (this._volume != value) {
	                this._volume = value;
	                this.dispatchEvent(this._changeEvent);
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MCSoundProps.prototype, "pan", {
	        get: function () {
	            return this._pan;
	        },
	        set: function (value) {
	            if (this._pan != value) {
	                this._pan = value;
	                this.dispatchEvent(this._changeEvent);
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AS2MCSoundProps.prototype, "audio", {
	        get: function () {
	            return this._audio;
	        },
	        set: function (value) {
	            if (this._audio)
	                this._audio.stop();
	            this._audio = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return AS2MCSoundProps;
	}(AssetBase_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AS2MCSoundProps;


/***/ }

});