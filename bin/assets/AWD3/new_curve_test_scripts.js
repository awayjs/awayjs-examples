Color = require('awayjs-player/lib/adapters/AS2ColorAdapter');
System = require('awayjs-player/lib/adapters/AS2SystemAdapter');
Sound = require('awayjs-player/lib/adapters/AS2SoundAdapter');
Key = require('awayjs-player/lib/adapters/AS2KeyAdapter');
Mouse = require('awayjs-player/lib/adapters/AS2MouseAdapter');
Stage = require('awayjs-player/lib/adapters/AS2StageAdapter');
SharedObject = require('awayjs-player/lib/adapters/AS2SharedObjectAdapter');
int = function (value) { return Math.floor(value) | 0; };
string = function (value) { return value.toString(); };
getURL = function (value) { return value; };

var new_curve_test_scripts = {

    //AnimateCC: Symbol: Scene 1 #frame: 1
    'Scene 1_f1' : function(){
        var _this=this;
        
        var mc_cnt=6;
        var current_mc=1;
        
        for(var i=2; i<=mc_cnt; i++){
        	_this["texttester_"+i]._alpha=0;	
        }
        _this["texttester_1"]._x=1000;
        this.onMouseDown = function () {
        	console.log("yay");
        	current_mc++;
        	if(current_mc>mc_cnt){
        		current_mc=1;
        	}
        	_this["texttester_"+current_mc]._x=1000;
        	_this["texttester_"+current_mc]._alpha=100;	
        };
        
        _this.mainloop = function () {
        	console.log("loop");
        	for(var i=1; i<=mc_cnt; i++){
        		if(i==current_mc){
        			if(_this["texttester_"+i]._x>35){
        				_this["texttester_"+i]._x-=30;
        			}
        			if(_this["texttester_"+i]._x<35){
        				_this["texttester_"+i]._x=35;
        			}
        		}
        		else{
        			if(_this["texttester_"+i]._x>-1500){
        				_this["texttester_"+i]._x-=30;
        			}
        			if(_this["texttester_"+i]._x<=-1500){
        				_this["texttester_"+i]._alpha=0;
        			}
        			
        		}
        	}
        	
        	
        }
        
        
        _this.KeyListener = {};
        _this.KeyListener.onKeyDown = function () {
        	console.log("keydown");
        };
        Key.addListener(_this.KeyListener);
        _this.clearInterval(_this.intervalID);
        _this.intervalID = _this.setInterval(_this.mainloop, 33); 
        
        _this.stop;
    },
};
