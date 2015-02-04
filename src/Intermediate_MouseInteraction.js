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
var BitmapData = require("awayjs-core/lib/base/BitmapData");
var BoundingSphere = require("awayjs-core/lib/bounds/BoundingSphere");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetType = require("awayjs-core/lib/library/AssetType");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var BitmapTexture = require("awayjs-core/lib/textures/BitmapTexture");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Keyboard = require("awayjs-core/lib/ui/Keyboard");
var View = require("awayjs-display/lib/containers/View");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var LineSegment = require("awayjs-display/lib/entities/LineSegment");
var PointLight = require("awayjs-display/lib/entities/PointLight");
var AwayMouseEvent = require("awayjs-display/lib/events/MouseEvent");
var BasicMaterial = require("awayjs-display/lib/materials/BasicMaterial");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var RaycastPicker = require("awayjs-display/lib/pick/RaycastPicker");
var PrimitiveCubePrefab = require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");
var PrimitiveCylinderPrefab = require("awayjs-display/lib/prefabs/PrimitiveCylinderPrefab");
var PrimitiveSpherePrefab = require("awayjs-display/lib/prefabs/PrimitiveSpherePrefab");
var PrimitiveTorusPrefab = require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var JSPickingCollider = require("awayjs-renderergl/lib/pick/JSPickingCollider");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
var OBJParser = require("awayjs-parsers/lib/OBJParser");
/**
 *
 */
