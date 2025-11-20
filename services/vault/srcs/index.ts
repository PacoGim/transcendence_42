import { generateKeys } from "./generateKeys.ts";
import { routes } from "./routes/handler.route.ts";

const PORT = 6988;

async function main() {
    await generateKeys();
    Bun.serve({
        port: PORT,
        routes,
        fetch() {
            return new Response("Route not Known", { status: 404 });
        }
    });
    console.log(`Listening on http://localhost:${PORT}`);
}

main();