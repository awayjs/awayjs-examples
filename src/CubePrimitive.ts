///<reference path="../libs/stagegl-renderer.next.d.ts" />

module examples
{
	import BlendMode					= away.base.BlendMode;
	import Scene						= away.containers.Scene;
	import View							= away.containers.View;
	import Mesh							= away.entities.Mesh;
	import Vector3D						= away.geom.Vector3D;
	import DirectionalLight				= away.lights.DirectionalLight;
	import StaticLightPicker			= away.materials.StaticLightPicker;
	import TriangleMaterial				= away.materials.TriangleMaterial;
	import URLLoader					= away.net.URLLoader;
	import URLLoaderDataFormat			= away.net.URLLoaderDataFormat;
	import URLRequest					= away.net.URLRequest;
	import ParserUtils					= away.parsers.ParserUtils;
	import PrimitiveTorusPrefab			= away.prefabs.PrimitiveTorusPrefab;
	import PrimitiveCubePrefab			= away.prefabs.PrimitiveCubePrefab;
	import PerspectiveProjection		= away.projections.PerspectiveProjection;
	import DefaultRenderer				= away.render.DefaultRenderer;
	import ImageTexture					= away.textures.ImageTexture;
	import RequestAnimationFrame		= away.utils.RequestAnimationFrame;

	export class CubePrimitive
	{
		private _view:View;
		private _cube:PrimitiveCubePrefab;
		private _torus:PrimitiveTorusPrefab;
		private _mesh:Mesh;
		private _mesh2:Mesh;
		private _raf:RequestAnimationFrame;
		private _image:HTMLImageElement;
		private _cameraAxis:Vector3D;
		private _light:DirectionalLight;
		private _lightPicker:StaticLightPicker;

		constructor ()
		{
			this.initView();
			this.initCamera();
			this.initLights();
			this.initGeometry();
			this.loadResources();
		}

		/**
		 *
		 */
		private initView ():void
		{
			this._view = new View(new DefaultRenderer());
			this._view.backgroundColor = 0x000000;
			this._view.camera.x = 130;
			this._view.camera.y = 0;
			this._view.camera.z = 0;
		}

		/**
		 *
		 */
		private initGeometry ():void
		{
			this._cube = new PrimitiveCubePrefab(20.0, 20.0, 20.0);
			this._torus = new PrimitiveTorusPrefab(150, 80, 32, 16, true);

			this._mesh = <Mesh> this._torus.getNewObject();
			this._mesh2 = <Mesh> this._cube.getNewObject();
			this._mesh2.x = 130;
			this._mesh2.z = 40;
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
			this._view.camera.projection = new PerspectiveProjection(120);
			this._view.camera.projection.near = 0.1;
		}

		/**
		 *
		 */
		private loadResources()
		{
			window.onresize = (event:UIEvent) => this.onResize(event);
			this.onResize();

			this._raf = new RequestAnimationFrame(this.render, this);
			this._raf.start ();

			var urlRequest:URLRequest = new URLRequest ("assets/spacy_texture.png");
			var imgLoader:URLLoader = new URLLoader();
			imgLoader.dataFormat = URLLoaderDataFormat.BLOB;

			imgLoader.addEventListener (away.events.Event.COMPLETE, (event:away.events.Event) => this.urlCompleteHandler(event));
			imgLoader.load (urlRequest);
		}

		/**
		 *
		 * @param e
		 */
		private urlCompleteHandler(event:away.events.Event)
		{
			var imageLoader:URLLoader = <URLLoader> event.target
			this._image = ParserUtils.blobToImage(imageLoader.data);
			this._image.onload = (event:Event) => this.imageCompleteHandler(event);
		}

		/**
		 *
		 * @param e
		 */
		private imageCompleteHandler(event:Event)
		{
			var ts:ImageTexture = new ImageTexture(this._image, false);
			var matTx:TriangleMaterial = new TriangleMaterial (ts, true, true, false);
			matTx.blendMode = BlendMode.ADD;
			matTx.bothSides = true;
			matTx.lightPicker = this._lightPicker;

			this._mesh.material = matTx;
			this._mesh2.material = matTx;

			this._view.scene.addChild(this._mesh);
			this._view.scene.addChild(this._mesh2);

		}

		/**
		 *
		 * @param dt
		 */
		public render(dt:number = null):void
		{
			this._view.camera.rotate (this._cameraAxis, 1);
			this._mesh.rotationY += 1;
			this._mesh2.rotationX += 0.4;
			this._mesh2.rotationY += 0.4;
			this._view.render ();
		}

		/**
		 *
		 */
		public onResize(event:UIEvent = null)
		{
			this._view.y = 0;
			this._view.x = 0;

			this._view.width = window.innerWidth;
			this._view.height = window.innerHeight;
		}
	}
}

window.onload = function()
{
	new examples.CubePrimitive();
}
