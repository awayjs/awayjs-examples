import {BitmapImage2D, Sampler2D} from "awayjs-full/lib/graphics";
import {LoaderEvent, Vector3D, AssetLibrary, Loader, IAsset, URLRequest, Debug, RequestAnimationFrame} from "awayjs-full/lib/core";
import {Sprite, DisplayObjectContainer, DirectionalLight, StaticLightPicker} from "awayjs-full/lib/display";
import {MethodMaterial} from "awayjs-full/lib/materials";
import {OBJParser} from "awayjs-full/lib/parsers";
import {View} from "awayjs-full/lib/view";

class ObjLoaderMasterChief
{
	private view:View;
	private raf:RequestAnimationFrame;
	private sprites:Array<Sprite> = new Array<Sprite>();
	private mat:MethodMaterial;

	private terrainMaterial:MethodMaterial;

	private light:DirectionalLight;

	private spartan:DisplayObjectContainer = new DisplayObjectContainer();
	private terrain:Sprite;

	constructor()
	{
		Debug.LOG_PI_ERRORS = false;
		Debug.THROW_ERRORS = false;

		this.view = new View();
		this.view.camera.z = -50;
		this.view.camera.y = 20;
		this.view.camera.projection.near = 0.1;
		this.view.backgroundColor = 0xCEC8C6;

		this.raf = new RequestAnimationFrame(this.render, this);

		this.light = new DirectionalLight();
		this.light.color = 0xc1582d;
		this.light.direction = new Vector3D(1, 0, 0);
		this.light.ambient = 0.4;
		this.light.ambientColor = 0x85b2cd;
		this.light.diffuse = 2.8;
		this.light.specular = 1.8;
		this.view.scene.addChild(this.light);

		this.spartan.transform.scaleTo(.25, .25, .25);
		this.spartan.y = 0;
		this.view.scene.addChild(this.spartan);

		AssetLibrary.enableParser(OBJParser);

		var session:Loader;
		
		session = AssetLibrary.getLoader();
		session.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
		session.load(new URLRequest('assets/Halo_3_SPARTAN4.obj'));

		session = AssetLibrary.getLoader();
		session.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
		session.load(new URLRequest('assets/terrain.obj'));

		session = AssetLibrary.getLoader();
		session.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
		session.load(new URLRequest('assets/masterchief_base.png'));

		session = AssetLibrary.getLoader();
		session.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
		session.load(new URLRequest('assets/stone_tx.jpg'));

		window.onresize = (event:UIEvent) => this.onResize();

		this.raf.start();
	}

	private render()
	{
		if ( this.terrain)
			this.terrain.rotationY += 0.4;

		this.spartan.rotationY += 0.4;
		this.view.render();
	}

	private spartanFlag    :boolean = false;

	public onResourceComplete (event:LoaderEvent)
	{
		var loader:Loader = <Loader> event.target;
		var l:number = loader.baseDependency.assets.length;

		console.log( '------------------------------------------------------------------------------');
		console.log( 'away.events.LoaderEvent.LOAD_COMPLETE' , event , l , loader );
		console.log( '------------------------------------------------------------------------------');

		var loader:Loader = <Loader> event.target;
		var l:number = loader.baseDependency.assets.length;

		for (var c:number = 0; c < l; c++) {

			var d:IAsset = loader.baseDependency.assets[c];

			console.log( d.name , event.url);

			switch (d.assetType) {
				case  Sprite.assetType:
					if (event.url =='assets/Halo_3_SPARTAN4.obj') {
						var sprite:Sprite = <Sprite> d;

						this.spartan.addChild(sprite);
						this.spartanFlag = true;
						this.sprites.push(sprite);
					} else if (event.url =='assets/terrain.obj') {
						this.terrain = <Sprite> d;
						this.terrain.y = 98;
						this.terrain.graphics.scaleUV(20, 20);
						this.view.scene.addChild(this.terrain);
					}

					break;
				case BitmapImage2D.assetType :
					if (event.url == 'assets/masterchief_base.png' ) {
						this.mat = new MethodMaterial(<BitmapImage2D> d);
						this.mat.style.sampler = new Sampler2D(true, true, false);
						this.mat.lightPicker = new StaticLightPicker([this.light]);
					} else if (event.url == 'assets/stone_tx.jpg') {
						this.terrainMaterial = new MethodMaterial(<BitmapImage2D> d);
						this.terrainMaterial.style.sampler = new Sampler2D(true, true, false);
						this.terrainMaterial.lightPicker = new StaticLightPicker([this.light]);
					}

					break;
			}
		}

		if (this.terrain && this.terrainMaterial)
			this.terrain.material = this.terrainMaterial;

		if (this.mat && this.spartanFlag)
			for (var c:number = 0; c < this.sprites.length; c++)
				this.sprites[c].material = this.mat;

		this.onResize();
	}

	public onResize(event:UIEvent = null)
	{
		this.view.y = 0;
		this.view.x = 0;

		this.view.width = window.innerWidth;
		this.view.height = window.innerHeight;
	}
}

window.onload = function ()
{
	new ObjLoaderMasterChief(); // Start the demo
}