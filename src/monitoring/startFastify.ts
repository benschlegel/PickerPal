import { stringify } from '../functions';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// Require the framework and instantiate it
import fastify from 'fastify';

export const server = fastify();

// Run the server!
const start = async () => {
	try {
		await server.listen({ port: 80, host: '0.0.0.0' });
	}
	catch (err) {
		console.log('level=error msg="fastify error" error="' + stringify(err) + '"');
		process.exit(1);
	}
};
start();
