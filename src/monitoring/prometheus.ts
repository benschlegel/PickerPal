import { server } from '../monitoring/startFastify';
import * as client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
const prefix = 'picker_pal';
collectDefaultMetrics({ prefix });

export const promNumRequests = new client.Counter({
	name: prefix + 'num_requests',
	help: 'Number of commands executed on this bot',
	labelNames: ['makeChoice', 'ping'] as const,
});

export const heartbeatGauge = new client.Gauge({
	name: prefix + 'heartbeat',
	help: 'Discord heartbeat (manual)',
});

export const activeChoicesAmountGauge = new client.Gauge({
	name: prefix + 'choice_count',
	help: 'Amount of total choices',
});

export const uptimeGauge = new client.Gauge({
	name: prefix + 'uptime',
	help: 'Uptime of the bot.',
});

export const userbaseGauge = new client.Gauge({
	name: prefix + 'userbase',
	help: 'Number of users using this bot.',
});

// Declare monitoring route
server.get('/metrics', async () => {
	return await client.register.metrics();
});
