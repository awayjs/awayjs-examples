import {Player} from "@awayjs/swf-viewer"


window.onload = function () {
    var player=new Player();
    player.playSWF(null, "./assets/SWF/BasicAS3Tests_FP30.swf");
};