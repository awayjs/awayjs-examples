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

import { RequestAnimationFrame, PerspectiveProjection, CoordinateSystem, Vector3D } from "@awayjs/core";
import { DefaultRenderer} from "@awayjs/renderer";
import { CapsStyle, JointStyle, Graphics, TextureAtlas, GradientFillStyle } from "@awayjs/graphics";
import { Sprite, Camera, Scene, MouseManager, SceneGraphPartition, DisplayObjectContainer } from "@awayjs/scene";
import { View, PickGroup } from "@awayjs/view";
import { MethodMaterial } from "@awayjs/materials";

class Graphics_Drawing_Tracer {
    //engine variables
    private _scene: Scene;
    private _view: View;
    private _root: DisplayObjectContainer;

    private _timer: RequestAnimationFrame;

    //navigation
    private _projection: PerspectiveProjection;
    private _camera_perspective: Camera;

    private _shape: Sprite;
    private _drawing_path: any[][];

    
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
        this._root = new DisplayObjectContainer();
        this._scene = new Scene(new SceneGraphPartition(this._root));
        this._scene.renderer.renderableSorter = null;//new RenderableSort2D();

        this._view = this._scene.view;
        this._view.backgroundColor = 0x777777;

        this._scene.mouseManager.eventBubbling = true;

        //console.log("this._scene.width", this._renderer.width);

        this._projection = new PerspectiveProjection();
        this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._projection.fieldOfView = Math.atan(window.innerHeight/1000/2)*360/Math.PI;
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

    private _movingRect:Sprite;
	/**
	 * Initialise the scene objects
	 */
    private initObjects(): void {

        this._drawing_path = [[],[],[],[]];

        this._shape = new Sprite(null);

        this._movingRect = new Sprite(null);
        this._movingRect.x=window.innerWidth/2;
        this._movingRect.y=window.innerHeight/2;

        var circle1 = new Sprite(null);
        circle1.graphics.beginFill(0xdddddd, 1);
        circle1.graphics.drawCircle(0, 0, 5);
        circle1.graphics.endFill();
        circle1.x=-50;
        circle1.y=-50;

        var circle2 = new Sprite(null);
        circle2.graphics.beginFill(0xdddddd, 1);
        circle2.graphics.drawCircle(0, 0, 5);
        circle2.graphics.endFill();
        circle2.x=50;
        circle2.y=-50;

        var circle3 = new Sprite(null);
        circle3.graphics.beginFill(0xdddddd, 1);
        circle3.graphics.drawCircle(0, 0, 5);
        circle3.graphics.endFill();
        circle3.x=-50;
        circle3.y=50;

        var circle4 = new Sprite(null);
        circle4.graphics.beginFill(0xdddddd, 1);
        circle4.graphics.drawCircle(0, 0, 5);
        circle4.graphics.endFill();
        circle4.x=50;
        circle4.y=50;

        this._movingRect.addChild(circle1);
        this._movingRect.addChild(circle2);
        this._movingRect.addChild(circle3);
        this._movingRect.addChild(circle4);

        this._root.addChild(this._shape);
        this._root.addChild(this._movingRect);

    }


    private draw_shape(): void {

        var i = 1;
        var p = 1;
        for (i = 0; i < 4; i++) {
            var globalPos:Vector3D=this._movingRect.getChildAt(i).scenePosition;
            this._drawing_path[i].push({x:globalPos.x, y:globalPos.y});
            if(this._drawing_path[i].length>500){
                this._drawing_path[i].shift();
            }
        }
        this._shape.graphics.clear();
        this._shape.graphics.lineStyle(2, 0x000000, 1, false, null, CapsStyle.ROUND, JointStyle.MITER, 1.8);

        if (this._drawing_path.length == 0)
            return;
        var color:number=0x000000;
        for (p = 0; p < 4; p++) {
            if(this._drawing_path[p].length==0)
                continue;
            color=0x000000;
            this._shape.graphics.lineStyle(1, color, 1, false, null, CapsStyle.ROUND, JointStyle.MITER, 1.8);
            this._shape.graphics.moveTo(this._drawing_path[p][0].x, this._drawing_path[p][0].y);
            for (i = 1; i < this._drawing_path[p].length; i++) {
                if(i>this._drawing_path[p].length*0.9){
                    if(color!=0xFFFFFF){
                        color=0xFFFFFF;
                        this._shape.graphics.lineStyle(5, color, 1, false, null, CapsStyle.ROUND, JointStyle.MITER, 1.8);
                    }
                }
                else if(i>this._drawing_path[p].length*0.5){
                    if(color!=0xcccccc){
                        color=0xcccccc;
                        this._shape.graphics.lineStyle(3, color, 1, false, null, CapsStyle.ROUND, JointStyle.MITER, 1.8);
                    }
                }
                this._shape.graphics.lineTo(this._drawing_path[p][i].x, this._drawing_path[p][i].y);                
            }
        }
        this._shape.graphics.endFill();
        
    }
	/**
	 * Initialise the listeners
	 */
    private initListeners(): void {


        window.onresize = (event) => this.onResize(event);


        this.onResize();

        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    }


    private _dirVec:Vector3D=new Vector3D(0, 0, 0);
    private _rotation:number=3;
    private _scale:number=0;
	/**
	 * Render loop
	 */
    private onEnterFrame(dt: number): void {
        this._rotation+=0.1-Math.random()*0.2;
        this._scale=0.005-Math.random()*0.01;
        this._dirVec.x+=0.1-Math.random()*0.2;
        this._dirVec.y+=0.1-Math.random()*0.2;

        if(this._movingRect.x<=(-71*this._movingRect.scaleX) || this._movingRect.x>=(window.innerWidth+(71*this._movingRect.scaleX))){
            this._dirVec.x*=-1;
        }
        if(this._movingRect.y<=(-71*this._movingRect.scaleX) || this._movingRect.y>=(window.innerHeight+(71*this._movingRect.scaleX))){
            this._dirVec.y*=-1;
        }
        this._movingRect.x+=this._dirVec.x;
        this._movingRect.y+=this._dirVec.y;
        this._movingRect.rotationZ+=this._rotation;
        this._movingRect.scaleX+=this._scale;
        this._movingRect.scaleY+=this._scale;
        this.draw_shape();



        //update view
        this._scene.render();
    }


    private onResize(event = null): void {
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
		this._projection.fieldOfView = Math.atan(window.innerHeight/1000/2)*360/Math.PI;
    }

}

window.onload = function () {
    new Graphics_Drawing_Tracer();
};
