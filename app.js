/*Node.js helps in scaling up the applications by allowing us  to split a single process into multiple processes or 
workers, in Node.js terminology. This can be achieved through a cluster module. The cluster module allows us to create 
child processes (workers), which share all the server ports with the main Node process (master). */
var cluster = require('cluster'); /*demonstrate the multi-processor platforms  */
var os = require('os');

let worker_process = []; /*array of child processes */

var proLen = os.cpus().length; /*cpus() gives an array of the CPU cores */

/*this if else statement will allow us to identify which portion of the 
code is for the master process and which portion is for the workers(child process). */
if (cluster.isMaster) {
	/*master process is in charge of initiating workers and controlling them */
	masterProcess();
} else {
	/*worker */
	childProcess();
}

function masterProcess() {
	console.log(`master id :- ${process.pid}`);
	for (let i = 0; i < proLen; i++) {
		console.log(`Process index ${i}`);
		/*A cluster is a pool of similar workers running under a parent Node process. Workers are created using the 
		fork() method of the child_processes module. This means workers can share server handles and use IPC 
		(Inter-process communication) to communicate with the parent Node process. */
		var worker = cluster.fork(); /* To start a worker process inside a master process, i have used fork() method */
		/*push into the child process array */
		worker_process.push(worker);
		/*workers may need to inform the master that the task is completed. To listen for messages, an event listener for
		 the message event should be set up in both master and workers */
		worker.on('message', function (msg) {
			console.log(`message received from worker ${worker.process.pid}`);
		});
		/*To send a message from the master to a worker */
		/*it is a good practice to send messages as JSON objects with some 
		information about the message like :- type, sender, and the content itself */
		worker.send({
			type: 'task 1',
			from: 'master',
			msg: `message from master ${process.pid} to worker ${worker.process.pid}`,
		});
		/*to loop through all the active workers */
		worker_process.forEach(function (worker) {
			console.log(`Master ${process.pid} is sending message to ${worker.process.pid}`);
		});
	}
}
function childProcess() {
	/*When requests are received, they are distributed once at a time to each worker. 
	If a worker is available, it immediately starts processing the request; otherwise it’ll be added to a queue. */
	console.log(`worker id :- ${process.pid} `);
	/*To listen for messages from the master */
	process.on('message', function (msg) {
		console.log(`Worker ${process.pid} receives message ${msg}`);
	});
	/*to send a message from a worker to the master */
	process.send({ msg: `Message from worker ${process.pid} to master` });
	process.exit();
}
