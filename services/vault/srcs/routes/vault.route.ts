import vaultLib from 'node-vault';

const VAULT_ADDR = process.env.VAULT_ADDR;
const VAULT_TOKEN = process.env.VAULT_DEV_ROOT_TOKEN_ID;

if (!VAULT_ADDR || !VAULT_TOKEN) {
    throw new Error('VAULT_ADDR or VAULT_TOKEN is not defined in environment variables.');
}

const vault = vaultLib({
    apiVersion: 'v1',
    endpoint: VAULT_ADDR,
    token: VAULT_TOKEN,
});

export async function getSecret(request:Request) {
    const { name } = await request.json();
    let res;
    try {
        const secret = await vault.read(`secret/data/${name}`);
        console.log('\x1b[32m%s\x1b[0m', `Secret ${name} retrieved from Vault`);
        res = { status: 200, message: secret.data.data.value };
    }
    catch (error:unknown) {
       res = { status: 500, message: 'Error getting secret' };
       console.error('\x1b[32m%s\x1b[0m', `Error getting secret ${name} from Vault:`, error);
    }
    return Response.json(res);
}

export async function setSecret(name: string, value: string) {
    let res;
    try {
        await vault.write(`secret/data/${name}`, { data: { value } });
        console.log('\x1b[32m%s\x1b[0m', `Secret ${name} set in Vault`);
        res = { status: 200, message: 'Secret set' };
    }
    catch (error:unknown) {
        res = { status: 500, message: 'Error setting secret' };
        console.error('\x1b[32m%s\x1b[0m', `Error setting secret ${name} in Vault:`, error);
    }
    return Response.json(res);
}