
export interface ProductionEntry {
    id: string;
    productionDate: Date;
    startTime: Date;
    boosterTime: Date;
    endTime: Date | null;
    duration: string;
    source: string;
    bottlesProduced: number;
    producer: string;
    observations: string;
    status: 'en-cours' | 'terminee';
}
