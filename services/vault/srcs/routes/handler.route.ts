import { getSecret, setSecret } from './vault.route.ts';

const vaultRoutes = {
    "/vault/getSecret": {
        POST: (request:Request) => getSecret(request),
    },
    "/vault/setSecret": {
        POST: (name: string, value: string) => setSecret(name, value),
    },
}

export const routes = {
    ...vaultRoutes
}
