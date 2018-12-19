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

import {RequestAnimationFrame, ColorTransform, OrthographicProjection, PerspectiveProjection, CoordinateSystem, Box, Vector3D} from "awayjs-full/lib/core";
import {DefaultRenderer, SceneGraphPartition, PickEntity, PickGroup} from "awayjs-full/lib/renderer";
import {CapsStyle, JointStyle, Graphics, TextureAtlas, GradientFillStyle} from "awayjs-full/lib/graphics";
import {MouseEvent, HoverController, MovieClip, Sprite, Camera, Scene, OrientationMode, AlignmentMode} from "awayjs-full/lib/scene";
import {View} from "awayjs-full/lib/view";
import {AS2MovieClipAdapter} from "awayjs-full/lib/player";
import { MethodMaterial } from "awayjs-full/lib/materials";

class Graphics_Drawing
{
	//engine variables
	private _view: View;
	private _renderer: DefaultRenderer;


	private _timer: RequestAnimationFrame;

	//navigation
	private _projection: PerspectiveProjection;
	private _camera_perspective: Camera;
	private batmanLogo: Sprite;
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
		this._renderer = new DefaultRenderer(new SceneGraphPartition(new Scene()));
		
		this._renderer.renderableSorter = null;
		this._view = new View(this._renderer);
		this._view.backgroundColor = 0x777777;

        // create and setup Camera and Projection

		this._projection = new PerspectiveProjection();
		this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._projection.fieldOfView = 30;
		this._projection.originX = -1;
		this._projection.originY = 1;
		this._camera_perspective = new Camera();
        this._camera_perspective.projection = this._projection;
        
		this._view.camera = this._camera_perspective;
	}

		/**
	 * Initialise the engine
	 */
	private initMaterials(): void
	{
		Graphics.get_material_for_color = function(color:number, alpha:number=1):any
		{
			if(color==0){
				color=0x000001;
			}
			var texObj:any=TextureAtlas.getTextureForColor(color, alpha);
			if(Graphics_Drawing._colorMaterials[texObj.bitmap.id]){
				texObj.material = Graphics_Drawing._colorMaterials[texObj.bitmap.id];
				return texObj;
			}

			var newmat:MethodMaterial=new MethodMaterial(texObj.bitmap);
			newmat.alphaBlending = true;
			newmat.useColorTransform = true;
			newmat.bothSides = true;
			Graphics_Drawing._colorMaterials[texObj.bitmap.id] = newmat;
			texObj.material=newmat;
			return texObj;
		};
		Graphics.get_material_for_gradient = function(gradient:GradientFillStyle):any
		{
			var texObj=TextureAtlas.getTextureForGradient(gradient);
			var lookupId:string=texObj.bitmap.id+gradient.type;
			if(Graphics_Drawing._textureMaterials[lookupId]){
				texObj.material=Graphics_Drawing._textureMaterials[lookupId];
				return texObj;
			}
			var newmat:MethodMaterial=new MethodMaterial(texObj.bitmap);
			newmat.useColorTransform = true;
			newmat.alphaBlending=true;
			newmat.bothSides = true;
			Graphics_Drawing._textureMaterials[lookupId]=newmat;
			texObj.material=newmat;
			return texObj;
		};
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
        var boxBounds:Box = PickGroup.getInstance(this._renderer.viewport).getAbstraction(this.batmanLogo).getBoxBounds(null, false, true);
        this.batmanLogo.registrationPoint = new Vector3D(boxBounds.width/2, boxBounds.height/2);
        
        // clone the Sprite on a grid of 20 x 20

		var numSpritesV:number = 20;
		var numSpritesH:number = 20;

		for (var i:number = 0; i < numSpritesV; i++) {
			for (var j:number = 0; j < numSpritesH; j++) {

				var sprite:Sprite = this.batmanLogo.clone();
                sprite.alignmentMode = AlignmentMode.TRANSFORM_POINT;
                
				sprite.transform.moveTo(i*50, j*25, 0);
				sprite.transform.scaleTo(0.1, 0.1, 0.1);
				sprite.transform.colorTransform = new ColorTransform(i/numSpritesV, 1 - i/numSpritesV, 1-j/numSpritesV, 1);

				this._animSprites.push(sprite);
				this._animSpeeds.push(0);
				this._view.scene.addChild(sprite);
			}
		}
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
		this._view.render();
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
