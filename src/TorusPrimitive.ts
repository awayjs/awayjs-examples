///<reference path="Away3D/Away3D.next.d.ts" />

module examples
{

	export class TorusPrimitive
	{

		private _view			: away.containers.View3D;
		private _torus       	: away.primitives.TorusGeometry;
		private _mesh  			: away.entities.Mesh;
		private _raf			: away.utils.RequestAnimationFrame;
		private _image			: HTMLImageElement;

		constructor()
		{

			this._view                  = new away.containers.View3D( );
			this._view.backgroundColor  = 0x000000;
			this._view.camera.lens      = new away.cameras.PerspectiveLens( 60 );
			this._torus                 = new away.primitives.TorusGeometry( 220, 80, 32, 16, false );
			
			this.loadResources();

            window.onresize = () => this.resize();

		}
		
		private loadResources()
		{
			var urlRequest  : away.net.URLRequest = new away.net.URLRequest( "assets/dots.png" );

			var imgLoader   : away.net.IMGLoader = new away.net.IMGLoader();
			    imgLoader.addEventListener( away.events.Event.COMPLETE, this.imageCompleteHandler, this );
			    imgLoader.load( urlRequest );
		}
		
		private imageCompleteHandler(e)
		{
			var imageLoader:away.net.IMGLoader  = <away.net.IMGLoader> e.target
			this._image                         = imageLoader.image;

			var ts : away.textures.HTMLImageElementTexture = new away.textures.HTMLImageElementTexture( this._image, false );
			
			var light:away.lights.DirectionalLight = new away.lights.DirectionalLight();
                light.ambientColor  = 0xff0000;
                light.ambient       = 0.3;
                light.diffuse       = .7;
                light.specular      = 1;

			this._view.scene.addChild( light );
			
			var lightPicker : away.materials.StaticLightPicker  = new away.materials.StaticLightPicker( [light] );
			
			var matTx       : away.materials.TextureMaterial    = new away.materials.TextureMaterial( ts, true, true, false );
			    matTx.lightPicker                               = lightPicker;

			this._mesh = new away.entities.Mesh( this._torus, matTx );

			this._view.scene.addChild( this._mesh );

            this.resize();

			this._raf = new away.utils.RequestAnimationFrame( this.render , this );
            this._raf.start();

		}

		public render( dt:number = null ):void
		{
            this._mesh.rotationY += 1;
            this._view.render();
		}

        public resize()
        {
            this._view.y         = 0;
            this._view.x         = 0;
            this._view.width     = window.innerWidth;
            this._view.height    = window.innerHeight;
        }

	}
}

window.onload = function ()
{
    new examples.TorusPrimitive();
}