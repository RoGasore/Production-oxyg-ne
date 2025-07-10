
export interface ProductionEntry {
    id: string;
    productionDate: Date;
    startTime: Date;
    boosterTime: Date | null;
    endTime: Date | null;
    duration: string;
    source: string;
    bottlesProduced: number;
    pressure: number | null;
    producer: string;
    observations: string;
    status: 'en-cours' | 'terminee';
    bottleDestination: 'hopital' | 'hopital-entreprises' | null;
    otherClientName: string | null;
    otherClientBottlesCount: number | null;
}

export type SaleClientType = 'hopital' | 'entreprise';

export interface SaleEntry {
  id: string;
  saleDate: Date;
  clientType: SaleClientType;
  clientName: string;
  recipientName: string;
  ourBottlesCount: number;
  clientBottlesCount: number;
  bottleNumbers: string;
  status: 'pending' | 'completed';
}
