
import {View, DefaultRenderer}		        								from "awayjs-full";
import {HoverController}													from "awayjs-full/lib/controllers";
import {RequestAnimationFrame}												from "awayjs-full/lib/utils";
import {Sprite, DirectionalLight}											from "awayjs-full/lib/display";
import {PrimitivePlanePrefab, PrimitiveCubePrefab}							from "awayjs-full/lib/prefabs";
import {Vector3D, Quaternion}												from "awayjs-full/lib/geom";
import {ElementsType}														from "awayjs-full/lib/graphics";
import {MethodMaterial, StaticLightPicker}									from "awayjs-full/lib/materials";
import {Sampler2D}															from "awayjs-full/lib/image";

class AmmoBasicWorker
{
	//engine variables
	private _view:View;

	//material objects
	private _planeMaterial:MethodMaterial;
	private _planeMaterials:Array<MethodMaterial>;

	private _cameraController:HoverController;
	//scene objects
	private _plane:Sprite;

	//tick for frame update
	private _timer:RequestAnimationFrame;
	private _boxes:Array<Sprite>;

	private quaternion:Quaternion=new Quaternion();
	private _light1:DirectionalLight;
	private _light2:DirectionalLight;
	private _lightPicker:StaticLightPicker;

	private _move:boolean = false;
	private _lastPanAngle:number;
	private _lastTiltAngle:number;
	private _lastMouseX:number;
	private _lastMouseY:number;
	private _num:number = 0;
	/**
	 * Constructor
	 */
	constructor()
	{
		//setup the view
		this._view = new View(new DefaultRenderer());
		this._view.backgroundColor=0xcccccc;
		//setup the camera
		this._view.camera.z = -600;
		this._view.camera.y = 500;
		this._view.camera.lookAt(new Vector3D());
		this._boxes=[];
		this._num=100;
		this._cameraController = new HoverController(this._view.camera, null, 180, 20, 320, 5);

		this._light1 = new DirectionalLight();
		this._light1.direction = new Vector3D(0, -1, 0);
		this._light1.ambient = 0.1;
		this._light1.diffuse = 0.7;

		this._view.scene.addChild(this._light1);

		this._light2 = new DirectionalLight();
		this._light2.direction = new Vector3D(0, -1, 0);
		this._light2.color = 0x00FFFF;
		this._light2.ambient = 0.1;
		this._light2.diffuse = 0.7;

		this._view.scene.addChild(this._light2);

		this._lightPicker = new StaticLightPicker([this._light1, this._light2]);
		//setup the materials
		this._planeMaterial = new MethodMaterial(0xbbbbbb);
		this._planeMaterial.lightPicker = this._lightPicker;
		this._planeMaterial.style.sampler = new Sampler2D(true, true, true);
		this._planeMaterials=[];
		var matcnt=0;
		this._planeMaterials[matcnt] = new MethodMaterial(0xffff00);
		this._planeMaterials[matcnt].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt++].style.sampler = new Sampler2D(true, true, true);
		this._planeMaterials[matcnt] = new MethodMaterial(0x00ffff);
		this._planeMaterials[matcnt].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt++].style.sampler = new Sampler2D(true, true, true);
		this._planeMaterials[matcnt] = new MethodMaterial(0xff00ff);
		this._planeMaterials[matcnt].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt++].style.sampler = new Sampler2D(true, true, true);
		this._planeMaterials[matcnt] = new MethodMaterial(0xff0000);
		this._planeMaterials[matcnt].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt++].style.sampler = new Sampler2D(true, true, true);
		this._planeMaterials[matcnt] = new MethodMaterial(0x00ff00);
		this._planeMaterials[matcnt].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt++].style.sampler = new Sampler2D(true, true, true);
		this._planeMaterials[matcnt] = new MethodMaterial(0x0000ff);
		this._planeMaterials[matcnt].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt++].style.sampler = new Sampler2D(true, true, true);

		//setup the scene
		this._plane = <Sprite> new PrimitivePlanePrefab(this._planeMaterial, ElementsType.TRIANGLE,400, 400).getNewObject();
		this._view.scene.addChild(this._plane);

		//setup the render loop
		window.onresize  = (event:UIEvent) => this.onResize(event);

		document.onmousedown = (event) => this.onMouseDown(event);
		document.onmouseup = (event) => this.onMouseUp(event);
		document.onmousemove = (event) => this.onMouseMove(event);
		document.onmousewheel = (event:WheelEvent) => this.onMouseWheel(event);
		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();
		this.startUP();
	}

	/**
	 * Mouse down listener for navigation
	 */
	private onMouseDown(event):void
	{
		this._lastPanAngle = this._cameraController.panAngle;
		this._lastTiltAngle = this._cameraController.tiltAngle;
		this._lastMouseX = event.clientX;
		this._lastMouseY = event.clientY;
		this._move = true;
	}

	/**
	 * Mouse up listener for navigation
	 */
	private onMouseUp(event):void
	{
		this._move = false;
	}

	/**
	 * Mouse move listener for navigation
	 */
	private onMouseMove(event)
	{
		if (this._move) {
			this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		}
	}

	/**
	 * Mouse wheel listener for navigation
	 */
	private onMouseWheel(event:WheelEvent)
	{
		this._cameraController.distance -= event.wheelDelta;

		if (this._cameraController.distance < 100)
			this._cameraController.distance = 100;
		else if (this._cameraController.distance > 2000)
			this._cameraController.distance = 2000;
	}
	/**
	 * render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._view.render();
	}

	private startUP()
	{
		var cube:PrimitiveCubePrefab = new PrimitiveCubePrefab(this._planeMaterial, ElementsType.TRIANGLE, 20.0, 20.0, 20.0);

		var matcnt=0;
		for (var i = 0; i < this._num; i++) {
			this._boxes[i] = <Sprite> cube.getNewObject();
			console.log(this._boxes[i].getBox());
			this._boxes[i].material=this._planeMaterials[matcnt++];
			this._boxes[i].debugVisible=true;
			if(matcnt>=this._planeMaterials.length)matcnt=0;
			this._view.scene.addChild(this._boxes[i]);
		}
		var physicsWorker = null;
		var nextPhysicsWorker = new Worker('third_party_libs/ammo_basic_worker.js');
		if (physicsWorker) physicsWorker.terminate();
		physicsWorker = nextPhysicsWorker;
		nextPhysicsWorker = null;
		if (!physicsWorker) physicsWorker = new Worker('third_party_libs/ammo_basic_worker.js');
		physicsWorker.onmessage = (event) => this.onMessage(event);
		physicsWorker.postMessage(this._num);
	}

	private onMessage(event = null):void
	{
		var data = event.data;
		if (data.objects.length != this._num) return;
		for (var i = 0; i < this._num; i++) {
			var physicsObject = data.objects[i];
			var renderObject = this._boxes[i];
			//console.log("x = "+physicsObject[0]);
			//console.log("y = "+physicsObject[1]);
			//console.log("z = "+physicsObject[2]);
			renderObject.x = physicsObject[0]*10;
			renderObject.y = physicsObject[1]*10;
			renderObject.z = physicsObject[2]*10;
			this.quaternion.x = physicsObject[3];
			this.quaternion.y = physicsObject[4];
			this.quaternion.z = physicsObject[5];
			this.quaternion.w = physicsObject[6];
			renderObject.eulers = this.quaternion.toEulerAngles();
		}
		//currFPS = data.currFPS;
		//allFPS = data.allFPS;
	};
	/**
	 * stage listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this._view.y = 100;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
		//this._view2.y = window.innerWidth/2;
		//this._view2.x = window.innerHeight/2;
		//this._view2.width = window.innerWidth/2;
		//this._view2.height = window.innerHeight/2;
	}
}

window.onload = function()
{
	new AmmoBasicWorker();
}