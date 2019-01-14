import {URLLoaderEvent, Vector3D, URLLoader, URLRequest, URLLoaderDataFormat, RequestAnimationFrame, PerspectiveProjection, ParserUtils} from "@awayjs/core";
import {ImageSampler, ImageUtils, BlendMode} from "@awayjs/stage";
import {ElementsType} from "@awayjs/graphics";
import {Sprite, PrimitiveCubePrefab, PrimitiveTorusPrefab, Scene} from "@awayjs/scene";
import {MethodMaterial, DirectionalLight, StaticLightPicker} from "@awayjs/materials";

class CubePrimitive
{
	private _scene:Scene;
	private _cube:PrimitiveCubePrefab;
	private _torus:PrimitiveTorusPrefab;
	private _sprite:Sprite;
	private _sprite2:Sprite;
	private _raf:RequestAnimationFrame;
	private _image:HTMLImageElement;
	private _cameraAxis:Vector3D;
	private _light:DirectionalLight;
	private _lightPicker:StaticLightPicker;

	constructor()
	{
		this.initView();
		this.initCamera();
		this.initLights();
		this.loadResources();
	}

	/**
	 *
	 */
	private initView():void
	{
		this._scene = new Scene();
		this._scene.view.backgroundColor = 0x000000;
		this._scene.camera.x = 130;
		this._scene.camera.y = 0;
		this._scene.camera.z = 0;
	}

	/**
	 *
	 */
	private initLights():void
	{
		this._light = new DirectionalLight();
		this._light.color = 0xffffff;
		this._light.direction = new Vector3D(1, 0, 0);
		this._light.ambient = 0.4;
		this._light.ambientColor = 0x85b2cd;
		this._light.diffuse = 2.8;
		this._light.specular = 1.8;

		this._lightPicker = new StaticLightPicker([this._light]);
	}

	/**
	 *
	 */
	private initCamera():void
	{
		this._cameraAxis = new Vector3D(0, 0, 1);
		this._scene.camera.projection = new PerspectiveProjection(120);
		this._scene.camera.projection.near = 0.1;
	}

	/**
	 *
	 */
	private loadResources()
	{
		var urlRequest:URLRequest = new URLRequest("assets/spacy_texture.png");
		var imgLoader:URLLoader = new URLLoader();
		imgLoader.dataFormat = URLLoaderDataFormat.BLOB;

		imgLoader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, (event:URLLoaderEvent) => this.urlCompleteHandler(event));
		imgLoader.load(urlRequest);
	}

	/**
	 *
	 * @param event
	 */
	private urlCompleteHandler(event:URLLoaderEvent)
	{
		var imageLoader:URLLoader = event.target;

		this._image = ParserUtils.blobToImage(imageLoader.data);

		this._image.onload = (event:Event) => this.imageCompleteHandler(event);
	}

	/**
	 *
	 * @param e
	 */
	private imageCompleteHandler(event:Event)
	{
		var matTx:MethodMaterial = new MethodMaterial(ImageUtils.imageToBitmapImage2D(this._image));
		matTx.style.sampler = new ImageSampler(true, true);
		matTx.blendMode = BlendMode.ADD;
		matTx.bothSides = true;
		matTx.lightPicker = this._lightPicker;

		this._cube = new PrimitiveCubePrefab(matTx, ElementsType.TRIANGLE, 20.0, 20.0, 20.0);
		this._torus = new PrimitiveTorusPrefab(matTx, ElementsType.TRIANGLE, 150, 80, 32, 16, true);

		this._sprite = <Sprite> this._torus.getNewObject();
		this._sprite2 = <Sprite> this._cube.getNewObject();
		this._sprite2.x = 130;
		this._sprite2.z = 40;

		this._scene.root.addChild(this._sprite);
		this._scene.root.addChild(this._sprite2);

		this._raf = new RequestAnimationFrame(this.render, this);
		this._raf.start();

		window.onresize = (event:UIEvent) => this.onResize(event);
		this.onResize();
    }

	/**
	 *
	 * @param dt
	 */
	public render(dt:number = null):void
	{
		this._scene.camera.transform.rotate(this._cameraAxis, 1);
		this._sprite.rotationY += 1;
		this._sprite2.rotationX += 0.4;
		this._sprite2.rotationY += 0.4;
		this._scene.render();
	}

	/**
	 *
	 */
	public onResize(event:UIEvent = null)
	{
		this._scene.view.y = 0;
		this._scene.view.x = 0;

		this._scene.view.width = window.innerWidth;
		this._scene.view.height = window.innerHeight;
	}
}

window.onload = function()
{
	new CubePrimitive();
}
