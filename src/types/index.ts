
export interface ProductionEntry {
    id: string;
    productionDate: Date;
    startTime: Date;
    boosterTime: Date;
    endTime: Date;
    duration: string;
    source: string;
    bottlesProduced: number;
    producer: string;
    observations?: string;
}
