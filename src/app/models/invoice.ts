/**
 * Modèles de données pour l'application de facturation
 */

export type VatMode = 'franchise' | 'tva20' | 'tva10' | 'tva5_5';

export interface Party {
  name: string;
  status?: string;
  address: string;
  email: string;
  phone?: string;
  siren?: string;
  iban?: string;
  bic?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface Invoice {
  // Informations émetteur
  seller: Party;
  
  // Informations client
  client: Party;
  
  // Informations facture
  invoiceNumber: string;
  invoiceDate: string;
  dueDays: number;
  
  // Lignes de facturation
  lineItems: LineItem[];
  
  // Paramètres fiscaux
  vatMode: VatMode;
  
  // Métadonnées
  logo?: string; // DataURL du logo
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Valeurs par défaut pour une nouvelle facture
 */
export const DEFAULT_INVOICE: Invoice = {
  seller: {
    name: 'Ramzi SIDI IBRAHIM',
    status: 'Micro-entreprise',
    address: '343 Rue Simone Weil, villa 8\n84100 ORANGE, FRANCE',
    email: 'rsidiibrahim@gmail.com',
    phone: '06 50 31 47 22',
    siren: '',
    iban: '',
    bic: ''
  },
  client: {
    name: 'Synanto Montpellier',
    address: '610 Rue Alfred Nobel\n34000 MONTPELLIER, FRANCE',
    email: 'contact@synanto.fr',
    phone: ''
  },
  invoiceNumber: '',
  invoiceDate: '',
  dueDays: 30,
  lineItems: [{
    id: '1',
    description: 'Prestation de développement / consulting (septembre)',
    quantity: 7,
    unitPrice: 465,
    discount: 0
  }],
  vatMode: 'franchise',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * Presets de clients
 */
export const CLIENT_PRESETS = {
  synanto: {
    name: 'Synanto Montpellier',
    address: '610 Rue Alfred Nobel\n34000 MONTPELLIER, FRANCE',
    email: 'contact@synanto.fr',
    phone: ''
  },
  nouveau: {
    name: '',
    address: '',
    email: '',
    phone: ''
  }
};

/**
 * Taux de TVA par mode
 */
export const VAT_RATES: Record<VatMode, number> = {
  franchise: 0,
  tva20: 0.20,
  tva10: 0.10,
  tva5_5: 0.055
};

/**
 * Libellés des modes de TVA
 */
export const VAT_LABELS: Record<VatMode, string> = {
  franchise: 'Franchise en base (art. 293 B)',
  tva20: 'TVA 20 %',
  tva10: 'TVA 10 %',
  tva5_5: 'TVA 5,5 %'
};


