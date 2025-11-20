import client from 'prom-client'
import Docker from 'dockerode'

export const register = new client.Registry();
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const runningContainers = new client.Gauge({
  name: 'running_containers',
  help: 'Number of running Docker containers',
})

const stoppedContainers = new client.Gauge({
  name: 'stopped_containers',
  help: 'Number of stopped Docker containers',
})

const totalImages = new client.Gauge({
  name: 'total_images',
  help: 'Total number of Docker images',
})

register.registerMetric(runningContainers)
register.registerMetric(stoppedContainers)
register.registerMetric(totalImages)

export async function updateMetrics() {
  const containers = await docker.listContainers({ all: true })
  runningContainers.set(containers.filter(c => c.State === 'running' && c.Labels && c.Labels['com.docker.compose.project'] === 'transcendence_42').length)
  stoppedContainers.set(containers.filter(c => c.State !== 'running' && c.Labels && c.Labels['com.docker.compose.project'] === 'transcendence_42').length)
  const images = await docker.listImages()
  // filtre projet
  const realImages = images.filter(img => img.RepoTags && img.RepoTags.length > 0)
  totalImages.set(realImages.length)
}