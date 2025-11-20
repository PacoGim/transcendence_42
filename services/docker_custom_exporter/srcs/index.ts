import { getMetrics } from "./routes";

const PORT = 6789;

async function main() {
    Bun.serve({
        port: PORT,
        routes: {
            "/metrics": getMetrics
        },
        fetch() {
            return new Response("Page not Found", { status: 404 })
        }
    })
    console.log(`Listening on http://localhost:${PORT}`)
}

main()