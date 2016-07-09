"use strict";
var mkdirp = require('mkdirp');
var fs = require('fs');
var getDirName = require('path').dirname;
var pandoc = require('pdc');
var async = require('async');
var count = 0;
var folderRegex = /^.[^.]+$/;
var mdRegex = /\.md$/;
var imgRegex = /\.((jpg)|(png)|(gif))$/;
var ignoredRegex = /(epub)|(node_modules)/;
var delay = 1;
var outputDir = "./html/";
/*
	fs.readdir("./", function(err, files){

		//console.log(files);

		for(let i in files){
			//console.log(files[i]);
		}

		for (let i = 0; i<files.length; i++)
			//console.log(files[i]);

		var hej = ["hej","då","min vän"];

		for(let i in hej)
			//console.log(hej[i]);
	});
*/

function Converter(){

	function searchDir(path){
		async.waterfall([
			
			function(next){
				next(null, path)
			},

			function readDir(path, next){
				//console.log("at readDir, path = " + path);
				fs.readdir(path, function(err, files){
					if (err)
						if (err.code == "ENOTDIR")
							return;
						else
							next(err);
					next(null, path, files);
				});
			},

			function identifyFiles(path, files, next){
				//console.log("at identifyFiles, path = " + path);
				for(let i in files){
					let file = files[i];
					//console.log("at file: " + file);
					if (ignoredRegex.test(file))
						console.log("ignoring " + path + file);
					else if (folderRegex.test(file))
						searchDir((path + file + "/"));
					else if (mdRegex.test(file))
						setTimeout(function(){
							convert((path+file))
						}, delay*count++);
					else if (imgRegex.test(file))
						setTimeout(function(){
							copyImg((path+file));
						}, delay*count++);
				}

				next(null);
			}
	
		], function(err, data){
			if (err)
					return console.log(err);

		});
	
	}

	function convert(path){
		async.waterfall([
			function(next){
				next(null, path);
			},
			function readFile(path, next){
				//console.log("at readFile, path = " + path);
				fs.readFile(path, "utf-8", function(err, txt){
					next(err, path, txt);
				});
			},

			function convertFile(path, txt, next){
				//console.log("at convertFile, txt = " + txt);
				pandoc(txt, "markdown", 'html', function(err, outp){
					if(err)
						console.log("Error at pandoc: " + err.stack);
					next(err, path, outp);
				})
			},

			function saveFile(path, output, next){
				//console.log("at saveFile, path = " + path);
				var newPath = outputDir + path.substring(2, path.length-2) + "html";
				console.log("saving file: " + newPath);
				mkdirp(getDirName(newPath), function(err){
					if (err){
						console.log("error at making dir");
						return next(err);
					}fs.writeFile(newPath, output, next)	
				})
			}

		], function(err, data){
			if (err){
				console.log(err);
			}
		});
	}

	function copyImg(path){
		async.waterfall([
			function(next){
				next(null, path);
			},
			function readFile(path, next){
				////console.log("at readFile, path = " + path);
				fs.readFile(path, function(err, txt){
					next(err, path, txt);
				});
			},

			function saveFile(path, output, next){
				//console.log("at IMG saveFile, path = " + path);
				var newPath = "./epub/" + path.substring(2, path.length);
				console.log("saving file: " + newPath);
				mkdirp(getDirName(newPath), function(err){
					if (err){
						console.log("error at making dir");
						return next(err);
					}fs.writeFile(newPath, output, next)	
				})
			}

		], function(err, data){
			if(err){
				console.log(err);
			}
		});
	}
	var API = {
		searchDirectory: searchDir
	}


	return API;

}



var run = Converter();


run.searchDirectory("./");