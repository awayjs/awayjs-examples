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
var BitmapData = require("awayjs-core/lib/data/BitmapData");
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
var BoundsType = require("awayjs-display/lib/bounds/BoundsType");
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
        var mesh;
        var boundsType;
        // Chose a random mesh.
        var randGeometry = Math.random();
        if (randGeometry > 0.75) {
            mesh = this._cubePrefab.getNewObject();
        }
        else if (randGeometry > 0.5) {
            mesh = this._spherePrefab.getNewObject();
            boundsType = BoundsType.SPHERE; // better on spherical meshes with bound picking colliders
        }
        else if (randGeometry > 0.25) {
            mesh = this._cylinderPrefab.getNewObject();
        }
        else {
            mesh = this._torusPrefab.getNewObject();
        }
        if (boundsType)
            mesh.boundsType = boundsType;
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
        mesh.debugVisible = true;
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
        mesh.debugVisible = false;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi50cyJdLCJuYW1lcyI6WyJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbiIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmluaXRFbmdpbmUiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdE1hdGVyaWFscyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmluaXRPYmplY3RzIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Bc3NldENvbXBsZXRlIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdGlhbGl6ZUhlYWRNb2RlbCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNyZWF0ZUFCdW5jaE9mT2JqZWN0cyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNyZWF0ZVNpbXBsZU9iamVjdCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNob3NlTWVzaE1hdGVyaWFsIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uRW50ZXJGcmFtZSIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uS2V5RG93biIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uS2V5VXAiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5lbmFibGVNZXNoTW91c2VMaXN0ZW5lcnMiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZURvd24iLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZU92ZXIiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZU91dCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uTWVzaE1vdXNlTW92ZSIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uTW91c2VEb3duIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Nb3VzZVVwIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Nb3VzZU1vdmUiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1vdXNlV2hlZWwiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vblJlc2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBbUNFO0FBRUYsSUFBTyxVQUFVLFdBQWUsaUNBQWlDLENBQUMsQ0FBQztBQUNuRSxJQUFPLFVBQVUsV0FBZSxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3JFLElBQU8sUUFBUSxXQUFnQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2hFLElBQU8sWUFBWSxXQUFlLHNDQUFzQyxDQUFDLENBQUM7QUFHMUUsSUFBTyxTQUFTLFdBQWUsbUNBQW1DLENBQUMsQ0FBQztBQUNwRSxJQUFPLFVBQVUsV0FBZSxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ2xFLElBQU8sYUFBYSxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFDNUUsSUFBTyxxQkFBcUIsV0FBWSw2Q0FBNkMsQ0FBQyxDQUFDO0FBQ3ZGLElBQU8sUUFBUSxXQUFnQiw2QkFBNkIsQ0FBQyxDQUFDO0FBSTlELElBQU8sSUFBSSxXQUFpQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ2xFLElBQU8sZUFBZSxXQUFjLGdEQUFnRCxDQUFDLENBQUM7QUFDdEYsSUFBTyxVQUFVLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQUd4RSxJQUFPLFdBQVcsV0FBZSx5Q0FBeUMs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QSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN6RUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMxQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMvQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUdoREEsQUFDQUEsNEJBRDRCQTtRQUM1QkEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1R0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMvQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMxQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUVyREEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUM3Q0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN4Q0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEs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R0FBRztJQUVmLElBQUksNkJBQTZCLEVBQUUsQ0FBQztBQUNyQyxDQUFDLENBQUEiLCJmaWxlIjoiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuXG5TaGFkaW5nIGV4YW1wbGUgaW4gQXdheTNkXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIGNyZWF0ZSBtdWx0aXBsZSBlbnRpdGllc291cmNlcyBpbiBhIHNjZW5lLlxuSG93IHRvIGFwcGx5IHNwZWN1bGFyIG1hcHMsIG5vcm1hbHMgbWFwcyBhbmQgZGlmZnVzZSB0ZXh0dXJlIG1hcHMgdG8gYSBtYXRlcmlhbC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hblxucm9iQGluZmluaXRldHVydGxlcy5jby51a1xuaHR0cDovL3d3dy5pbmZpbml0ZXR1cnRsZXMuY28udWtcblxuVGhpcyBjb2RlIGlzIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIFRoZSBBd2F5IEZvdW5kYXRpb24gaHR0cDovL3d3dy50aGVhd2F5Zm91bmRhdGlvbi5vcmdcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUg4oCcU29mdHdhcmXigJ0pLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIOKAnEFTIElT4oCdLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cblxuKi9cblxuaW1wb3J0IEJpdG1hcERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvQml0bWFwRGF0YVwiKTtcbmltcG9ydCBBc3NldEV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvQXNzZXRFdmVudFwiKTtcbmltcG9ydCBWZWN0b3IzRFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1ZlY3RvcjNEXCIpO1xuaW1wb3J0IEFzc2V0TGlicmFyeVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExpYnJhcnlcIik7XG5pbXBvcnQgSUFzc2V0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvSUFzc2V0XCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyVG9rZW5cdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyVG9rZW5cIik7XG5pbXBvcnQgQXNzZXRUeXBlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0VHlwZVwiKTtcbmltcG9ydCBVUkxSZXF1ZXN0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMUmVxdWVzdFwiKTtcbmltcG9ydCBCaXRtYXBUZXh0dXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvQml0bWFwVGV4dHVyZVwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcbmltcG9ydCBLZXlib2FyZFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91aS9LZXlib2FyZFwiKTtcblxuaW1wb3J0IFNjZW5lXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvU2NlbmVcIik7XG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL1ZpZXdcIik7XG5pbXBvcnQgSG92ZXJDb250cm9sbGVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udHJvbGxlcnMvSG92ZXJDb250cm9sbGVyXCIpO1xuaW1wb3J0IEJvdW5kc1R5cGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2JvdW5kcy9Cb3VuZHNUeXBlXCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5pbXBvcnQgRGlyZWN0aW9uYWxMaWdodFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0RpcmVjdGlvbmFsTGlnaHRcIik7XG5pbXBvcnQgTGluZVNlZ21lbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0xpbmVTZWdtZW50XCIpO1xuaW1wb3J0IE1lc2hcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9NZXNoXCIpO1xuaW1wb3J0IFBvaW50TGlnaHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1BvaW50TGlnaHRcIik7XG5pbXBvcnQgQXdheU1vdXNlRXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9ldmVudHMvTW91c2VFdmVudFwiKTtcbmltcG9ydCBCYXNpY01hdGVyaWFsXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL0Jhc2ljTWF0ZXJpYWxcIik7XG5pbXBvcnQgU3RhdGljTGlnaHRQaWNrZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcbmltcG9ydCBQaWNraW5nQ29sbGlzaW9uVk9cdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcGljay9QaWNraW5nQ29sbGlzaW9uVk9cIik7XG5pbXBvcnQgUmF5Y2FzdFBpY2tlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3BpY2svUmF5Y2FzdFBpY2tlclwiKTtcbmltcG9ydCBQcmltaXRpdmVDdWJlUHJlZmFiXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlQ3ViZVByZWZhYlwiKTtcbmltcG9ydCBQcmltaXRpdmVDeWxpbmRlclByZWZhYlx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVDeWxpbmRlclByZWZhYlwiKTtcbmltcG9ydCBQcmltaXRpdmVTcGhlcmVQcmVmYWJcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlU3BoZXJlUHJlZmFiXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVRvcnVzUHJlZmFiXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlVG9ydXNQcmVmYWJcIik7XG5cbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9EZWZhdWx0UmVuZGVyZXJcIik7XG5pbXBvcnQgRGVmYXVsdE1hdGVyaWFsTWFuYWdlclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWFuYWdlcnMvRGVmYXVsdE1hdGVyaWFsTWFuYWdlclwiKTtcbmltcG9ydCBKU1BpY2tpbmdDb2xsaWRlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9waWNrL0pTUGlja2luZ0NvbGxpZGVyXCIpO1xuXG5pbXBvcnQgTWV0aG9kTWF0ZXJpYWxcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL01ldGhvZE1hdGVyaWFsXCIpO1xuaW1wb3J0IE1ldGhvZFJlbmRlcmVyUG9vbFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL3Bvb2wvTWV0aG9kUmVuZGVyZXJQb29sXCIpO1xuXG5pbXBvcnQgT0JKUGFyc2VyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1wYXJzZXJzL2xpYi9PQkpQYXJzZXJcIik7XG5cbi8qKlxuICpcbiAqL1xuY2xhc3MgSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb25cbntcblx0Ly9lbmdpbmUgdmFyaWFibGVzXG5cdHByaXZhdGUgX3NjZW5lOlNjZW5lO1xuXHRwcml2YXRlIF9jYW1lcmE6Q2FtZXJhO1xuXHRwcml2YXRlIF9yZW5kZXJlcjpEZWZhdWx0UmVuZGVyZXI7XG5cdHByaXZhdGUgX3ZpZXc6Vmlldztcblx0cHJpdmF0ZSBfdG9rZW46QXNzZXRMb2FkZXJUb2tlbjtcblx0cHJpdmF0ZSBfY2FtZXJhQ29udHJvbGxlcjpIb3ZlckNvbnRyb2xsZXI7XG5cblx0cHJpdmF0ZSBfdGltZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF90aW1lOm51bWJlciA9IDA7XG5cblx0Ly9tYXRlcmlhbCBvYmplY3RzXG5cdC8vcHJpdmF0ZSBfcGFpbnRlcjpTcHJpdGU7XG5cdHByaXZhdGUgX2JsYWNrTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgX3doaXRlTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgX2dyYXlNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBfYmx1ZU1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIF9yZWRNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblxuXHQvL2xpZ2h0IG9iamVjdHNcblx0cHJpdmF0ZSBfcG9pbnRMaWdodDpQb2ludExpZ2h0O1xuXHRwcml2YXRlIF9saWdodFBpY2tlcjpTdGF0aWNMaWdodFBpY2tlcjtcblxuXHQvL3NjZW5lIG9iamVjdHNcblx0cHJpdmF0ZSBfcGlja2luZ1Bvc2l0aW9uVHJhY2VyOk1lc2g7XG5cdHByaXZhdGUgX3NjZW5lUG9zaXRpb25UcmFjZXI6TWVzaDtcblx0cHJpdmF0ZSBfcGlja2luZ05vcm1hbFRyYWNlcjpMaW5lU2VnbWVudDtcblx0cHJpdmF0ZSBfc2NlbmVOb3JtYWxUcmFjZXI6TGluZVNlZ21lbnQ7XG5cdHByaXZhdGUgX3ByZXZpb2l1c0NvbGxpZGluZ09iamVjdDpQaWNraW5nQ29sbGlzaW9uVk87XG5cdHByaXZhdGUgX3JheWNhc3RQaWNrZXI6UmF5Y2FzdFBpY2tlciA9IG5ldyBSYXljYXN0UGlja2VyKGZhbHNlKTtcblx0cHJpdmF0ZSBfaGVhZDpNZXNoO1xuXHRwcml2YXRlIF9jdWJlUHJlZmFiOlByaW1pdGl2ZUN1YmVQcmVmYWI7XG5cdHByaXZhdGUgX3NwaGVyZVByZWZhYjpQcmltaXRpdmVTcGhlcmVQcmVmYWI7XG5cdHByaXZhdGUgX2N5bGluZGVyUHJlZmFiOlByaW1pdGl2ZUN5bGluZGVyUHJlZmFiO1xuXHRwcml2YXRlIF90b3J1c1ByZWZhYjpQcmltaXRpdmVUb3J1c1ByZWZhYjtcblxuXHQvL25hdmlnYXRpb24gdmFyaWFibGVzXG5cdHByaXZhdGUgX21vdmU6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIF9sYXN0UGFuQW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0VGlsdEFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdE1vdXNlWDpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RNb3VzZVk6bnVtYmVyO1xuXHRwcml2YXRlIF90aWx0U3BlZWQ6bnVtYmVyID0gNDtcblx0cHJpdmF0ZSBfcGFuU3BlZWQ6bnVtYmVyID0gNDtcblx0cHJpdmF0ZSBfZGlzdGFuY2VTcGVlZDpudW1iZXIgPSA0O1xuXHRwcml2YXRlIF90aWx0SW5jcmVtZW50Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX3BhbkluY3JlbWVudDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9kaXN0YW5jZUluY3JlbWVudDpudW1iZXIgPSAwO1xuXG5cdHByaXZhdGUgc3RhdGljIFBBSU5UX1RFWFRVUkVfU0laRTpudW1iZXIgPSAxMDI0O1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblxuXHQvKipcblx0ICogR2xvYmFsIGluaXRpYWxpc2UgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgaW5pdCgpOnZvaWRcblx0e1xuXHRcdHRoaXMuaW5pdEVuZ2luZSgpO1xuXHRcdHRoaXMuaW5pdExpZ2h0cygpO1xuXHRcdHRoaXMuaW5pdE1hdGVyaWFscygpO1xuXHRcdHRoaXMuaW5pdE9iamVjdHMoKTtcblx0XHR0aGlzLmluaXRMaXN0ZW5lcnMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBlbmdpbmVcblx0ICovXG5cdHByaXZhdGUgaW5pdEVuZ2luZSgpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3JlbmRlcmVyID0gbmV3IERlZmF1bHRSZW5kZXJlcihNZXRob2RSZW5kZXJlclBvb2wpO1xuXHRcdHRoaXMuX3ZpZXcgPSBuZXcgVmlldyh0aGlzLl9yZW5kZXJlcik7XG5cdFx0dGhpcy5fdmlldy5mb3JjZU1vdXNlTW92ZSA9IHRydWU7XG5cdFx0dGhpcy5fc2NlbmUgPSB0aGlzLl92aWV3LnNjZW5lO1xuXHRcdHRoaXMuX2NhbWVyYSA9IHRoaXMuX3ZpZXcuY2FtZXJhO1xuXHRcdHRoaXMuX3ZpZXcubW91c2VQaWNrZXIgPSBuZXcgUmF5Y2FzdFBpY2tlcih0cnVlKTtcblxuXHRcdC8vc2V0dXAgY29udHJvbGxlciB0byBiZSB1c2VkIG9uIHRoZSBjYW1lcmFcblx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyID0gbmV3IEhvdmVyQ29udHJvbGxlcih0aGlzLl9jYW1lcmEsIG51bGwsIDE4MCwgMjAsIDMyMCwgNSk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlnaHRzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaWdodHMoKTp2b2lkXG5cdHtcblx0XHQvL2NyZWF0ZSBhIGxpZ2h0IGZvciB0aGUgY2FtZXJhXG5cdFx0dGhpcy5fcG9pbnRMaWdodCA9IG5ldyBQb2ludExpZ2h0KCk7XG5cdFx0dGhpcy5fc2NlbmUuYWRkQ2hpbGQodGhpcy5fcG9pbnRMaWdodCk7XG5cdFx0dGhpcy5fbGlnaHRQaWNrZXIgPSBuZXcgU3RhdGljTGlnaHRQaWNrZXIoW3RoaXMuX3BvaW50TGlnaHRdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBtYXRlcmlhbFxuXHQgKi9cblx0cHJpdmF0ZSBpbml0TWF0ZXJpYWxzKCk6dm9pZFxuXHR7XG5cdFx0Ly8gdXYgcGFpbnRlclxuXHRcdC8vdGhpcy5fcGFpbnRlciA9IG5ldyBTcHJpdGUoKTtcblx0XHQvL3RoaXMuX3BhaW50ZXIuZ3JhcGhpY3MuYmVnaW5GaWxsKCAweEZGMDAwMCApO1xuXHRcdC8vdGhpcy5fcGFpbnRlci5ncmFwaGljcy5kcmF3Q2lyY2xlKCAwLCAwLCAxMCApO1xuXHRcdC8vdGhpcy5fcGFpbnRlci5ncmFwaGljcy5lbmRGaWxsKCk7XG5cblx0XHQvLyBsb2NhdG9yIG1hdGVyaWFsc1xuXHRcdHRoaXMuX3doaXRlTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoIDB4RkZGRkZGICk7XG5cdFx0dGhpcy5fd2hpdGVNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuXHRcdHRoaXMuX2JsYWNrTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoIDB4MzMzMzMzICk7XG5cdFx0dGhpcy5fYmxhY2tNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuXHRcdHRoaXMuX2dyYXlNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCggMHhDQ0NDQ0MgKTtcblx0XHR0aGlzLl9ncmF5TWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcblx0XHR0aGlzLl9ibHVlTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoIDB4MDAwMEZGICk7XG5cdFx0dGhpcy5fYmx1ZU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5fcmVkTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoIDB4RkYwMDAwICk7XG5cdFx0dGhpcy5fcmVkTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBzY2VuZSBvYmplY3RzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRPYmplY3RzKCk6dm9pZFxuXHR7XG5cdFx0Ly8gVG8gdHJhY2UgbW91c2UgaGl0IHBvc2l0aW9uLlxuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlciA9IDxNZXNoPiBuZXcgUHJpbWl0aXZlU3BoZXJlUHJlZmFiKDIpLmdldE5ld09iamVjdCgpO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci5tYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgweDAwRkYwMCwgMC41KTtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci5tb3VzZUVuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIubW91c2VDaGlsZHJlbiA9IGZhbHNlO1xuXHRcdHRoaXMuX3NjZW5lLmFkZENoaWxkKHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlcik7XG5cblx0XHR0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMikuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyLm1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKDB4MDAwMEZGLCAwLjUpO1xuXHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIubW91c2VFbmFibGVkID0gZmFsc2U7XG5cdFx0dGhpcy5fc2NlbmUuYWRkQ2hpbGQodGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlcik7XG5cblxuXHRcdC8vIFRvIHRyYWNlIHBpY2tpbmcgbm9ybWFscy5cblx0XHR0aGlzLl9waWNraW5nTm9ybWFsVHJhY2VyID0gbmV3IExpbmVTZWdtZW50KG5ldyBCYXNpY01hdGVyaWFsKDB4RkZGRkZGKSwgbmV3IFZlY3RvcjNEKCksIG5ldyBWZWN0b3IzRCgpLCAzKTtcblx0XHR0aGlzLl9waWNraW5nTm9ybWFsVHJhY2VyLm1vdXNlRW5hYmxlZCA9IGZhbHNlO1xuXHRcdHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQodGhpcy5fcGlja2luZ05vcm1hbFRyYWNlcik7XG5cblx0XHR0aGlzLl9zY2VuZU5vcm1hbFRyYWNlciA9IG5ldyBMaW5lU2VnbWVudChuZXcgQmFzaWNNYXRlcmlhbCgweEZGRkZGRiksIG5ldyBWZWN0b3IzRCgpLCBuZXcgVmVjdG9yM0QoKSwgMyk7XG5cdFx0dGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIubW91c2VFbmFibGVkID0gZmFsc2U7XG5cdFx0dGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQodGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIpO1xuXG5cblx0XHQvLyBMb2FkIGEgaGVhZCBtb2RlbCB0aGF0IHdlIHdpbGwgYmUgYWJsZSB0byBwYWludCBvbiBvbiBtb3VzZSBkb3duLlxuXHRcdHRoaXMuX3Rva2VuID0gQXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoJ2Fzc2V0cy9oZWFkLm9iaicpLCBudWxsLCBudWxsLCBuZXcgT0JKUGFyc2VyKCAyNSApKTtcblx0XHR0aGlzLl90b2tlbi5hZGRFdmVudExpc3RlbmVyKEFzc2V0RXZlbnQuQVNTRVRfQ09NUExFVEUsIChldmVudDpBc3NldEV2ZW50KSA9PiB0aGlzLm9uQXNzZXRDb21wbGV0ZShldmVudCkpO1xuXG5cdFx0Ly8gUHJvZHVjZSBhIGJ1bmNoIG9mIG9iamVjdHMgdG8gYmUgYXJvdW5kIHRoZSBzY2VuZS5cblx0XHR0aGlzLmNyZWF0ZUFCdW5jaE9mT2JqZWN0cygpO1xuXG5cdFx0dGhpcy5fcmF5Y2FzdFBpY2tlci5zZXRJZ25vcmVMaXN0KFt0aGlzLl9zY2VuZU5vcm1hbFRyYWNlciwgdGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlcl0pO1xuXHRcdHRoaXMuX3JheWNhc3RQaWNrZXIub25seU1vdXNlRW5hYmxlZCA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbmVyIGZvciBhc3NldCBjb21wbGV0ZSBldmVudCBvbiBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgb25Bc3NldENvbXBsZXRlKGV2ZW50OkFzc2V0RXZlbnQpOnZvaWRcblx0e1xuXHRcdGlmIChldmVudC5hc3NldC5hc3NldFR5cGUgPT0gQXNzZXRUeXBlLk1FU0gpIHtcblx0XHRcdHRoaXMuaW5pdGlhbGl6ZUhlYWRNb2RlbCg8TWVzaD4gZXZlbnQuYXNzZXQpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgaW5pdGlhbGl6ZUhlYWRNb2RlbCggbW9kZWw6TWVzaCApOnZvaWRcblx0e1xuXHRcdHRoaXMuX2hlYWQgPSBtb2RlbDtcblxuXHRcdC8vIEFwcGx5IGEgYml0bWFwIG1hdGVyaWFsIHRoYXQgY2FuIGJlIHBhaW50ZWQgb24uXG5cdFx0dmFyIGJtZDpCaXRtYXBEYXRhID0gbmV3IEJpdG1hcERhdGEoSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uUEFJTlRfVEVYVFVSRV9TSVpFLCBJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5QQUlOVF9URVhUVVJFX1NJWkUsIGZhbHNlLCAweENDQ0NDQyk7XG5cdFx0Ly9ibWQucGVybGluTm9pc2UoNTAsIDUwLCA4LCAxLCBmYWxzZSwgdHJ1ZSwgNywgdHJ1ZSk7XG5cdFx0dmFyIGJpdG1hcFRleHR1cmU6Qml0bWFwVGV4dHVyZSA9IG5ldyBCaXRtYXBUZXh0dXJlKGJtZCk7XG5cdFx0dmFyIHRleHR1cmVNYXRlcmlhbDpNZXRob2RNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbChiaXRtYXBUZXh0dXJlKTtcblx0XHR0ZXh0dXJlTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcblx0XHRtb2RlbC5tYXRlcmlhbCA9IHRleHR1cmVNYXRlcmlhbDtcblx0XHRtb2RlbC5waWNraW5nQ29sbGlkZXIgPSBuZXcgSlNQaWNraW5nQ29sbGlkZXIodGhpcy5fcmVuZGVyZXIuc3RhZ2UpO1xuXG5cdFx0Ly8gQXBwbHkgbW91c2UgaW50ZXJhY3Rpdml0eS5cblx0XHRtb2RlbC5tb3VzZUVuYWJsZWQgPSBtb2RlbC5tb3VzZUNoaWxkcmVuID0gdHJ1ZTtcblx0XHR0aGlzLmVuYWJsZU1lc2hNb3VzZUxpc3RlbmVycyhtb2RlbCk7XG5cblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKG1vZGVsKTtcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlQUJ1bmNoT2ZPYmplY3RzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fY3ViZVByZWZhYiA9IG5ldyBQcmltaXRpdmVDdWJlUHJlZmFiKCAyNSwgNTAsIDI1ICk7XG5cdFx0dGhpcy5fc3BoZXJlUHJlZmFiID0gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigxMik7XG5cdFx0dGhpcy5fY3lsaW5kZXJQcmVmYWIgPSBuZXcgUHJpbWl0aXZlQ3lsaW5kZXJQcmVmYWIoIDEyLCAxMiwgMjUgKTtcblx0XHR0aGlzLl90b3J1c1ByZWZhYiA9IG5ldyBQcmltaXRpdmVUb3J1c1ByZWZhYiggMTIsIDEyICk7XG5cblx0XHRmb3IodmFyIGk6bnVtYmVyID0gMDsgaSA8IDQwOyBpKyspIHtcblxuXHRcdFx0Ly8gQ3JlYXRlIG9iamVjdC5cblx0XHRcdHZhciBvYmplY3Q6TWVzaCA9IHRoaXMuY3JlYXRlU2ltcGxlT2JqZWN0KCk7XG5cblx0XHRcdC8vIFJhbmRvbSBvcmllbnRhdGlvbi5cblx0XHRcdC8vb2JqZWN0LnJvdGF0aW9uWCA9IDM2MCpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0Ly9vYmplY3Qucm90YXRpb25ZID0gMzYwKk1hdGgucmFuZG9tKCk7XG5cdFx0XHRvYmplY3Qucm90YXRpb25aID0gMzYwKk1hdGgucmFuZG9tKCk7XG5cblx0XHRcdC8vIFJhbmRvbSBwb3NpdGlvbi5cblx0XHRcdHZhciByOm51bWJlciA9IDIwMCArIDEwMCpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0dmFyIGF6aW11dGg6bnVtYmVyID0gMipNYXRoLlBJKk1hdGgucmFuZG9tKCk7XG5cdFx0XHR2YXIgZWxldmF0aW9uOm51bWJlciA9IDAuMjUgKiBNYXRoLlBJKk1hdGgucmFuZG9tKCk7XG5cdFx0XHRvYmplY3QueCA9IHIqTWF0aC5jb3MoZWxldmF0aW9uKSpNYXRoLnNpbihhemltdXRoKTtcblx0XHRcdG9iamVjdC55ID0gcipNYXRoLnNpbihlbGV2YXRpb24pO1xuXHRcdFx0b2JqZWN0LnogPSByKk1hdGguY29zKGVsZXZhdGlvbikqTWF0aC5jb3MoYXppbXV0aCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVTaW1wbGVPYmplY3QoKTpNZXNoXG5cdHtcblxuXHRcdHZhciBtZXNoOk1lc2g7XG5cdFx0dmFyIGJvdW5kc1R5cGU6c3RyaW5nO1xuXG5cdFx0Ly8gQ2hvc2UgYSByYW5kb20gbWVzaC5cblx0XHR2YXIgcmFuZEdlb21ldHJ5Om51bWJlciA9IE1hdGgucmFuZG9tKCk7XG5cdFx0aWYoIHJhbmRHZW9tZXRyeSA+IDAuNzUgKSB7XG5cdFx0XHRtZXNoID0gPE1lc2g+IHRoaXMuX2N1YmVQcmVmYWIuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYoIHJhbmRHZW9tZXRyeSA+IDAuNSApIHtcblx0XHRcdG1lc2ggPSA8TWVzaD4gdGhpcy5fc3BoZXJlUHJlZmFiLmdldE5ld09iamVjdCgpO1xuXHRcdFx0Ym91bmRzVHlwZSA9IEJvdW5kc1R5cGUuU1BIRVJFOyAvLyBiZXR0ZXIgb24gc3BoZXJpY2FsIG1lc2hlcyB3aXRoIGJvdW5kIHBpY2tpbmcgY29sbGlkZXJzXG5cdFx0fVxuXHRcdGVsc2UgaWYoIHJhbmRHZW9tZXRyeSA+IDAuMjUgKSB7XG5cdFx0XHRtZXNoID0gPE1lc2g+IHRoaXMuX2N5bGluZGVyUHJlZmFiLmdldE5ld09iamVjdCgpO1xuXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0bWVzaCA9IDxNZXNoPiB0aGlzLl90b3J1c1ByZWZhYi5nZXROZXdPYmplY3QoKTtcblx0XHR9XG5cblx0XHRpZiAoYm91bmRzVHlwZSlcblx0XHRcdG1lc2guYm91bmRzVHlwZSA9IGJvdW5kc1R5cGU7XG5cblx0XHQvLyBSYW5kb21seSBkZWNpZGUgaWYgdGhlIG1lc2ggaGFzIGEgdHJpYW5nbGUgY29sbGlkZXIuXG5cdFx0dmFyIHVzZXNUcmlhbmdsZUNvbGxpZGVyOmJvb2xlYW4gPSBNYXRoLnJhbmRvbSgpID4gMC41O1xuXHRcdGlmKCB1c2VzVHJpYW5nbGVDb2xsaWRlciApIHtcblx0XHRcdC8vIEFTMyB0cmlhbmdsZSBwaWNrZXJzIGZvciBtZXNoZXMgd2l0aCBsb3cgcG9seSBjb3VudHMgYXJlIGZhc3RlciB0aGFuIHBpeGVsIGJlbmRlciBvbmVzLlxuXHRcdFx0Ly9cdFx0XHRcdG1lc2gucGlja2luZ0NvbGxpZGVyID0gUGlja2luZ0NvbGxpZGVyVHlwZS5CT1VORFNfT05MWTsgLy8gdGhpcyBpcyB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgYWxsIG1lc2hlc1xuXHRcdFx0bWVzaC5waWNraW5nQ29sbGlkZXIgPSBuZXcgSlNQaWNraW5nQ29sbGlkZXIodGhpcy5fcmVuZGVyZXIuc3RhZ2UpO1xuXHRcdFx0Ly9cdFx0XHRcdG1lc2gucGlja2luZ0NvbGxpZGVyID0gUGlja2luZ0NvbGxpZGVyVHlwZS5BUzNfQkVTVF9ISVQ7IC8vIHNsb3dlciBhbmQgbW9yZSBhY2N1cmF0ZSwgYmVzdCBmb3IgbWVzaGVzIHdpdGggZm9sZHNcblx0XHRcdC8vXHRcdFx0XHRtZXNoLnBpY2tpbmdDb2xsaWRlciA9IFBpY2tpbmdDb2xsaWRlclR5cGUuQVVUT19GSVJTVF9FTkNPVU5URVJFRDsgLy8gYXV0b21hdGljYWxseSBkZWNpZGVzIHdoZW4gdG8gdXNlIHBpeGVsIGJlbmRlciBvciBhY3Rpb25zY3JpcHRcblx0XHR9XG5cblx0XHQvLyBFbmFibGUgbW91c2UgaW50ZXJhY3Rpdml0eT9cblx0XHR2YXIgaXNNb3VzZUVuYWJsZWQ6Ym9vbGVhbiA9IE1hdGgucmFuZG9tKCkgPiAwLjI1O1xuXHRcdG1lc2gubW91c2VFbmFibGVkID0gbWVzaC5tb3VzZUNoaWxkcmVuID0gaXNNb3VzZUVuYWJsZWQ7XG5cblx0XHQvLyBFbmFibGUgbW91c2UgbGlzdGVuZXJzP1xuXHRcdHZhciBsaXN0ZW5zVG9Nb3VzZUV2ZW50czpib29sZWFuID0gTWF0aC5yYW5kb20oKSA+IDAuMjU7XG5cdFx0aWYoIGlzTW91c2VFbmFibGVkICYmIGxpc3RlbnNUb01vdXNlRXZlbnRzICkge1xuXHRcdFx0dGhpcy5lbmFibGVNZXNoTW91c2VMaXN0ZW5lcnMobWVzaCk7XG5cdFx0fVxuXG5cdFx0Ly8gQXBwbHkgbWF0ZXJpYWwgYWNjb3JkaW5nIHRvIHRoZSByYW5kb20gc2V0dXAgb2YgdGhlIG9iamVjdC5cblx0XHR0aGlzLmNob3NlTWVzaE1hdGVyaWFsKG1lc2gpO1xuXG5cdFx0Ly8gQWRkIHRvIHNjZW5lIGFuZCBzdG9yZS5cblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKG1lc2gpO1xuXG5cdFx0cmV0dXJuIG1lc2g7XG5cdH1cblxuXHRwcml2YXRlIGNob3NlTWVzaE1hdGVyaWFsKG1lc2g6TWVzaCk6dm9pZFxuXHR7XG5cdFx0aWYoICFtZXNoLm1vdXNlRW5hYmxlZCApIHtcblx0XHRcdG1lc2gubWF0ZXJpYWwgPSB0aGlzLl9ibGFja01hdGVyaWFsO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlmKCAhbWVzaC5oYXNFdmVudExpc3RlbmVyKCBBd2F5TW91c2VFdmVudC5NT1VTRV9NT1ZFICkgKSB7XG5cdFx0XHRcdG1lc2gubWF0ZXJpYWwgPSB0aGlzLl9ncmF5TWF0ZXJpYWw7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoIG1lc2gucGlja2luZ0NvbGxpZGVyICE9IG51bGwgKSB7XG5cdFx0XHRcdFx0bWVzaC5tYXRlcmlhbCA9IHRoaXMuX3JlZE1hdGVyaWFsO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdG1lc2gubWF0ZXJpYWwgPSB0aGlzLl9ibHVlTWF0ZXJpYWw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlzdGVuZXJzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaXN0ZW5lcnMoKTp2b2lkXG5cdHtcblx0XHR3aW5kb3cub25yZXNpemUgID0gKGV2ZW50OlVJRXZlbnQpID0+IHRoaXMub25SZXNpemUoZXZlbnQpO1xuXG5cdFx0ZG9jdW1lbnQub25tb3VzZWRvd24gPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlRG93bihldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZXVwID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZVVwKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNlbW92ZSA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNld2hlZWwgPSAoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KSA9PiB0aGlzLm9uTW91c2VXaGVlbChldmVudCk7XG5cdFx0ZG9jdW1lbnQub25rZXlkb3duID0gKGV2ZW50OktleWJvYXJkRXZlbnQpID0+IHRoaXMub25LZXlEb3duKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbmtleXVwID0gKGV2ZW50OktleWJvYXJkRXZlbnQpID0+IHRoaXMub25LZXlVcChldmVudCk7XG5cblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cblx0XHR0aGlzLl90aW1lciA9IG5ldyBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkVudGVyRnJhbWUsIHRoaXMpO1xuXHRcdHRoaXMuX3RpbWVyLnN0YXJ0KCk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGlvbiBhbmQgcmVuZGVyIGxvb3Bcblx0ICovXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGR0Om51bWJlcik6dm9pZFxuXHR7XG5cdFx0Ly8gTW92ZSBsaWdodCB3aXRoIGNhbWVyYS5cblx0XHR0aGlzLl9wb2ludExpZ2h0LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMuX2NhbWVyYS50cmFuc2Zvcm0ucG9zaXRpb247XG5cblx0XHR2YXIgY29sbGlkaW5nT2JqZWN0OlBpY2tpbmdDb2xsaXNpb25WTyA9IHRoaXMuX3JheWNhc3RQaWNrZXIuZ2V0U2NlbmVDb2xsaXNpb24odGhpcy5fY2FtZXJhLnRyYW5zZm9ybS5wb3NpdGlvbiwgdGhpcy5fdmlldy5jYW1lcmEudHJhbnNmb3JtLmZvcndhcmRWZWN0b3IsIHRoaXMuX3ZpZXcuc2NlbmUpO1xuXHRcdC8vdmFyIG1lc2g6TWVzaDtcblxuXHRcdGlmICh0aGlzLl9wcmV2aW9pdXNDb2xsaWRpbmdPYmplY3QgJiYgdGhpcy5fcHJldmlvaXVzQ29sbGlkaW5nT2JqZWN0ICE9IGNvbGxpZGluZ09iamVjdCkgeyAvL2VxdWl2YWxlbnQgdG8gbW91c2Ugb3V0XG5cdFx0XHR0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyLnZpc2libGUgPSB0aGlzLl9zY2VuZU5vcm1hbFRyYWNlci52aXNpYmxlID0gZmFsc2U7XG5cdFx0XHR0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyLnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IzRCgpO1xuXHRcdH1cblxuXHRcdGlmIChjb2xsaWRpbmdPYmplY3QpIHtcblx0XHRcdC8vIFNob3cgdHJhY2Vycy5cblx0XHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IHRoaXMuX3NjZW5lTm9ybWFsVHJhY2VyLnZpc2libGUgPSB0cnVlO1xuXG5cdFx0XHQvLyBVcGRhdGUgcG9zaXRpb24gdHJhY2VyLlxuXHRcdFx0dGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb24gPSBjb2xsaWRpbmdPYmplY3QuZGlzcGxheU9iamVjdC5zY2VuZVRyYW5zZm9ybS50cmFuc2Zvcm1WZWN0b3IoY29sbGlkaW5nT2JqZWN0LmxvY2FsUG9zaXRpb24pO1xuXG5cdFx0XHQvLyBVcGRhdGUgbm9ybWFsIHRyYWNlci5cblx0XHRcdHRoaXMuX3NjZW5lTm9ybWFsVHJhY2VyLnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIudHJhbnNmb3JtLnBvc2l0aW9uO1xuXHRcdFx0dmFyIG5vcm1hbDpWZWN0b3IzRCA9IGNvbGxpZGluZ09iamVjdC5kaXNwbGF5T2JqZWN0LnNjZW5lVHJhbnNmb3JtLmRlbHRhVHJhbnNmb3JtVmVjdG9yKGNvbGxpZGluZ09iamVjdC5sb2NhbE5vcm1hbCk7XG5cdFx0XHRub3JtYWwubm9ybWFsaXplKCk7XG5cdFx0XHRub3JtYWwuc2NhbGVCeSggMjUgKTtcblx0XHRcdHRoaXMuX3NjZW5lTm9ybWFsVHJhY2VyLmVuZFBvc2l0aW9uID0gbm9ybWFsLmNsb25lKCk7XG5cdFx0fVxuXG5cblx0XHR0aGlzLl9wcmV2aW9pdXNDb2xsaWRpbmdPYmplY3QgPSBjb2xsaWRpbmdPYmplY3Q7XG5cblx0XHQvLyBSZW5kZXIgM0QuXG5cdFx0dGhpcy5fdmlldy5yZW5kZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBLZXkgZG93biBsaXN0ZW5lciBmb3IgY2FtZXJhIGNvbnRyb2xcblx0ICovXG5cdHByaXZhdGUgb25LZXlEb3duKGV2ZW50OktleWJvYXJkRXZlbnQpOnZvaWRcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdFx0dGhpcy5fdGlsdEluY3JlbWVudCA9IHRoaXMuX3RpbHRTcGVlZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkRPV046XG5cdFx0XHRjYXNlIEtleWJvYXJkLlM6XG5cdFx0XHRcdHRoaXMuX3RpbHRJbmNyZW1lbnQgPSAtdGhpcy5fdGlsdFNwZWVkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTEVGVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuQTpcblx0XHRcdFx0dGhpcy5fcGFuSW5jcmVtZW50ID0gdGhpcy5fcGFuU3BlZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5SSUdIVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRDpcblx0XHRcdFx0dGhpcy5fcGFuSW5jcmVtZW50ID0gLXRoaXMuX3BhblNwZWVkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuWjpcblx0XHRcdFx0dGhpcy5fZGlzdGFuY2VJbmNyZW1lbnQgPSB0aGlzLl9kaXN0YW5jZVNwZWVkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuWDpcblx0XHRcdFx0dGhpcy5fZGlzdGFuY2VJbmNyZW1lbnQgPSAtdGhpcy5fZGlzdGFuY2VTcGVlZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEtleSB1cCBsaXN0ZW5lciBmb3IgY2FtZXJhIGNvbnRyb2xcblx0ICovXG5cdHByaXZhdGUgb25LZXlVcChldmVudDpLZXlib2FyZEV2ZW50KTp2b2lkXG5cdHtcblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVVA6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlc6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkRPV046XG5cdFx0XHRjYXNlIEtleWJvYXJkLlM6XG5cdFx0XHRcdHRoaXMuX3RpbHRJbmNyZW1lbnQgPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTEVGVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuQTpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUklHSFQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkQ6XG5cdFx0XHRcdHRoaXMuX3BhbkluY3JlbWVudCA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5aOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5YOlxuXHRcdFx0XHR0aGlzLl9kaXN0YW5jZUluY3JlbWVudCA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyAzRCBtb3VzZSBldmVudCBoYW5kbGVycy5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0cHJpdmF0ZSBlbmFibGVNZXNoTW91c2VMaXN0ZW5lcnMobWVzaDpNZXNoKTp2b2lkXG5cdHtcblx0XHRtZXNoLmFkZEV2ZW50TGlzdGVuZXIoQXdheU1vdXNlRXZlbnQuTU9VU0VfT1ZFUiwgKGV2ZW50OkF3YXlNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTWVzaE1vdXNlT3ZlcihldmVudCkpO1xuXHRcdG1lc2guYWRkRXZlbnRMaXN0ZW5lcihBd2F5TW91c2VFdmVudC5NT1VTRV9PVVQsIChldmVudDpBd2F5TW91c2VFdmVudCkgPT4gdGhpcy5vbk1lc2hNb3VzZU91dChldmVudCkpO1xuXHRcdG1lc2guYWRkRXZlbnRMaXN0ZW5lcihBd2F5TW91c2VFdmVudC5NT1VTRV9NT1ZFLCAoZXZlbnQ6QXdheU1vdXNlRXZlbnQpID0+IHRoaXMub25NZXNoTW91c2VNb3ZlKGV2ZW50KSk7XG5cdFx0bWVzaC5hZGRFdmVudExpc3RlbmVyKEF3YXlNb3VzZUV2ZW50Lk1PVVNFX0RPV04sIChldmVudDpBd2F5TW91c2VFdmVudCkgPT4gdGhpcy5vbk1lc2hNb3VzZURvd24oZXZlbnQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBtZXNoIGxpc3RlbmVyIGZvciBtb3VzZSBkb3duIGludGVyYWN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTWVzaE1vdXNlRG93bihldmVudDpBd2F5TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0Ly92YXIgbWVzaDpNZXNoID0gPE1lc2g+IGV2ZW50Lm9iamVjdDtcblx0XHQvLy8vIFBhaW50IG9uIHRoZSBoZWFkJ3MgbWF0ZXJpYWwuXG5cdFx0Ly9pZiggbWVzaCA9PSB0aGlzLl9oZWFkICkge1xuXHRcdC8vXHR2YXIgdXY6UG9pbnQgPSBldmVudC51djtcblx0XHQvL1x0dmFyIHRleHR1cmVNYXRlcmlhbDpNZXRob2RNYXRlcmlhbCA9ICg8TWV0aG9kTWF0ZXJpYWw+ICg8TWVzaD4gZXZlbnQub2JqZWN0KS5tYXRlcmlhbCk7XG5cdFx0Ly9cdHZhciBibWQ6Qml0bWFwRGF0YSA9IEJpdG1hcFRleHR1cmUoIHRleHR1cmVNYXRlcmlhbC50ZXh0dXJlICkuYml0bWFwRGF0YTtcblx0XHQvL1x0dmFyIHg6bnVtYmVyID0gSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uUEFJTlRfVEVYVFVSRV9TSVpFKnV2Lng7XG5cdFx0Ly9cdHZhciB5Om51bWJlciA9IEludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLlBBSU5UX1RFWFRVUkVfU0laRSp1di55O1xuXHRcdC8vXHR2YXIgbWF0cml4Ok1hdHJpeCA9IG5ldyBNYXRyaXgoKTtcblx0XHQvL1x0bWF0cml4LnRyYW5zbGF0ZSh4LCB5KTtcblx0XHQvL1x0Ym1kLmRyYXcodGhpcy5fcGFpbnRlciwgbWF0cml4KTtcblx0XHQvL1x0Qml0bWFwVGV4dHVyZSh0ZXh0dXJlTWF0ZXJpYWwudGV4dHVyZSkuaW52YWxpZGF0ZUNvbnRlbnQoKTtcblx0XHQvL31cblx0fVxuXG5cdC8qKlxuXHQgKiBtZXNoIGxpc3RlbmVyIGZvciBtb3VzZSBvdmVyIGludGVyYWN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTWVzaE1vdXNlT3ZlcihldmVudDpBd2F5TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dmFyIG1lc2g6TWVzaCA9IDxNZXNoPiBldmVudC5vYmplY3Q7XG5cdFx0bWVzaC5kZWJ1Z1Zpc2libGUgPSB0cnVlO1xuXHRcdGlmKCBtZXNoICE9IHRoaXMuX2hlYWQgKSBtZXNoLm1hdGVyaWFsID0gdGhpcy5fd2hpdGVNYXRlcmlhbDtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIudmlzaWJsZSA9IHRydWU7XG5cdFx0dGhpcy5vbk1lc2hNb3VzZU1vdmUoZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIG1lc2ggbGlzdGVuZXIgZm9yIG1vdXNlIG91dCBpbnRlcmFjdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1lc2hNb3VzZU91dChldmVudDpBd2F5TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dmFyIG1lc2g6TWVzaCA9IDxNZXNoPiBldmVudC5vYmplY3Q7XG5cdFx0bWVzaC5kZWJ1Z1Zpc2libGUgPSBmYWxzZTtcblx0XHRpZiggbWVzaCAhPSB0aGlzLl9oZWFkICkgdGhpcy5jaG9zZU1lc2hNYXRlcmlhbCggbWVzaCApO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci52aXNpYmxlID0gdGhpcy5fcGlja2luZ05vcm1hbFRyYWNlci52aXNpYmxlID0gZmFsc2U7XG5cdFx0dGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyLnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IzRCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIG1lc2ggbGlzdGVuZXIgZm9yIG1vdXNlIG1vdmUgaW50ZXJhY3Rpb25cblx0ICovXG5cdHByaXZhdGUgb25NZXNoTW91c2VNb3ZlKGV2ZW50OkF3YXlNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHQvLyBTaG93IHRyYWNlcnMuXG5cdFx0dGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyLnZpc2libGUgPSB0aGlzLl9waWNraW5nTm9ybWFsVHJhY2VyLnZpc2libGUgPSB0cnVlO1xuXHRcblx0XHQvLyBVcGRhdGUgcG9zaXRpb24gdHJhY2VyLlxuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb24gPSBldmVudC5zY2VuZVBvc2l0aW9uO1xuXHRcblx0XHQvLyBVcGRhdGUgbm9ybWFsIHRyYWNlci5cblx0XHR0aGlzLl9waWNraW5nTm9ybWFsVHJhY2VyLnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb247XG5cdFx0dmFyIG5vcm1hbDpWZWN0b3IzRCA9IGV2ZW50LnNjZW5lTm9ybWFsLmNsb25lKCk7XG5cdFx0bm9ybWFsLnNjYWxlQnkoIDI1ICk7XG5cdFx0dGhpcy5fcGlja2luZ05vcm1hbFRyYWNlci5lbmRQb3NpdGlvbiA9IG5vcm1hbC5jbG9uZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fbGFzdFBhbkFuZ2xlID0gdGhpcy5fY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZTtcblx0XHR0aGlzLl9sYXN0VGlsdEFuZ2xlID0gdGhpcy5fY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGU7XG5cdFx0dGhpcy5fbGFzdE1vdXNlWCA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy5fbGFzdE1vdXNlWSA9IGV2ZW50LmNsaWVudFk7XG5cdFx0dGhpcy5fbW92ZSA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgdXAgbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZVVwKGV2ZW50Ok1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHRoaXMuX21vdmUgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBtb3ZlIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50Ok1vdXNlRXZlbnQpXG5cdHtcblx0XHRpZiAodGhpcy5fbW92ZSkge1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyooZXZlbnQuY2xpZW50WCAtIHRoaXMuX2xhc3RNb3VzZVgpICsgdGhpcy5fbGFzdFBhbkFuZ2xlO1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFkgLSB0aGlzLl9sYXN0TW91c2VZKSArIHRoaXMuX2xhc3RUaWx0QW5nbGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHdoZWVsIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VXaGVlbChldmVudDpNb3VzZVdoZWVsRXZlbnQpXG5cdHtcblx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlIC09IGV2ZW50LndoZWVsRGVsdGE7XG5cblx0XHRpZiAodGhpcy5fY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA8IDEwMClcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPSAxMDA7XG5cdFx0ZWxzZSBpZiAodGhpcy5fY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA+IDIwMDApXG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gMjAwMDtcblx0fVxuXG5cdC8qKlxuXHQgKiB3aW5kb3cgbGlzdGVuZXIgZm9yIHJlc2l6ZSBldmVudHNcblx0ICovXG5cdHByaXZhdGUgb25SZXNpemUoZXZlbnQ6VUlFdmVudCA9IG51bGwpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3ZpZXcueSA9IDA7XG5cdFx0dGhpcy5fdmlldy54ID0gMDtcblx0XHR0aGlzLl92aWV3LndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy5fdmlldy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdH1cbn1cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKClcbntcblx0bmV3IEludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uKCk7XG59Il19