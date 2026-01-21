import { SignJWT, jwtVerify, jwtDecrypt, EncryptJWT, importJWK, CryptoKey, JWK } from 'jose';
import { getVaultSecret } from '../services/vault.service.js';
import { log } from '../logs.js';
import { userInfoType } from '../../types/user.type.js';

export async function getJwsSecret() {
    const jwk = await getVaultSecret<JWK>('jws_secret', JSON.parse)
    if (!jwk) return null
    const secretKey: CryptoKey = await importJWK(jwk, 'HS256') as CryptoKey
    return secretKey
}


export async function getJweSecret() {
    const jwk = await getVaultSecret<JWK>('jwe_secret', JSON.parse)
    if (!jwk) return null
    const secretKey: CryptoKey = await importJWK(jwk, 'A256GCM') as CryptoKey
    return secretKey
}

export async function createToken(userInfo: userInfoType) {
    const jwsSecretKey: CryptoKey | null = await getJwsSecret()
    if (!jwsSecretKey) return null
    const signed = await signJWS(userInfo, jwsSecretKey)
    const jweSecretKey: CryptoKey | null = await getJweSecret()
    if (!jweSecretKey) return null
    const encrypted = await encryptJWE(signed, jweSecretKey)
    return encrypted
}

export async function verifyToken(token: string) {
    const jweSecretKey: CryptoKey | null = await getJweSecret()
    if (!jweSecretKey) return null
    const payload = await decryptJWE(token, jweSecretKey)
    if (!payload) return null
    const jws = (payload as { jws: string }).jws
    const jwsSecretKey: CryptoKey | null = await getJwsSecret()
    if (!jwsSecretKey) return null
    const verifiedPayload = await verifyJWS(jws, jwsSecretKey)
    return verifiedPayload
}

export async function signJWS(userInfo: userInfoType, secretKey: CryptoKey) {
    const jws = await new SignJWT({ userInfo })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('12h')
        .sign(secretKey)
    return jws
}

export async function verifyJWS(token: string, secretKey: CryptoKey) {
    try {
        const { payload } = await jwtVerify(token, secretKey)
        log(`Verified JWS payload: ${JSON.stringify(payload)}`, 'info')
        return payload
    } catch (error: unknown) {
        log(`Invalid JWS token: ${error}`, 'error')
    }
}

export async function encryptJWE(payload: string, secretKey: CryptoKey) {
    const jwe = await new EncryptJWT({ jws: payload })
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }) // enc = encryption
        .setExpirationTime('1h')
        .encrypt(secretKey)
    return jwe
}

export async function decryptJWE(token: string, secretKey: CryptoKey) {
    try {
        const { payload } = await jwtDecrypt(token, secretKey)
        log(`Decrypted JWE payload: ${payload}`, 'info')
        return payload
    }
    catch (error: unknown) {
        log(`Invalid or expired JWE token: ${error}`, 'error')
    }
}
