/**
 * executing-phantom.js
 */
var path = require('path');
var fs = require('fs');

var spawn = require('child_process').spawn;
var child_pid = null;
// var args = [path.join(__dirname, "pdf-phantom-renderer.js"), "./pdf-template-filled.html", "./output.pdf"];
// In case you want to customize the process, modify the options object
// var options = {};

// If phantom is in the path use 'phantomjs', otherwise provide the path to the phantom phantomExecutable
// e.g for windows:
// var phantomExecutable = 'E:\\Programs\\PhantomJS\\bin\\phantomjs.exe';
var phantomExecutable = path.join(__dirname, '..\\..\\phantomjs\\bin\\phantomjs.exe');

/**
 * This method converts a Uint8Array to its string representation
 */
function Uint8ArrToString(myUint8Arr) {
  return String.fromCharCode.apply(null, myUint8Arr);
};

function renderPhantom(ph_script, input_file, output_file, opt) {
  // opt : {cwd: 'path/to/cwd', debug: false, timeout_ms: 10000}
  var options = {
    cwd: (opt.cwd || __dirname)
    // 'stdio': [process.stdin, process.stdout, process.stderr]
  }

  if (!fs.existsSync(phantomExecutable)) return Promise.reject("PhantomJS exe cannot be found in " + phantomExecutable);
  if (!fs.existsSync(ph_script)) return Promise.reject("PhantomJS script '" + ph_script + "' cannot be found :(");
  if (!fs.existsSync(input_file)) return Promise.reject("Input file '" + input_file + "' for PhantomJS cannot be found :(");

  var child = spawn(phantomExecutable, [ph_script, input_file, output_file], options);
  child_pid = child.pid;
  // console.log(options)

  var stderr = ''; // where errors from child process phantomjs will be stored

  var p = new Promise((resolve, reject) => {
    // Receive output of the child process
    if (opt.hasOwnProperty('debug') && opt['debug'] === true) {
      console.log("DEBUG activated for phantomjs script");

      child.stdout.on('data', function(data) {
        var textData = Uint8ArrToString(data);
        console.log(textData);
      });
    }

    // Receive error output of the child process
    child.stderr.on('data', function(err) {
      var textErr = Uint8ArrToString(err);
      if (opt.hasOwnProperty('debug') && opt['debug'] === true) console.log(textErr)
      stderr += textErr;
    });

    // Triggered when the process closes
    child.on('close', function(code) {
      if (stderr) reject(stderr);
      else resolve(code);
    });

    child.on('exit', function(code, signal) {
      if (opt.hasOwnProperty('debug') && opt['debug'] === true) console.log('child process exited with ' +
        `code ${code} and signal ${signal}`);
      if (stderr) reject(stderr);
      else resolve(code)
    });
  })

  // si timeout_ms vaut 0 on ne timeout jamais
  if (opt.hasOwnProperty('timeout_ms') && opt['timeout_ms'] == 0) return p;
  // sinon on renvoie une timeout promise
  else return promiseTimeout((opt['timeout_ms'] || 10000), p)

}


// pour faire un timeout à la promise qui execute le phantomjs script
function promiseTimeout(ms, promise) {

  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      // on kill le processus phantomjs et on reject
      kill(child_pid);
      reject('TIMEOUT PhantomJS (' + parseInt(ms / 1000) + 's)')
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}

// to kill the child process
// from : http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn

var psTree = require('ps-tree');

var killLinux = function(pid, signal, callback) {
  signal = signal || 'SIGKILL';
  callback = callback || function() {};
  var killTree = true;
  if (killTree) {
    psTree(pid, function(err, children) {
      [pid].concat(
        children.map(function(p) {
          return p.PID;
        })
      ).forEach(function(tpid) {
        try {
          process.kill(tpid, signal)
        } catch (ex) {}
      });
      callback();
    });
  } else {
    try {
      process.kill(pid, signal)
    } catch (ex) {}
    callback();
  }
};

function kill(pid) {
  var isWin = /^win/.test(process.platform);
  if (!isWin) {
    killLinux(pid);
  } else {
    var cp = require('child_process');
    cp.exec('taskkill /PID ' + pid + ' /T /F', function(error, stdout, stderr) {
      // console.log('stdout: ' + stdout);
      // console.log('stderr: ' + stderr);
      // if(error !== null) {
      //      console.log('exec error: ' + error);
      // }
    });
  }
}



module.exports.renderPhantom = renderPhantom;
