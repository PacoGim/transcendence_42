import { register } from '../services/prometheus.service.ts'

export async function getMetrics() {
    const metrics = await register.metrics();
    return new Response(metrics, {
        headers: { 'Content-Type': register.contentType }
    })
}