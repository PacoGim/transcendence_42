import { SignJWT, jwtVerify, jwtDecrypt, EncryptJWT, importJWK, CryptoKey, JWK } from 'jose';
import { getSecret} from '../services/vault.service.ts';
// generateKeyPair (+ RS256 ou ES256) pour asymetrie si microservices ayant besoin de verif les tokens

export async function getJwsSecret() {
    const jwk: JWK = JSON.parse(await getSecret('jws_secret'));
    const secretKey: CryptoKey = await importJWK(jwk, 'HS256') as CryptoKey;
    return secretKey;
}

export async function getJweSecret() {
    const jwk: JWK = JSON.parse(await getSecret('jwe_secret'));
    const secretKey: CryptoKey = await importJWK(jwk, 'A256GCM') as CryptoKey;
    return secretKey;
}

export async function createToken(id: number) {
    const jwsSecretKey: CryptoKey = await getJwsSecret();
    const signed = await signJWS(id, jwsSecretKey);
    const jweSecretKey: CryptoKey = await getJweSecret();
    const encrypted = await encryptJWE(signed, jweSecretKey);
    return encrypted;
}

export async function verifyToken(token: string) {
    const jweSecretKey: CryptoKey = await getJweSecret();
    console.log('\x1b[32m%s\x1b[0m', 'jwesecretkey:', jweSecretKey);
    const payload = await decryptJWE(token, jweSecretKey);
    if (!payload) return null;
    const jws = (payload as { jws: string }).jws;
    const jwsSecretKey: CryptoKey = await getJwsSecret();
    const verifiedPayload = await verifyJWS(jws, jwsSecretKey);
    return verifiedPayload;
}

export async function signJWS(id: number, secretKey: CryptoKey) {
    const jws = await new SignJWT({ id })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(secretKey);
    console.log('\x1b[32m%s\x1b[0m','Generated token:', jws);
    return jws;
}

export async function verifyJWS(token: string, secretKey: CryptoKey) {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log('\x1b[32m%s\x1b[0m', 'Decoded token:', payload);
        return payload;
    } catch (error: unknown) {
        console.error('\x1b[32m%s\x1b[0m', 'Invalid token:', error);
    }
}

export async function encryptJWE(payload: string, secretKey: CryptoKey) {
    const jwe = await new EncryptJWT({ jws: payload })
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }) // enc = encryption
        .setExpirationTime('1h')
        .encrypt(secretKey);
    console.log('\x1b[32m%s\x1b[0m', 'Encrypted JWT:', jwe);
    return jwe;
}

export async function decryptJWE(token: string, secretKey: CryptoKey) {
    try {
        const { payload } = await jwtDecrypt(token, secretKey);
        console.log('\x1b[32m%s\x1b[0m', 'Decrypted JWE payload:', payload);
        return payload;
    }
    catch (error: unknown) {
        console.error('\x1b[32m%s\x1b[0m', 'Invalid or expired JWE token:', error);
    }
}