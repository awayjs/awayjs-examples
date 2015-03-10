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
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var BitmapTexture = require("awayjs-core/lib/textures/BitmapTexture");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Keyboard = require("awayjs-core/lib/ui/Keyboard");
var View = require("awayjs-display/lib/containers/View");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var BoundsType = require("awayjs-display/lib/bounds/BoundsType");
var LineSegment = require("awayjs-display/lib/entities/LineSegment");
var Mesh = require("awayjs-display/lib/entities/Mesh");
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
        if (event.asset.isAsset(Mesh)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi50cyJdLCJuYW1lcyI6WyJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbiIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmluaXRFbmdpbmUiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdE1hdGVyaWFscyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmluaXRPYmplY3RzIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Bc3NldENvbXBsZXRlIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdGlhbGl6ZUhlYWRNb2RlbCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNyZWF0ZUFCdW5jaE9mT2JqZWN0cyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNyZWF0ZVNpbXBsZU9iamVjdCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmNob3NlTWVzaE1hdGVyaWFsIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uRW50ZXJGcmFtZSIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uS2V5RG93biIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uS2V5VXAiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5lbmFibGVNZXNoTW91c2VMaXN0ZW5lcnMiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZURvd24iLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZU92ZXIiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1lc2hNb3VzZU91dCIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uTWVzaE1vdXNlTW92ZSIsIkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLm9uTW91c2VEb3duIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Nb3VzZVVwIiwiSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24ub25Nb3VzZU1vdmUiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vbk1vdXNlV2hlZWwiLCJJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5vblJlc2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBbUNFO0FBRUYsSUFBTyxVQUFVLFdBQWUsaUNBQWlDLENBQUMsQ0FBQztBQUNuRSxJQUFPLFVBQVUsV0FBZSxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3JFLElBQU8sUUFBUSxXQUFnQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2hFLElBQU8sWUFBWSxXQUFlLHNDQUFzQyxDQUFDLENBQUM7QUFHMUUsSUFBTyxVQUFVLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUNsRSxJQUFPLGFBQWEsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzVFLElBQU8scUJBQXFCLFdBQVksNkNBQTZDLENBQUMsQ0FBQztBQUN2RixJQUFPLFFBQVEsV0FBZ0IsNkJBQTZCLENBQUMsQ0FBQztBQUk5RCxJQUFPLElBQUksV0FBaUIsb0NBQW9DLENBQUMsQ0FBQztBQUNsRSxJQUFPLGVBQWUsV0FBYyxnREFBZ0QsQ0FBQyxDQUFDO0FBQ3RGLElBQU8sVUFBVSxXQUFlLHNDQUFzQyxDQUFDLENBQUM7QUFHeEUsSUFBTyxXQUFXLFdBQWUseUNBQXlDLENBQUMsQ0FBQztBQUM1RSxJQUFPLElBQUksV0FBaUIsa0NBQWtD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RUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDekVBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDMUNBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsWUFBWUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDL0NBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7UUFHaERBLEFBQ0FBLDRCQUQ0QkE7UUFDNUJBLElBQUlBLENBQUNBLG9CQUFvQkEsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsSUFBSUEsUUFBUUEsRUFBRUEsRUFBRUEsSUFBSUEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNUdBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsWUFBWUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDL0NBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDMUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7UUFFckRBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsSUFBSUEsUUFBUUEsRUFBRUEsRUFBRUEsSUFBSUEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUdBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsWUFBWUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDN0NBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDeENBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFB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SUFFZixJQUFJLDZCQUE2QixFQUFFLENBQUM7QUFDckMsQ0FBQyxDQUFBIiwiZmlsZSI6IkludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuU2hhZGluZyBleGFtcGxlIGluIEF3YXkzZFxuXG5EZW1vbnN0cmF0ZXM6XG5cbkhvdyB0byBjcmVhdGUgbXVsdGlwbGUgZW50aXRpZXNvdXJjZXMgaW4gYSBzY2VuZS5cbkhvdyB0byBhcHBseSBzcGVjdWxhciBtYXBzLCBub3JtYWxzIG1hcHMgYW5kIGRpZmZ1c2UgdGV4dHVyZSBtYXBzIHRvIGEgbWF0ZXJpYWwuXG5cbkNvZGUgYnkgUm9iIEJhdGVtYW5cbnJvYkBpbmZpbml0ZXR1cnRsZXMuY28udWtcbmh0dHA6Ly93d3cuaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5cblRoaXMgY29kZSBpcyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuQ29weXJpZ2h0IChjKSBUaGUgQXdheSBGb3VuZGF0aW9uIGh0dHA6Ly93d3cudGhlYXdheWZvdW5kYXRpb24ub3JnXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIOKAnFNvZnR3YXJl4oCdKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCDigJxBUyBJU+KAnSwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG5cbiovXG5cbmltcG9ydCBCaXRtYXBEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0JpdG1hcERhdGFcIik7XG5pbXBvcnQgQXNzZXRFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0Fzc2V0RXZlbnRcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IElBc3NldFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0lBc3NldFwiKTtcbmltcG9ydCBBc3NldExvYWRlclRva2VuXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExvYWRlclRva2VuXCIpO1xuaW1wb3J0IFVSTFJlcXVlc3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IEJpdG1hcFRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9CaXRtYXBUZXh0dXJlXCIpO1xuaW1wb3J0IFJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuaW1wb3J0IEtleWJvYXJkXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3VpL0tleWJvYXJkXCIpO1xuXG5pbXBvcnQgU2NlbmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9TY2VuZVwiKTtcbmltcG9ydCBMb2FkZXJcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9Mb2FkZXJcIik7XG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvVmlld1wiKTtcbmltcG9ydCBIb3ZlckNvbnRyb2xsZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250cm9sbGVycy9Ib3ZlckNvbnRyb2xsZXJcIik7XG5pbXBvcnQgQm91bmRzVHlwZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYm91bmRzL0JvdW5kc1R5cGVcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBEaXJlY3Rpb25hbExpZ2h0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBMaW5lU2VnbWVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTGluZVNlZ21lbnRcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL01lc2hcIik7XG5pbXBvcnQgUG9pbnRMaWdodFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvUG9pbnRMaWdodFwiKTtcbmltcG9ydCBBd2F5TW91c2VFdmVudFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2V2ZW50cy9Nb3VzZUV2ZW50XCIpO1xuaW1wb3J0IEJhc2ljTWF0ZXJpYWxcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvQmFzaWNNYXRlcmlhbFwiKTtcbmltcG9ydCBTdGF0aWNMaWdodFBpY2tlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL1N0YXRpY0xpZ2h0UGlja2VyXCIpO1xuaW1wb3J0IFBpY2tpbmdDb2xsaXNpb25WT1x0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9waWNrL1BpY2tpbmdDb2xsaXNpb25WT1wiKTtcbmltcG9ydCBSYXljYXN0UGlja2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcGljay9SYXljYXN0UGlja2VyXCIpO1xuaW1wb3J0IFByaW1pdGl2ZUN1YmVQcmVmYWJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVDdWJlUHJlZmFiXCIpO1xuaW1wb3J0IFByaW1pdGl2ZUN5bGluZGVyUHJlZmFiXHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9wcmVmYWJzL1ByaW1pdGl2ZUN5bGluZGVyUHJlZmFiXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVNwaGVyZVByZWZhYlx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVTcGhlcmVQcmVmYWJcIik7XG5pbXBvcnQgUHJpbWl0aXZlVG9ydXNQcmVmYWJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVUb3J1c1ByZWZhYlwiKTtcblxuaW1wb3J0IERlZmF1bHRSZW5kZXJlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL0RlZmF1bHRSZW5kZXJlclwiKTtcbmltcG9ydCBKU1BpY2tpbmdDb2xsaWRlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9waWNrL0pTUGlja2luZ0NvbGxpZGVyXCIpO1xuXG5pbXBvcnQgTWV0aG9kTWF0ZXJpYWxcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL01ldGhvZE1hdGVyaWFsXCIpO1xuaW1wb3J0IE1ldGhvZFJlbmRlcmVyUG9vbFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL3Bvb2wvTWV0aG9kUmVuZGVyZXJQb29sXCIpO1xuXG5pbXBvcnQgT0JKUGFyc2VyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1wYXJzZXJzL2xpYi9PQkpQYXJzZXJcIik7XG5cbi8qKlxuICpcbiAqL1xuY2xhc3MgSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb25cbntcblx0Ly9lbmdpbmUgdmFyaWFibGVzXG5cdHByaXZhdGUgX3NjZW5lOlNjZW5lO1xuXHRwcml2YXRlIF9jYW1lcmE6Q2FtZXJhO1xuXHRwcml2YXRlIF9yZW5kZXJlcjpEZWZhdWx0UmVuZGVyZXI7XG5cdHByaXZhdGUgX3ZpZXc6Vmlldztcblx0cHJpdmF0ZSBfdG9rZW46QXNzZXRMb2FkZXJUb2tlbjtcblx0cHJpdmF0ZSBfY2FtZXJhQ29udHJvbGxlcjpIb3ZlckNvbnRyb2xsZXI7XG5cblx0cHJpdmF0ZSBfdGltZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF90aW1lOm51bWJlciA9IDA7XG5cblx0Ly9tYXRlcmlhbCBvYmplY3RzXG5cdC8vcHJpdmF0ZSBfcGFpbnRlcjpTcHJpdGU7XG5cdHByaXZhdGUgX2JsYWNrTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgX3doaXRlTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgX2dyYXlNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBfYmx1ZU1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIF9yZWRNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblxuXHQvL2xpZ2h0IG9iamVjdHNcblx0cHJpdmF0ZSBfcG9pbnRMaWdodDpQb2ludExpZ2h0O1xuXHRwcml2YXRlIF9saWdodFBpY2tlcjpTdGF0aWNMaWdodFBpY2tlcjtcblxuXHQvL3NjZW5lIG9iamVjdHNcblx0cHJpdmF0ZSBfcGlja2luZ1Bvc2l0aW9uVHJhY2VyOk1lc2g7XG5cdHByaXZhdGUgX3NjZW5lUG9zaXRpb25UcmFjZXI6TWVzaDtcblx0cHJpdmF0ZSBfcGlja2luZ05vcm1hbFRyYWNlcjpMaW5lU2VnbWVudDtcblx0cHJpdmF0ZSBfc2NlbmVOb3JtYWxUcmFjZXI6TGluZVNlZ21lbnQ7XG5cdHByaXZhdGUgX3ByZXZpb2l1c0NvbGxpZGluZ09iamVjdDpQaWNraW5nQ29sbGlzaW9uVk87XG5cdHByaXZhdGUgX3JheWNhc3RQaWNrZXI6UmF5Y2FzdFBpY2tlciA9IG5ldyBSYXljYXN0UGlja2VyKGZhbHNlKTtcblx0cHJpdmF0ZSBfaGVhZDpNZXNoO1xuXHRwcml2YXRlIF9jdWJlUHJlZmFiOlByaW1pdGl2ZUN1YmVQcmVmYWI7XG5cdHByaXZhdGUgX3NwaGVyZVByZWZhYjpQcmltaXRpdmVTcGhlcmVQcmVmYWI7XG5cdHByaXZhdGUgX2N5bGluZGVyUHJlZmFiOlByaW1pdGl2ZUN5bGluZGVyUHJlZmFiO1xuXHRwcml2YXRlIF90b3J1c1ByZWZhYjpQcmltaXRpdmVUb3J1c1ByZWZhYjtcblxuXHQvL25hdmlnYXRpb24gdmFyaWFibGVzXG5cdHByaXZhdGUgX21vdmU6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIF9sYXN0UGFuQW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0VGlsdEFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdE1vdXNlWDpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RNb3VzZVk6bnVtYmVyO1xuXHRwcml2YXRlIF90aWx0U3BlZWQ6bnVtYmVyID0gNDtcblx0cHJpdmF0ZSBfcGFuU3BlZWQ6bnVtYmVyID0gNDtcblx0cHJpdmF0ZSBfZGlzdGFuY2VTcGVlZDpudW1iZXIgPSA0O1xuXHRwcml2YXRlIF90aWx0SW5jcmVtZW50Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX3BhbkluY3JlbWVudDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9kaXN0YW5jZUluY3JlbWVudDpudW1iZXIgPSAwO1xuXG5cdHByaXZhdGUgc3RhdGljIFBBSU5UX1RFWFRVUkVfU0laRTpudW1iZXIgPSAxMDI0O1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblxuXHQvKipcblx0ICogR2xvYmFsIGluaXRpYWxpc2UgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgaW5pdCgpOnZvaWRcblx0e1xuXHRcdHRoaXMuaW5pdEVuZ2luZSgpO1xuXHRcdHRoaXMuaW5pdExpZ2h0cygpO1xuXHRcdHRoaXMuaW5pdE1hdGVyaWFscygpO1xuXHRcdHRoaXMuaW5pdE9iamVjdHMoKTtcblx0XHR0aGlzLmluaXRMaXN0ZW5lcnMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBlbmdpbmVcblx0ICovXG5cdHByaXZhdGUgaW5pdEVuZ2luZSgpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3JlbmRlcmVyID0gbmV3IERlZmF1bHRSZW5kZXJlcihNZXRob2RSZW5kZXJlclBvb2wpO1xuXHRcdHRoaXMuX3ZpZXcgPSBuZXcgVmlldyh0aGlzLl9yZW5kZXJlcik7XG5cdFx0dGhpcy5fdmlldy5mb3JjZU1vdXNlTW92ZSA9IHRydWU7XG5cdFx0dGhpcy5fc2NlbmUgPSB0aGlzLl92aWV3LnNjZW5lO1xuXHRcdHRoaXMuX2NhbWVyYSA9IHRoaXMuX3ZpZXcuY2FtZXJhO1xuXHRcdHRoaXMuX3ZpZXcubW91c2VQaWNrZXIgPSBuZXcgUmF5Y2FzdFBpY2tlcih0cnVlKTtcblxuXHRcdC8vc2V0dXAgY29udHJvbGxlciB0byBiZSB1c2VkIG9uIHRoZSBjYW1lcmFcblx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyID0gbmV3IEhvdmVyQ29udHJvbGxlcih0aGlzLl9jYW1lcmEsIG51bGwsIDE4MCwgMjAsIDMyMCwgNSk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlnaHRzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaWdodHMoKTp2b2lkXG5cdHtcblx0XHQvL2NyZWF0ZSBhIGxpZ2h0IGZvciB0aGUgY2FtZXJhXG5cdFx0dGhpcy5fcG9pbnRMaWdodCA9IG5ldyBQb2ludExpZ2h0KCk7XG5cdFx0dGhpcy5fc2NlbmUuYWRkQ2hpbGQodGhpcy5fcG9pbnRMaWdodCk7XG5cdFx0dGhpcy5fbGlnaHRQaWNrZXIgPSBuZXcgU3RhdGljTGlnaHRQaWNrZXIoW3RoaXMuX3BvaW50TGlnaHRdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBtYXRlcmlhbFxuXHQgKi9cblx0cHJpdmF0ZSBpbml0TWF0ZXJpYWxzKCk6dm9pZFxuXHR7XG5cdFx0Ly8gdXYgcGFpbnRlclxuXHRcdC8vdGhpcy5fcGFpbnRlciA9IG5ldyBTcHJpdGUoKTtcblx0XHQvL3RoaXMuX3BhaW50ZXIuZ3JhcGhpY3MuYmVnaW5GaWxsKCAweEZGMDAwMCApO1xuXHRcdC8vdGhpcy5fcGFpbnRlci5ncmFwaGljcy5kcmF3Q2lyY2xlKCAwLCAwLCAxMCApO1xuXHRcdC8vdGhpcy5fcGFpbnRlci5ncmFwaGljcy5lbmRGaWxsKCk7XG5cblx0XHQvLyBsb2NhdG9yIG1hdGVyaWFsc1xuXHRcdHRoaXMuX3doaXRlTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoIDB4RkZGRkZGICk7XG5cdFx0dGhpcy5fd2hpdGVNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuXHRcdHRoaXMuX2JsYWNrTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoIDB4MzMzMzMzICk7XG5cdFx0dGhpcy5fYmxhY2tNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuXHRcdHRoaXMuX2dyYXlNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCggMHhDQ0NDQ0MgKTtcblx0XHR0aGlzLl9ncmF5TWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcblx0XHR0aGlzLl9ibHVlTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoIDB4MDAwMEZGICk7XG5cdFx0dGhpcy5fYmx1ZU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5fcmVkTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoIDB4RkYwMDAwICk7XG5cdFx0dGhpcy5fcmVkTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBzY2VuZSBvYmplY3RzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRPYmplY3RzKCk6dm9pZFxuXHR7XG5cdFx0Ly8gVG8gdHJhY2UgbW91c2UgaGl0IHBvc2l0aW9uLlxuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlciA9IDxNZXNoPiBuZXcgUHJpbWl0aXZlU3BoZXJlUHJlZmFiKDIpLmdldE5ld09iamVjdCgpO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci5tYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgweDAwRkYwMCwgMC41KTtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci5tb3VzZUVuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIubW91c2VDaGlsZHJlbiA9IGZhbHNlO1xuXHRcdHRoaXMuX3NjZW5lLmFkZENoaWxkKHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlcik7XG5cblx0XHR0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMikuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyLm1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKDB4MDAwMEZGLCAwLjUpO1xuXHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIubW91c2VFbmFibGVkID0gZmFsc2U7XG5cdFx0dGhpcy5fc2NlbmUuYWRkQ2hpbGQodGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlcik7XG5cblxuXHRcdC8vIFRvIHRyYWNlIHBpY2tpbmcgbm9ybWFscy5cblx0XHR0aGlzLl9waWNraW5nTm9ybWFsVHJhY2VyID0gbmV3IExpbmVTZWdtZW50KG5ldyBCYXNpY01hdGVyaWFsKDB4RkZGRkZGKSwgbmV3IFZlY3RvcjNEKCksIG5ldyBWZWN0b3IzRCgpLCAzKTtcblx0XHR0aGlzLl9waWNraW5nTm9ybWFsVHJhY2VyLm1vdXNlRW5hYmxlZCA9IGZhbHNlO1xuXHRcdHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQodGhpcy5fcGlja2luZ05vcm1hbFRyYWNlcik7XG5cblx0XHR0aGlzLl9zY2VuZU5vcm1hbFRyYWNlciA9IG5ldyBMaW5lU2VnbWVudChuZXcgQmFzaWNNYXRlcmlhbCgweEZGRkZGRiksIG5ldyBWZWN0b3IzRCgpLCBuZXcgVmVjdG9yM0QoKSwgMyk7XG5cdFx0dGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIubW91c2VFbmFibGVkID0gZmFsc2U7XG5cdFx0dGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQodGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIpO1xuXG5cblx0XHQvLyBMb2FkIGEgaGVhZCBtb2RlbCB0aGF0IHdlIHdpbGwgYmUgYWJsZSB0byBwYWludCBvbiBvbiBtb3VzZSBkb3duLlxuXHRcdHRoaXMuX3Rva2VuID0gQXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoJ2Fzc2V0cy9oZWFkLm9iaicpLCBudWxsLCBudWxsLCBuZXcgT0JKUGFyc2VyKCAyNSApKTtcblx0XHR0aGlzLl90b2tlbi5hZGRFdmVudExpc3RlbmVyKEFzc2V0RXZlbnQuQVNTRVRfQ09NUExFVEUsIChldmVudDpBc3NldEV2ZW50KSA9PiB0aGlzLm9uQXNzZXRDb21wbGV0ZShldmVudCkpO1xuXG5cdFx0Ly8gUHJvZHVjZSBhIGJ1bmNoIG9mIG9iamVjdHMgdG8gYmUgYXJvdW5kIHRoZSBzY2VuZS5cblx0XHR0aGlzLmNyZWF0ZUFCdW5jaE9mT2JqZWN0cygpO1xuXG5cdFx0dGhpcy5fcmF5Y2FzdFBpY2tlci5zZXRJZ25vcmVMaXN0KFt0aGlzLl9zY2VuZU5vcm1hbFRyYWNlciwgdGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlcl0pO1xuXHRcdHRoaXMuX3JheWNhc3RQaWNrZXIub25seU1vdXNlRW5hYmxlZCA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbmVyIGZvciBhc3NldCBjb21wbGV0ZSBldmVudCBvbiBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgb25Bc3NldENvbXBsZXRlKGV2ZW50OkFzc2V0RXZlbnQpOnZvaWRcblx0e1xuXHRcdGlmIChldmVudC5hc3NldC5pc0Fzc2V0KE1lc2gpKSB7XG5cdFx0XHR0aGlzLmluaXRpYWxpemVIZWFkTW9kZWwoPE1lc2g+IGV2ZW50LmFzc2V0KTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGluaXRpYWxpemVIZWFkTW9kZWwoIG1vZGVsOk1lc2ggKTp2b2lkXG5cdHtcblx0XHR0aGlzLl9oZWFkID0gbW9kZWw7XG5cblx0XHQvLyBBcHBseSBhIGJpdG1hcCBtYXRlcmlhbCB0aGF0IGNhbiBiZSBwYWludGVkIG9uLlxuXHRcdHZhciBibWQ6Qml0bWFwRGF0YSA9IG5ldyBCaXRtYXBEYXRhKEludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLlBBSU5UX1RFWFRVUkVfU0laRSwgSW50ZXJtZWRpYXRlX01vdXNlSW50ZXJhY3Rpb24uUEFJTlRfVEVYVFVSRV9TSVpFLCBmYWxzZSwgMHhDQ0NDQ0MpO1xuXHRcdC8vYm1kLnBlcmxpbk5vaXNlKDUwLCA1MCwgOCwgMSwgZmFsc2UsIHRydWUsIDcsIHRydWUpO1xuXHRcdHZhciBiaXRtYXBUZXh0dXJlOkJpdG1hcFRleHR1cmUgPSBuZXcgQml0bWFwVGV4dHVyZShibWQpO1xuXHRcdHZhciB0ZXh0dXJlTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoYml0bWFwVGV4dHVyZSk7XG5cdFx0dGV4dHVyZU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG5cdFx0bW9kZWwubWF0ZXJpYWwgPSB0ZXh0dXJlTWF0ZXJpYWw7XG5cdFx0bW9kZWwucGlja2luZ0NvbGxpZGVyID0gbmV3IEpTUGlja2luZ0NvbGxpZGVyKHRoaXMuX3JlbmRlcmVyLnN0YWdlKTtcblxuXHRcdC8vIEFwcGx5IG1vdXNlIGludGVyYWN0aXZpdHkuXG5cdFx0bW9kZWwubW91c2VFbmFibGVkID0gbW9kZWwubW91c2VDaGlsZHJlbiA9IHRydWU7XG5cdFx0dGhpcy5lbmFibGVNZXNoTW91c2VMaXN0ZW5lcnMobW9kZWwpO1xuXG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZChtb2RlbCk7XG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZUFCdW5jaE9mT2JqZWN0cygpOnZvaWRcblx0e1xuXHRcdHRoaXMuX2N1YmVQcmVmYWIgPSBuZXcgUHJpbWl0aXZlQ3ViZVByZWZhYiggMjUsIDUwLCAyNSApO1xuXHRcdHRoaXMuX3NwaGVyZVByZWZhYiA9IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMTIpO1xuXHRcdHRoaXMuX2N5bGluZGVyUHJlZmFiID0gbmV3IFByaW1pdGl2ZUN5bGluZGVyUHJlZmFiKCAxMiwgMTIsIDI1ICk7XG5cdFx0dGhpcy5fdG9ydXNQcmVmYWIgPSBuZXcgUHJpbWl0aXZlVG9ydXNQcmVmYWIoIDEyLCAxMiApO1xuXG5cdFx0Zm9yKHZhciBpOm51bWJlciA9IDA7IGkgPCA0MDsgaSsrKSB7XG5cblx0XHRcdC8vIENyZWF0ZSBvYmplY3QuXG5cdFx0XHR2YXIgb2JqZWN0Ok1lc2ggPSB0aGlzLmNyZWF0ZVNpbXBsZU9iamVjdCgpO1xuXG5cdFx0XHQvLyBSYW5kb20gb3JpZW50YXRpb24uXG5cdFx0XHQvL29iamVjdC5yb3RhdGlvblggPSAzNjAqTWF0aC5yYW5kb20oKTtcblx0XHRcdC8vb2JqZWN0LnJvdGF0aW9uWSA9IDM2MCpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0b2JqZWN0LnJvdGF0aW9uWiA9IDM2MCpNYXRoLnJhbmRvbSgpO1xuXG5cdFx0XHQvLyBSYW5kb20gcG9zaXRpb24uXG5cdFx0XHR2YXIgcjpudW1iZXIgPSAyMDAgKyAxMDAqTWF0aC5yYW5kb20oKTtcblx0XHRcdHZhciBhemltdXRoOm51bWJlciA9IDIqTWF0aC5QSSpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0dmFyIGVsZXZhdGlvbjpudW1iZXIgPSAwLjI1ICogTWF0aC5QSSpNYXRoLnJhbmRvbSgpO1xuXHRcdFx0b2JqZWN0LnggPSByKk1hdGguY29zKGVsZXZhdGlvbikqTWF0aC5zaW4oYXppbXV0aCk7XG5cdFx0XHRvYmplY3QueSA9IHIqTWF0aC5zaW4oZWxldmF0aW9uKTtcblx0XHRcdG9iamVjdC56ID0gcipNYXRoLmNvcyhlbGV2YXRpb24pKk1hdGguY29zKGF6aW11dGgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlU2ltcGxlT2JqZWN0KCk6TWVzaFxuXHR7XG5cblx0XHR2YXIgbWVzaDpNZXNoO1xuXHRcdHZhciBib3VuZHNUeXBlOnN0cmluZztcblxuXHRcdC8vIENob3NlIGEgcmFuZG9tIG1lc2guXG5cdFx0dmFyIHJhbmRHZW9tZXRyeTpudW1iZXIgPSBNYXRoLnJhbmRvbSgpO1xuXHRcdGlmKCByYW5kR2VvbWV0cnkgPiAwLjc1ICkge1xuXHRcdFx0bWVzaCA9IDxNZXNoPiB0aGlzLl9jdWJlUHJlZmFiLmdldE5ld09iamVjdCgpO1xuXHRcdH1cblx0XHRlbHNlIGlmKCByYW5kR2VvbWV0cnkgPiAwLjUgKSB7XG5cdFx0XHRtZXNoID0gPE1lc2g+IHRoaXMuX3NwaGVyZVByZWZhYi5nZXROZXdPYmplY3QoKTtcblx0XHRcdGJvdW5kc1R5cGUgPSBCb3VuZHNUeXBlLlNQSEVSRTsgLy8gYmV0dGVyIG9uIHNwaGVyaWNhbCBtZXNoZXMgd2l0aCBib3VuZCBwaWNraW5nIGNvbGxpZGVyc1xuXHRcdH1cblx0XHRlbHNlIGlmKCByYW5kR2VvbWV0cnkgPiAwLjI1ICkge1xuXHRcdFx0bWVzaCA9IDxNZXNoPiB0aGlzLl9jeWxpbmRlclByZWZhYi5nZXROZXdPYmplY3QoKTtcblxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdG1lc2ggPSA8TWVzaD4gdGhpcy5fdG9ydXNQcmVmYWIuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKGJvdW5kc1R5cGUpXG5cdFx0XHRtZXNoLmJvdW5kc1R5cGUgPSBib3VuZHNUeXBlO1xuXG5cdFx0Ly8gUmFuZG9tbHkgZGVjaWRlIGlmIHRoZSBtZXNoIGhhcyBhIHRyaWFuZ2xlIGNvbGxpZGVyLlxuXHRcdHZhciB1c2VzVHJpYW5nbGVDb2xsaWRlcjpib29sZWFuID0gTWF0aC5yYW5kb20oKSA+IDAuNTtcblx0XHRpZiggdXNlc1RyaWFuZ2xlQ29sbGlkZXIgKSB7XG5cdFx0XHQvLyBBUzMgdHJpYW5nbGUgcGlja2VycyBmb3IgbWVzaGVzIHdpdGggbG93IHBvbHkgY291bnRzIGFyZSBmYXN0ZXIgdGhhbiBwaXhlbCBiZW5kZXIgb25lcy5cblx0XHRcdC8vXHRcdFx0XHRtZXNoLnBpY2tpbmdDb2xsaWRlciA9IFBpY2tpbmdDb2xsaWRlclR5cGUuQk9VTkRTX09OTFk7IC8vIHRoaXMgaXMgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIGFsbCBtZXNoZXNcblx0XHRcdG1lc2gucGlja2luZ0NvbGxpZGVyID0gbmV3IEpTUGlja2luZ0NvbGxpZGVyKHRoaXMuX3JlbmRlcmVyLnN0YWdlKTtcblx0XHRcdC8vXHRcdFx0XHRtZXNoLnBpY2tpbmdDb2xsaWRlciA9IFBpY2tpbmdDb2xsaWRlclR5cGUuQVMzX0JFU1RfSElUOyAvLyBzbG93ZXIgYW5kIG1vcmUgYWNjdXJhdGUsIGJlc3QgZm9yIG1lc2hlcyB3aXRoIGZvbGRzXG5cdFx0XHQvL1x0XHRcdFx0bWVzaC5waWNraW5nQ29sbGlkZXIgPSBQaWNraW5nQ29sbGlkZXJUeXBlLkFVVE9fRklSU1RfRU5DT1VOVEVSRUQ7IC8vIGF1dG9tYXRpY2FsbHkgZGVjaWRlcyB3aGVuIHRvIHVzZSBwaXhlbCBiZW5kZXIgb3IgYWN0aW9uc2NyaXB0XG5cdFx0fVxuXG5cdFx0Ly8gRW5hYmxlIG1vdXNlIGludGVyYWN0aXZpdHk/XG5cdFx0dmFyIGlzTW91c2VFbmFibGVkOmJvb2xlYW4gPSBNYXRoLnJhbmRvbSgpID4gMC4yNTtcblx0XHRtZXNoLm1vdXNlRW5hYmxlZCA9IG1lc2gubW91c2VDaGlsZHJlbiA9IGlzTW91c2VFbmFibGVkO1xuXG5cdFx0Ly8gRW5hYmxlIG1vdXNlIGxpc3RlbmVycz9cblx0XHR2YXIgbGlzdGVuc1RvTW91c2VFdmVudHM6Ym9vbGVhbiA9IE1hdGgucmFuZG9tKCkgPiAwLjI1O1xuXHRcdGlmKCBpc01vdXNlRW5hYmxlZCAmJiBsaXN0ZW5zVG9Nb3VzZUV2ZW50cyApIHtcblx0XHRcdHRoaXMuZW5hYmxlTWVzaE1vdXNlTGlzdGVuZXJzKG1lc2gpO1xuXHRcdH1cblxuXHRcdC8vIEFwcGx5IG1hdGVyaWFsIGFjY29yZGluZyB0byB0aGUgcmFuZG9tIHNldHVwIG9mIHRoZSBvYmplY3QuXG5cdFx0dGhpcy5jaG9zZU1lc2hNYXRlcmlhbChtZXNoKTtcblxuXHRcdC8vIEFkZCB0byBzY2VuZSBhbmQgc3RvcmUuXG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZChtZXNoKTtcblxuXHRcdHJldHVybiBtZXNoO1xuXHR9XG5cblx0cHJpdmF0ZSBjaG9zZU1lc2hNYXRlcmlhbChtZXNoOk1lc2gpOnZvaWRcblx0e1xuXHRcdGlmKCAhbWVzaC5tb3VzZUVuYWJsZWQgKSB7XG5cdFx0XHRtZXNoLm1hdGVyaWFsID0gdGhpcy5fYmxhY2tNYXRlcmlhbDtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiggIW1lc2guaGFzRXZlbnRMaXN0ZW5lciggQXdheU1vdXNlRXZlbnQuTU9VU0VfTU9WRSApICkge1xuXHRcdFx0XHRtZXNoLm1hdGVyaWFsID0gdGhpcy5fZ3JheU1hdGVyaWFsO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKCBtZXNoLnBpY2tpbmdDb2xsaWRlciAhPSBudWxsICkge1xuXHRcdFx0XHRcdG1lc2gubWF0ZXJpYWwgPSB0aGlzLl9yZWRNYXRlcmlhbDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRtZXNoLm1hdGVyaWFsID0gdGhpcy5fYmx1ZU1hdGVyaWFsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpc3RlbmVyc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlzdGVuZXJzKCk6dm9pZFxuXHR7XG5cdFx0d2luZG93Lm9ucmVzaXplICA9IChldmVudDpVSUV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcblxuXHRcdGRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V1cCA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VVcChldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZW1vdmUgPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZXdoZWVsID0gKGV2ZW50Ok1vdXNlV2hlZWxFdmVudCkgPT4gdGhpcy5vbk1vdXNlV2hlZWwoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ua2V5ZG93biA9IChldmVudDpLZXlib2FyZEV2ZW50KSA9PiB0aGlzLm9uS2V5RG93bihldmVudCk7XG5cdFx0ZG9jdW1lbnQub25rZXl1cCA9IChldmVudDpLZXlib2FyZEV2ZW50KSA9PiB0aGlzLm9uS2V5VXAoZXZlbnQpO1xuXG5cdFx0dGhpcy5vblJlc2l6ZSgpO1xuXG5cdFx0dGhpcy5fdGltZXIgPSBuZXcgUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25FbnRlckZyYW1lLCB0aGlzKTtcblx0XHR0aGlzLl90aW1lci5zdGFydCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpOnZvaWRcblx0e1xuXHRcdC8vIE1vdmUgbGlnaHQgd2l0aCBjYW1lcmEuXG5cdFx0dGhpcy5fcG9pbnRMaWdodC50cmFuc2Zvcm0ucG9zaXRpb24gPSB0aGlzLl9jYW1lcmEudHJhbnNmb3JtLnBvc2l0aW9uO1xuXG5cdFx0dmFyIGNvbGxpZGluZ09iamVjdDpQaWNraW5nQ29sbGlzaW9uVk8gPSB0aGlzLl9yYXljYXN0UGlja2VyLmdldFNjZW5lQ29sbGlzaW9uKHRoaXMuX2NhbWVyYS50cmFuc2Zvcm0ucG9zaXRpb24sIHRoaXMuX3ZpZXcuY2FtZXJhLnRyYW5zZm9ybS5mb3J3YXJkVmVjdG9yLCB0aGlzLl92aWV3LnNjZW5lKTtcblx0XHQvL3ZhciBtZXNoOk1lc2g7XG5cblx0XHRpZiAodGhpcy5fcHJldmlvaXVzQ29sbGlkaW5nT2JqZWN0ICYmIHRoaXMuX3ByZXZpb2l1c0NvbGxpZGluZ09iamVjdCAhPSBjb2xsaWRpbmdPYmplY3QpIHsgLy9lcXVpdmFsZW50IHRvIG1vdXNlIG91dFxuXHRcdFx0dGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlci52aXNpYmxlID0gdGhpcy5fc2NlbmVOb3JtYWxUcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5fc2NlbmVQb3NpdGlvblRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgVmVjdG9yM0QoKTtcblx0XHR9XG5cblx0XHRpZiAoY29sbGlkaW5nT2JqZWN0KSB7XG5cdFx0XHQvLyBTaG93IHRyYWNlcnMuXG5cdFx0XHR0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyLnZpc2libGUgPSB0aGlzLl9zY2VuZU5vcm1hbFRyYWNlci52aXNpYmxlID0gdHJ1ZTtcblxuXHRcdFx0Ly8gVXBkYXRlIHBvc2l0aW9uIHRyYWNlci5cblx0XHRcdHRoaXMuX3NjZW5lUG9zaXRpb25UcmFjZXIudHJhbnNmb3JtLnBvc2l0aW9uID0gY29sbGlkaW5nT2JqZWN0LmRpc3BsYXlPYmplY3Quc2NlbmVUcmFuc2Zvcm0udHJhbnNmb3JtVmVjdG9yKGNvbGxpZGluZ09iamVjdC5sb2NhbFBvc2l0aW9uKTtcblxuXHRcdFx0Ly8gVXBkYXRlIG5vcm1hbCB0cmFjZXIuXG5cdFx0XHR0aGlzLl9zY2VuZU5vcm1hbFRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb24gPSB0aGlzLl9zY2VuZVBvc2l0aW9uVHJhY2VyLnRyYW5zZm9ybS5wb3NpdGlvbjtcblx0XHRcdHZhciBub3JtYWw6VmVjdG9yM0QgPSBjb2xsaWRpbmdPYmplY3QuZGlzcGxheU9iamVjdC5zY2VuZVRyYW5zZm9ybS5kZWx0YVRyYW5zZm9ybVZlY3Rvcihjb2xsaWRpbmdPYmplY3QubG9jYWxOb3JtYWwpO1xuXHRcdFx0bm9ybWFsLm5vcm1hbGl6ZSgpO1xuXHRcdFx0bm9ybWFsLnNjYWxlQnkoIDI1ICk7XG5cdFx0XHR0aGlzLl9zY2VuZU5vcm1hbFRyYWNlci5lbmRQb3NpdGlvbiA9IG5vcm1hbC5jbG9uZSgpO1xuXHRcdH1cblxuXG5cdFx0dGhpcy5fcHJldmlvaXVzQ29sbGlkaW5nT2JqZWN0ID0gY29sbGlkaW5nT2JqZWN0O1xuXG5cdFx0Ly8gUmVuZGVyIDNELlxuXHRcdHRoaXMuX3ZpZXcucmVuZGVyKCk7XG5cdH1cblxuXHQvKipcblx0ICogS2V5IGRvd24gbGlzdGVuZXIgZm9yIGNhbWVyYSBjb250cm9sXG5cdCAqL1xuXHRwcml2YXRlIG9uS2V5RG93bihldmVudDpLZXlib2FyZEV2ZW50KTp2b2lkXG5cdHtcblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVVA6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlc6XG5cdFx0XHRcdHRoaXMuX3RpbHRJbmNyZW1lbnQgPSB0aGlzLl90aWx0U3BlZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5ET1dOOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5TOlxuXHRcdFx0XHR0aGlzLl90aWx0SW5jcmVtZW50ID0gLXRoaXMuX3RpbHRTcGVlZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkxFRlQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkE6XG5cdFx0XHRcdHRoaXMuX3BhbkluY3JlbWVudCA9IHRoaXMuX3BhblNwZWVkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUklHSFQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkQ6XG5cdFx0XHRcdHRoaXMuX3BhbkluY3JlbWVudCA9IC10aGlzLl9wYW5TcGVlZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlo6XG5cdFx0XHRcdHRoaXMuX2Rpc3RhbmNlSW5jcmVtZW50ID0gdGhpcy5fZGlzdGFuY2VTcGVlZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlg6XG5cdFx0XHRcdHRoaXMuX2Rpc3RhbmNlSW5jcmVtZW50ID0gLXRoaXMuX2Rpc3RhbmNlU3BlZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBLZXkgdXAgbGlzdGVuZXIgZm9yIGNhbWVyYSBjb250cm9sXG5cdCAqL1xuXHRwcml2YXRlIG9uS2V5VXAoZXZlbnQ6S2V5Ym9hcmRFdmVudCk6dm9pZFxuXHR7XG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlVQOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5XOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5ET1dOOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5TOlxuXHRcdFx0XHR0aGlzLl90aWx0SW5jcmVtZW50ID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkxFRlQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkE6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlJJR0hUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5EOlxuXHRcdFx0XHR0aGlzLl9wYW5JbmNyZW1lbnQgPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuWjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuWDpcblx0XHRcdFx0dGhpcy5fZGlzdGFuY2VJbmNyZW1lbnQgPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gM0QgbW91c2UgZXZlbnQgaGFuZGxlcnMuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdHByaXZhdGUgZW5hYmxlTWVzaE1vdXNlTGlzdGVuZXJzKG1lc2g6TWVzaCk6dm9pZFxuXHR7XG5cdFx0bWVzaC5hZGRFdmVudExpc3RlbmVyKEF3YXlNb3VzZUV2ZW50Lk1PVVNFX09WRVIsIChldmVudDpBd2F5TW91c2VFdmVudCkgPT4gdGhpcy5vbk1lc2hNb3VzZU92ZXIoZXZlbnQpKTtcblx0XHRtZXNoLmFkZEV2ZW50TGlzdGVuZXIoQXdheU1vdXNlRXZlbnQuTU9VU0VfT1VULCAoZXZlbnQ6QXdheU1vdXNlRXZlbnQpID0+IHRoaXMub25NZXNoTW91c2VPdXQoZXZlbnQpKTtcblx0XHRtZXNoLmFkZEV2ZW50TGlzdGVuZXIoQXdheU1vdXNlRXZlbnQuTU9VU0VfTU9WRSwgKGV2ZW50OkF3YXlNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTWVzaE1vdXNlTW92ZShldmVudCkpO1xuXHRcdG1lc2guYWRkRXZlbnRMaXN0ZW5lcihBd2F5TW91c2VFdmVudC5NT1VTRV9ET1dOLCAoZXZlbnQ6QXdheU1vdXNlRXZlbnQpID0+IHRoaXMub25NZXNoTW91c2VEb3duKGV2ZW50KSk7XG5cdH1cblxuXHQvKipcblx0ICogbWVzaCBsaXN0ZW5lciBmb3IgbW91c2UgZG93biBpbnRlcmFjdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1lc2hNb3VzZURvd24oZXZlbnQ6QXdheU1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdC8vdmFyIG1lc2g6TWVzaCA9IDxNZXNoPiBldmVudC5vYmplY3Q7XG5cdFx0Ly8vLyBQYWludCBvbiB0aGUgaGVhZCdzIG1hdGVyaWFsLlxuXHRcdC8vaWYoIG1lc2ggPT0gdGhpcy5faGVhZCApIHtcblx0XHQvL1x0dmFyIHV2OlBvaW50ID0gZXZlbnQudXY7XG5cdFx0Ly9cdHZhciB0ZXh0dXJlTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWwgPSAoPE1ldGhvZE1hdGVyaWFsPiAoPE1lc2g+IGV2ZW50Lm9iamVjdCkubWF0ZXJpYWwpO1xuXHRcdC8vXHR2YXIgYm1kOkJpdG1hcERhdGEgPSBCaXRtYXBUZXh0dXJlKCB0ZXh0dXJlTWF0ZXJpYWwudGV4dHVyZSApLmJpdG1hcERhdGE7XG5cdFx0Ly9cdHZhciB4Om51bWJlciA9IEludGVybWVkaWF0ZV9Nb3VzZUludGVyYWN0aW9uLlBBSU5UX1RFWFRVUkVfU0laRSp1di54O1xuXHRcdC8vXHR2YXIgeTpudW1iZXIgPSBJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbi5QQUlOVF9URVhUVVJFX1NJWkUqdXYueTtcblx0XHQvL1x0dmFyIG1hdHJpeDpNYXRyaXggPSBuZXcgTWF0cml4KCk7XG5cdFx0Ly9cdG1hdHJpeC50cmFuc2xhdGUoeCwgeSk7XG5cdFx0Ly9cdGJtZC5kcmF3KHRoaXMuX3BhaW50ZXIsIG1hdHJpeCk7XG5cdFx0Ly9cdEJpdG1hcFRleHR1cmUodGV4dHVyZU1hdGVyaWFsLnRleHR1cmUpLmludmFsaWRhdGVDb250ZW50KCk7XG5cdFx0Ly99XG5cdH1cblxuXHQvKipcblx0ICogbWVzaCBsaXN0ZW5lciBmb3IgbW91c2Ugb3ZlciBpbnRlcmFjdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1lc2hNb3VzZU92ZXIoZXZlbnQ6QXdheU1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHZhciBtZXNoOk1lc2ggPSA8TWVzaD4gZXZlbnQub2JqZWN0O1xuXHRcdG1lc2guZGVidWdWaXNpYmxlID0gdHJ1ZTtcblx0XHRpZiggbWVzaCAhPSB0aGlzLl9oZWFkICkgbWVzaC5tYXRlcmlhbCA9IHRoaXMuX3doaXRlTWF0ZXJpYWw7XG5cdFx0dGhpcy5fcGlja2luZ1Bvc2l0aW9uVHJhY2VyLnZpc2libGUgPSB0aGlzLl9waWNraW5nTm9ybWFsVHJhY2VyLnZpc2libGUgPSB0cnVlO1xuXHRcdHRoaXMub25NZXNoTW91c2VNb3ZlKGV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBtZXNoIGxpc3RlbmVyIGZvciBtb3VzZSBvdXQgaW50ZXJhY3Rpb25cblx0ICovXG5cdHByaXZhdGUgb25NZXNoTW91c2VPdXQoZXZlbnQ6QXdheU1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHZhciBtZXNoOk1lc2ggPSA8TWVzaD4gZXZlbnQub2JqZWN0O1xuXHRcdG1lc2guZGVidWdWaXNpYmxlID0gZmFsc2U7XG5cdFx0aWYoIG1lc2ggIT0gdGhpcy5faGVhZCApIHRoaXMuY2hvc2VNZXNoTWF0ZXJpYWwoIG1lc2ggKTtcblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudmlzaWJsZSA9IHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgVmVjdG9yM0QoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBtZXNoIGxpc3RlbmVyIGZvciBtb3VzZSBtb3ZlIGludGVyYWN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTWVzaE1vdXNlTW92ZShldmVudDpBd2F5TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0Ly8gU2hvdyB0cmFjZXJzLlxuXHRcdHRoaXMuX3BpY2tpbmdQb3NpdGlvblRyYWNlci52aXNpYmxlID0gdGhpcy5fcGlja2luZ05vcm1hbFRyYWNlci52aXNpYmxlID0gdHJ1ZTtcblx0XG5cdFx0Ly8gVXBkYXRlIHBvc2l0aW9uIHRyYWNlci5cblx0XHR0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudHJhbnNmb3JtLnBvc2l0aW9uID0gZXZlbnQuc2NlbmVQb3NpdGlvbjtcblx0XG5cdFx0Ly8gVXBkYXRlIG5vcm1hbCB0cmFjZXIuXG5cdFx0dGhpcy5fcGlja2luZ05vcm1hbFRyYWNlci50cmFuc2Zvcm0ucG9zaXRpb24gPSB0aGlzLl9waWNraW5nUG9zaXRpb25UcmFjZXIudHJhbnNmb3JtLnBvc2l0aW9uO1xuXHRcdHZhciBub3JtYWw6VmVjdG9yM0QgPSBldmVudC5zY2VuZU5vcm1hbC5jbG9uZSgpO1xuXHRcdG5vcm1hbC5zY2FsZUJ5KCAyNSApO1xuXHRcdHRoaXMuX3BpY2tpbmdOb3JtYWxUcmFjZXIuZW5kUG9zaXRpb24gPSBub3JtYWwuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBkb3duIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50Ok1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHRoaXMuX2xhc3RQYW5BbmdsZSA9IHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGU7XG5cdFx0dGhpcy5fbGFzdFRpbHRBbmdsZSA9IHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVggPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVkgPSBldmVudC5jbGllbnRZO1xuXHRcdHRoaXMuX21vdmUgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHVwIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VVcChldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLl9tb3ZlID0gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgbW92ZSBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDpNb3VzZUV2ZW50KVxuXHR7XG5cdFx0aWYgKHRoaXMuX21vdmUpIHtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFggLSB0aGlzLl9sYXN0TW91c2VYKSArIHRoaXMuX2xhc3RQYW5BbmdsZTtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihldmVudC5jbGllbnRZIC0gdGhpcy5fbGFzdE1vdXNlWSkgKyB0aGlzLl9sYXN0VGlsdEFuZ2xlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB3aGVlbCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlV2hlZWwoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KVxuXHR7XG5cdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSAtPSBldmVudC53aGVlbERlbHRhO1xuXG5cdFx0aWYgKHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPCAxMDApXG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gMTAwO1xuXHRcdGVsc2UgaWYgKHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPiAyMDAwKVxuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA9IDIwMDA7XG5cdH1cblxuXHQvKipcblx0ICogd2luZG93IGxpc3RlbmVyIGZvciByZXNpemUgZXZlbnRzXG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzaXplKGV2ZW50OlVJRXZlbnQgPSBudWxsKTp2b2lkXG5cdHtcblx0XHR0aGlzLl92aWV3LnkgPSAwO1xuXHRcdHRoaXMuX3ZpZXcueCA9IDA7XG5cdFx0dGhpcy5fdmlldy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMuX3ZpZXcuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpXG57XG5cdG5ldyBJbnRlcm1lZGlhdGVfTW91c2VJbnRlcmFjdGlvbigpO1xufSJdfQ==