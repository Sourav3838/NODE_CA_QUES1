/*Node.js helps in scaling up the applications by allowing us  to split a single process into multiple processes or 
workers, in Node.js terminology. This can be achieved through a cluster module. The cluster module allows us to create 
child processes (workers), which share all the server ports with the main Node process (master). */
var cluster = require('cluster'); /*demonstrate the multi-processor platforms  */

/*this if else statement will allow us to identify which portion of the 
code is for the master process and which portion is for the workers(child process). */
if (cluster.isMaster) {
	/*master process is in charge of initiating workers and controlling them */
	var numWorkers = require('os').cpus().length; /*cpus() gives an array of the CPU cores */

	console.log('Master cluster setting up ' + numWorkers + ' workers...');

	for (var i = 0; i < numWorkers; i++) {
		cluster.fork(); /* To start a worker process inside a master process, i have used fork() method */
	}
	/*Two common events related to the moments of start and termination of 
	workers are the online and the exit events. */
	cluster.on('online', function (worker) {
		/*online is emitted when the worker is forked and sends the online message */
		console.log('Worker ' + worker.process.pid + ' is online');
	});

	cluster.on('exit', function (worker, code, signal) {
		/*exit is emitted when a worker process dies */
		console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
		console.log('Starting a new worker');
		/*fork a new worker in order to maintain the intended number of workers. 
		This allows us to keep the application running, even if there are some unhandled exceptions. */
		cluster.fork();
	});
} else {
	/*When requests are received, they are distributed one at a time to each worker. 
	If a worker is available, it immediately starts processing the request; otherwise it’ll be added to a queue. */
	var app = require('express')();
	app.all('/*', function (req, res) {
		res.send('process ' + process.pid + ' says hello!').end();
	});
	/*listen to port 5000 */
	var server = app.listen(5000, function () {
		console.log('Process ' + process.pid + ' is listening to all incoming requests');
	});
}
