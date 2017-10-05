webpackJsonp([4],{

/***/ 37:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__ = __webpack_require__(2);
/*

Shading example in Away3d

Demonstrates:

How to create multiple entitiesources in a scene.
How to apply specular maps, normals maps and diffuse texture maps to a material.

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






/**
 *
 */
var Intermediate_MouseInteraction = function () {
    /**
     * Constructor
     */
    function Intermediate_MouseInteraction() {
        this._time = 0;
        this._raycastPicker = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["RaycastPicker"](false);
        //navigation variables
        this._move = false;
        this._tiltSpeed = 4;
        this._panSpeed = 4;
        this._distanceSpeed = 4;
        this._tiltIncrement = 0;
        this._panIncrement = 0;
        this._distanceIncrement = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    Intermediate_MouseInteraction.prototype.init = function () {
        this.initEngine();
        this.initLights();
        this.initMaterials();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    Intermediate_MouseInteraction.prototype.initEngine = function () {
        this._view = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["View"]();
        this._view.forceMouseMove = true;
        this._scene = this._view.scene;
        this._camera = this._view.camera;
        this._view.mousePicker = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["RaycastPicker"](true);
        //setup controller to be used on the camera
        this._cameraController = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["HoverController"](this._camera, null, 180, 20, 320, 5);
    };
    /**
     * Initialise the lights
     */
    Intermediate_MouseInteraction.prototype.initLights = function () {
        //create a light for the camera
        this._pointLight = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PointLight"]();
        this._scene.addChild(this._pointLight);
        this._lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([this._pointLight]);
    };
    /**
     * Initialise the material
     */
    Intermediate_MouseInteraction.prototype.initMaterials = function () {
        // uv painter
        //this._painter = new Sprite();
        //this._painter.graphics.beginFill( 0xFF0000 );
        //this._painter.graphics.drawCircle( 0, 0, 10 );
        //this._painter.graphics.endFill();
        // locator materials
        this._whiteMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](0xFFFFFF);
        this._whiteMaterial.lightPicker = this._lightPicker;
        this._blackMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](0x333333);
        this._blackMaterial.lightPicker = this._lightPicker;
        this._grayMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](0xCCCCCC);
        this._grayMaterial.lightPicker = this._lightPicker;
        this._blueMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](0x0000FF);
        this._blueMaterial.lightPicker = this._lightPicker;
        this._redMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](0xFF0000);
        this._redMaterial.lightPicker = this._lightPicker;
    };
    /**
     * Initialise the scene objects
     */
    Intermediate_MouseInteraction.prototype.initObjects = function () {
        var _this = this;
        // To trace mouse hit position.
        this._pickingPositionTracer = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveSpherePrefab"](new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](0x00FF00, 0.5), __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 2).getNewObject();
        this._pickingPositionTracer.visible = false;
        this._pickingPositionTracer.mouseEnabled = false;
        this._pickingPositionTracer.mouseChildren = false;
        this._scene.addChild(this._pickingPositionTracer);
        this._scenePositionTracer = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveSpherePrefab"](new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](0x0000FF, 0.5), __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 2).getNewObject();
        this._scenePositionTracer.visible = false;
        this._scenePositionTracer.mouseEnabled = false;
        this._scene.addChild(this._scenePositionTracer);
        // To trace picking normals.
        this._pickingNormalTracer = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["LineSegment"](new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["BasicMaterial"](0xFFFFFF), new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](), new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](), 3);
        this._pickingNormalTracer.mouseEnabled = false;
        this._pickingNormalTracer.visible = false;
        this._view.scene.addChild(this._pickingNormalTracer);
        this._sceneNormalTracer = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["LineSegment"](new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["BasicMaterial"](0xFFFFFF), new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](), new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](), 3);
        this._sceneNormalTracer.mouseEnabled = false;
        this._sceneNormalTracer.visible = false;
        this._view.scene.addChild(this._sceneNormalTracer);
        // Load a head model that we will be able to paint on on mouse down.
        this._session = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].getLoader();
        this._session.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetEvent"].ASSET_COMPLETE, function (event) {
            return _this.onAssetComplete(event);
        });
        this._session.load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]('assets/head.obj'), null, null, new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_parsers__["OBJParser"](25));
        // Produce a bunch of objects to be around the scene.
        this.createABunchOfObjects();
        this._raycastPicker.setIgnoreList([this._sceneNormalTracer, this._scenePositionTracer]);
        this._raycastPicker.onlyMouseEnabled = false;
    };
    /**
     * Listener for asset complete event on loader
     */
    Intermediate_MouseInteraction.prototype.onAssetComplete = function (event) {
        if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Sprite"])) {
            this.initializeHeadModel(event.asset);
        }
    };
    Intermediate_MouseInteraction.prototype.initializeHeadModel = function (model) {
        this._head = model;
        // Apply a bitmap material that can be painted on.
        var bmd = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["BitmapImage2D"](Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, false, 0xCCCCCC);
        //bmd.perlinNoise(50, 50, 8, 1, false, true, 7, true);
        var textureMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"](bmd);
        textureMaterial.lightPicker = this._lightPicker;
        model.material = textureMaterial;
        // Apply mouse interactivity.
        model.mouseEnabled = model.mouseChildren = true;
        this.enableSpriteMouseListeners(model);
        this._view.scene.addChild(model);
        this._view.setCollider(model, new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["JSPickingCollider"]());
    };
    Intermediate_MouseInteraction.prototype.createABunchOfObjects = function () {
        this._cubePrefab = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveCubePrefab"](null, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 25, 50, 25);
        this._spherePrefab = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveSpherePrefab"](null, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 12);
        this._cylinderPrefab = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveCylinderPrefab"](null, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 12, 12, 25);
        this._torusPrefab = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitiveTorusPrefab"](null, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 12, 12);
        for (var i = 0; i < 40; i++) {
            // Create object.
            var object = this.createSimpleObject();
            // Random orientation.
            //object.rotationX = 360*Math.random();
            //object.rotationY = 360*Math.random();
            object.rotationZ = 360 * Math.random();
            // Random position.
            var r = 200 + 100 * Math.random();
            var azimuth = 2 * Math.PI * Math.random();
            var elevation = 0.25 * Math.PI * Math.random();
            object.x = r * Math.cos(elevation) * Math.sin(azimuth);
            object.y = r * Math.sin(elevation);
            object.z = r * Math.cos(elevation) * Math.cos(azimuth);
        }
    };
    Intermediate_MouseInteraction.prototype.createSimpleObject = function () {
        var sprite;
        var boundsType;
        // Chose a random sprite.
        var randGeometry = Math.random();
        if (randGeometry > 0.75) {
            sprite = this._cubePrefab.getNewObject();
        } else if (randGeometry > 0.5) {
            sprite = this._spherePrefab.getNewObject();
            boundsType = __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["BoundsType"].SPHERE; // better on spherical sprites with bound picking colliders
        } else if (randGeometry > 0.25) {
            sprite = this._cylinderPrefab.getNewObject();
        } else {
            sprite = this._torusPrefab.getNewObject();
        }
        if (boundsType) sprite.boundsType = boundsType;
        // Enable mouse interactivity?
        var isMouseEnabled = Math.random() > 0.25;
        sprite.mouseEnabled = sprite.mouseChildren = isMouseEnabled;
        // Enable mouse listeners?
        var listensToMouseEvents = Math.random() > 0.25;
        if (isMouseEnabled && listensToMouseEvents) {
            this.enableSpriteMouseListeners(sprite);
        }
        // Add to scene and store.
        this._view.scene.addChild(sprite);
        // Randomly decide if the sprite has a triangle collider.
        var usesTriangleCollider = Math.random() > 0.5;
        if (usesTriangleCollider) {
            this._view.setCollider(sprite, new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["JSPickingCollider"]());
        }
        // Apply material according to the random setup of the object.
        this.choseSpriteMaterial(sprite);
        return sprite;
    };
    Intermediate_MouseInteraction.prototype.choseSpriteMaterial = function (sprite) {
        if (!sprite.mouseEnabled) {
            sprite.material = this._blackMaterial;
        } else {
            if (!sprite.hasEventListener(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["MouseEvent"].MOUSE_MOVE)) {
                sprite.material = this._grayMaterial;
            } else {
                if (this._view.getCollider(sprite) != null) sprite.material = this._redMaterial;else sprite.material = this._blueMaterial;
            }
        }
    };
    /**
     * Initialise the listeners
     */
    Intermediate_MouseInteraction.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        document.onmousedown = function (event) {
            return _this.onMouseDown(event);
        };
        document.onmouseup = function (event) {
            return _this.onMouseUp(event);
        };
        document.onmousemove = function (event) {
            return _this.onMouseMove(event);
        };
        document.onmousewheel = function (event) {
            return _this.onMouseWheel(event);
        };
        document.onkeydown = function (event) {
            return _this.onKeyDown(event);
        };
        document.onkeyup = function (event) {
            return _this.onKeyUp(event);
        };
        this.onResize();
        this._timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * Navigation and render loop
     */
    Intermediate_MouseInteraction.prototype.onEnterFrame = function (dt) {
        // Move light with camera.
        var pos = this._camera.transform.position;
        this._pointLight.transform.moveTo(pos.x, pos.y, pos.z);
        var collidingObject = this._raycastPicker.getCollision(this._camera.transform.position, this._view.camera.transform.forwardVector, this._view);
        //var sprite:Sprite;
        if (this._previoiusCollidingObject && this._previoiusCollidingObject != collidingObject) {
            this._scenePositionTracer.visible = this._sceneNormalTracer.visible = false;
            this._scenePositionTracer.transform.moveTo(0, 0, 0);
        }
        if (collidingObject) {
            // Show tracers.
            this._scenePositionTracer.visible = this._sceneNormalTracer.visible = true;
            // Update position tracer.
            pos = collidingObject.entity.transform.concatenatedMatrix3D.transformVector(collidingObject.position);
            this._scenePositionTracer.transform.moveTo(pos.x, pos.y, pos.z);
            // Update normal tracer.
            pos = this._scenePositionTracer.transform.position;
            this._sceneNormalTracer.transform.moveTo(pos.x, pos.y, pos.z);
            var normal = collidingObject.entity.transform.concatenatedMatrix3D.deltaTransformVector(collidingObject.normal);
            normal.normalize();
            normal.scaleBy(25);
            this._sceneNormalTracer.endPosition = normal.clone();
        }
        this._previoiusCollidingObject = collidingObject;
        // Render 3D.
        this._view.render();
    };
    /**
     * Key down listener for camera control
     */
    Intermediate_MouseInteraction.prototype.onKeyDown = function (event) {
        switch (event.keyCode) {
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].UP:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].W:
                this._tiltIncrement = this._tiltSpeed;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].DOWN:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].S:
                this._tiltIncrement = -this._tiltSpeed;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].LEFT:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].A:
                this._panIncrement = this._panSpeed;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].RIGHT:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].D:
                this._panIncrement = -this._panSpeed;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].Z:
                this._distanceIncrement = this._distanceSpeed;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].X:
                this._distanceIncrement = -this._distanceSpeed;
                break;
        }
    };
    /**
     * Key up listener for camera control
     */
    Intermediate_MouseInteraction.prototype.onKeyUp = function (event) {
        switch (event.keyCode) {
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].UP:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].W:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].DOWN:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].S:
                this._tiltIncrement = 0;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].LEFT:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].A:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].RIGHT:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].D:
                this._panIncrement = 0;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].Z:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].X:
                this._distanceIncrement = 0;
                break;
        }
    };
    // ---------------------------------------------------------------------
    // 3D mouse event handlers.
    // ---------------------------------------------------------------------
    Intermediate_MouseInteraction.prototype.enableSpriteMouseListeners = function (sprite) {
        var _this = this;
        sprite.addEventListener(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["MouseEvent"].MOUSE_OVER, function (event) {
            return _this.onSpriteMouseOver(event);
        });
        sprite.addEventListener(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["MouseEvent"].MOUSE_OUT, function (event) {
            return _this.onSpriteMouseOut(event);
        });
        sprite.addEventListener(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["MouseEvent"].MOUSE_MOVE, function (event) {
            return _this.onSpriteMouseMove(event);
        });
        sprite.addEventListener(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["MouseEvent"].MOUSE_DOWN, function (event) {
            return _this.onSpriteMouseDown(event);
        });
    };
    /**
     * sprite listener for mouse down interaction
     */
    Intermediate_MouseInteraction.prototype.onSpriteMouseDown = function (event) {
        //var sprite:Sprite = <Sprite> event.object;
        //// Paint on the head's material.
        //if( sprite == this._head ) {
        //	var uv:Point = event.uv;
        //	var textureMaterial:MethodMaterial = (<MethodMaterial> (<Sprite> event.object).material);
        //	var bmd:BitmapData = Single2DTexture( textureMaterial.texture ).bitmapData;
        //	var x:number = Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE*uv.x;
        //	var y:number = Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE*uv.y;
        //	var matrix:Matrix = new Matrix();
        //	matrix.translate(x, y);
        //	bmd.draw(this._painter, matrix);
        //	Single2DTexture(textureMaterial.texture).invalidateContent();
        //}
    };
    /**
     * sprite listener for mouse over interaction
     */
    Intermediate_MouseInteraction.prototype.onSpriteMouseOver = function (event) {
        var sprite = event.entity;
        sprite.debugVisible = true;
        if (sprite != this._head) sprite.material = this._whiteMaterial;
        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
        this.onSpriteMouseMove(event);
    };
    /**
     * sprite listener for mouse out interaction
     */
    Intermediate_MouseInteraction.prototype.onSpriteMouseOut = function (event) {
        var sprite = event.entity;
        sprite.debugVisible = false;
        if (sprite != this._head) this.choseSpriteMaterial(sprite);
        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = false;
        this._pickingPositionTracer.transform.moveTo(0, 0, 0);
    };
    /**
     * sprite listener for mouse move interaction
     */
    Intermediate_MouseInteraction.prototype.onSpriteMouseMove = function (event) {
        var pos;
        // Show tracers.
        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
        // Update position tracer.
        pos = event.scenePosition;
        this._pickingPositionTracer.transform.moveTo(pos.x, pos.y, pos.z);
        // Update normal tracer.
        pos = this._pickingPositionTracer.transform.position;
        this._pickingNormalTracer.transform.moveTo(pos.x, pos.y, pos.z);
        var normal = event.sceneNormal.clone();
        normal.scaleBy(25);
        this._pickingNormalTracer.endPosition = normal.clone();
    };
    /**
     * Mouse down listener for navigation
     */
    Intermediate_MouseInteraction.prototype.onMouseDown = function (event) {
        this._lastPanAngle = this._cameraController.panAngle;
        this._lastTiltAngle = this._cameraController.tiltAngle;
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
        this._move = true;
    };
    /**
     * Mouse up listener for navigation
     */
    Intermediate_MouseInteraction.prototype.onMouseUp = function (event) {
        this._move = false;
    };
    /**
     * Mouse move listener for navigation
     */
    Intermediate_MouseInteraction.prototype.onMouseMove = function (event) {
        if (this._move) {
            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
        }
    };
    /**
     * Mouse wheel listener for navigation
     */
    Intermediate_MouseInteraction.prototype.onMouseWheel = function (event) {
        this._cameraController.distance -= event.wheelDelta;
        if (this._cameraController.distance < 100) this._cameraController.distance = 100;else if (this._cameraController.distance > 2000) this._cameraController.distance = 2000;
    };
    /**
     * window listener for resize events
     */
    Intermediate_MouseInteraction.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Intermediate_MouseInteraction;
}();
Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE = 1024;
window.onload = function () {
    new Intermediate_MouseInteraction();
};

/***/ })

},[37]);
//# sourceMappingURL=Intermediate_MouseInteraction.js.map