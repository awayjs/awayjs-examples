/****************************************************************************************************************************************************************
 *   Grunt File Usage:
 ****************************************************************************************************************************************************************
 *
 *  Export Documentation, TypeScript and Minify:
 *
 *      grunt
 *
 *  Export TypeScript and Minify:
 *
 *      grunt lib
 *
 *****************************************************************************************************************************************************************
 *  Options
 *****************************************************************************************************************************************************************
 *
 *  Export lib version, defaults to 'next' if not specified:
 *
 *      grunt --libversion=0.0.1
 *
 ****************************************************************************************************************************************************************
 *    Installing Dependencies:
 ****************************************************************************************************************************************************************
 *
 *  To install Grunt
 *
 *  1) install the grunt cli:
 *
 *      npm install -g grunt-cli
 *
 *  2) install the dependencies used by the build script:
 *
 *      OSX :       sudo npm install
 *      Windows:    npm install
 *
 ****************************************************************************************************************************************************************/

module.exports = function(grunt) {


    var version = grunt.option('libversion') || 'next';                     // Check for a version number | defaults to next if not specified

    //--------------------------------------------------------------------------------------------------------------
    // Plugins used by Grunt Script
    //--------------------------------------------------------------------------------------------------------------

	grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks('grunt-contrib-watch');

    //--------------------------------------------------------------------------------------------------------------
    // Grunt Config
    //--------------------------------------------------------------------------------------------------------------

    grunt.initConfig( {

        //--------------------------------------------------------------------------------------------------------------
        // Read the package.json
        //--------------------------------------------------------------------------------------------------------------

        pkg: grunt.file.readJSON('package.json'),

        //--------------------------------------------------------------------------------------------------------------
        // Export and compile TypeScript
        //--------------------------------------------------------------------------------------------------------------

        ts: {

			MultiPassSponzaDemo: {
				src: ['src/Advanced_MultiPassSponzaDemo.ts'],
				out: 'bin/js/Advanced_MultiPassSponzaDemo.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			AircraftDemo: {
				src: ['src/AircraftDemo.ts'],
				out: 'bin/js/AircraftDemo.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			AWDSuzanne: {
				src: ['src/AWDSuzanne.ts'],
				out: 'bin/js/AWDSuzanne.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Basic_Fire: {
				src: ['src/Basic_Fire.ts'],
				out: 'bin/js/Basic_Fire.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Basic_Load3DS: {
				src: ['src/Basic_Load3DS.ts'],
				out: 'bin/js/Basic_Load3DS.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Basic_LoadAWD: {
				src: ['src/Basic_LoadAWD.ts'],
				out: 'bin/js/Basic_LoadAWD.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Basic_Shading: {
				src: ['src/Basic_Shading.ts'],
				out: 'bin/js/Basic_Shading.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Basic_Skybox: {
				src: ['src/Basic_Skybox.ts'],
				out: 'bin/js/Basic_Skybox.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Basic_View: {
				src: ['src/Basic_View.ts'],
				out: 'bin/js/Basic_View.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			CubePrimitive: {
				src: ['src/CubePrimitive.ts'],
				out: 'bin/js/CubePrimitive.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Intermediate_AWDViewer: {
				src: ['src/Intermediate_AWDViewer.ts'],
				out: 'bin/js/Intermediate_AWDViewer.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Intermediate_Globe: {
				src: ['src/Intermediate_Globe.ts'],
				out: 'bin/js/Intermediate_Globe.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Intermediate_MD5Animation: {
				src: ['src/Intermediate_MD5Animation.ts'],
				out: 'bin/js/Intermediate_MD5Animation.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Intermediate_MonsterHeadShading: {
				src: ['src/Intermediate_MonsterHeadShading.ts'],
				out: 'bin/js/Intermediate_MonsterHeadShading.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Intermediate_ParticleExplosions: {
				src: ['src/Intermediate_ParticleExplosions.ts'],
				out: 'bin/js/Intermediate_ParticleExplosions.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			Intermediate_PerelithKnight: {
				src: ['src/Intermediate_PerelithKnight.ts'],
				out: 'bin/js/Intermediate_PerelithKnight.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			ObjLoaderMasterChief: {
				src: ['src/ObjLoaderMasterChief.ts'],
				out: 'bin/js/ObjLoaderMasterChief.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			},
			TorusPrimitive: {
				src: ['src/TorusPrimitive.ts'],
				out: 'bin/js/TorusPrimitive.js',
				options: {
					target: 'es5',
					sourcemap: true,
					declaration: false,
					comments: true
				}
			}
        }
    } );

    //--------------------------------------------------------------------------------------------------------------
    // Register Grunt tasks
    //--------------------------------------------------------------------------------------------------------------

    grunt.option.init();
	grunt.registerTask('default',  							['ts:MultiPassSponzaDemo' ,'ts:MultiPassSponzaDemo' , 'ts:AircraftDemo' , 'ts:AWDSuzanne' , 'ts:Basic_Fire' , 'ts:Basic_Load3DS' , 'ts:Basic_Shading' , 'ts:Basic_View'  , 'ts:Basic_View' , 'ts:CubePrimitive' , 'ts:Intermediate_AWDViewer' , 'ts:Intermediate_Globe','ts:Intermediate_MD5Animation','ts:Intermediate_MonsterHeadShading','ts:Intermediate_ParticleExplosions','ts:Intermediate_PerelithKnight','ts:ObjLoaderMasterChief','ts:TorusPrimitive' ]);
	grunt.registerTask('MultiPassSponzaDemo',  			 	['ts:MultiPassSponzaDemo' ]);
	grunt.registerTask('AircraftDemo',   					['ts:AircraftDemo' ]);
	grunt.registerTask('AWDSuzanne',   						['ts:AWDSuzanne' ]);
	grunt.registerTask('Basic_Fire',   						['ts:Basic_Fire' ]);
	grunt.registerTask('Basic_Load3DS',   					['ts:Basic_Load3DS' ]);
	grunt.registerTask('Basic_Shading',   					['ts:Basic_Shading' ]);
	grunt.registerTask('Basic_Skybox',   					['ts:Basic_Skybox' ]);
	grunt.registerTask('Basic_View',   						['ts:Basic_View' ]);
	grunt.registerTask('CubePrimitive',   					['ts:CubePrimitive' ]);
	grunt.registerTask('Intermediate_AWDViewer'				['ts:Intermediate_AWDViewer' ]);
	grunt.registerTask('Intermediate_Globe',				['ts:Intermediate_Globe' ]); // not working
	grunt.registerTask('Intermediate_MD5Animation',			['ts:Intermediate_MD5Animation' ]); // not working
	grunt.registerTask('Intermediate_MonsterHeadShading',	['ts:Intermediate_MonsterHeadShading' ]);
	grunt.registerTask('Intermediate_ParticleExplosions',	['ts:Intermediate_ParticleExplosions' ]);
	grunt.registerTask('Intermediate_PerelithKnight',		['ts:Intermediate_PerelithKnight' ]);
	grunt.registerTask('ObjLoaderMasterChief',				['ts:ObjLoaderMasterChief' ]);
	grunt.registerTask('TorusPrimitive',					['ts:TorusPrimitive' ]);

};

