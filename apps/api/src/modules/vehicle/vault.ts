import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
export class PlateVault {
  private readonly key: Buffer;
  constructor(encodedKey: string) { this.key = Buffer.from(encodedKey, "base64"); if (this.key.length !== 32) throw new Error("VEHICLE_VAULT_KEY must be a base64-encoded 32-byte key."); }
  encrypt(value: string) { const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", this.key, iv); const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]); return `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${data.toString("base64url")}`; }
  decrypt(value: string) { const [version, iv, tag, data] = value.split("."); if (version !== "v1" || !iv || !tag || !data) throw new Error("Invalid plate vault record."); const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(iv, "base64url")); decipher.setAuthTag(Buffer.from(tag, "base64url")); return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8"); }
}
