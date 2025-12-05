import { genSalt } from 'bcrypt';
import { setSecret, CheckSecretExists } from './routes/vault.route.ts';
import { generateSecret, exportJWK } from 'jose';
import { CryptoKey, JWK } from 'jose';
import { log } from './logs.ts';

export async function generateKeys() {
    if (await CheckSecretExists('bcrypt_salt') === false)
        await generateBcryptSalt();
    else log('Bcrypt salt already exists in Vault, skipping generation.', "warn");
    if (await CheckSecretExists('jws_secret') === false)
        await generateJwsSecret();
    else log('JWS secret already exists in Vault, skipping generation.', "warn");
    if (await CheckSecretExists('jwe_secret') === false)
        await generateJweSecret();
    else log('JWE secret already exists in Vault, skipping generation.', "warn");
}

export async function generateBcryptSalt() {
    const saltRounds = 10;
    const salt = await genSalt(saltRounds);
    await setSecret('bcrypt_salt', salt);
}

export async function generateJwsSecret() {
    const jwk: CryptoKey = await generateSecret('HS256', { extractable: true }) as CryptoKey;
    // need to export because CryptoKey isn't JSON object so can't be stringified
    const exported: JWK = await exportJWK(jwk);
    await setSecret('jws_secret', JSON.stringify(exported));
}

export async function generateJweSecret() {
    const jwk: CryptoKey = await generateSecret('A256GCM', { extractable: true }) as CryptoKey;
    const exported: JWK = await exportJWK(jwk);
    await setSecret('jwe_secret', JSON.stringify(exported));
}