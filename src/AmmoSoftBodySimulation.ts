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
import {PrimitiveSpherePrefab, PrimitiveCubePrefab}							from "awayjs-full/lib/prefabs";
import {Vector3D, Quaternion, Matrix3D}										from "awayjs-full/lib/geom";
import {ElementsType, TriangleElements, LineElements}						from "awayjs-full/lib/graphics";
import {MethodMaterial, StaticLightPicker}									from "awayjs-full/lib/materials";
import {Sampler2D, BitmapImage2D}											from "awayjs-full/lib/image";
import {URLRequest}															from "awayjs-full/lib/net";
import {AssetLibrary, IAsset}												from "awayjs-full/lib/library";
import {LoaderEvent}														from "awayjs-full/lib/events";
import {Single2DTexture}													from "awayjs-full/lib/textures";
import {AttributesBuffer}													from "awayjs-full/lib/attributes";
import {PickingCollision, RaycastPicker}									from "awayjs-full/lib/pick";


var ammoLib;

class AmmoSoftBodySimulation
{
	private _view:View;
	private _planeMaterial:MethodMaterial;
	private _planeMaterials:Array<MethodMaterial>;
	private _cameraController:HoverController;
	private _plane:Sprite;

	//tick for frame update
	private _timer:RequestAnimationFrame;
	private _boxes:Array<Sprite>;
	private _direction:Vector3D;
	private _debugVisible:boolean=true;


	private _time:number = 0;
	private quaternion:Quaternion=new Quaternion();
	private _light1:DirectionalLight;
	private _light2:DirectionalLight;
	private _lightPicker:StaticLightPicker;

	private _move:boolean = false;
	private _lastPanAngle:number;
	private _lastTiltAngle:number;
	private _lastMouseX:number;
	private _lastMouseY:number;