var Intermediate_MouseInteraction = (function () {
    /**
     * Constructor
     */
    function Intermediate_MouseInteraction() {
        this._time = 0;
        this._raycastPicker = new RaycastPicker(false);
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
        this._renderer = new DefaultRenderer(MethodRendererPool);
        this._view = new View(this._renderer);
        this._view.forceMouseMove = true;
        this._scene = this._view.scene;
        this._camera = this._view.camera;
        this._view.mousePicker = new RaycastPicker(true);
        //setup controller to be used on the camera
        this._cameraController = new HoverController(this._camera, null, 180, 20, 320, 5);
    };
    /**
     * Initialise the lights
     */
    Intermediate_MouseInteraction.prototype.initLights = function () {
        //create a light for the camera
        this._pointLight = new PointLight();
        this._scene.addChild(this._pointLight);
        this._lightPicker = new StaticLightPicker([this._pointLight]);
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
        this._whiteMaterial = new MethodMaterial(0xFFFFFF);
        this._whiteMaterial.lightPicker = this._lightPicker;
        this._blackMaterial = new MethodMaterial(0x333333);
        this._blackMaterial.lightPicker = this._lightPicker;
        this._grayMaterial = new MethodMaterial(0xCCCCCC);
        this._grayMaterial.lightPicker = this._lightPicker;
        this._blueMaterial = new MethodMaterial(0x0000FF);
        this._blueMaterial.lightPicker = this._lightPicker;
        this._redMaterial = new MethodMaterial(0xFF0000);
        this._redMaterial.lightPicker = this._lightPicker;
    };
    /**
     * Initialise the scene objects
     */
    Intermediate_MouseInteraction.prototype.initObjects = function () {
        var _this = this;
        // To trace mouse hit position.
        this._pickingPositionTracer = new PrimitiveSpherePrefab(2).getNewObject();
        this._pickingPositionTracer.material = new MethodMaterial(0x00FF00, 0.5);
        this._pickingPositionTracer.visible = false;
        this._pickingPositionTracer.mouseEnabled = false;
        this._pickingPositionTracer.mouseChildren = false;
        this._scene.addChild(this._pickingPositionTracer);
        this._scenePositionTracer = new PrimitiveSpherePrefab(2).getNewObject();
        this._pickingPositionTracer.material = new MethodMaterial(0x0000FF, 0.5);
        this._scenePositionTracer.visible = false;
        this._scenePositionTracer.mouseEnabled = false;
        this._scene.addChild(this._scenePositionTracer);
        // To trace picking normals.
        this._pickingNormalTracer = new LineSegment(new BasicMaterial(0xFFFFFF), new Vector3D(), new Vector3D(), 3);
        this._pickingNormalTracer.mouseEnabled = false;
        this._pickingNormalTracer.visible = false;
        this._view.scene.addChild(this._pickingNormalTracer);
        this._sceneNormalTracer = new LineSegment(new BasicMaterial(0xFFFFFF), new Vector3D(), new Vector3D(), 3);
        this._sceneNormalTracer.mouseEnabled = false;
        this._sceneNormalTracer.visible = false;
        this._view.scene.addChild(this._sceneNormalTracer);
        // Load a head model that we will be able to paint on on mouse down.
        this._token = AssetLibrary.load(new URLRequest('assets/head.obj'), null, null, new OBJParser(25));
        this._token.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        // Produce a bunch of objects to be around the scene.
        this.createABunchOfObjects();
        this._raycastPicker.setIgnoreList([this._sceneNormalTracer, this._scenePositionTracer]);
        this._raycastPicker.onlyMouseEnabled = false;
    };
    /**
     * Listener for asset complete event on loader
     */
    Intermediate_MouseInteraction.prototype.onAssetComplete = function (event) {
        if (event.asset.assetType == AssetType.MESH) {
            this.initializeHeadModel(event.asset);
        }
    };
    Intermediate_MouseInteraction.prototype.initializeHeadModel = function (model) {
        this._head = model;
        // Apply a bitmap material that can be painted on.
        var bmd = new BitmapData(Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE, false, 0xCCCCCC);
        //bmd.perlinNoise(50, 50, 8, 1, false, true, 7, true);
        var bitmapTexture = new BitmapTexture(bmd);
        var textureMaterial = new MethodMaterial(bitmapTexture);
        textureMaterial.lightPicker = this._lightPicker;
        model.material = textureMaterial;
        model.pickingCollider = new JSPickingCollider(this._renderer.stage);
        // Apply mouse interactivity.
        model.mouseEnabled = model.mouseChildren = true;
        this.enableMeshMouseListeners(model);
        this._view.scene.addChild(model);
    };
    Intermediate_MouseInteraction.prototype.createABunchOfObjects = function () {
        this._cubePrefab = new PrimitiveCubePrefab(25, 50, 25);
        this._spherePrefab = new PrimitiveSpherePrefab(12);
        this._cylinderPrefab = new PrimitiveCylinderPrefab(12, 12, 25);
        this._torusPrefab = new PrimitiveTorusPrefab(12, 12);
        for (var i = 0; i < 40; i++) {
            // Create object.
            var object = this.createSimpleObject();
            // Random orientation.
            object.rotationX = 360 * Math.random();
            object.rotationY = 360 * Math.random();
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
        var mesh;
        var bounds;
        // Chose a random mesh.
        var randGeometry = Math.random();
        if (randGeometry > 0.75) {
            mesh = this._cubePrefab.getNewObject();
        }
        else if (randGeometry > 0.5) {
            mesh = this._spherePrefab.getNewObject();
            bounds = new BoundingSphere(); // better on spherical meshes with bound picking colliders
        }
        else if (randGeometry > 0.25) {
            mesh = this._cylinderPrefab.getNewObject();
        }
        else {
            mesh = this._torusPrefab.getNewObject();
        }
        if (bounds)
            mesh.bounds = bounds;
        // Randomly decide if the mesh has a triangle collider.
        var usesTriangleCollider = Math.random() > 0.5;
        if (usesTriangleCollider) {
            // AS3 triangle pickers for meshes with low poly counts are faster than pixel bender ones.
            //				mesh.pickingCollider = PickingColliderType.BOUNDS_ONLY; // this is the default value for all meshes
            mesh.pickingCollider = new JSPickingCollider(this._renderer.stage);
        }
        // Enable mouse interactivity?
        var isMouseEnabled = Math.random() > 0.25;
        mesh.mouseEnabled = mesh.mouseChildren = isMouseEnabled;
        // Enable mouse listeners?
        var listensToMouseEvents = Math.random() > 0.25;
        if (isMouseEnabled && listensToMouseEvents) {
            this.enableMeshMouseListeners(mesh);
        }
        // Apply material according to the random setup of the object.
        this.choseMeshMaterial(mesh);
        // Add to scene and store.
        this._view.scene.addChild(mesh);
        return mesh;
    };
    Intermediate_MouseInteraction.prototype.choseMeshMaterial = function (mesh) {
        if (!mesh.mouseEnabled) {
            mesh.material = this._blackMaterial;
        }
        else {
            if (!mesh.hasEventListener(AwayMouseEvent.MOUSE_MOVE)) {
                mesh.material = this._grayMaterial;
            }
            else {
                if (mesh.pickingCollider != null) {
                    mesh.material = this._redMaterial;
                }
                else {
                    mesh.material = this._blueMaterial;
                }
            }
        }
    };
    /**
     * Initialise the listeners
     */
    Intermediate_MouseInteraction.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
        document.onmouseup = function (event) { return _this.onMouseUp(event); };
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        document.onmousewheel = function (event) { return _this.onMouseWheel(event); };
        document.onkeydown = function (event) { return _this.onKeyDown(event); };
        document.onkeyup = function (event) { return _this.onKeyUp(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * Navigation and render loop
     */
    Intermediate_MouseInteraction.prototype.onEnterFrame = function (dt) {
        // Move light with camera.
        this._pointLight.transform.position = this._camera.transform.position;
        var collidingObject = this._raycastPicker.getSceneCollision(this._camera.transform.position, this._view.camera.transform.forwardVector, this._view.scene);
        //var mesh:Mesh;
        if (this._previoiusCollidingObject && this._previoiusCollidingObject != collidingObject) {
            this._scenePositionTracer.visible = this._sceneNormalTracer.visible = false;
            this._scenePositionTracer.transform.position = new Vector3D();
        }
        if (collidingObject) {
            // Show tracers.
            this._scenePositionTracer.visible = this._sceneNormalTracer.visible = true;
            // Update position tracer.
            this._scenePositionTracer.transform.position = collidingObject.displayObject.sceneTransform.transformVector(collidingObject.localPosition);
            // Update normal tracer.
            this._sceneNormalTracer.transform.position = this._scenePositionTracer.transform.position;
            var normal = collidingObject.displayObject.sceneTransform.deltaTransformVector(collidingObject.localNormal);
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
            case Keyboard.UP:
            case Keyboard.W:
                this._tiltIncrement = this._tiltSpeed;
                break;
            case Keyboard.DOWN:
            case Keyboard.S:
                this._tiltIncrement = -this._tiltSpeed;
                break;
            case Keyboard.LEFT:
            case Keyboard.A:
                this._panIncrement = this._panSpeed;
                break;
            case Keyboard.RIGHT:
            case Keyboard.D:
                this._panIncrement = -this._panSpeed;
                break;
            case Keyboard.Z:
                this._distanceIncrement = this._distanceSpeed;
                break;
            case Keyboard.X:
                this._distanceIncrement = -this._distanceSpeed;
                break;
        }
    };
    /**
     * Key up listener for camera control
     */
    Intermediate_MouseInteraction.prototype.onKeyUp = function (event) {
        switch (event.keyCode) {
            case Keyboard.UP:
            case Keyboard.W:
            case Keyboard.DOWN:
            case Keyboard.S:
                this._tiltIncrement = 0;
                break;
            case Keyboard.LEFT:
            case Keyboard.A:
            case Keyboard.RIGHT:
            case Keyboard.D:
                this._panIncrement = 0;
                break;
            case Keyboard.Z:
            case Keyboard.X:
                this._distanceIncrement = 0;
                break;
        }
    };
    // ---------------------------------------------------------------------
    // 3D mouse event handlers.
    // ---------------------------------------------------------------------
    Intermediate_MouseInteraction.prototype.enableMeshMouseListeners = function (mesh) {
        var _this = this;
        mesh.addEventListener(AwayMouseEvent.MOUSE_OVER, function (event) { return _this.onMeshMouseOver(event); });
        mesh.addEventListener(AwayMouseEvent.MOUSE_OUT, function (event) { return _this.onMeshMouseOut(event); });
        mesh.addEventListener(AwayMouseEvent.MOUSE_MOVE, function (event) { return _this.onMeshMouseMove(event); });
        mesh.addEventListener(AwayMouseEvent.MOUSE_DOWN, function (event) { return _this.onMeshMouseDown(event); });
    };
    /**
     * mesh listener for mouse down interaction
     */
    Intermediate_MouseInteraction.prototype.onMeshMouseDown = function (event) {
        //var mesh:Mesh = <Mesh> event.object;
        //// Paint on the head's material.
        //if( mesh == this._head ) {
        //	var uv:Point = event.uv;
        //	var textureMaterial:MethodMaterial = (<MethodMaterial> (<Mesh> event.object).material);
        //	var bmd:BitmapData = BitmapTexture( textureMaterial.texture ).bitmapData;
        //	var x:number = Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE*uv.x;
        //	var y:number = Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE*uv.y;
        //	var matrix:Matrix = new Matrix();
        //	matrix.translate(x, y);
        //	bmd.draw(this._painter, matrix);
        //	BitmapTexture(textureMaterial.texture).invalidateContent();
        //}
    };
    /**
     * mesh listener for mouse over interaction
     */
    Intermediate_MouseInteraction.prototype.onMeshMouseOver = function (event) {
        var mesh = event.object;
        mesh.boundsVisible = true;
        if (mesh != this._head)
            mesh.material = this._whiteMaterial;
        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
        this.onMeshMouseMove(event);
    };
    /**
     * mesh listener for mouse out interaction
     */
    Intermediate_MouseInteraction.prototype.onMeshMouseOut = function (event) {
        var mesh = event.object;
        mesh.boundsVisible = false;
        if (mesh != this._head)
            this.choseMeshMaterial(mesh);
        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = false;
        this._pickingPositionTracer.transform.position = new Vector3D();
    };
    /**
     * mesh listener for mouse move interaction
     */
    Intermediate_MouseInteraction.prototype.onMeshMouseMove = function (event) {
        // Show tracers.
        this._pickingPositionTracer.visible = this._pickingNormalTracer.visible = true;
        // Update position tracer.
        this._pickingPositionTracer.transform.position = event.scenePosition;
        // Update normal tracer.
        this._pickingNormalTracer.transform.position = this._pickingPositionTracer.transform.position;
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
        if (this._cameraController.distance < 100)
            this._cameraController.distance = 100;
        else if (this._cameraController.distance > 2000)
            this._cameraController.distance = 2000;
    };
    /**
     * window listener for resize events
     */
    Intermediate_MouseInteraction.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    Intermediate_MouseInteraction.PAINT_TEXTURE_SIZE = 1024;
    return Intermediate_MouseInteraction;
})();
window.onload = function () {
    new Intermediate_MouseInteraction();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi50cyJdLCJuYW1lcyI6WyJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbiIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmluaXRFbmdpbmUiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdE1hdGVyaWFscyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmluaXRPYmplY3RzIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Bc3NldENvbXBsZXRlIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdGlhbGl6ZUhlYWRNb2RlbCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNyZWF0ZUFCdW5jaE9mT2JqZWN0cyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNyZWF0ZVNpbXBsZU9iamVjdCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNob3NlTWVzaE1hdGVyaWFsIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uRW50ZXJGcmFtZSIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uS2V5RG93biIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uS2V5VXAiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5lbmFibGVNZXNoTW91c2VMaXN0ZW5lcnMiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZURvd24iLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZU92ZXIiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZU91dCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uTWVzaE1vdXNlTW92ZSIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uTW91c2VEb3duIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Nb3VzZVVwIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Nb3VzZU1vdmUiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1vdXNlV2hlZWwiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vblJlc2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBbUNFO0FBRUYsSUFBTyxVQUFVLFdBQWUsaUNBQWlDLENBQUMsQ0FBQztBQUNuRSxJQUFPLGNBQWMsV0FBYyx1Q0FBdUMsQ0FBQyxDQUFDO0FBRTVFLElBQU8sVUFBVSxXQUFlLG1DQUFtQyxDQUFDLENBQUM7QUFDckUsSUFBTyxRQUFRLFdBQWdCLCtCQUErQixDQUFDLENBQUM7QUFDaEUsSUFBTyxZQUFZLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQUcxRSxJQUFPLFNBQVMsV0FBZSxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3BFLElBQU8sVUFBVSxXQUFlLGdDQUFnQyxDQUFDLENBQUM7QUFDbEUsSUFBTyxhQUFhLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUM1RSxJQUFPLHFCQUFxQixXQUFZLDZDQUE2QyxDQUFDLENBQUM7QUFDdkYsSUFBTyxRQUFRLFdBQWdCLDZCQUE2QixDQUFDLENBQUM7QUFJOUQsSUFBTyxJQUFJLFdBQWlCLG9DQUFvQyxDQUFDLENBQUM7QUFDbEUsSUFBTyxlQUFlLFdBQWMsZ0RBQWdELENBQUMsQ0FBQztBQUd0RixJQUFPLFdBQVcsV0FBZSx5Q0FBeUMs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QSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN6RUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMxQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMvQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUdoREEsQUFDQUEsNEJBRDRCQTtRQUM1QkEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1R0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMvQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMxQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUVyREEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUM3Q0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN4Q0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEs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QSxDQUFDQTtJQUN4Q0EsQ0FBQ0E7SUF6ZWN6QixnREFBa0JBLEdBQVVBLElBQUlBLENBQUNBO0lBMGVqREEsb0NBQUNBO0FBQURBLENBN2hCQSxBQTZoQkNBLElBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxHQUFHO0lBRWYsSUFBSSw2QkFBNkIsRUFBRSxDQUFDO0FBQ3JDLENBQUMsQ0FBQSIsImZpbGUiOiJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5cblNoYWRpbmcgZXhhbXBsZSBpbiBBd2F5M2RcblxuRGVtb25zdHJhdGVzOlxuXG5Ib3cgdG8gY3JlYXRlIG11bHRpcGxlIGVudGl0aWVzb3VyY2VzIGluIGEgc2NlbmUuXG5Ib3cgdG8gYXBwbHkgc3BlY3VsYXIgbWFwcywgbm9ybWFscyBtYXBzIGFuZCBkaWZmdXNlIHRleHR1cmUgbWFwcyB0byBhIG1hdGVyaWFsLlxuXG5Db2RlIGJ5IFJvYiBCYXRlbWFuXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuXG5UaGlzIGNvZGUgaXMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG5cbkNvcHlyaWdodCAoYykgVGhlIEF3YXkgRm91bmRhdGlvbiBodHRwOi8vd3d3LnRoZWF3YXlmb3VuZGF0aW9uLm9yZ1xuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSDigJxTb2Z0d2FyZeKAnSksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQg4oCcQVMgSVPigJ0sIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG5pbXBvcnQgQml0bWFwRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYmFzZS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IEJvdW5kaW5nU3BoZXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYm91bmRzL0JvdW5kaW5nU3BoZXJlXCIpO1xuaW1wb3J0IEJvdW5kaW5nVm9sdW1lQmFzZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ib3VuZHMvQm91bmRpbmdWb2x1bWVCYXNlXCIpO1xuaW1wb3J0IEFzc2V0RXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Bc3NldEV2ZW50XCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgQXNzZXRMaWJyYXJ5XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TGlicmFyeVwiKTtcbmltcG9ydCBJQXNzZXRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9JQXNzZXRcIik7XG5pbXBvcnQgQXNzZXRMb2FkZXJUb2tlblx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMb2FkZXJUb2tlblwiKTtcbmltcG9ydCBBc3NldFR5cGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRUeXBlXCIpO1xuaW1wb3J0IFVSTFJlcXVlc3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IEJpdG1hcFRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9CaXRtYXBUZXh0dXJlXCIpO1xuaW1wb3J0IFJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuaW1wb3J0IEtleWJvYXJkXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3VpL0tleWJvYXJkXCIpO1xuXG5pbXBvcnQgU2NlbmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9TY2VuZVwiKTtcbmltcG9ydCBMb2FkZXJcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9Mb2FkZXJcIik7XG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvVmlld1wiKTtcbmltcG9ydCBIb3ZlckNvbnRyb2xsZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250cm9sbGVycy9Ib3ZlckNvbnRyb2xsZXJcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBEaXJlY3Rpb25hbExpZ2h0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBMaW5lU2VnbWVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTGluZVNlZ21lbnRcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL01lc2hcIik7XG5pbXBvcnQgUG9pbnRMaWdodFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvUG9pbnRMaWdodFwiKTtcbmltcG9ydCBBd2F5TW91c2VFdmVudFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2V2ZW50cy9Nb3VzZUV2ZW50XCIpO1xuaW1wb3J0IEJhc2ljTWF0ZXJpYWxcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvQmFzaWNNYXRlcmlhbFwiKTtcbmltcG9ydCBTdGF0aWNMaWdodFBpY2tlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL1N0YXRpY0xpZ2h0UGlja2VyXCIpO1xuaW1wb3J0IFBpY2tpbmdDb2xsaXNpb25WT1x0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9waWNrL1BpY2tpbmdDb2xsaXNpb25WT1wiKTtcbmltcG9ydCBSYXljYXN0UGlja2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcGljay9SYXljYXN0UGlja2VyXCIpO1xuaW1wb3J0IFByaW1pdGl2ZUN1YmVQcmVmYWJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVDdWJlUHJlZmFiXCIpO1xuaW1wb3J0IFByaW1pdGl2ZUN5bGluZGVyUHJlZmFiXHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9wcmVmYWJzL1ByaW1pdGl2ZUN5bGluZGVyUHJlZmFiXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVNwaGVyZVByZWZhYlx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVTcGhlcmVQcmVmYWJcIik7XG5pbXBvcnQgUHJpbWl0aXZlVG9ydXNQcmVmYWJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVUb3J1c1ByZWZhYlwiKTtcblxuaW1wb3J0IERlZmF1bHRSZW5kZXJlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL0RlZmF1bHRSZW5kZXJlclwiKTtcbmltcG9ydCBEZWZhdWx0TWF0ZXJpYWxNYW5hZ2VyXHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYW5hZ2Vycy9EZWZhdWx0TWF0ZXJpYWxNYW5hZ2VyXCIpO1xuaW1wb3J0IEpTUGlja2luZ0NvbGxpZGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL3BpY2svSlNQaWNraW5nQ29sbGlkZXJcIik7XG5cbmltcG9ydCBNZXRob2RNYXRlcmlhbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvTWV0aG9kTWF0ZXJpYWxcIik7XG5pbXBvcnQgTWV0aG9kUmVuZGVyZXJQb29sXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvcG9vbC9NZXRob2RSZW5kZXJlclBvb2xcIik7XG5cbmltcG9ydCBPQkpQYXJzZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXBhcnNlcnMvbGliL09CSlBhcnNlclwiKTtcblxuLyoqXG4gKlxuICovXG5jbGFzcyBJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvblxue1xuXHQvL2VuZ2luZSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfc2NlbmU6U2NlbmU7XG5cdHByaXZhdGUgX2NhbWVyYTpDYW1lcmE7XG5cdHByaXZhdGUgX3JlbmRlcmVyOkRlZmF1bHRSZW5kZXJlcjtcblx0cHJpdmF0ZSBfdmlldzpWaWV3O1xuXHRwcml2YXRlIF90b2tlbjpBc3NldExvYWRlclRva2VuO1xuXHRwcml2YXRlIF9jYW1lcmFDb250cm9sbGVyOkhvdmVyQ29udHJvbGxlcjtcblxuXHRwcml2YXRlIF90aW1lcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyID0gMDtcblxuXHQvL21hdGVyaWFsIG9iamVjdHNcblx0Ly9wcml2YXRlIF9wYWludGVyOlNwcml0ZTtcblx0cHJpdmF0ZSBfYmxhY2tNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBfd2hpdGVNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBfZ3JheU1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIF9ibHVlTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgX3JlZE1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXG5cdC8vbGlnaHQgb2JqZWN0c1xuXHRwcml2YXRlIF9wb2ludExpZ2h0OlBvaW50TGlnaHQ7XG5cdHByaXZhdGUgX2xpZ2h0UGlja2VyOlN0YXRpY0xpZ2h0UGlja2VyO1xuXG5cdC8vc2NlbmUgb2JqZWN0c1xuXHRwcml2YXRlIF9waWNraW5nUG9zaXRpb25UcmFjZXI6TWVzaDtcblx0cHJpdmF0ZSBfc2NlbmVQb3NpdGlvblRyYWNlcjpNZXNoO1xuXHRwcml2YXRlIF9waWNraW5nTm9ybWFsVHJhY2VyOkxpbmVTZWdtZW50O1xuXHRwcml2YXRlIF9zY2VuZU5vcm1hbFRyYWNlcjpMaW5lU2VnbWVudDtcblx0cHJpdmF0ZSBfcHJldmlvaXVzQ29sbGlkaW5nT2JqZWN0OlBpY2tpbmdDb2xsaXNpb25WTztcblx0cHJpdmF0ZSBfcmF5Y2FzdFBpY2tlcjpSYXljYXN0UGlja2VyID0gbmV3IFJheWNhc3RQaWNrZXIoZmFsc2UpO1xuXHRwcml2YXRlIF9oZWFkOk1lc2g7XG5cdHByaXZhdGUgX2N1YmVQcmVmYWI6UHJpbWl0aXZlQ3ViZVByZWZhYjtcblx0cHJpdmF0ZSBfc3BoZXJlUHJlZmFiOlByaW1pdGl2ZVNwaGVyZVByZWZhYjtcblx0cHJpdmF0ZSBfY3lsaW5kZXJQcmVmYWI6UHJpbWl0aXZlQ3lsaW5kZXJQcmVmYWI7XG5cdHByaXZhdGUgX3RvcnVzUHJlZmFiOlByaW1pdGl2ZVRvcnVzUHJlZmFiO1xuXG5cdC8vbmF2aWdhdGlvbiB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfbW92ZTpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX2xhc3RQYW5BbmdsZTpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RUaWx0QW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0TW91c2VYOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdE1vdXNlWTpudW1iZXI7XG5cdHByaXZhdGUgX3RpbHRTcGVlZDpudW1iZXIgPSA0O1xuXHRwcml2YXRlIF9wYW5TcGVlZDpudW1iZXIgPSA0O1xuXHRwcml2YXRlIF9kaXN0YW5jZVNwZWVkOm51bWJlciA9IDQ7XG5cdHByaXZhdGUgX3RpbHRJbmNyZW1lbnQ6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfcGFuSW5jcmVtZW50Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX2Rpc3RhbmNlSW5jcmVtZW50Om51bWJlciA9IDA7XG5cblx0cHJpdmF0ZSBzdGF0aWMgUEFJTlRfVEVYVFVSRV9TSVpFOm51bWJlciA9IDEwMjQ7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHbG9iYWwgaW5pdGlhbGlzZSBmdW5jdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBpbml0KCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5pbml0RW5naW5lKCk7XG5cdFx0dGhpcy5pbml0TGlnaHRzKCk7XG5cdFx0dGhpcy5pbml0TWF0ZXJpYWxzKCk7XG5cdFx0dGhpcy5pbml0T2JqZWN0cygpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGVuZ2luZVxuXHQgKi9cblx0cHJpdmF0ZSBpbml0RW5naW5lKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fcmVuZGVyZXIgPSBuZXcgRGVmYXVsdFJlbmRlcmVyKE1ldGhvZFJlbmRlcmVyUG9vbCk7XG5cdFx0dGhpcy5fdmlldyA9IG5ldyBWaWV3KHRoaXMuX3JlbmRlcmVyKTtcblx0XHR0aGlzLl92aWV3LmZvcmNlTW91c2VNb3ZlID0gdHJ1ZTtcblx0XHR0aGlzLl9zY2VuZSA9IHRoaXMuX3ZpZXcuc2NlbmU7XG5cdFx0dGhpcy5fY2FtZXJhID0gdGhpcy5fdmlldy5jYW1lcmE7XG5cdFx0dGhpcy5fdmlldy5tb3VzZVBpY2tlciA9IG5ldyBSYXljYXN0UGlja2VyKHRydWUpO1xuXG5cdFx0Ly9zZXR1cCBjb250cm9sbGVyIHRvIGJlIHVzZWQgb24gdGhlIGNhbWVyYVxuXHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIgPSBuZXcgSG92ZXJDb250cm9sbGVyKHRoaXMuX2NhbWVyYSwgbnVsbCwgMTgwLCAyMCwgMzIwLCA1KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaWdodHNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpZ2h0cygpOnZvaWRcblx0e1xuXHRcdC8vY3JlYXRlIGEgbGlnaHQgZm9yIHRoZSBjYW1lcmFcblx0XHR0aGlzLl9wb2ludExpZ2h0ID0gbmV3IFBvaW50TGlnaHQoKTtcblx0XHR0aGlzLl9zY2VuZS5hZGRDaGlsZCh0aGlzLl9wb2ludExpZ2h0KTtcblx0XHR0aGlzLl9saWdodFBpY2tlciA9IG5ldyBTdGF0aWNMaWdodFBpY2tlcihbdGhpcy5fcG9pbnRMaWdodF0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIG1hdGVyaWFsXG5cdCAqL1xuXHRwcml2YXRlIGluaXRNYXRlcmlhbHMoKTp2b2lkXG5cdHtcblx0XHQvLyB1diBwYWludGVyXG5cdFx0Ly90aGlzLl9wYWludGVyID0gbmV3IFNwcml0ZSgpO1xuXHRcdC8vdGhpcy5fcGFpbnRlci5ncmFwaGljcy5iZWdpbkZpbGwoIDB4RkYwMDAwICk7XG5cdFx0Ly90aGlzLl9wYWludGVyLmdyYXBoaWNzLmRyYXdDaXJjbGUoIDAsIDAsIDEwICk7XG5cdFx0Ly90aGlzLl9wYWludGVyLmdyYXBoaWNzLmVuZEZpbGwoKTtcblxuXHRcdC8vIGxvY2F0b3IgbWF0ZXJpYWxzXG5cdFx0dGhpcy5fd2hpdGVNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCggMHhGRkZGRkYgKTtcblx0XHR0aGlzLl93aGl0ZU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5fYmxhY2tNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCggMHgzMzMzMzMgKTtcblx0XHR0aGlzLl9ibGFja01hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5fZ3JheU1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKCAweENDQ0NDQyApO1xuXHRcdHRoaXMuX2dyYXlNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuXHRcdHRoaXMuX2JsdWVNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCggMHgwMDAwRkYgKTtcblx0XHR0aGlzLl9ibHVlTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcblx0XHR0aGlzLl9yZWRNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCggMHhGRjAwMDAgKTtcblx0XHR0aGlzLl9yZWRNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIHNjZW5lIG9iamVjdHNcblx0ICovXG5cdHByaXZhdGUgaW5pdE9iamVjdHMoKTp2b2lkXG5cdHtcblx0XHQvLyBUbyB0cmFjZSBtb3VzZSBoaXQgcG9zaXRpb24uXG5cdFx0dGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMikuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyLm1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKDB4MDBGRjAwLCAwLjUpO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci52aXNpYmxlID0gZmFsc2U7XG5cdFx0dGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyLm1vdXNlRW5hYmxlZCA9IGZhbHNlO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci5tb3VzZUNoaWxkcmVuID0gZmFsc2U7XG5cdFx0dGhpcy5fc2NlbmUuYWRkQ2hpbGQodGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyKTtcblxuXHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIgPSA8TWVzaD4gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigyKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIubWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoMHgwMDAwRkYsIDAuNSk7XG5cdFx0dGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlci52aXNpYmxlID0gZmFsc2U7XG5cdFx0dGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlci5tb3VzZUVuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLl9zY2VuZS5hZGRDaGlsZCh0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyKTtcblxuXG5cdFx0Ly8gVG8gdHJhY2UgcGlja2luZyBub3JtYWxzLlxuXHRcdHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIgPSBuZXcgTGluZVNlZ21lbnQobmV3IEJhc2ljTWF0ZXJpYWwoMHhGRkZGRkYpLCBuZXcgVmVjdG9yM0QoKSwgbmV3IFZlY3RvcjNEKCksIDMpO1xuXHRcdHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIubW91c2VFbmFibGVkID0gZmFsc2U7XG5cdFx0dGhpcy5fcGlja2luZ05vcm1hbFRyYWNlci52aXNpYmxlID0gZmFsc2U7XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl9waWNraW5nTm9ybWFsVHJhY2VyKTtcblxuXHRcdHRoaXMuX3NjZW5lTm9ybWFsVHJhY2VyID0gbmV3IExpbmVTZWdtZW50KG5ldyBCYXNpY01hdGVyaWFsKDB4RkZGRkZGKSwgbmV3IFZlY3RvcjNEKCksIG5ldyBWZWN0b3IzRCgpLCAzKTtcblx0XHR0aGlzLl9zY2VuZU5vcm1hbFRyYWNlci5tb3VzZUVuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLl9zY2VuZU5vcm1hbFRyYWNlci52aXNpYmxlID0gZmFsc2U7XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl9zY2VuZU5vcm1hbFRyYWNlcik7XG5cblxuXHRcdC8vIExvYWQgYSBoZWFkIG1vZGVsIHRoYXQgd2Ugd2lsbCBiZSBhYmxlIHRvIHBhaW50IG9uIG9uIG1vdXNlIGRvd24uXG5cdFx0dGhpcy5fdG9rZW4gPSBBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdCgnYXNzZXRzL2hlYWQub2JqJyksIG51bGwsIG51bGwsIG5ldyBPQkpQYXJzZXIoIDI1ICkpO1xuXHRcdHRoaXMuX3Rva2VuLmFkZEV2ZW50TGlzdGVuZXIoQXNzZXRFdmVudC5BU1NFVF9DT01QTEVURSwgKGV2ZW50OkFzc2V0RXZlbnQpID0+IHRoaXMub25Bc3NldENvbXBsZXRlKGV2ZW50KSk7XG5cblx0XHQvLyBQcm9kdWNlIGEgYnVuY2ggb2Ygb2JqZWN0cyB0byBiZSBhcm91bmQgdGhlIHNjZW5lLlxuXHRcdHRoaXMuY3JlYXRlQUJ1bmNoT2ZPYmplY3RzKCk7XG5cblx0XHR0aGlzLl9yYXljYXN0UGlja2VyLnNldElnbm9yZUxpc3QoW3RoaXMuX3NjZW5lTm9ybWFsVHJhY2VyLCB0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyXSk7XG5cdFx0dGhpcy5fcmF5Y2FzdFBpY2tlci5vbmx5TW91c2VFbmFibGVkID0gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVuZXIgZm9yIGFzc2V0IGNvbXBsZXRlIGV2ZW50IG9uIGxvYWRlclxuXHQgKi9cblx0cHJpdmF0ZSBvbkFzc2V0Q29tcGxldGUoZXZlbnQ6QXNzZXRFdmVudCk6dm9pZFxuXHR7XG5cdFx0aWYgKGV2ZW50LmFzc2V0LmFzc2V0VHlwZSA9PSBBc3NldFR5cGUuTUVTSCkge1xuXHRcdFx0dGhpcy5pbml0aWFsaXplSGVhZE1vZGVsKDxNZXNoPiBldmVudC5hc3NldCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBpbml0aWFsaXplSGVhZE1vZGVsKCBtb2RlbDpNZXNoICk6dm9pZFxuXHR7XG5cdFx0dGhpcy5faGVhZCA9IG1vZGVsO1xuXG5cdFx0Ly8gQXBwbHkgYSBiaXRtYXAgbWF0ZXJpYWwgdGhhdCBjYW4gYmUgcGFpbnRlZCBvbi5cblx0XHR2YXIgYm1kOkJpdG1hcERhdGEgPSBuZXcgQml0bWFwRGF0YShJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5QQUlOVF9URVhUVVJFX1NJWkUsIEludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLlBBSU5UX1RFWFRVUkVfU0laRSwgZmFsc2UsIDB4Q0NDQ0NDKTtcblx0XHQvL2JtZC5wZXJsaW5Ob2lzZSg1MCwgNTAsIDgsIDEsIGZhbHNlLCB0cnVlLCA3LCB0cnVlKTtcblx0XHR2YXIgYml0bWFwVGV4dHVyZTpCaXRtYXBUZXh0dXJlID0gbmV3IEJpdG1hcFRleHR1cmUoYm1kKTtcblx0XHR2YXIgdGV4dHVyZU1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKGJpdG1hcFRleHR1cmUpO1xuXHRcdHRleHR1cmVNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuXHRcdG1vZGVsLm1hdGVyaWFsID0gdGV4dHVyZU1hdGVyaWFsO1xuXHRcdG1vZGVsLnBpY2tpbmdDb2xsaWRlciA9IG5ldyBKU1BpY2tpbmdDb2xsaWRlcih0aGlzLl9yZW5kZXJlci5zdGFnZSk7XG5cblx0XHQvLyBBcHBseSBtb3VzZSBpbnRlcmFjdGl2aXR5LlxuXHRcdG1vZGVsLm1vdXNlRW5hYmxlZCA9IG1vZGVsLm1vdXNlQ2hpbGRyZW4gPSB0cnVlO1xuXHRcdHRoaXMuZW5hYmxlTWVzaE1vdXNlTGlzdGVuZXJzKG1vZGVsKTtcblxuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQobW9kZWwpO1xuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVBQnVuY2hPZk9iamVjdHMoKTp2b2lkXG5cdHtcblx0XHR0aGlzLl9jdWJlUHJlZmFiID0gbmV3IFByaW1pdGl2ZUN1YmVQcmVmYWIoIDI1LCA1MCwgMjUgKTtcblx0XHR0aGlzLl9zcGhlcmVQcmVmYWIgPSBuZXcgUHJpbWl0aXZlU3BoZXJlUHJlZmFiKDEyKTtcblx0XHR0aGlzLl9jeWxpbmRlclByZWZhYiA9IG5ldyBQcmltaXRpdmVDeWxpbmRlclByZWZhYiggMTIsIDEyLCAyNSApO1xuXHRcdHRoaXMuX3RvcnVzUHJlZmFiID0gbmV3IFByaW1pdGl2ZVRvcnVzUHJlZmFiKCAxMiwgMTIgKTtcblxuXHRcdGZvcih2YXIgaTpudW1iZXIgPSAwOyBpIDwgNDA7IGkrKykge1xuXG5cdFx0XHQvLyBDcmVhdGUgb2JqZWN0LlxuXHRcdFx0dmFyIG9iamVjdDpNZXNoID0gdGhpcy5jcmVhdGVTaW1wbGVPYmplY3QoKTtcblxuXHRcdFx0Ly8gUmFuZG9tIG9yaWVudGF0aW9uLlxuXHRcdFx0b2JqZWN0LnJvdGF0aW9uWCA9IDM2MCpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0b2JqZWN0LnJvdGF0aW9uWSA9IDM2MCpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0b2JqZWN0LnJvdGF0aW9uWiA9IDM2MCpNYXRoLnJhbmRvbSgpO1xuXG5cdFx0XHQvLyBSYW5kb20gcG9zaXRpb24uXG5cdFx0XHR2YXIgcjpudW1iZXIgPSAyMDAgKyAxMDAqTWF0aC5yYW5kb20oKTtcblx0XHRcdHZhciBhemltdXRoOm51bWJlciA9IDIqTWF0aC5QSSpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0dmFyIGVsZXZhdGlvbjpudW1iZXIgPSAwLjI1ICogTWF0aC5QSSpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0b2JqZWN0LnggPSByKk1hdGguY29zKGVsZXZhdGlvbikqTWF0aC5zaW4oYXppbXV0aCk7XG5cdFx0XHRvYmplY3QueSA9IHIqTWF0aC5zaW4oZWxldmF0aW9uKTtcblx0XHRcdG9iamVjdC56ID0gcipNYXRoLmNvcyhlbGV2YXRpb24pKk1hdGguY29zKGF6aW11dGgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlU2ltcGxlT2JqZWN0KCk6TWVzaFxuXHR7XG5cblx0XHR2YXIgbWVzaDpNZXNoO1xuXHRcdHZhciBib3VuZHM6Qm91bmRpbmdWb2x1bWVCYXNlO1xuXG5cdFx0Ly8gQ2hvc2UgYSByYW5kb20gbWVzaC5cblx0XHR2YXIgcmFuZEdlb21ldHJ5Om51bWJlciA9IE1hdGgucmFuZG9tKCk7XG5cdFx0aWYoIHJhbmRHZW9tZXRyeSA+IDAuNzUgKSB7XG5cdFx0XHRtZXNoID0gPE1lc2g+IHRoaXMuX2N1YmVQcmVmYWIuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYoIHJhbmRHZW9tZXRyeSA+IDAuNSApIHtcblx0XHRcdG1lc2ggPSA8TWVzaD4gdGhpcy5fc3BoZXJlUHJlZmFiLmdldE5ld09iamVjdCgpO1xuXHRcdFx0Ym91bmRzID0gbmV3IEJvdW5kaW5nU3BoZXJlKCk7IC8vIGJldHRlciBvbiBzcGhlcmljYWwgbWVzaGVzIHdpdGggYm91bmQgcGlja2luZyBjb2xsaWRlcnNcblx0XHR9XG5cdFx0ZWxzZSBpZiggcmFuZEdlb21ldHJ5ID4gMC4yNSApIHtcblx0XHRcdG1lc2ggPSA8TWVzaD4gdGhpcy5fY3lsaW5kZXJQcmVmYWIuZ2V0TmV3T2JqZWN0KCk7XG5cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRtZXNoID0gPE1lc2g+IHRoaXMuX3RvcnVzUHJlZmFiLmdldE5ld09iamVjdCgpO1xuXHRcdH1cblxuXHRcdGlmIChib3VuZHMpXG5cdFx0XHRtZXNoLmJvdW5kcyA9IGJvdW5kcztcblxuXHRcdC8vIFJhbmRvbWx5IGRlY2lkZSBpZiB0aGUgbWVzaCBoYXMgYSB0cmlhbmdsZSBjb2xsaWRlci5cblx0XHR2YXIgdXNlc1RyaWFuZ2xlQ29sbGlkZXI6Ym9vbGVhbiA9IE1hdGgucmFuZG9tKCkgPiAwLjU7XG5cdFx0aWYoIHVzZXNUcmlhbmdsZUNvbGxpZGVyICkge1xuXHRcdFx0Ly8gQVMzIHRyaWFuZ2xlIHBpY2tlcnMgZm9yIG1lc2hlcyB3aXRoIGxvdyBwb2x5IGNvdW50cyBhcmUgZmFzdGVyIHRoYW4gcGl4ZWwgYmVuZGVyIG9uZXMuXG5cdFx0XHQvL1x0XHRcdFx0bWVzaC5waWNraW5nQ29sbGlkZXIgPSBQaWNraW5nQ29sbGlkZXJUeXBlLkJPVU5EU19PTkxZOyAvLyB0aGlzIGlzIHRoZSBkZWZhdWx0IHZhbHVlIGZvciBhbGwgbWVzaGVzXG5cdFx0XHRtZXNoLnBpY2tpbmdDb2xsaWRlciA9IG5ldyBKU1BpY2tpbmdDb2xsaWRlcih0aGlzLl9yZW5kZXJlci5zdGFnZSk7XG5cdFx0XHQvL1x0XHRcdFx0bWVzaC5waWNraW5nQ29sbGlkZXIgPSBQaWNraW5nQ29sbGlkZXJUeXBlLkFTM19CRVNUX0hJVDsgLy8gc2xvd2VyIGFuZCBtb3JlIGFjY3VyYXRlLCBiZXN0IGZvciBtZXNoZXMgd2l0aCBmb2xkc1xuXHRcdFx0Ly9cdFx0XHRcdG1lc2gucGlja2luZ0NvbGxpZGVyID0gUGlja2luZ0NvbGxpZGVyVHlwZS5BVVRPX0ZJUlNUX0VOQ09VTlRFUkVEOyAvLyBhdXRvbWF0aWNhbGx5IGRlY2lkZXMgd2hlbiB0byB1c2UgcGl4ZWwgYmVuZGVyIG9yIGFjdGlvbnNjcmlwdFxuXHRcdH1cblxuXHRcdC8vIEVuYWJsZSBtb3VzZSBpbnRlcmFjdGl2aXR5P1xuXHRcdHZhciBpc01vdXNlRW5hYmxlZDpib29sZWFuID0gTWF0aC5yYW5kb20oKSA+IDAuMjU7XG5cdFx0bWVzaC5tb3VzZUVuYWJsZWQgPSBtZXNoLm1vdXNlQ2hpbGRyZW4gPSBpc01vdXNlRW5hYmxlZDtcblxuXHRcdC8vIEVuYWJsZSBtb3VzZSBsaXN0ZW5lcnM/XG5cdFx0dmFyIGxpc3RlbnNUb01vdXNlRXZlbnRzOmJvb2xlYW4gPSBNYXRoLnJhbmRvbSgpID4gMC4yNTtcblx0XHRpZiggaXNNb3VzZUVuYWJsZWQgJiYgbGlzdGVuc1RvTW91c2VFdmVudHMgKSB7XG5cdFx0XHR0aGlzLmVuYWJsZU1lc2hNb3VzZUxpc3RlbmVycyhtZXNoKTtcblx0XHR9XG5cblx0XHQvLyBBcHBseSBtYXRlcmlhbCBhY2NvcmRpbmcgdG8gdGhlIHJhbmRvbSBzZXR1cCBvZiB0aGUgb2JqZWN0LlxuXHRcdHRoaXMuY2hvc2VNZXNoTWF0ZXJpYWwobWVzaCk7XG5cblx0XHQvLyBBZGQgdG8gc2NlbmUgYW5kIHN0b3JlLlxuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQobWVzaCk7XG5cblx0XHRyZXR1cm4gbWVzaDtcblx0fVxuXG5cdHByaXZhdGUgY2hvc2VNZXNoTWF0ZXJpYWwobWVzaDpNZXNoKTp2b2lkXG5cdHtcblx0XHRpZiggIW1lc2gubW91c2VFbmFibGVkICkge1xuXHRcdFx0bWVzaC5tYXRlcmlhbCA9IHRoaXMuX2JsYWNrTWF0ZXJpYWw7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYoICFtZXNoLmhhc0V2ZW50TGlzdGVuZXIoIEF3YXlNb3VzZUV2ZW50Lk1PVVNFX01PVkUgKSApIHtcblx0XHRcdFx0bWVzaC5tYXRlcmlhbCA9IHRoaXMuX2dyYXlNYXRlcmlhbDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZiggbWVzaC5waWNraW5nQ29sbGlkZXIgIT0gbnVsbCApIHtcblx0XHRcdFx0XHRtZXNoLm1hdGVyaWFsID0gdGhpcy5fcmVkTWF0ZXJpYWw7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0bWVzaC5tYXRlcmlhbCA9IHRoaXMuX2JsdWVNYXRlcmlhbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaXN0ZW5lcnNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpc3RlbmVycygpOnZvaWRcblx0e1xuXHRcdHdpbmRvdy5vbnJlc2l6ZSAgPSAoZXZlbnQ6VUlFdmVudCkgPT4gdGhpcy5vblJlc2l6ZShldmVudCk7XG5cblx0XHRkb2N1bWVudC5vbm1vdXNlZG93biA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VEb3duKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNldXAgPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlVXAoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZU1vdmUoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V3aGVlbCA9IChldmVudDpNb3VzZVdoZWVsRXZlbnQpID0+IHRoaXMub25Nb3VzZVdoZWVsKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbmtleWRvd24gPSAoZXZlbnQ6S2V5Ym9hcmRFdmVudCkgPT4gdGhpcy5vbktleURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ua2V5dXAgPSAoZXZlbnQ6S2V5Ym9hcmRFdmVudCkgPT4gdGhpcy5vbktleVVwKGV2ZW50KTtcblxuXHRcdHRoaXMub25SZXNpemUoKTtcblxuXHRcdHRoaXMuX3RpbWVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyk7XG5cdFx0dGhpcy5fdGltZXIuc3RhcnQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0aW9uIGFuZCByZW5kZXIgbG9vcFxuXHQgKi9cblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZHQ6bnVtYmVyKTp2b2lkXG5cdHtcblx0XHQvLyBNb3ZlIGxpZ2h0IHdpdGggY2FtZXJhLlxuXHRcdHRoaXMuX3BvaW50TGlnaHQudHJhbnNmb3JtLnBvc2l0aW9uID0gdGhpcy5fY2FtZXJhLnRyYW5zZm9ybS5wb3NpdGlvbjtcblxuXHRcdHZhciBjb2xsaWRpbmdPYmplY3Q6UGlja2luZ0NvbGxpc2lvblZPID0gdGhpcy5fcmF5Y2FzdFBpY2tlci5nZXRTY2VuZUNvbGxpc2lvbih0aGlzLl9jYW1lcmEudHJhbnNmb3JtLnBvc2l0aW9uLCB0aGlzLl92aWV3LmNhbWVyYS50cmFuc2Zvcm0uZm9yd2FyZFZlY3RvciwgdGhpcy5fdmlldy5zY2VuZSk7XG5cdFx0Ly92YXIgbWVzaDpNZXNoO1xuXG5cdFx0aWYgKHRoaXMuX3ByZXZpb2l1c0NvbGxpZGluZ09iamVjdCAmJiB0aGlzLl9wcmV2aW9pdXNDb2xsaWRpbmdPYmplY3QgIT0gY29sbGlkaW5nT2JqZWN0KSB7IC8vZXF1aXZhbGVudCB0byBtb3VzZSBvdXRcblx0XHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IHRoaXMuX3NjZW5lTm9ybWFsVHJhY2VyLnZpc2libGUgPSBmYWxzZTtcblx0XHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IFZlY3RvcjNEKCk7XG5cdFx0fVxuXG5cdFx0aWYgKGNvbGxpZGluZ09iamVjdCkge1xuXHRcdFx0Ly8gU2hvdyB0cmFjZXJzLlxuXHRcdFx0dGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlci52aXNpYmxlID0gdGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIudmlzaWJsZSA9IHRydWU7XG5cblx0XHRcdC8vIFVwZGF0ZSBwb3NpdGlvbiB0cmFjZXIuXG5cdFx0XHR0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyLnRyYW5zZm9ybS5wb3NpdGlvbiA9IGNvbGxpZGluZ09iamVjdC5kaXNwbGF5T2JqZWN0LnNjZW5lVHJhbnNmb3JtLnRyYW5zZm9ybVZlY3Rvcihjb2xsaWRpbmdPYmplY3QubG9jYWxQb3NpdGlvbik7XG5cblx0XHRcdC8vIFVwZGF0ZSBub3JtYWwgdHJhY2VyLlxuXHRcdFx0dGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIudHJhbnNmb3JtLnBvc2l0aW9uID0gdGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb247XG5cdFx0XHR2YXIgbm9ybWFsOlZlY3RvcjNEID0gY29sbGlkaW5nT2JqZWN0LmRpc3BsYXlPYmplY3Quc2NlbmVUcmFuc2Zvcm0uZGVsdGFUcmFuc2Zvcm1WZWN0b3IoY29sbGlkaW5nT2JqZWN0LmxvY2FsTm9ybWFsKTtcblx0XHRcdG5vcm1hbC5ub3JtYWxpemUoKTtcblx0XHRcdG5vcm1hbC5zY2FsZUJ5KCAyNSApO1xuXHRcdFx0dGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIuZW5kUG9zaXRpb24gPSBub3JtYWwuY2xvbmUoKTtcblx0XHR9XG5cblxuXHRcdHRoaXMuX3ByZXZpb2l1c0NvbGxpZGluZ09iamVjdCA9IGNvbGxpZGluZ09iamVjdDtcblxuXHRcdC8vIFJlbmRlciAzRC5cblx0XHR0aGlzLl92aWV3LnJlbmRlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEtleSBkb3duIGxpc3RlbmVyIGZvciBjYW1lcmEgY29udHJvbFxuXHQgKi9cblx0cHJpdmF0ZSBvbktleURvd24oZXZlbnQ6S2V5Ym9hcmRFdmVudCk6dm9pZFxuXHR7XG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlVQOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5XOlxuXHRcdFx0XHR0aGlzLl90aWx0SW5jcmVtZW50ID0gdGhpcy5fdGlsdFNwZWVkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRE9XTjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUzpcblx0XHRcdFx0dGhpcy5fdGlsdEluY3JlbWVudCA9IC10aGlzLl90aWx0U3BlZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0XHR0aGlzLl9wYW5JbmNyZW1lbnQgPSB0aGlzLl9wYW5TcGVlZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlJJR0hUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5EOlxuXHRcdFx0XHR0aGlzLl9wYW5JbmNyZW1lbnQgPSAtdGhpcy5fcGFuU3BlZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5aOlxuXHRcdFx0XHR0aGlzLl9kaXN0YW5jZUluY3JlbWVudCA9IHRoaXMuX2Rpc3RhbmNlU3BlZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5YOlxuXHRcdFx0XHR0aGlzLl9kaXN0YW5jZUluY3JlbWVudCA9IC10aGlzLl9kaXN0YW5jZVNwZWVkO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogS2V5IHVwIGxpc3RlbmVyIGZvciBjYW1lcmEgY29udHJvbFxuXHQgKi9cblx0cHJpdmF0ZSBvbktleVVwKGV2ZW50OktleWJvYXJkRXZlbnQpOnZvaWRcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRE9XTjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUzpcblx0XHRcdFx0dGhpcy5fdGlsdEluY3JlbWVudCA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5SSUdIVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRDpcblx0XHRcdFx0dGhpcy5fcGFuSW5jcmVtZW50ID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlo6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlg6XG5cdFx0XHRcdHRoaXMuX2Rpc3RhbmNlSW5jcmVtZW50ID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIDNEIG1vdXNlIGV2ZW50IGhhbmRsZXJzLlxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRwcml2YXRlIGVuYWJsZU1lc2hNb3VzZUxpc3RlbmVycyhtZXNoOk1lc2gpOnZvaWRcblx0e1xuXHRcdG1lc2guYWRkRXZlbnRMaXN0ZW5lcihBd2F5TW91c2VFdmVudC5NT1VTRV9PVkVSLCAoZXZlbnQ6QXdheU1vdXNlRXZlbnQpID0+IHRoaXMub25NZXNoTW91c2VPdmVyKGV2ZW50KSk7XG5cdFx0bWVzaC5hZGRFdmVudExpc3RlbmVyKEF3YXlNb3VzZUV2ZW50Lk1PVVNFX09VVCwgKGV2ZW50OkF3YXlNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTWVzaE1vdXNlT3V0KGV2ZW50KSk7XG5cdFx0bWVzaC5hZGRFdmVudExpc3RlbmVyKEF3YXlNb3VzZUV2ZW50Lk1PVVNFX01PVkUsIChldmVudDpBd2F5TW91c2VFdmVudCkgPT4gdGhpcy5vbk1lc2hNb3VzZU1vdmUoZXZlbnQpKTtcblx0XHRtZXNoLmFkZEV2ZW50TGlzdGVuZXIoQXdheU1vdXNlRXZlbnQuTU9VU0VfRE9XTiwgKGV2ZW50OkF3YXlNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTWVzaE1vdXNlRG93bihldmVudCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIG1lc2ggbGlzdGVuZXIgZm9yIG1vdXNlIGRvd24gaW50ZXJhY3Rpb25cblx0ICovXG5cdHByaXZhdGUgb25NZXNoTW91c2VEb3duKGV2ZW50OkF3YXlNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHQvL3ZhciBtZXNoOk1lc2ggPSA8TWVzaD4gZXZlbnQub2JqZWN0O1xuXHRcdC8vLy8gUGFpbnQgb24gdGhlIGhlYWQncyBtYXRlcmlhbC5cblx0XHQvL2lmKCBtZXNoID09IHRoaXMuX2hlYWQgKSB7XG5cdFx0Ly9cdHZhciB1djpQb2ludCA9IGV2ZW50LnV2O1xuXHRcdC8vXHR2YXIgdGV4dHVyZU1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsID0gKDxNZXRob2RNYXRlcmlhbD4gKDxNZXNoPiBldmVudC5vYmplY3QpLm1hdGVyaWFsKTtcblx0XHQvL1x0dmFyIGJtZDpCaXRtYXBEYXRhID0gQml0bWFwVGV4dHVyZSggdGV4dHVyZU1hdGVyaWFsLnRleHR1cmUgKS5iaXRtYXBEYXRhO1xuXHRcdC8vXHR2YXIgeDpudW1iZXIgPSBJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5QQUlOVF9URVhUVVJFX1NJWkUqdXYueDtcblx0XHQvL1x0dmFyIHk6bnVtYmVyID0gSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uUEFJTlRfVEVYVFVSRV9TSVpFKnV2Lnk7XG5cdFx0Ly9cdHZhciBtYXRyaXg6TWF0cml4ID0gbmV3IE1hdHJpeCgpO1xuXHRcdC8vXHRtYXRyaXgudHJhbnNsYXRlKHgsIHkpO1xuXHRcdC8vXHRibWQuZHJhdyh0aGlzLl9wYWludGVyLCBtYXRyaXgpO1xuXHRcdC8vXHRCaXRtYXBUZXh0dXJlKHRleHR1cmVNYXRlcmlhbC50ZXh0dXJlKS5pbnZhbGlkYXRlQ29udGVudCgpO1xuXHRcdC8vfVxuXHR9XG5cblx0LyoqXG5cdCAqIG1lc2ggbGlzdGVuZXIgZm9yIG1vdXNlIG92ZXIgaW50ZXJhY3Rpb25cblx0ICovXG5cdHByaXZhdGUgb25NZXNoTW91c2VPdmVyKGV2ZW50OkF3YXlNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR2YXIgbWVzaDpNZXNoID0gPE1lc2g+IGV2ZW50Lm9iamVjdDtcblx0XHRtZXNoLmJvdW5kc1Zpc2libGUgPSB0cnVlO1xuXHRcdGlmKCBtZXNoICE9IHRoaXMuX2hlYWQgKSBtZXNoLm1hdGVyaWFsID0gdGhpcy5fd2hpdGVNYXRlcmlhbDtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIudmlzaWJsZSA9IHRydWU7XG5cdFx0dGhpcy5vbk1lc2hNb3VzZU1vdmUoZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIG1lc2ggbGlzdGVuZXIgZm9yIG1vdXNlIG91dCBpbnRlcmFjdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1lc2hNb3VzZU91dChldmVudDpBd2F5TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dmFyIG1lc2g6TWVzaCA9IDxNZXNoPiBldmVudC5vYmplY3Q7XG5cdFx0bWVzaC5ib3VuZHNWaXNpYmxlID0gZmFsc2U7XG5cdFx0aWYoIG1lc2ggIT0gdGhpcy5faGVhZCApIHRoaXMuY2hvc2VNZXNoTWF0ZXJpYWwoIG1lc2ggKTtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgVmVjdG9yM0QoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBtZXNoIGxpc3RlbmVyIGZvciBtb3VzZSBtb3ZlIGludGVyYWN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTWVzaE1vdXNlTW92ZShldmVudDpBd2F5TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0Ly8gU2hvdyB0cmFjZXJzLlxuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci52aXNpYmxlID0gdGhpcy5fcGlja2luZ05vcm1hbFRyYWNlci52aXNpYmxlID0gdHJ1ZTtcblx0XG5cdFx0Ly8gVXBkYXRlIHBvc2l0aW9uIHRyYWNlci5cblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudHJhbnNmb3JtLnBvc2l0aW9uID0gZXZlbnQuc2NlbmVQb3NpdGlvbjtcblx0XG5cdFx0Ly8gVXBkYXRlIG5vcm1hbCB0cmFjZXIuXG5cdFx0dGhpcy5fcGlja2luZ05vcm1hbFRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb24gPSB0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudHJhbnNmb3JtLnBvc2l0aW9uO1xuXHRcdHZhciBub3JtYWw6VmVjdG9yM0QgPSBldmVudC5zY2VuZU5vcm1hbC5jbG9uZSgpO1xuXHRcdG5vcm1hbC5zY2FsZUJ5KCAyNSApO1xuXHRcdHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIuZW5kUG9zaXRpb24gPSBub3JtYWwuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBkb3duIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50Ok1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHRoaXMuX2xhc3RQYW5BbmdsZSA9IHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGU7XG5cdFx0dGhpcy5fbGFzdFRpbHRBbmdsZSA9IHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVggPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVkgPSBldmVudC5jbGllbnRZO1xuXHRcdHRoaXMuX21vdmUgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHVwIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VVcChldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLl9tb3ZlID0gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgbW92ZSBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDpNb3VzZUV2ZW50KVxuXHR7XG5cdFx0aWYgKHRoaXMuX21vdmUpIHtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFggLSB0aGlzLl9sYXN0TW91c2VYKSArIHRoaXMuX2xhc3RQYW5BbmdsZTtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihldmVudC5jbGllbnRZIC0gdGhpcy5fbGFzdE1vdXNlWSkgKyB0aGlzLl9sYXN0VGlsdEFuZ2xlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB3aGVlbCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlV2hlZWwoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KVxuXHR7XG5cdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSAtPSBldmVudC53aGVlbERlbHRhO1xuXG5cdFx0aWYgKHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPCAxMDApXG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gMTAwO1xuXHRcdGVsc2UgaWYgKHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPiAyMDAwKVxuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA9IDIwMDA7XG5cdH1cblxuXHQvKipcblx0ICogd2luZG93IGxpc3RlbmVyIGZvciByZXNpemUgZXZlbnRzXG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzaXplKGV2ZW50OlVJRXZlbnQgPSBudWxsKTp2b2lkXG5cdHtcblx0XHR0aGlzLl92aWV3LnkgPSAwO1xuXHRcdHRoaXMuX3ZpZXcueCA9IDA7XG5cdFx0dGhpcy5fdmlldy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMuX3ZpZXcuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpXG57XG5cdG5ldyBJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbigpO1xufSJdfQ==