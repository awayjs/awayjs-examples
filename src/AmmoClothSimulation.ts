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
import {View, DefaultRenderer}		        								from "awayjs-full";
import {HoverController}													from "awayjs-full/lib/controllers";
import {RequestAnimationFrame}												from "awayjs-full/lib/utils";
import {Sprite, DirectionalLight}											from "awayjs-full/lib/display";
import {PrimitivePlanePrefab, PrimitiveCubePrefab}							from "awayjs-full/lib/prefabs";
import {Vector3D, Quaternion, Matrix3D}										from "awayjs-full/lib/geom";
import {ElementsType, TriangleElements, LineElements}						from "awayjs-full/lib/graphics";
import {MethodMaterial, StaticLightPicker}									from "awayjs-full/lib/materials";
import {Sampler2D, BitmapImage2D}											from "awayjs-full/lib/image";
import {URLRequest}															from "awayjs-full/lib/net";
import {AssetLibrary, IAsset}												from "awayjs-full/lib/library";
import {LoaderEvent}														from "awayjs-full/lib/events";
import {Single2DTexture}													from "awayjs-full/lib/textures";
import {AttributesBuffer}													from "awayjs-full/lib/attributes";

var ammoLib;

class AmmoClothSimulation
{
	//engine variables
	private _view:View;

	private _direction:Vector3D;
	private _time:number = 0;

	//material objects
	private _planeMaterial:MethodMaterial;
	private _planeMaterials:Array<MethodMaterial>;
	private _clothElement:TriangleElements;
	private _cameraController:HoverController;
	//scene objects
	private _plane:Sprite;

	private _debugVisible:boolean=true;
	//tick for frame update
	private _timer:RequestAnimationFrame;
	private _boxes:Array<Sprite>;

	private quaternion:Quaternion=new Quaternion();
	private _light1:DirectionalLight;
	private _light2:DirectionalLight;
	private _lightPicker:StaticLightPicker;

	private armMovement=0;

	private _move:boolean = false;
	private _lastPanAngle:number;
	private _lastTiltAngle:number;
	private _lastMouseX:number;
	private _lastMouseY:number;
	private _num:number = 0;


	private gravityConstant = -9.8;
	private collisionConfiguration;
	private dispatcher;
	private broadphase;
	private solver;
	private physicsWorld;
	private rigidBodies = [];
	private enviromentSprites = [];
	private margin = 0.05;
	private hinge;
	private cloth;
	private clothDebug;
	private transformAux1 = new ammoLib.btTransform();
	/**
	 * Constructor
	 */
	constructor() {
		//setup the view
		this._view = new View(new DefaultRenderer());
		this._view.backgroundColor = 0xcccccc;
		//setup the camera
		this._view.camera.z = -600;
		this._view.camera.y = 500;
		this._view.camera.lookAt(new Vector3D());
		this._view.camera.projection.far = 5000;
		this._view.camera.projection.near = 1;
		this._boxes = [];
		this._num = 100;
		this._cameraController = new HoverController(this._view.camera, null, 180, 20, 15, 5);

		this._direction = new Vector3D(-1, -1, 1);

		this._light1 = new DirectionalLight();
		this._light1.direction = new Vector3D(0, -1, 0);

		this._view.scene.addChild(this._light1);

		this._light2 = new DirectionalLight();
		this._light2.direction = new Vector3D(0, 0, -1);

		this._view.scene.addChild(this._light2);

		this._lightPicker = new StaticLightPicker([this._light1, this._light2]);

		//setup the materials
		this._planeMaterial = new MethodMaterial();
		this._planeMaterial.lightPicker = this._lightPicker;
		this._planeMaterial.style.sampler = new Sampler2D(true, true, true);
		this._planeMaterials = [];
		var matcnt = 0;
		this._planeMaterials[matcnt] = new MethodMaterial(0xffff00);
		this._planeMaterials[matcnt].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt].bothSides = true;
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



