import { getMetrics } from "./routes";

async function main() {
    Bun.serve({
        port: Number(process.env.DOCKER_CUSTOM_EXPORTER_PORT),
        routes: {
            "/metrics": getMetrics
        },
        fetch() {
            return new Response("Page not Found", { status: 404 })
        }
    })
    console.log(`Listening on http://localhost:${process.env.DOCKER_CUSTOM_EXPORTER_PORT}`)
}

main()