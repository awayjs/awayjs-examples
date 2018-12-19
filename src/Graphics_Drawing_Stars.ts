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

import { RequestAnimationFrame, ColorTransform, OrthographicProjection, PerspectiveProjection, CoordinateSystem, Box, Vector3D, ColorUtils } from "awayjs-full/lib/core";
import { DefaultRenderer, SceneGraphPartition, PickEntity, PickGroup } from "awayjs-full/lib/renderer";
import { CapsStyle, JointStyle, Graphics, TextureAtlas, GradientFillStyle } from "awayjs-full/lib/graphics";
import { MouseEvent, HoverController, MovieClip, Sprite, Camera, Scene, OrientationMode, AlignmentMode } from "awayjs-full/lib/scene";
import { View, MouseManager } from "awayjs-full/lib/view";
import { AS2MovieClipAdapter } from "awayjs-full/lib/player";
import { MethodMaterial } from "awayjs-full/lib/materials";

class GGraphics_Drawing_Stars {
    //engine variables
    private _view: View;
    private _renderer: DefaultRenderer;


    private _timer: RequestAnimationFrame;

    //navigation
    private _projection: PerspectiveProjection;
    private _camera_perspective: Camera;

    private _shape: Sprite;
    private _circleGraphic: Sprite;
    private _drawing_path: any[];
    private _drawing_points: any[];

    private static _colorMaterials: Object = {};
    private static _textureMaterials: Object = {};

	/**
	 * Constructor
	 */
    constructor() {
        this.init();
    }

	/**
	 * Global initialise function
	 */
    private init(): void {
        this.initEngine();
        this.initMaterials();
        this.initObjects();
        this.initListeners();
    }

