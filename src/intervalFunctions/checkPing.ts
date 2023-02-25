import { heartbeatGauge } from '../monitoring/prometheus';
import { client } from '../index';

export async function checkPing() {
	const ping = client.ws.ping;
	heartbeatGauge.set(ping);
}
