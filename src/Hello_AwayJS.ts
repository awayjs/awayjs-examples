import { Vector3D, RequestAnimationFrame, AssetLibrary, URLRequest, AssetEvent } from "@awayjs/core";
import { PrimitiveSpherePrefab, DisplayObject, DisplayObjectContainer, MouseEvent, Scene } from "@awayjs/scene";
import { BasicMaterial, ImageTexture2D } from "@awayjs/materials";
import { BitmapImage2D } from "@awayjs/stage";

class Hello_AwayJS
{
    //view into the scene
    private _scene:Scene;

    //material placeholder
    private _material:BasicMaterial;

    //RAF callback timer
    private _timer:RequestAnimationFrame;

    //array of spheres
    private _spheres:DisplayObject[] = [];

    private _time:number = 0;

    private _mouseContainer:DisplayObjectContainer;

    constructor()
    {
        //instantiate view and set dimensions
        this._scene = new Scene();
        this._scene.view.x = 0;
        this._scene.view.y = 0;
        this._scene.view.width = 500;
        this._scene.view.height = 500;

        //set camera position
        this._scene.camera.z = -600;
        this._scene.camera.y = 500;
        this._scene.camera.lookAt(new Vector3D());

        this._material = new BasicMaterial();

        this._mouseContainer = new DisplayObjectContainer();
        this._scene.root.addChild(this._mouseContainer);

        //adding sphere object to scene
        var prefab:PrimitiveSpherePrefab = new PrimitiveSpherePrefab(this._material)
        for (var i:number = 0; i < 100; i++) {
            var object:DisplayObject = prefab.getNewObject();
            this._spheres.push(object);
            object.x = Math.random()*1000 - 500;
            object.y = Math.random()*1000 - 500;
            object.z = Math.random()*1000 - 500;
            this._mouseContainer.addChild(object);
        }

        this._mouseContainer.addEventListener(MouseEvent.MOUSE_DOWN, (event:MouseEvent) => this.onMouseDownEvent(event))
        this._mouseContainer.addEventListener(MouseEvent.MOUSE_UP, (event:MouseEvent) => this.onMouseUpEvent(event))

        //start the RAF timer
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();

        //Load asset files

        AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, (event:AssetEvent) => this.onAssetComplete(event));
        AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
    }

    public onEnterFrame(dt:number):void
    {
        this._time += dt;

        for (var i:number = 0; i < 100; i++) {
            // this._spheres[i].x += Math.sin(this._time/200)*100;
            // this._spheres[i].y += Math.sin(this._time/60)*100;
        }
        
        this._scene.render();
    }

    public onMouseDownEvent(event:MouseEvent):void
    {
        var object:DisplayObject = <DisplayObject> event.entity

        // if (object == this._mouseContainer)
        //     return;
        
        object.scaleX = 2;
        object.scaleY = 2;
        object.scaleZ = 2;
    }

    public onMouseUpEvent(event:MouseEvent):void
    {
        var object:DisplayObject = <DisplayObject> event.entity

        // if (object == this._mouseContainer)
        //     return;

        object.scaleX = 1;
        object.scaleY = 1;
        object.scaleZ = 1;
    }

    public onAssetComplete(event:AssetEvent):void
    {
        this._material.texture = new ImageTexture2D(<BitmapImage2D> event.asset);

    }
}
window.onload = function()
{
	new Hello_AwayJS();
}