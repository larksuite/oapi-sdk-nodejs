import * as crypto from "crypto";

export class AESCipher {
    private readonly key: Buffer

    public constructor(key: string) {
        const hash = crypto.createHash('sha256')
        hash.update(key)
        this.key = hash.digest()
    }

    public decrypt(encrypt: string): string {
        const encryptBuffer = Buffer.from(encrypt, 'base64')
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            this.key,
            encryptBuffer.slice(0, 16),
        )
        let decrypted = decipher.update(encryptBuffer.slice(16), 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    }
}