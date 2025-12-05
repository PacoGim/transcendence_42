import { log } from '../logs.ts';
import https from 'https';
import fs from 'fs';

const VAULT_TOKEN = fs.readFileSync(process.env.VAULT_ROOT_TOKEN_FILE as string, 'utf8').trim();
const VAULT_CERT_PATH = fs.readFileSync(process.env.VAULT_CERT_PATH as string, 'utf8');

const httpsAgent = new https.Agent({ ca: VAULT_CERT_PATH });

async function vaultFetch(path: string, options: RequestInit) {
    return fetch(`${process.env.VAULT_ADDR}/v1/${path}`, {
        ...options,
        headers: {
            'X-Vault-Token': VAULT_TOKEN,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        dispatcher: httpsAgent
        }
    )
}

export async function CheckSecretExists(name: string): Promise<boolean | void> {
    try {
        const res = await vaultFetch(`secret/data/${name}`, {
            method: 'GET',
        });
        if (res.ok)
            return true;
        return false
    } catch(error: unknown) {
        if (error instanceof Error && error.message.includes('404')) {
            throw new Error('Secret not found');
        }
    }
}

export async function getSecret(request:Request) {
    const { name } = await request.json();
    let res;
    try {
        const secret = await vaultFetch(`secret/data/${name}`, {
            method: 'GET',
        })
        if (!secret.ok) throw new Error(`${secret.status} ${secret.statusText}`);
        const data = await secret.json();
        const secretData = { value: data.data.value };
        log(`Secret ${name} retrieved from Vault`, 'info');
        res = { status: 200, message: secretData };
    }
    catch (error:unknown) {
       res = { status: 500, message: 'Error getting secret' };
       log(`Error getting secret ${name} from Vault: ${error}`, 'error');
    }
    return Response.json(res);
}

export async function setSecret(name: string, value: string) {
    let res;
    try {
        const secret = await vaultFetch(`secret/data/${name}`, {
            method: 'POST',
            body: JSON.stringify({ data: { value } }),
        })
        if (!secret.ok) throw new Error(`${secret.status} ${secret.statusText}`);
        log(`Secret ${name} set in Vault`, 'info');
        res = { status: 200, message: 'Secret set' };
    }
    catch (error:unknown) {
        res = { status: 500, message: 'Error setting secret' };
        log(`Error setting secret ${name} in Vault: ${error}`, 'error');
    }
    return Response.json(res);
}