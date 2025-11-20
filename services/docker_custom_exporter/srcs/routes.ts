import { register, updateMetrics } from './services/prometheus.service.ts'

export async function getMetrics() {
    await updateMetrics();
    const metrics = await register.metrics();
    return new Response(metrics, {
        headers: { 'Content-Type': register.contentType }
    })
}