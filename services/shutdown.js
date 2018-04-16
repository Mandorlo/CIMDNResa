// cleanup actions on process exit
// this module is loaded in bin/www

const dbapi = require('./db.js')

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

process.on("SIGINT", function () {
  onExit()
  process.exit();
});


function onExit() {
  // on quitte la connexion à SQL
  dbapi.close()
  console.log('Ma assalami ! Grazie Signore !')
}
