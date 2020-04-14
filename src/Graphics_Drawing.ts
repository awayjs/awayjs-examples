/*

 Create shape using the Graphics API

 Demonstrates:

 How to use the Graphics API to draw a shape. 
 How to clone shapes.
 How to animate the positions of the clones.
 How to use ColorTranforms on the clones.

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

import {RequestAnimationFrame, ColorTransform, PerspectiveProjection, CoordinateSystem, Box, Vector3D} from "@awayjs/core";
import {DefaultRenderer} from "@awayjs/renderer";
import {CapsStyle, JointStyle, Graphics, TextureAtlas, GradientFillStyle} from "@awayjs/graphics";
import {Sprite, Camera, Scene, AlignmentMode, SceneGraphPartition, DisplayObjectContainer} from "@awayjs/scene";
import {View, PickGroup} from "@awayjs/view";
import { MethodMaterial } from "@awayjs/materials";

class Graphics_Drawing
{
	//engine variables
	private _scene: Scene;
    private _view: View;
    private _root: DisplayObjectContainer;


	private _timer: RequestAnimationFrame;

	//navigation
	private _projection: PerspectiveProjection;
	private _camera_perspective: Camera;
	private batmanLogo: Sprite;
	private circle: Sprite;
	private _animSprites:Sprite[] = [];
	private _animSpeeds:number[] = [];

	private static _colorMaterials:Object = {};
	private static _textureMaterials:Object = {};
	/**
	 * Constructor
	 */
	constructor()
	{
		this.init();
	}

	/**
	 * Global initialise function
	 */
	private init(): void
	{
		this.initEngine();
		this.initMaterials();
		this.initObjects();
		this.initListeners();
	}

	/**
	 * Initialise the engine
	 */
	private initEngine(): void
	{
		//create the view
		this._root = new DisplayObjectContainer();		
		this._scene = new Scene(new SceneGraphPartition(this._root));
		this._scene.renderer.renderableSorter = null;

		this._view = this._scene.view;
		this._view.backgroundColor = 0x777777;

        // create and setup Camera and Projection

		this._projection = new PerspectiveProjection();
		this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._projection.fieldOfView = 30;
		this._projection.originX = -1;
		this._projection.originY = 1;
		this._camera_perspective = new Camera();
        this._camera_perspective.projection = this._projection;
        
		this._scene.camera = this._camera_perspective;
	}

		/**
	 * Initialise the engine
	 */
	private initMaterials(): void
	{

	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects(): void
	{

        //  create a new Sprite that will hold the graphics that we are going todraw in next step
        this.batmanLogo = new Sprite(null);
        
        //  set fillstyle and linestyle that should be used for drawing
		this.batmanLogo.graphics.beginFill(0xFFFFFF, 1);
        this.batmanLogo.graphics.lineStyle(5, 0xFF0000, 1, false, null, CapsStyle.ROUND, JointStyle.MITER, 1.8);
        
        //  issue drawing commands on the Sprite´s graphics. This will draw a batman-logo
        this.batmanLogo.graphics.moveTo(50, 50);
        this.batmanLogo.graphics.lineTo(50, 50);
		this.batmanLogo.graphics.lineTo(50, 50);
		this.batmanLogo.graphics.lineTo(290, 50);
		this.batmanLogo.graphics.curveTo( 290, 150, 450, 150);
		this.batmanLogo.graphics.lineTo(460, 60);
		this.batmanLogo.graphics.lineTo(470, 100);
		this.batmanLogo.graphics.lineTo(530, 100);
		this.batmanLogo.graphics.lineTo(540, 60);
		this.batmanLogo.graphics.lineTo(550, 150);
		this.batmanLogo.graphics.curveTo( 710, 150, 710, 50);
		this.batmanLogo.graphics.lineTo(950, 50);
		this.batmanLogo.graphics.curveTo( 800, 120, 825, 250);
		this.batmanLogo.graphics.curveTo( 630, 280, 500, 450);
		this.batmanLogo.graphics.curveTo( 370, 280, 175, 250);
        this.batmanLogo.graphics.endFill();
        
        // move the registration-point of the Sprite to be at the center of the shape that we have been drawing into it
        var boxBounds:Box = PickGroup.getInstance(this._view).getAbstraction(this.batmanLogo).getBoxBounds(null, false, true);
        this.batmanLogo.registrationPoint = new Vector3D(boxBounds.width/2, boxBounds.height/2);
		
		this.circle = new Sprite(null);
		this.circle.graphics.beginFill(0x000000, 1);
		this.circle.graphics.drawCircle(0, 0, 100);
		this.circle.graphics.endFill();
        // clone the Sprite on a grid of 20 x 20

		var numSpritesV:number = 5;
		var numSpritesH:number = 5;

		////issue for graphics masking
		// for (var i:number = 0; i < numSpritesV; i++) {
		// 	for (var j:number = 0; j < numSpritesH; j++) {
		// 		var mask:Sprite = this.circle.clone();

		// 		var sprite:Sprite = this.batmanLogo.clone();
        //         //sprite.alignmentMode = AlignmentMode.TRANSFORM_POINT;
                
		// 		mask.transform.moveTo(i*50, j*25, 0);
		// 		mask.transform.scaleTo(0.1, 0.1, 0.1);
		// 		sprite.transform.colorTransform = new ColorTransform(i/numSpritesV, 1 - i/numSpritesV, 1-j/numSpritesV, 1);

		// 		this._animSprites.push(sprite);
		// 		this._animSpeeds.push(0);
		// 		sprite.masks = [mask];
		// 		mask.addChild(sprite);
		// 		this._root.addChild(mask);
		// 	}
		// }


		//issue for masks that are underneath sprite
		for (var i:number = 0; i < numSpritesV; i++) {
			for (var j:number = 0; j < numSpritesH; j++) {
				var container:Sprite = new Sprite(null);

				var mask:Sprite = this.circle.clone();

				var sprite:Sprite = this.batmanLogo.clone();
                //sprite.alignmentMode = AlignmentMode.TRANSFORM_POINT;
                
				container.transform.moveTo(i*50, j*25, 0);
				container.transform.scaleTo(0.1, 0.1, 0.1);
				sprite.transform.colorTransform = new ColorTransform(i/numSpritesV, 1 - i/numSpritesV, 1-j/numSpritesV, 1);

				this._animSprites.push(sprite);
				this._animSpeeds.push(0);
				sprite.masks = [mask];
				container.addChild(sprite);
				container.addChild(mask);
				this._root.addChild(container);
			}
		}

		
		// for (var i:number = 0; i < numSpritesV; i++) {
		// 	for (var j:number = 0; j < numSpritesH; j++) {
		// 		var container:Sprite = new Sprite(null);

		// 		var mask:Sprite = this.circle.clone();

		// 		var sprite:Sprite = this.batmanLogo.clone();
        //         //sprite.alignmentMode = AlignmentMode.TRANSFORM_POINT;
                
		// 		container.transform.moveTo(i*50, j*25, 0);
		// 		container.transform.scaleTo(0.1, 0.1, 0.1);
		// 		sprite.transform.colorTransform = new ColorTransform(i/numSpritesV, 1 - i/numSpritesV, 1-j/numSpritesV, 1);

		// 		this._animSprites.push(sprite);
		// 		this._animSpeeds.push(0);
		// 		sprite.masks = [mask];
		// 		container.addChild(mask);
		// 		container.addChild(sprite);
		// 		this._root.addChild(container);
		// 	}
		// }
	}

	/**
	 * Initialise the listeners
	 */
	private initListeners(): void
	{
		window.onresize  = (event) => this.onResize(event);

		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();
	}


	/**
	 * Render loop
	 */
	private onEnterFrame(dt: number): void {

		//animate
		var len:number = this._animSprites.length;
		for (var i:number = 0; i < len; i++) {
			var sprite:Sprite = this._animSprites[i];
			sprite.rotationZ += this._animSpeeds[i];
			this._animSpeeds[i] += (1 - 2*Math.random());
			this._animSpeeds[i] *= 0.98;
		}


		//update view
		this._scene.render();
	}


	private onResize(event = null): void
	{
		this._view.y         = 0;
		this._view.x         = 0;
		this._view.width     = window.innerWidth;
		this._view.height    = window.innerHeight;
	}

}

window.onload = function () {
	new Graphics_Drawing();
};
