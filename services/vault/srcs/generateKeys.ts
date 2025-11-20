import { genSalt } from 'bcrypt';
import { setSecret } from './routes/vault.route.ts';
import { generateSecret, exportJWK } from 'jose';
import { CryptoKey, JWK } from 'jose';

export async function generateKeys() {
    await generateBcryptSalt();
    await generateJwsSecret();
    await generateJweSecret();
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