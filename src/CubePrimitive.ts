///<reference path="Away3D/Away3D.next.d.ts" />

module examples
{

	export class CubePrimitive {

		private _view:away.containers.View3D;
		private _cube:away.primitives.CubeGeometry;
		private _torus:away.primitives.TorusGeometry;
		private _mesh:away.entities.Mesh;
		private _mesh2:away.entities.Mesh;
		private _raf:away.utils.RequestAnimationFrame;
		private _image:HTMLImageElement;
		private _cameraAxis:away.geom.Vector3D;
		private _light:away.lights.DirectionalLight;
		private _lightPicker:away.materials.StaticLightPicker;

		constructor ()
		{

			this.initView ();
			this.initCamera ();
			this.initLights ();
			this.initGeometry ();
			this.loadResources ();

		}

		/**
		 *
		 */
		private initView ():void
		{
			this._view = new away.containers.View3D ();
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
			this._cube = new away.primitives.CubeGeometry (20.0, 20.0, 20.0);
			this._torus = new away.primitives.TorusGeometry (150, 80, 32, 16, true);
		}

		/**
		 *
		 */
		private initLights ():void
		{
			this._light = new away.lights.DirectionalLight ();
			this._light.color = 0xffffff;
			this._light.direction = new away.geom.Vector3D (1, 0, 0);
			this._light.ambient = 0.4;
			this._light.ambientColor = 0x85b2cd;
			this._light.diffuse = 2.8;
			this._light.specular = 1.8;

			this._lightPicker = new away.materials.StaticLightPicker ([this._light]);
		}

		/**
		 *
		 */
		private initCamera ():void
		{
			this._cameraAxis = new away.geom.Vector3D (0, 0, 1);
			this._view.camera.lens = new away.cameras.PerspectiveLens (120);
		}

		/**
		 *
		 */
		public initResizeHandler ():void
		{
			this.resize ();
			window.onresize = () => this.resize ();
		}

		/**
		 *
		 */
		public startRAF ():void
		{
			this._raf = new away.utils.RequestAnimationFrame (this.render, this);
			this._raf.start ();
		}

		/**
		 *
		 */
		private loadResources ()
		{
			var urlRequest:away.net.URLRequest = new away.net.URLRequest ("assets/spacy_texture.png");
			var imgLoader:away.net.IMGLoader = new away.net.IMGLoader ();

			imgLoader.addEventListener (away.events.Event.COMPLETE, this.imageCompleteHandler, this);
			imgLoader.load (urlRequest);
		}

		/**
		 *
		 * @param e
		 */
		private imageCompleteHandler (e)
		{
			var imageLoader:away.net.IMGLoader = <away.net.IMGLoader> e.target
			this._image = imageLoader.image;

			var ts:away.textures.HTMLImageElementTexture = new away.textures.HTMLImageElementTexture (this._image, false);
			var matTx:away.materials.TextureMaterial = new away.materials.TextureMaterial (ts, true, true, false);
			matTx.blendMode = away.display.BlendMode.ADD;
			matTx.bothSides = true;
			matTx.lightPicker = this._lightPicker;

			this._lightPicker

			this._mesh = new away.entities.Mesh (this._torus, matTx);
			this._mesh2 = new away.entities.Mesh (this._cube, matTx);
			this._mesh2.x = 130;
			this._mesh2.z = 40;

			this._view.scene.addChild (this._mesh);
			this._view.scene.addChild (this._mesh2);

			this.initResizeHandler ();
			this.startRAF ();

		}

		/**
		 *
		 * @param dt
		 */
		public render (dt:number = null):void
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
		public resize ()
		{
			this._view.y = 0;
			this._view.x = 0;

			this._view.width = window.innerWidth;
			this._view.height = window.innerHeight;

		}

	}
}

window.onload = function ()
{
	new examples.CubePrimitive ();
}
