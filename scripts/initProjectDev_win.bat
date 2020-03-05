@ECHO off
TITLE Init Project Dev Enviroment
ECHO [32m Links all AwayFL modules and AwayJS modules to existing checked-out source modules[0m
PAUSE

ECHO [32m link "@awayjs/core" module[0m
call yarn link @awayjs/core

ECHO [32m link "@awayjs/stage" module[0m
call yarn link @awayjs/stage

ECHO [32m link "@awayjs/view" module[0m
call yarn link @awayjs/view

ECHO [32m link "@awayjs/renderer" module[0m
call yarn link @awayjs/renderer

ECHO [32m link "@awayjs/graphics" module[0m
call yarn link @awayjs/graphics

ECHO [32m link "@awayjs/materials" module[0m
call yarn link @awayjs/materials

ECHO [32m link "@awayjs/scene" module[0m
call yarn link @awayjs/scene

ECHO [32m link "@awayfl/swf-loader" module[0m
call yarn link @awayfl/swf-loader

ECHO [32m link "@awayfl/avm1" module[0m
call yarn link @awayfl/avm1

ECHO [32m link "@awayfl/avm2" module[0m
call yarn link @awayfl/avm2

ECHO [32m link "@awayfl/playerglobal" module[0m
call yarn link @awayfl/playerglobal

ECHO [32m link "@awayfl/awayfl-player" module[0m
call yarn link @awayfl/awayfl-player

PAUSE
