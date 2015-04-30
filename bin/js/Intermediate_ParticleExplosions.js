(function e(i,t,a){function r(n,o){if(!t[n]){if(!i[n]){var l=typeof require=="function"&&require;if(!o&&l)return l(n,!0);if(s)return s(n,!0);var h=new Error("Cannot find module '"+n+"'");throw h.code="MODULE_NOT_FOUND",h}var c=t[n]={exports:{}};i[n][0].call(c.exports,function(e){var t=i[n][1][e];return r(t?t:e)},c,c.exports,e,i,t,a)}return t[n].exports}var s=typeof require=="function"&&require;for(var n=0;n<a.length;n++)r(a[n]);return r})({"./src/Intermediate_ParticleExplosions.ts":[function(e,i,t){var a=e("awayjs-core/lib/events/LoaderEvent");var r=e("awayjs-core/lib/geom/ColorTransform");var s=e("awayjs-core/lib/geom/Vector3D");var n=e("awayjs-core/lib/library/AssetLibrary");var o=e("awayjs-core/lib/net/URLRequest");var l=e("awayjs-core/lib/utils/RequestAnimationFrame");var h=e("awayjs-display/lib/containers/Scene");var c=e("awayjs-display/lib/containers/View");var d=e("awayjs-display/lib/controllers/HoverController");var m=e("awayjs-display/lib/entities/Camera");var u=e("awayjs-display/lib/entities/Mesh");var g=e("awayjs-display/lib/entities/PointLight");var f=e("awayjs-display/lib/materials/lightpickers/StaticLightPicker");var p=e("awayjs-display/lib/prefabs/PrimitivePlanePrefab");var w=e("awayjs-renderergl/lib/animators/ParticleAnimationSet");var y=e("awayjs-renderergl/lib/animators/ParticleAnimator");var P=e("awayjs-renderergl/lib/animators/data/ParticlePropertiesMode");var I=e("awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode");var b=e("awayjs-renderergl/lib/animators/nodes/ParticleBezierCurveNode");var v=e("awayjs-renderergl/lib/animators/nodes/ParticleInitialColorNode");var A=e("awayjs-renderergl/lib/animators/nodes/ParticlePositionNode");var E=e("awayjs-renderergl/lib/DefaultRenderer");var L=e("awayjs-renderergl/lib/utils/ParticleGeometryHelper");var M=e("awayjs-methodmaterials/lib/MethodMaterial");var C=e("awayjs-methodmaterials/lib/pool/MethodRendererPool");var R=function(){function e(){this.colorValues=new Array;this.colorPoints=new Array;this.time=0;this.angle=0;this.move=false;this.init()}e.prototype.init=function(){this.initEngine();this.initLights();this.initMaterials();this.initListeners()};e.prototype.initEngine=function(){this.scene=new h;this.camera=new m;this.view=new c(new E(C),this.scene,this.camera);this.cameraController=new d(this.camera,null,225,10,1e3)};e.prototype.initLights=function(){this.greenLight=new g;this.greenLight.color=65280;this.greenLight.ambient=1;this.greenLight.fallOff=600;this.greenLight.radius=100;this.greenLight.specular=2;this.scene.addChild(this.greenLight);this.blueLight=new g;this.blueLight.color=255;this.blueLight.fallOff=600;this.blueLight.radius=100;this.blueLight.specular=2;this.scene.addChild(this.blueLight);this.lightPicker=new f([this.greenLight,this.blueLight])};e.prototype.initMaterials=function(){this.colorMaterial=new M(16777215);this.colorMaterial.bothSides=true;this.colorMaterial.lightPicker=this.lightPicker};e.prototype.initParticles=function(){var i;var t;var a;var n;var o;for(i=0;i<this.chromeBitmapImage2D.width;i++){for(t=0;t<this.chromeBitmapImage2D.height;t++){a=new s(e.PARTICLE_SIZE*(i-this.chromeBitmapImage2D.width/2-100),e.PARTICLE_SIZE*(-t+this.chromeBitmapImage2D.height/2));o=this.chromeBitmapImage2D.getPixel32(i,t);if((o>>24&255)>176){this.colorValues.push(new s(((o&16711680)>>16)/255,((o&65280)>>8)/255,(o&255)/255));this.colorPoints.push(a)}}}this.colorChromeSeparation=this.colorPoints.length;for(i=0;i<this.firefoxBitmapImage2D.width;i++){for(t=0;t<this.firefoxBitmapImage2D.height;t++){a=new s(e.PARTICLE_SIZE*(i-this.firefoxBitmapImage2D.width/2+100),e.PARTICLE_SIZE*(-t+this.firefoxBitmapImage2D.height/2));o=this.firefoxBitmapImage2D.getPixel32(i,t);if((o>>24&255)>176){this.colorValues.push(new s(((o&16711680)>>16)/255,((o&65280)>>8)/255,(o&255)/255));this.colorPoints.push(a)}}}this.colorFirefoxSeparation=this.colorPoints.length;for(i=0;i<this.safariBitmapImage2D.width;i++){for(t=0;t<this.safariBitmapImage2D.height;t++){a=new s(e.PARTICLE_SIZE*(i-this.safariBitmapImage2D.width/2),e.PARTICLE_SIZE*(-t+this.safariBitmapImage2D.height/2),-e.PARTICLE_SIZE*100);o=this.safariBitmapImage2D.getPixel32(i,t);if((o>>24&255)>176){this.colorValues.push(new s(((o&16711680)>>16)/255,((o&65280)>>8)/255,(o&255)/255));this.colorPoints.push(a)}}}this.colorSafariSeparation=this.colorPoints.length;for(i=0;i<this.ieBitmapImage2D.width;i++){for(t=0;t<this.ieBitmapImage2D.height;t++){a=new s(e.PARTICLE_SIZE*(i-this.ieBitmapImage2D.width/2),e.PARTICLE_SIZE*(-t+this.ieBitmapImage2D.height/2),e.PARTICLE_SIZE*100);o=this.ieBitmapImage2D.getPixel32(i,t);if((o>>24&255)>176){this.colorValues.push(new s(((o&16711680)>>16)/255,((o&65280)>>8)/255,(o&255)/255));this.colorPoints.push(a)}}}var l=this.colorPoints.length;var h=new p(e.PARTICLE_SIZE,e.PARTICLE_SIZE,1,1,false);var c=new Array;for(i=0;i<l;i++)c.push(h.geometry);this.colorGeometry=L.generateGeometry(c);this.colorAnimationSet=new w;this.colorAnimationSet.addAnimation(new I);this.colorAnimationSet.addAnimation(new b(P.LOCAL_STATIC));this.colorAnimationSet.addAnimation(new A(P.LOCAL_STATIC));this.colorAnimationSet.addAnimation(new v(P.LOCAL_STATIC,true,false,new r(0,1,0,1)));this.colorAnimationSet.initParticleFunc=this.iniColorParticleFunc;this.colorAnimationSet.initParticleScope=this};e.prototype.initObjects=function(){this.colorAnimators=new Array(e.NUM_ANIMATORS);this.colorParticleMesh=new u(this.colorGeometry,this.colorMaterial);var i=0;for(i=0;i<e.NUM_ANIMATORS;i++){this.colorParticleMesh=this.colorParticleMesh.clone();this.colorParticleMesh.rotationY=45*(i-1);this.scene.addChild(this.colorParticleMesh);this.colorAnimators[i]=new y(this.colorAnimationSet);this.colorParticleMesh.animator=this.colorAnimators[i];this.scene.addChild(this.colorParticleMesh)}};e.prototype.initListeners=function(){var e=this;window.onresize=function(i){return e.onResize(i)};document.onmousedown=function(i){return e.onMouseDown(i)};document.onmouseup=function(i){return e.onMouseUp(i)};document.onmousemove=function(i){return e.onMouseMove(i)};this.onResize();this.timer=new l(this.onEnterFrame,this);this.timer.start();n.addEventListener(a.RESOURCE_COMPLETE,function(i){return e.onResourceComplete(i)});n.load(new o("assets/firefox.png"));n.load(new o("assets/chrome.png"));n.load(new o("assets/safari.png"));n.load(new o("assets/ie.png"))};e.prototype.iniColorParticleFunc=function(i){i.startTime=0;i.duration=1;var t=Math.random()*Math.PI*2;var a=Math.random()*Math.PI*2;var n=500;if(i.index<this.colorChromeSeparation)i[b.BEZIER_END_VECTOR3D]=new s(300*e.PARTICLE_SIZE,0,0);else if(i.index<this.colorFirefoxSeparation)i[b.BEZIER_END_VECTOR3D]=new s(-300*e.PARTICLE_SIZE,0,0);else if(i.index<this.colorSafariSeparation)i[b.BEZIER_END_VECTOR3D]=new s(0,0,300*e.PARTICLE_SIZE);else i[b.BEZIER_END_VECTOR3D]=new s(0,0,-300*e.PARTICLE_SIZE);var o=this.colorValues[i.index];i[v.COLOR_INITIAL_COLORTRANSFORM]=new r(o.x,o.y,o.z,1);i[b.BEZIER_CONTROL_VECTOR3D]=new s(n*Math.sin(t)*Math.cos(a),n*Math.cos(t)*Math.cos(a),n*Math.sin(a));i[A.POSITION_VECTOR3D]=this.colorPoints[i.index]};e.prototype.onEnterFrame=function(e){this.time+=e;this.cameraController.panAngle+=.2;var i;var t;if(this.colorAnimators){for(i=0;i<this.colorAnimators.length;i++){t=1e3*(Math.sin(this.time/5e3+Math.PI*i/4)+1);this.colorAnimators[i].update(t)}}this.angle+=Math.PI/180;this.greenLight.x=Math.sin(this.angle)*600;this.greenLight.z=Math.cos(this.angle)*600;this.blueLight.x=Math.sin(this.angle+Math.PI)*600;this.blueLight.z=Math.cos(this.angle+Math.PI)*600;this.view.render()};e.prototype.onResourceComplete=function(e){switch(e.url){case"assets/firefox.png":this.firefoxBitmapImage2D=e.assets[0];break;case"assets/chrome.png":this.chromeBitmapImage2D=e.assets[0];break;case"assets/ie.png":this.ieBitmapImage2D=e.assets[0];break;case"assets/safari.png":this.safariBitmapImage2D=e.assets[0];break}if(this.firefoxBitmapImage2D!=null&&this.chromeBitmapImage2D!=null&&this.safariBitmapImage2D!=null&&this.ieBitmapImage2D!=null){this.initParticles();this.initObjects()}};e.prototype.onMouseDown=function(e){this.lastPanAngle=this.cameraController.panAngle;this.lastTiltAngle=this.cameraController.tiltAngle;this.lastMouseX=e.clientX;this.lastMouseY=e.clientY;this.move=true};e.prototype.onMouseUp=function(e){this.move=false};e.prototype.onMouseMove=function(e){if(this.move){this.cameraController.panAngle=.3*(e.clientX-this.lastMouseX)+this.lastPanAngle;this.cameraController.tiltAngle=.3*(e.clientY-this.lastMouseY)+this.lastTiltAngle}};e.prototype.onResize=function(e){if(e===void 0){e=null}this.view.y=0;this.view.x=0;this.view.width=window.innerWidth;this.view.height=window.innerHeight};e.PARTICLE_SIZE=2;e.NUM_ANIMATORS=4;return e}();window.onload=function(){new R}},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/ColorTransform":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Scene":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/PointLight":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/pool/MethodRendererPool":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined,"awayjs-renderergl/lib/animators/ParticleAnimationSet":undefined,"awayjs-renderergl/lib/animators/ParticleAnimator":undefined,"awayjs-renderergl/lib/animators/data/ParticlePropertiesMode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleBezierCurveNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleInitialColorNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticlePositionNode":undefined,"awayjs-renderergl/lib/utils/ParticleGeometryHelper":undefined}]},{},["./src/Intermediate_ParticleExplosions.ts"]);

//# sourceMappingURL=Intermediate_ParticleExplosions.js.map