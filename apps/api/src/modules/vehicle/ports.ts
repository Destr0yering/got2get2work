import type { VehicleRecord } from "./domain";
export interface VehicleStore { getByOwner(uid: string): Promise<VehicleRecord | null>; save(record: VehicleRecord): Promise<VehicleRecord>; }