		this.initPhysics();


		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
		AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/floor_normal.jpg"));
		AssetLibrary.load(new URLRequest("assets/floor_specular.jpg"));

		this.build_objects();

		window.onresize = (event:UIEvent) => this.onResize(event);

		this.onResize();
		document.onkeydown = (event) => this.onKeyDown(event);
		document.onkeyup = (event) => this.onKeyUp(event);
		document.onmousedown = (event) => this.onMouseDown(event);
		document.onmouseup = (event) => this.onMouseUp(event);
		document.onmousemove = (event) => this.onMouseMove(event);
		document.onmousewheel = (event:WheelEvent) => this.onMouseWheel(event);
		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();
	}

	private onResourceComplete(event:LoaderEvent)
	{
		var assets:IAsset[] = event.assets;
		var length:number = assets.length;

		for (var c:number = 0; c < length; c++) {
			var asset:IAsset = assets[c];

			console.log(asset.name, event.url);

			switch (event.url) {
				//plane textures
				case "assets/floor_diffuse.jpg" :
					this._planeMaterial.ambientMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
				case "assets/floor_normal.jpg" :
					this._planeMaterial.normalMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
				case "assets/floor_specular.jpg" :
					this._planeMaterial.specularMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
			}
		}
	}

	private build_objects() {
		var newVec:Vector3D=new Vector3D( 0, - 0.5, 0 );
		var newQuat:Quaternion=new Quaternion();
		this._plane = this.createParalellepiped( 40, 1, 40, 0, newVec, newQuat, this._planeMaterial );
		this._plane.debugVisible=true;
		this._plane.graphics.scaleUV(30, 20);
		this._plane.y=-0.6;

		// Wall
		var brickMass = 0.5;
		var brickLength = 1.2;
		var brickDepth = 0.6;
		var brickHeight = brickLength * 0.5;
		var numBricksLength = 6;
		var numBricksHeight = 8;
		var z0 = - numBricksLength * brickLength * 0.5;
		newVec.setTo( 0, brickHeight * 0.5, z0 );
		newQuat.x=0;
		newQuat.y=0;
		newQuat.z=0;
		newQuat.w=1;
		var matcnt=0;
		for ( var j = 0; j < numBricksHeight; j ++ ) {

			var oddRow = ( j % 2 ) == 1;

			newVec.z = z0;

			if ( oddRow ) {
				newVec.z -= 0.25 * brickLength;
			}

			var nRow = oddRow? numBricksLength + 1 : numBricksLength;
			for ( var i = 0; i < nRow; i ++ ) {

				var brickLengthCurrent = brickLength;
				var brickMassCurrent = brickMass;
				if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {
					brickLengthCurrent *= 0.5;
					brickMassCurrent *= 0.5;
				}

				if(matcnt>=this._planeMaterials.length)matcnt=0;
				var brick:Sprite = <Sprite>this.createParalellepiped( brickDepth, brickHeight, brickLengthCurrent, brickMassCurrent, newVec, newQuat, this._planeMaterials[matcnt++] );
				brick.debugVisible=true;

				if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {
					newVec.z += 0.75 * brickLength;
				}
				else {
					newVec.z += brickLength;
				}

			}
			newVec.y += brickHeight;
		}

		// The cloth
		// Cloth graphic object
		var clothWidth = 4;
		var clothHeight = 3;
		var clothNumSegmentsZ = clothWidth * 5;
		var clothNumSegmentsY = clothHeight * 5;
		var clothSegmentLengthZ = clothWidth / clothNumSegmentsZ;
		var clothSegmentLengthY = clothHeight / clothNumSegmentsY;
		var clothPos =new Vector3D(-3, 3, 2 );

		var clothGeometry:PrimitivePlanePrefab = new PrimitivePlanePrefab(this._planeMaterials[0], ElementsType.TRIANGLE, clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY, true, false);
		this.cloth = <Sprite>clothGeometry.getNewObject();
		//this.cloth.debugVisible=true;
		var newMtx:Matrix3D=new Matrix3D();
		newMtx.appendRotation( 90, new Vector3D(0,0,1));
		newMtx.appendRotation( 90, new Vector3D(1,0,0));
		newMtx.appendTranslation( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z - clothWidth * 0.5);
		var thiselement=this.cloth.graphics.getGraphicAt(0);
		thiselement.applyTransformation(newMtx);
		this._clothElement=<TriangleElements>thiselement.elements;
		this._view.scene.addChild(this.cloth);

		// Cloth physic object
		var softBodyHelpers = new ammoLib.btSoftBodyHelpers();
		var clothCorner00 = new ammoLib.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
		var clothCorner01 = new ammoLib.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z - clothWidth );
		var clothCorner10 = new ammoLib.btVector3( clothPos.x, clothPos.y, clothPos.z );
		var clothCorner11 = new ammoLib.btVector3( clothPos.x, clothPos.y, clothPos.z - clothWidth );
		var clothSoftBody = softBodyHelpers.CreatePatch( this.physicsWorld.getWorldInfo(), clothCorner00, clothCorner01, clothCorner10, clothCorner11, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
		var sbConfig = clothSoftBody.get_m_cfg();
		sbConfig.set_viterations( 10 );
		sbConfig.set_piterations( 10 );

		clothSoftBody.setTotalMass( 0.9, false )
		ammoLib.castObject( clothSoftBody, ammoLib.btCollisionObject ).getCollisionShape().setMargin( this.margin * 3 );
		this.physicsWorld.addSoftBody( clothSoftBody, 1, -1 );
		this.cloth.extra={};
		this.cloth.extra["physics"] = clothSoftBody;
		// Disable deactivation
		clothSoftBody.setActivationState( 4 );

		// The base
		var armMass = 2;
		var armLength = 3 + clothWidth;
		var pylonHeight = clothPos.y + clothHeight;
		newVec.setTo( clothPos.x, 0.1, clothPos.z - armLength );
		newQuat.x=0;
		newQuat.y=0;
		newQuat.z=0;
		newQuat.w=1;
		var base = this.createParalellepiped( 1, 0.2, 1, 0, newVec, newQuat, this._planeMaterials[1] );
		base.debugVisible=true;
		newVec.setTo( clothPos.x, 0.5 * pylonHeight, clothPos.z - armLength );
		var pylon = this.createParalellepiped( 0.4, pylonHeight, 0.4, 0, newVec, newQuat, this._planeMaterials[1] );
		pylon.debugVisible=true;
		newVec.setTo( clothPos.x, pylonHeight + 0.2, clothPos.z - 0.5 * armLength );
		var arm = this.createParalellepiped( 0.4, 0.4, armLength + 0.4, armMass, newVec, newQuat, this._planeMaterials[1] );
		arm.debugVisible=true;

		// Glue the cloth to the arm
		var influence = 0.5;
		clothSoftBody.appendAnchor( 0, arm.extra["physics"], false, influence );
		clothSoftBody.appendAnchor( clothNumSegmentsZ, arm.extra["physics"], false, influence );

		// Hinge constraint to move the arm
		var pivotA = new ammoLib.btVector3( 0, pylonHeight * 0.5, 0 );
		var pivotB = new ammoLib.btVector3( 0, -0.2, - armLength * 0.5 );
		var axis = new ammoLib.btVector3( 0, 1, 0 );
		this.hinge = new ammoLib.btHingeConstraint( pylon.extra["physics"], arm.extra["physics"], pivotA, pivotB, axis, axis, true );
		this.physicsWorld.addConstraint( this.hinge, true );


		var thiselement:TriangleElements=this.cloth.graphics.getGraphicAt(0).elements;

		var positions_new=[];
		var posCnt=0;

		var positions:ArrayBufferView = thiselement.positions.get(thiselement.numVertices, 0);
		var positionStride:number = thiselement.positions.stride;

		var vi0:number = 0;
		var i:number = 0;
		var count = thiselement.numVertices;
		for (i = 0; i < count; ++i) {
			positions_new[posCnt++] = positions[vi0];
			positions_new[posCnt++] = positions[vi0 + 1];
			positions_new[posCnt++] = positions[vi0 + 2];
			vi0 += positionStride;
		}

		var vert_pool={};
		var indices=thiselement.indices.get(thiselement.numElements, 0);
		var positions_final=[];
		var indices_final=[];
		var line_pool={};
		var debug_association=[];
		var vidx=0;
		var didx=0;
		var fidx=0;
		var thickness=1;
		var line_str="";
		var lineGraphics:LineElements = new LineElements(new AttributesBuffer());
		var positions_lines=[];
		var thickness_lines=[];

		for (i = 0; i < indices.length/3; ++i) {
			var xpos1=positions_new[indices[i*3]*3];
			var ypos1=positions_new[indices[i*3]*3+1];
			var zpos1=positions_new[indices[i*3]*3+2];

			var xpos2=positions_new[indices[i*3+1]*3];
			var ypos2=positions_new[indices[i*3+1]*3+1];
			var zpos2=positions_new[indices[i*3+1]*3+2];

			var xpos3=positions_new[indices[i*3+2]*3];
			var ypos3=positions_new[indices[i*3+2]*3+1];
			var zpos3=positions_new[indices[i*3+2]*3+2];

			line_str=xpos1>xpos2 ? xpos1+"#"+xpos2+"#" : xpos2+"#"+xpos1+"#";
			line_str+=ypos1>ypos2 ? ypos1+"#"+ypos2+"#"  : ypos2+"#"+ypos1+"#";
			line_str+=zpos1>zpos2 ? zpos1+"#"+zpos2+"#"  : zpos2+"#"+zpos1+"#";

			if(line_pool[line_str]==null){
				line_pool[line_str]=true;
				positions_lines[vidx++] = xpos1;
				positions_lines[vidx++] = ypos1;
				positions_lines[vidx++] = zpos1;
				debug_association[didx++]=indices[i*3]*3;
				positions_lines[vidx++] = xpos2;
				positions_lines[vidx++] = ypos2;
				positions_lines[vidx++] = zpos2;
				debug_association[didx++]=indices[i*3+1]*3;
				thickness_lines[fidx++] = thickness;
			}

			line_str=xpos3>xpos2 ? xpos3+"#"+xpos2+"#" : xpos2+"#"+xpos3+"#";
			line_str+=ypos3>ypos2 ? ypos3+"#"+ypos2+"#"  : ypos2+"#"+ypos3+"#";
			line_str+=zpos3>zpos2 ? zpos3+"#"+zpos2+"#"  : zpos2+"#"+zpos3+"#";

			if(line_pool[line_str]==null){
				line_pool[line_str]=true;
				positions_lines[vidx++] = xpos3;
				positions_lines[vidx++] = ypos3;
				positions_lines[vidx++] = zpos3;
				debug_association[didx++]=indices[i*3+2]*3;
				positions_lines[vidx++] = xpos2;
				positions_lines[vidx++] = ypos2;
				positions_lines[vidx++] = zpos2;
				debug_association[didx++]=indices[i*3+1]*3;
				thickness_lines[fidx++] = thickness;
			}

			line_str=xpos3>xpos1 ? xpos3+"#"+xpos1+"#" : xpos1+"#"+xpos3+"#";
			line_str+=ypos3>ypos1 ? ypos3+"#"+ypos1+"#"  : ypos1+"#"+ypos3+"#";
			line_str+=zpos3>zpos1 ? zpos3+"#"+zpos1+"#"  : zpos1+"#"+zpos3+"#";

			if(line_pool[line_str]==null){
				line_pool[line_str]=true;
				positions_lines[vidx++] = xpos1;
				positions_lines[vidx++] = ypos1;
				positions_lines[vidx++] = zpos1;
				debug_association[didx++]=indices[i*3]*3;
				positions_lines[vidx++] = xpos3;
				positions_lines[vidx++] = ypos3;
				positions_lines[vidx++] = zpos3;
				debug_association[didx++]=indices[i*3+2]*3;
				thickness_lines[fidx++] = thickness;
			}

		}

		lineGraphics.setPositions(positions_lines);
		lineGraphics.setThickness(thickness_lines);
		this.clothDebug=new Sprite();
		this.clothDebug.graphics.addGraphic(lineGraphics);
		this.clothDebug.extra={};
		this.clothDebug.extra["vert_association"]=debug_association;
		this._view.scene.addChild(this.clothDebug);
	}

	private createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {
		var newSprite:Sprite = <Sprite> new PrimitiveCubePrefab(material, ElementsType.TRIANGLE, sx, sy, sz, 1, 1, 1).getNewObject();
		newSprite.x=pos.x;
		newSprite.y=pos.y;
		newSprite.z=pos.z;
		this._view.scene.addChild(newSprite);
		var shape = new ammoLib.btBoxShape( new ammoLib.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
		shape.setMargin( this.margin );
		this.createRigidBody( newSprite, shape, mass, pos, quat );
		return newSprite;

}
	private createRigidBody( awayObj, physicsShape, mass, pos, quat ) {
		var transform = new ammoLib.btTransform();
		transform.setIdentity();
		transform.setOrigin( new ammoLib.btVector3( pos.x, pos.y, pos.z ) );
		transform.setRotation( new ammoLib.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		var motionState = new ammoLib.btDefaultMotionState( transform );

		var localInertia = new ammoLib.btVector3( 0, 0, 0 );
		physicsShape.calculateLocalInertia( mass, localInertia );

		var rbInfo = new ammoLib.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
		var body = new ammoLib.btRigidBody( rbInfo );

		awayObj.extra={};
		awayObj.extra["physics"]=body;
		if ( mass > 0 ) {
			this.rigidBodies.push( awayObj );

			// Disable deactivation
			body.setActivationState( 4 );
		}
		else{
			this.enviromentSprites.push( awayObj );

		}

		this.physicsWorld.addRigidBody( body );

}
	private initPhysics() {

		// Physics configuration

		this.collisionConfiguration = new ammoLib.btSoftBodyRigidBodyCollisionConfiguration();
		this.dispatcher = new ammoLib.btCollisionDispatcher( this.collisionConfiguration );
		this.broadphase = new ammoLib.btDbvtBroadphase();
		this.solver = new ammoLib.btSequentialImpulseConstraintSolver();
		var softBodySolver = new ammoLib.btDefaultSoftBodySolver();
		this.physicsWorld = new ammoLib.btSoftRigidDynamicsWorld( this.dispatcher,this.broadphase, this.solver, this.collisionConfiguration, softBodySolver);
		this.physicsWorld.setGravity( new ammoLib.btVector3( 0, this.gravityConstant, 0 ) );
		this.physicsWorld.getWorldInfo().set_m_gravity( new ammoLib.btVector3( 0, this.gravityConstant, 0 ) );
	}
	/**
	 * Mouse down listener for navigation
	 */
	private onKeyDown(event):void
	{
		event.preventDefault();
		switch ( event.keyCode ) {
			// Q - left
			case 81:
			case 37:
				this.armMovement = 1;
				break;

			// A - right
			case 65:
			case 39:
				this.armMovement = - 1;
				break;
			// d - toggle debug
			case 68:
				var len=0;
				this._debugVisible=!this._debugVisible;
				len = this.rigidBodies.length;
				for ( var i = 0; i < len; i++ ) {
					this.rigidBodies[i].debugVisible=this._debugVisible;
				}
				len = this.enviromentSprites.length;
				for ( var i = 0; i < len; i++ ) {
					this.enviromentSprites[i].debugVisible=this._debugVisible;
				}
				this.clothDebug.visible=this._debugVisible;
				break;
		}
	}
	private onKeyUp(event):void
	{
		this.armMovement = 0;
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
		event.preventDefault();
		this._cameraController.distance -= event.wheelDelta*0.01;

		if (this._cameraController.distance < 10)
			this._cameraController.distance = 10;
		else if (this._cameraController.distance > 2000)
			this._cameraController.distance = 2000;
	}
	/**
	 * render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._time += dt;

		this._direction.x = -Math.sin(this._time/4000);
		this._direction.z = -Math.cos(this._time/4000);
		this._light1.direction = this._direction;
		// Hinge control
		this.hinge.enableAngularMotor( true, 0.5 * this.armMovement, 50 );

		// Step world
		this.physicsWorld.stepSimulation( dt, 10 );

		// Update cloth
		var softBody = this.cloth.extra["physics"];

		var i=0;
		var vi1=0;
		var nodes = softBody.get_m_nodes();
		var new_pos:Array<number>=[];
		for (i = 0; i < this._clothElement.numVertices; ++i) {
			// bake position
			var node = nodes.at( i );
			var nodePos = node.get_m_x();
			new_pos[vi1++]=nodePos.x();
			new_pos[vi1++]=nodePos.y();
			new_pos[vi1++]=nodePos.z();
		}
		//positionAttributes.invalidate();
		//todo: i thought i could just update the positions on the AttributesView and invalidate this,
		// like it is done in ElementUtils.applyTransformation(), but i could not get it to work as expected
		// setting the position using a new array, is the temporary workaround
		this._clothElement.setPositions(new_pos);

		var volumedebug = this.clothDebug;
		if (volumedebug.visible) {
			var vert_maps_debug = volumedebug.extra["vert_association"];
			var thisElementDebug:LineElements = volumedebug.graphics.getGraphicAt(0).elements;
			var debug_positions = [];
			var pos_cnt = 0;
			for (var j = 0; j < vert_maps_debug.length; j++) {
				debug_positions[pos_cnt++] = new_pos[vert_maps_debug[j]];
				debug_positions[pos_cnt++] = new_pos[vert_maps_debug[j] + 1];
				debug_positions[pos_cnt++] = new_pos[vert_maps_debug[j] + 2];
			}
			thisElementDebug.setPositions(debug_positions);
		}

		// Update rigid bodies
		for ( var i = 0, il = this.rigidBodies.length; i < il; i++ ) {
			var objThree = this.rigidBodies[ i ];
			var objPhys = objThree.extra["physics"];
			var ms = objPhys.getMotionState();
			if ( ms ) {

				ms.getWorldTransform( this.transformAux1 );
				var p = this.transformAux1.getOrigin();
				var q = this.transformAux1.getRotation();
				objThree.x = p.x();
				objThree.y = p.y();
				objThree.z = p.z();
				this.quaternion.x = q.x();
				this.quaternion.y = q.y();
				this.quaternion.z = q.z();
				this.quaternion.w = q.w();
				objThree.eulers = this.quaternion.toEulerAngles();

			}
		}
		this._view.render()
	}



	/**
	 * stage listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this._view.y = 100;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}

window.onload = function()
{
	// create a script tag for the ammo.js lib and wait until it is loaded
	var fileref=document.createElement('script');
	fileref.setAttribute("type","text/javascript");
	fileref.setAttribute("src", "third_party_libs/ammo.js");
	if (typeof fileref!="undefined")
		document.getElementsByTagName("body")[0].appendChild(fileref);
	fileref.onload= function(event){
		// ammo.js script has been loaded, and should be ready to use
		ammoLib=window["Ammo"];
		new AmmoClothSimulation();
	};
}