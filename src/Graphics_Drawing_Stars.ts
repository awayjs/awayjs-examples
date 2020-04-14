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

import { RequestAnimationFrame, PerspectiveProjection, CoordinateSystem, ColorUtils } from "@awayjs/core";
import { DefaultRenderer } from "@awayjs/renderer";
import { CapsStyle, JointStyle, Graphics, TextureAtlas, GradientFillStyle } from "@awayjs/graphics";
import { MouseEvent, Sprite, Camera, Scene, MouseManager, SceneGraphPartition, DisplayObjectContainer } from "@awayjs/scene";
import { View, PickGroup } from "@awayjs/view";
import { MethodMaterial } from "@awayjs/materials";

class Graphics_Drawing_Stars {
    //engine variables
    private _scene: Scene;
    private _view: View;
    private _root: DisplayObjectContainer;


    private _timer: RequestAnimationFrame;

    //navigation
    private _projection: PerspectiveProjection;
    private _camera_perspective: Camera;

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
        //create the scene
        this._root = new DisplayObjectContainer();
        this._scene = new Scene(new SceneGraphPartition(this._root));
        this._scene.renderer.renderableSorter = null;//new RenderableSort2D();

        this._view = this._scene.view;
        this._view.backgroundColor = 0x777777;

        this._scene.mouseManager.eventBubbling = true;

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
    private initMaterials(): void {

    }

	/**
	 * Initialise the scene objects
	 */
    private initObjects(): void {

        var bgSprite = new Sprite(null);
        bgSprite.graphics.beginFill(0xdddddd, 1);
        bgSprite.graphics.drawRect(0, 0, window.innerWidth, window.innerHeight);
        bgSprite.graphics.endFill();
        this._root.addChild(bgSprite);

    }

    private _star:Sprite;
    private onMouseDown(event: MouseEvent): void {

        this._star=new Sprite(null);
        this._star.x = event.scenePosition.x;
        this._star.y= event.scenePosition.y;
        this.draw_star(this._star, 10);
        this._root.addChild(this._star);
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
            
            this._root.removeChildren(0, this._root.numChildren);
            var bgSprite = new Sprite(null);
            bgSprite.graphics.beginFill(0xdddddd, 1);
            bgSprite.graphics.drawRect(0, 0, window.innerWidth, window.innerHeight);
            bgSprite.graphics.endFill();
            this._root.addChild(bgSprite);
        }
    }
	/**
	 * Initialise the listeners
	 */
    private initListeners(): void {

        
        this._root.addEventListener(MouseEvent.MOUSE_DOWN, (event: MouseEvent) => this.onMouseDown(event));
        this._root.addEventListener(MouseEvent.MOUSE_MOVE, (event: MouseEvent) => this.onMouseMove(event));
        this._root.addEventListener(MouseEvent.MOUSE_UP, (event: MouseEvent) => this.onMouseUp(event));
        this._root.addEventListener(MouseEvent.MOUSE_UP_OUTSIDE, (event: MouseEvent) => this.onMouseUp(event));

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
        this._scene.render();
    }


    private onResize(event = null): void {
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    }

}

window.onload = function () {
    new Graphics_Drawing_Stars();
};
