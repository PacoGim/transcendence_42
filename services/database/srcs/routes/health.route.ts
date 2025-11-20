export function getUrlHealth() {
    return new Response(JSON.stringify({ status: 'ok', uptime: process.uptime() }), { status: 200 });
}