// code example from https://docs.aws.amazon.com/cloud9/latest/user-guide/tutorial-tour-ide.html
// run code by typing: node hello-cloud9.js
var readline = require('readline-sync');
var i = 0;
// add random number
i += Math.random() * 10;
// convert i to int
i = Math.floor(i);
var input;

console.log("Hello Cloud9!");
console.log("randomized i is " + i);

do {
	input = readline.question("Enter a number (or 'q' to quit): ");
	if (input === 'q') {
		console.log('OK, exiting.')
	}
	if (input === 's') {
		console.log("Pss! It's a secret mode.");
		// create code for ASCII face in JS
		console.log("  _______");
		console.log(" | o o o |");
		console.log(" |  <>  |");
		console.log(" |_______|");
		// create code to display PID
		console.log("PID: " + process.pid);
		console.log("UID: " + process.getuid());
		console.log("GID: " + process.getgid());
		console.log("cwd: " + process.cwd());
		console.log("version: " + process.version);
		console.log("platform: " + process.platform);
		console.log("arch: " + process.arch);
		console.log("uptime: " + process.uptime());
		console.log("execPath: " + process.execPath);
		console.log("execArgv: " + process.execArgv);
		console.log("title: " + process.title);
	}


	else {
		i += Number(input);
		console.log("i is now " + i);
	}
} while (input != 'q');

console.log("Goodbye!");
