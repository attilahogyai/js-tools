var fs = require("fs");
var path = require("path");

var expressions = [];
fs.readFile("expression.xpr", function(err, buf) {
  let lines = buf.toString().split("\n");
  for (let i = 0; i < lines.length; i++) {
    let expr = lines[i].trim().split(";");
    if (expr.length == 2) {
      expressions.push([expr[0], expr[1]]);
    }
    //console.log(expr[0]+' -> '+expr[1]);
  }
});

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

// here you specify the location where do you are looking for the files. 
walk(".", function(err, files) {
  if (err) throw err;
  for (let i = 0; i < files.length; i++) {
    if (files[i].endsWith(".js")) {
      fs.readFile(files[i], function(err, buf) {
        let content = buf.toString();
        let  changed = false;
        for (let j = 0; j < expressions.length; j++) {
          if(content.search(expressions[j][0])>-1){
            //console.log(expressions[j][0] + " -> " + expressions[j][1]);
            content = content.replace(new RegExp(expressions[j][0], "g"), expressions[j][1]);
            changed = true;
          }
        }
        if(changed){
          console.log('replace >> '+files[i]);
          fs.writeFile(files[i], content, function(err, data) {
            if (err) console.log(err);
          });
        }
      });
    }
  }
});
