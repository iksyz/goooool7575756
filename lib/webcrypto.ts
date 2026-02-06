import type { JWTEncodeParams, JWTDecodeParams } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

async function generateSecretKey() {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    return await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

export async function encode({
    token,
}: JWTEncodeParams): Promise<string> {
    const secretKey = await generateSecretKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(token));
    const signature = await crypto.subtle.sign("HMAC", secretKey, data);

    // Base64 encode using btoa (available in Cloudflare Workers)
    const dataB64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return `${dataB64}.${sigB64}`;
}

export async function decode({
    token,
}: JWTDecodeParams): Promise<JWT | null> {
    if (!token) return null;

    try {
        const secretKey = await generateSecretKey();
        const parts = token.split(".");
        if (parts.length !== 2) return null;

        // Base64 decode using atob (available in Cloudflare Workers)
        const data = Uint8Array.from(atob(parts[0]), (c) => c.charCodeAt(0));
        const signature = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));

        const isValid = await crypto.subtle.verify(
            "HMAC",
            secretKey,
            signature,
            data
        );

        if (!isValid) return null;

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(data));
    } catch (error) {
        console.error("JWT decode error:", error);
        return null;
    }
}
