(function e(t,i,a){function s(n,o){if(!i[n]){if(!t[n]){var l=typeof require=="function"&&require;if(!o&&l)return l(n,!0);if(r)return r(n,!0);var h=new Error("Cannot find module '"+n+"'");throw h.code="MODULE_NOT_FOUND",h}var d=i[n]={exports:{}};t[n][0].call(d.exports,function(e){var i=t[n][1][e];return s(i?i:e)},d,d.exports,e,t,i,a)}return i[n].exports}var r=typeof require=="function"&&require;for(var n=0;n<a.length;n++)s(a[n]);return s})({"./src/AircraftDemo.ts":[function(e,t,i){var a=e("awayjs-core/lib/data/Geometry");var s=e("awayjs-core/lib/events/LoaderEvent");var r=e("awayjs-core/lib/geom/UVTransform");var n=e("awayjs-core/lib/geom/Vector3D");var o=e("awayjs-core/lib/library/AssetLibrary");var l=e("awayjs-core/lib/net/URLRequest");var h=e("awayjs-core/lib/utils/Debug");var d=e("awayjs-core/lib/utils/RequestAnimationFrame");var c=e("awayjs-display/lib/containers/DisplayObjectContainer");var m=e("awayjs-display/lib/containers/View");var u=e("awayjs-display/lib/entities/DirectionalLight");var f=e("awayjs-display/lib/entities/Mesh");var w=e("awayjs-display/lib/entities/Skybox");var y=e("awayjs-display/lib/materials/MaterialBase");var _=e("awayjs-display/lib/materials/lightpickers/StaticLightPicker");var b=e("awayjs-display/lib/prefabs/PrimitivePlanePrefab");var p=e("awayjs-display/lib/textures/SingleCubeTexture");var v=e("awayjs-display/lib/textures/Single2DTexture");var j=e("awayjs-renderergl/lib/DefaultRenderer");var M=e("awayjs-methodmaterials/lib/MethodMaterial");var g=e("awayjs-methodmaterials/lib/pool/MethodRendererPool");var x=e("awayjs-methodmaterials/lib/methods/EffectEnvMapMethod");var T=e("awayjs-methodmaterials/lib/methods/NormalSimpleWaterMethod");var k=e("awayjs-methodmaterials/lib/methods/SpecularFresnelMethod");var G=e("awayjs-parsers/lib/OBJParser");var R=function(){function e(){var e=this;this._maxStates=2;this._cameraIncrement=0;this._rollIncrement=0;this._loopIncrement=0;this._state=0;this._appTime=0;this._seaInitialized=false;this._f14Initialized=false;this._skyboxInitialized=false;h.LOG_PI_ERRORS=false;h.THROW_ERRORS=false;this.initView();this.initLights();this.initAnimation();this.initParsers();this.loadAssets();window.onresize=function(t){return e.onResize(t)}}e.prototype.loadAssets=function(){this.loadAsset("assets/sea_normals.jpg");this.loadAsset("assets/f14/f14d.obj");this.loadAsset("assets/skybox/CubeTextureTest.cube")};e.prototype.loadAsset=function(e){var t=this;var i=o.load(new l(e));i.addEventListener(s.RESOURCE_COMPLETE,function(e){return t.onResourceComplete(e)})};e.prototype.initParsers=function(){o.enableParser(G)};e.prototype.initAnimation=function(){this._timer=new d(this.render,this)};e.prototype.initView=function(){this._view=new m(new j(g));this._view.camera.z=-500;this._view.camera.y=250;this._view.camera.rotationX=20;this._view.camera.projection.near=.5;this._view.camera.projection.far=14e3;this._view.backgroundColor=2894898;this.onResize()};e.prototype.initializeScene=function(){if(this._skyboxCubeTexture&&this._f14Geom&&this._seaNormalTexture){this.initF14();this.initSea();this._timer.start()}};e.prototype.initLights=function(){var e=new u;e.color=9913635;e.direction=new n(-300,-300,-5e3);e.ambient=1;e.ambientColor=7444140;e.diffuse=1.2;e.specular=1.1;this._view.scene.addChild(e);this._lightPicker=new _([e])};e.prototype.initF14=function(){var e=this;this._f14Initialized=true;var t=new M(this._seaNormalTexture,true,true,false);t.lightPicker=this._lightPicker;this._view.scene.addChild(this._f14Geom);this._f14Geom.transform.scale=new n(20,20,20);this._f14Geom.rotationX=90;this._f14Geom.y=200;this._view.camera.lookAt(this._f14Geom.transform.position);document.onmousedown=function(t){return e.onMouseDown(t)}};e.prototype.initSea=function(){this._seaMaterial=new M(this._seaNormalTexture,true,true,false);this._waterMethod=new T(this._seaNormalTexture,new v(this._seaNormalTexture.sampler2D));var e=new k;e.normalReflectance=.3;this._seaMaterial.alphaBlending=true;this._seaMaterial.lightPicker=this._lightPicker;this._seaMaterial.repeat=true;this._seaMaterial.animateUVs=true;this._seaMaterial.normalMethod=this._waterMethod;this._seaMaterial.addEffectMethod(new x(this._skyboxCubeTexture));this._seaMaterial.specularMethod=e;this._seaMaterial.gloss=100;this._seaMaterial.specular=1;this._seaGeom=new b(5e4,5e4,1,1,true,false);this._seaMesh=this._seaGeom.getNewObject();this._seaGeom.geometry.scaleUV(100,100);this._seaMesh.subMeshes[0].uvTransform=new r;this._seaMesh.material=this._seaMaterial;this._view.scene.addChild(new w(this._skyboxCubeTexture));this._view.scene.addChild(this._seaMesh)};e.prototype.onResourceComplete=function(e){var t=e.target;var i=t.baseDependency.assets.length;var s=0;switch(e.url){case"assets/sea_normals.jpg":this._seaNormalTexture=new v(t.baseDependency.assets[0]);break;case"assets/f14/f14d.obj":this._f14Geom=new c;for(s=0;s<i;++s){var r=t.baseDependency.assets[s];switch(r.assetType){case f.assetType:var n=r;this._f14Geom.addChild(n);break;case a.assetType:break;case y.assetType:break}}break;case"assets/skybox/CubeTextureTest.cube":this._skyboxCubeTexture=new p(t.baseDependency.assets[0]);break}this.initializeScene()};e.prototype.render=function(e){if(this._f14Geom){this._rollIncrement+=.02;switch(this._state){case 0:this._f14Geom.rotationZ=Math.sin(this._rollIncrement)*25;break;case 1:this._loopIncrement+=.05;this._f14Geom.z+=Math.cos(this._loopIncrement)*20;this._f14Geom.y+=Math.sin(this._loopIncrement)*20;this._f14Geom.rotationX+=-1*(Math.PI/180*Math.atan2(this._f14Geom.z,this._f14Geom.y));this._f14Geom.rotationZ=Math.sin(this._rollIncrement)*25;if(this._loopIncrement>Math.PI*2){this._loopIncrement=0;this._state=0}break}}if(this._f14Geom){this._view.camera.lookAt(this._f14Geom.transform.position)}if(this._view.camera){this._cameraIncrement+=.01;this._view.camera.x=Math.cos(this._cameraIncrement)*400;this._view.camera.z=Math.sin(this._cameraIncrement)*400}if(this._f14Geom){this._view.camera.lookAt(this._f14Geom.transform.position)}if(this._seaMaterial){this._seaMesh.subMeshes[0].uvTransform.offsetV-=.04}this._appTime+=e;this._view.render()};e.prototype.onResize=function(e){if(e===void 0){e=null}this._view.y=0;this._view.x=0;this._view.width=window.innerWidth;this._view.height=window.innerHeight};e.prototype.onMouseDown=function(e){this._state++;if(this._state>=this._maxStates)this._state=0};return e}();window.onload=function(){new R}},{"awayjs-core/lib/data/Geometry":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/UVTransform":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/Debug":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/DisplayObjectContainer":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/entities/DirectionalLight":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/Skybox":undefined,"awayjs-display/lib/materials/MaterialBase":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-display/lib/textures/SingleCubeTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/methods/EffectEnvMapMethod":undefined,"awayjs-methodmaterials/lib/methods/NormalSimpleWaterMethod":undefined,"awayjs-methodmaterials/lib/methods/SpecularFresnelMethod":undefined,"awayjs-methodmaterials/lib/pool/MethodRendererPool":undefined,"awayjs-parsers/lib/OBJParser":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/AircraftDemo.ts"]);

//# sourceMappingURL=AircraftDemo.js.map