	/**
	 * Initialise the engine
	 */
    private initEngine(): void {
        //create the view
        this._renderer = new DefaultRenderer(new SceneGraphPartition(new Scene()));

        MouseManager.getInstance(PickGroup.getInstance(this._renderer.viewport)).eventBubbling = true;


        this._renderer.renderableSorter = null;//new RenderableSort2D();
        this._view = new View(this._renderer);
        this._view.backgroundColor = 0x777777;
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
    private initMaterials(): void {
        Graphics.get_material_for_color = function (color: number, alpha: number = 1): any {
            if (color == 0) {
                color = 0x000001;
            }
            //color=0xFF8100;
            //console.log("get color");
            //alpha=0.5;
            var texObj: any = TextureAtlas.getTextureForColor(color, alpha);
            if (GGraphics_Drawing_Stars._colorMaterials[texObj.bitmap.id]) {
                texObj.material = GGraphics_Drawing_Stars._colorMaterials[texObj.bitmap.id];
                return texObj;
            }

            var newmat: MethodMaterial = new MethodMaterial(texObj.bitmap);
            newmat.alphaBlending = true;
            newmat.useColorTransform = true;
            newmat.bothSides = true;
            GGraphics_Drawing_Stars._colorMaterials[texObj.bitmap.id] = newmat;
            texObj.material = newmat;
            return texObj;
        };
        Graphics.get_material_for_gradient = function (gradient: GradientFillStyle): any {
            var texObj = TextureAtlas.getTextureForGradient(gradient);
			/*if(alpha==0){
			 alpha=1;
			 }*/
            //alpha=0.5;
			/*if(color==0xffffff){
			 color=0xcccccc;
			 }*/
            var lookupId: string = texObj.bitmap.id + gradient.type;
            if (GGraphics_Drawing_Stars._textureMaterials[lookupId]) {
                texObj.material = GGraphics_Drawing_Stars._textureMaterials[lookupId];
                return texObj;
            }
            var newmat: MethodMaterial = new MethodMaterial(texObj.bitmap);
            newmat.useColorTransform = true;
            newmat.alphaBlending = true;
            newmat.bothSides = true;
            GGraphics_Drawing_Stars._textureMaterials[lookupId] = newmat;
            texObj.material = newmat;
            return texObj;
        };
    }

	/**
	 * Initialise the scene objects
	 */
    private initObjects(): void {

        var bgSprite = new Sprite(null);
        bgSprite.graphics.beginFill(0xdddddd, 1);
        bgSprite.graphics.drawRect(0, 0, window.innerWidth, window.innerHeight);
        bgSprite.graphics.endFill();
        this._view.scene.addChild(bgSprite);

    }

    private _star:Sprite;
    private onMouseDown(event: MouseEvent): void {

        this._star=new Sprite(null);
        this._star.x = event.scenePosition.x;
        this._star.y= event.scenePosition.y;
        this.draw_star(this._star, 10);
        this._view.scene.addChild(this._star);
    }
    private onMouseUp(event: MouseEvent): void {
        this._star = null;
    }

    private onMouseMove(event: MouseEvent): void {
        if (this._star) {
            var deltaX: number = event.scenePosition.x - this._star.x;
            var deltaY: number = event.scenePosition.y - this._star.y;
            var distance: number = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if(distance<10)
                distance=10;
            this.draw_star(this._star, distance);
        }
    }


    private draw_star(star:Sprite, radiusOutter:number): any {
        
        // some random values to draw different stars
        var radiusInner:number=radiusOutter/2 + Math.random()*radiusOutter/2;
        var spikes:number=2+Math.random()*100;

        var r:number=Math.random()*255;
        var g:number=Math.random()*255;
        var b:number=Math.random()*255;
        var fillColor:number=ColorUtils.ARGBtoFloat32(255, r, g, b);
        var strokeColor:number=ColorUtils.ARGBtoFloat32(255, 255-r, 255-g, 255-b);
        var spikes:number=Math.round(2+Math.random()*100);
        var thickness:number=1+Math.random()*3;
        var alpha:number=0.5+Math.random()*0.5;


        star.graphics.clear();        
        star.graphics.beginFill(fillColor, alpha);
        star.graphics.lineStyle(thickness, strokeColor, alpha, false, null, CapsStyle.ROUND, JointStyle.MITER, 1.8);
        star.graphics.moveTo(radiusOutter * Math.cos(0), radiusOutter * Math.sin(0));

        var i:number = 0;
        var a=0;
        var aDelta=(360/spikes)*0.5;
        for (i = 0; i < spikes; i++) {
            a+=aDelta;
            star.graphics.lineTo(radiusInner * Math.cos(a*(Math.PI/180)), radiusInner * Math.sin(a*(Math.PI/180)));
            a+=aDelta;
            star.graphics.lineTo(radiusOutter * Math.cos(a*(Math.PI/180)), radiusOutter * Math.sin(a*(Math.PI/180)));
        }
        star.graphics.endFill();

        return star;

    }
    private onKeyDown(event){
        if(event.key=="c"){
            
            this._view.scene.removeChildren(0, this._view.scene.numChildren);
            var bgSprite = new Sprite(null);
            bgSprite.graphics.beginFill(0xdddddd, 1);
            bgSprite.graphics.drawRect(0, 0, window.innerWidth, window.innerHeight);
            bgSprite.graphics.endFill();
            this._view.scene.addChild(bgSprite);
        }
    }
	/**
	 * Initialise the listeners
	 */
    private initListeners(): void {

        
        this._view.scene.addEventListener(MouseEvent.MOUSE_DOWN, (event: MouseEvent) => this.onMouseDown(event));
        this._view.scene.addEventListener(MouseEvent.MOUSE_MOVE, (event: MouseEvent) => this.onMouseMove(event));
        this._view.scene.addEventListener(MouseEvent.MOUSE_UP, (event: MouseEvent) => this.onMouseUp(event));
        this._view.scene.addEventListener(MouseEvent.MOUSE_UP_OUTSIDE, (event: MouseEvent) => this.onMouseUp(event));

        window.onresize = (event) => this.onResize(event);

        window.addEventListener("keydown", (event)=>this.onKeyDown(event));

        this.onResize();

        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    }


	/**
	 * Render loop
	 */
    private onEnterFrame(dt: number): void {

        //update view
        this._view.render();
    }


    private onResize(event = null): void {
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    }

}

window.onload = function () {
    new GGraphics_Drawing_Stars();
};
