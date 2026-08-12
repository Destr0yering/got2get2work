import { randomUUID } from "node:crypto";
import type { Vehicle, VehicleBody } from "../../../../../packages/contracts/src";
import type { RequestIdentity } from "../membership/domain";
import { VehicleError, type VehicleRecord } from "./domain";
import type { VehicleStore } from "./ports";
import type { PlateVault } from "./vault";
export class VehicleService {
  constructor(private readonly store: VehicleStore, private readonly vault: PlateVault, private readonly now = () => new Date()) {}
  private view(v: VehicleRecord): Vehicle { return { id: v.id, make: v.make, model: v.model, color: v.color, year: v.year, seatsAvailable: v.seatsAvailable, wheelchairAccessible: v.wheelchairAccessible ?? false, plate: this.vault.decrypt(v.plateCiphertext), updatedAt: v.updatedAt.toISOString() }; }
  async get(identity: RequestIdentity) { const v = await this.store.getByOwner(identity.uid); if (!v || v.tenantId !== identity.tenantId || v.worksiteId !== identity.worksiteId) throw new VehicleError("Vehicle not found.", "VEHICLE_NOT_FOUND", 404); return this.view(v); }
  async save(identity: RequestIdentity, body: VehicleBody) { const existing = await this.store.getByOwner(identity.uid); const plate = body.plate.replace(/[ -]/g, "").toUpperCase(); return this.view(await this.store.save({ id: existing?.id ?? randomUUID(), uid: identity.uid, tenantId: identity.tenantId, worksiteId: identity.worksiteId, make: body.make.trim(), model: body.model.trim(), color: body.color.trim(), year: body.year, seatsAvailable: body.seatsAvailable, wheelchairAccessible: body.wheelchairAccessible ?? false, plateCiphertext: this.vault.encrypt(plate), updatedAt: this.now() })); }
}
