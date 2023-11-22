// code example from https://docs.aws.amazon.com/cloud9/latest/user-guide/tutorial-tour-ide.html
// run code by typing: node hello-cloud9.js
var readline = require('readline-sync');
var i = 10;
var input;

console.log("Hello Cloud9!");
console.log("i is " + i);

do {
	    input = readline.question("Enter a number (or 'q' to quit): ");
	    if (input === 'q') {
		            console.log('OK, exiting.')
		        }
	    else{
		            i += Number(input);
		            console.log("i is now " + i);
		        }
} while (input != 'q');

console.log("Goodbye!");