	private gravityConstant = -9.8;
	private collisionConfiguration;
	private dispatcher;
	private broadphase;
	private solver;
	private physicsWorld;
	private rigidBodies = [];
	private softBodies = [];
	private softBodiesDebug = [];
	private enviromentSprites = [];
	private margin = 0.05;
	private transformAux1 = new ammoLib.btTransform();
	private softBodyHelpers = new ammoLib.btSoftBodyHelpers();
	private _raycastPicker:RaycastPicker = new RaycastPicker(false);
	/**
	 * Constructor
	 */
	constructor() {
		//setup the view
		this._view = new View(new DefaultRenderer());
		this._view.backgroundColor = 0xcccccc;
		this._direction = new Vector3D(-1, -1, 1);
		//setup the camera
		this._view.camera.z = -600;
		this._view.camera.y = 500;
		this._view.camera.lookAt(new Vector3D());
		this._view.camera.projection.far = 5000;
		this._view.camera.projection.near = 1;
		this._view.mousePicker = new RaycastPicker(true);

		this._cameraController = new HoverController(this._view.camera, null, 180, 20, 15, 5);

		//setup lights
		this._light1 = new DirectionalLight();
		this._light1.direction = new Vector3D(0, -1, 0);

		this._view.scene.addChild(this._light1);

		this._light2 = new DirectionalLight();
		this._light2.direction = new Vector3D(-1, -1, 0);
		//this._light2.color = 0x00FFFF;
		this._light2.ambient = 0.1;
		this._light2.diffuse = 0.7;
		this._view.scene.addChild(this._light2);

		this._lightPicker = new StaticLightPicker([this._light1,this._light2]);

		//setup materials
		this._planeMaterial = new MethodMaterial();
		this._planeMaterial.style.sampler = new Sampler2D(true, true, true);
		this._planeMaterial.lightPicker = this._lightPicker;
		this._planeMaterials = [];

		var matcnt = 0;
		this._planeMaterials[matcnt] = new MethodMaterial(0x000000);
		this._planeMaterials[matcnt++].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt] = new MethodMaterial(0x00ffff);
		this._planeMaterials[matcnt++].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt] = new MethodMaterial(0xff00ff);
		this._planeMaterials[matcnt++].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt] = new MethodMaterial();
		this._planeMaterials[matcnt++].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt] = new MethodMaterial(0x00ff00);
		this._planeMaterials[matcnt++].lightPicker = this._lightPicker;
		this._planeMaterials[matcnt] = new MethodMaterial(0x0000ff);
		this._planeMaterials[matcnt++].lightPicker = this._lightPicker;

		this.initPhysics();


		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
		AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/floor_normal.jpg"));
		AssetLibrary.load(new URLRequest("assets/floor_specular.jpg"));
		AssetLibrary.load(new URLRequest("assets/beachball_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/beachball_specular.jpg"));

		this.build_objects();

		// setup listeners
		window.onresize = (event:UIEvent) => this.onResize(event);

		document.onkeydown = (event) => this.onKeyDown(event);
		document.onmousedown = (event) => this.onMouseDown(event);
		document.onmouseup = (event) => this.onMouseUp(event);
		document.onmousemove = (event) => this.onMouseMove(event);
		document.onmousewheel = (event:WheelEvent) => this.onMouseWheel(event);
		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();
	}


	private build_objects() {

		var newVec:Vector3D=new Vector3D( 0, - 0.5, 0 );
		var newQuat:Quaternion=new Quaternion();
		var newMtx:Matrix3D=new Matrix3D();

		// ground
		this._plane = this.createParalellepiped( 40, 1, 40, 0, newVec, newQuat, this._planeMaterial );
		this._plane.debugVisible=this._debugVisible;
		this._plane.graphics.scaleUV(30, 20);
		this.enviromentSprites.push(this._plane);
		// Create soft volumes
		var volumeMass = 15;

		newMtx.appendTranslation(5, 5, 0);
		var ball:Sprite = <Sprite> new PrimitiveSpherePrefab(  this._planeMaterials[3], ElementsType.TRIANGLE, 1.5, 40, 25 ).getNewObject();
		var ball_debug:Sprite = <Sprite> new PrimitiveSpherePrefab(  null, ElementsType.LINE, 1.5, 40, 25 ).getNewObject();
		this.createSoftVolume( ball, volumeMass, 200, newMtx );

		var box= <Sprite> new PrimitiveCubePrefab( this._planeMaterials[3], ElementsType.TRIANGLE, 1, 1, 5,  4, 4, 20 ).getNewObject();
		var newMtx:Matrix3D=new Matrix3D();
		newMtx.appendTranslation( -2, 5, 0 );
		this.createSoftVolume( box, volumeMass, 120 , newMtx);

		// Ramp
		newVec.setTo( 3, 1, 0 );
		newQuat.fromAxisAngle( new Vector3D( 0, 0, 1 ), 30 * Math.PI / 180 );
		var obstacle = this.createParalellepiped( 10, 1, 4, 0, newVec, newQuat, this._planeMaterials[0] );
		obstacle.debugVisible=this._debugVisible;
		this.enviromentSprites.push(obstacle);
	}

	private createSoftVolume( thisSprite, mass, pressure, mtx) {

		this._view.scene.addChild(thisSprite);

		thisSprite.graphics.getGraphicAt(0).applyTransformation(mtx);
		var thiselement:TriangleElements=thisSprite.graphics.getGraphicAt(0).elements;

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
		posCnt=0;
		for (i = 0; i < indices.length; ++i) {
			var vert_str=positions_new[indices[i]*3]+"#"+positions_new[indices[i]*3+1]+"#"+positions_new[indices[i]*3+2];
			if(vert_pool[vert_str]!=null){
				indices_final[i]=vert_pool[vert_str][0];
				vert_pool[vert_str].push(indices[i]*3);
			}
			else{
				vert_pool[vert_str]=[positions_final.length/3];
				vert_pool[vert_str].push(indices[i]*3);
				indices_final[i]=positions_final.length/3;
				positions_final[posCnt++]=positions_new[indices[i]*3];
				positions_final[posCnt++]=positions_new[indices[i]*3+1];
				positions_final[posCnt++]=positions_new[indices[i]*3+2];
			}
		}
		// create the final vert_association array
		var vert_association=[];
		posCnt=0;
		for(var key in vert_pool) vert_association[posCnt++]=vert_pool[key];


		// create the softbody and configure it:

		 var volumeSoftBody = this.softBodyHelpers.CreateFromTriMesh(
			 this.physicsWorld.getWorldInfo(),
			 positions_final,
			 indices_final,
			 indices_final.length/3,
			 true );

		 var sbConfig = volumeSoftBody.get_m_cfg();
		 sbConfig.set_viterations( 40 );
		 sbConfig.set_piterations( 40 );

		 // Soft-soft and soft-rigid collisions
		 sbConfig.set_collisions( 0x11 );

		 // Friction
		 sbConfig.set_kDF( 0.1 );
		 // Damping
		 sbConfig.set_kDP( 0.01 );
		 // Pressure
		 sbConfig.set_kPR( pressure );
		 // Stiffness
		volumeSoftBody.get_m_materials().at( 0 ).set_m_kLST( 0.9 );
		volumeSoftBody.get_m_materials().at( 0 ).set_m_kAST( 0.9 );

		volumeSoftBody.setTotalMass( mass, false )
		ammoLib.castObject( volumeSoftBody, ammoLib.btCollisionObject ).getCollisionShape().setMargin( this.margin );
		this.physicsWorld.addSoftBody( volumeSoftBody, 1, -1 );
		thisSprite.extra={};
		thisSprite.extra["physics"] = volumeSoftBody;
		thisSprite.extra["vert_association"]=vert_association;
		volumeSoftBody.setActivationState( 4 );

		this.softBodies.push( thisSprite );



		// create a Wireframe for the mesh

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
		var thisSpriteDebug=new Sprite();
		thisSpriteDebug.graphics.addGraphic(lineGraphics);
		thisSpriteDebug.extra={};
		thisSpriteDebug.extra["vert_association"]=debug_association;
		this._view.scene.addChild(thisSpriteDebug);
		this.softBodiesDebug.push( thisSpriteDebug );


	}


	private createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {
		var newSprite:Sprite = <Sprite> new PrimitiveCubePrefab(material, ElementsType.TRIANGLE, sx, sy, sz, 1, 1, 1).getNewObject();
		newSprite.x=pos.x;
		newSprite.y=pos.y;
		newSprite.z=pos.z;
		newSprite.eulers = quat.toEulerAngles();
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

		this.physicsWorld.addRigidBody( body );
		return body;

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
	private onKeyDown(event):void
	{
		event.preventDefault();
		switch ( event.keyCode ) {
			// d - toggle debug
			case 68:
				var len=0;
				this._debugVisible=!this._debugVisible;
				len = this.softBodies.length;
				for ( var i = 0; i < len; i++ ) {
					this.softBodiesDebug[i].visible=this._debugVisible;
				}
				len = this.rigidBodies.length;
				for ( var i = 0; i < len; i++ ) {
					this.rigidBodies[i].debugVisible=this._debugVisible;
				}
				len = this.enviromentSprites.length;
				for ( var i = 0; i < len; i++ ) {
					this.enviromentSprites[i].debugVisible=this._debugVisible;
				}
				break;

		}
	}
	/**
	 * Mouse down listener for navigation
	 */
	private onMouseDown(event):void
	{

		// navigation stuff:

		this._lastPanAngle = this._cameraController.panAngle;
		this._lastTiltAngle = this._cameraController.tiltAngle;
		this._lastMouseX = event.clientX;
		this._lastMouseY = event.clientY;
		this._move = true;

		// shot a sphere:

		var collidingObject:PickingCollision = this._raycastPicker.getSceneCollision(this._view.camera.transform.position, this._view.camera.transform.forwardVector, this._view.scene);

		// Creates a ball
		var ballMass = 3;
		var ballRadius = 0.4;

		var ball = <Sprite> new PrimitiveSpherePrefab( this._planeMaterials[0], ElementsType.TRIANGLE, ballRadius, 18, 16 ).getNewObject();
		ball.debugVisible=this._debugVisible;
		var ballShape = new ammoLib.btSphereShape( ballRadius );
		ballShape.setMargin( this.margin );
		var newVec=new Vector3D(5, 5, 0);
		newVec.copyFrom( collidingObject.rayPosition);
		var quat=new Quaternion();
		var ballBody = this.createRigidBody( ball, ballShape, ballMass, newVec, quat );
		ballBody.setFriction( 0.5 );
		this._view.scene.addChild(ball);
		newVec.copyFrom(collidingObject.rayDirection);
		newVec.scaleBy( 14 );
		ballBody.setLinearVelocity( new ammoLib.btVector3( newVec.x, newVec.y, newVec.z ) );
		
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
		// Step world
		this.physicsWorld.stepSimulation( dt, 10 );


		// Update soft volumes
		var len=0;
		len = this.softBodies.length;
		for ( var i = 0; i < len; i++ ) {

			var volume = this.softBodies[i];
			var softBody = volume.extra["physics"];
			var vert_maps = volume.extra["vert_association"];
			var thisElement:TriangleElements = volume.graphics.getGraphicAt(0).elements;

			var numVerts = vert_maps.length;
			var positions = [];
			var normals = [];
			var pos_cnt = 0;
			var nodes = softBody.get_m_nodes();
			for (var j = 0; j < numVerts; j++) {

				var node = nodes.at(j);
				var nodePos = node.get_m_x();
				var nodeNormal = node.get_m_n();
				var this_vert_map = vert_maps[j];
				for (var k = 1; k < this_vert_map.length; k++) {
					positions[this_vert_map[k]] = nodePos.x();
					positions[this_vert_map[k] + 1] = nodePos.y();
					positions[this_vert_map[k] + 2] = nodePos.z();
					normals[this_vert_map[k]] = nodeNormal.x();
					normals[this_vert_map[k] + 1] = nodeNormal.y();
					normals[this_vert_map[k] + 2] = nodeNormal.z();
				}
				/*
				 */
			}
			thisElement.setPositions(positions);
			thisElement.setNormals(normals);

			var volumedebug = this.softBodiesDebug[i];
			if (volumedebug.visible) {
				var vert_maps_debug = volumedebug.extra["vert_association"];
				var thisElementDebug:LineElements = volumedebug.graphics.getGraphicAt(0).elements;
				var debug_positions = [];
				pos_cnt = 0;
				for (var j = 0; j < vert_maps_debug.length; j++) {
					debug_positions[pos_cnt++] = positions[vert_maps_debug[j]];
					debug_positions[pos_cnt++] = positions[vert_maps_debug[j] + 1];
					debug_positions[pos_cnt++] = positions[vert_maps_debug[j] + 2];
				}
				thisElementDebug.setPositions(debug_positions);
			}

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

		this._view.render();
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
				case "assets/beachball_diffuse.jpg" :
					this._planeMaterials[3].ambientMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
				case "assets/beachball_specular.jpg" :
					this._planeMaterials[3].specularMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
			}
		}
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
		new AmmoSoftBodySimulation();
	};
}