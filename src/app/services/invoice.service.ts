import { Injectable, signal, computed } from '@angular/core';
import { Invoice, Party, LineItem, VatMode, DEFAULT_INVOICE, CLIENT_PRESETS, VAT_RATES } from '../models/invoice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Service principal pour la gestion des factures
 */
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly STORAGE_KEY = 'invoice-draft';
  private readonly COUNTER_KEY = 'invoice-counter';
  
  // Signal pour l'état de la facture courante
  private invoiceSignal = signal<Invoice>({ ...DEFAULT_INVOICE });
  
  // Computed pour les totaux
  totals = computed(() => {
    const invoice = this.invoiceSignal();
    const lineTotal = invoice.lineItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discount = item.discount || 0;
      return sum + Math.max(0, itemTotal - discount);
    }, 0);
    
    const vatRate = VAT_RATES[invoice.vatMode];
    const vatAmount = lineTotal * vatRate;
    const totalTTC = lineTotal + vatAmount;
    
    const dueDate = this.addDays(invoice.invoiceDate, invoice.dueDays);
    
    return {
      lineTotal,
      vatAmount,
      totalTTC,
      vatRate,
      dueDate
    };
  });

  constructor() {
    console.log('Constructeur InvoiceService appelé');
    console.log('DEFAULT_INVOICE:', DEFAULT_INVOICE);
    
    // Initialiser avec les valeurs par défaut puis charger le brouillon
    const draft = this.loadDraft();
    console.log('Brouillon chargé:', draft);
    this.invoiceSignal.set(draft);
    
    // Générer le numéro de facture si vide
    if (!draft.invoiceNumber) {
      const newNumber = this.generateInvoiceNumber();
      this.updateInvoice({ invoiceNumber: newNumber });
    }
    
    // Définir la date par défaut si vide
    if (!draft.invoiceDate) {
      const defaultDate = this.getDefaultInvoiceDate();
      this.updateInvoice({ invoiceDate: defaultDate });
    }
  }

  /**
   * Obtient la facture courante
   */
  get invoice() {
    return this.invoiceSignal();
  }

  /**
   * Met à jour la facture
   */
  updateInvoice(updates: Partial<Invoice>) {
    const current = this.invoiceSignal();
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.invoiceSignal.set(updated);
    this.saveDraft(updated);
  }

  /**
   * Met à jour les informations de l'émetteur
   */
  updateSeller(seller: Partial<Party>) {
    this.updateInvoice({
      seller: { ...this.invoice.seller, ...seller }
    });
  }

  /**
   * Met à jour les informations du client
   */
  updateClient(client: Partial<Party>) {
    this.updateInvoice({
      client: { ...this.invoice.client, ...client }
    });
  }

  /**
   * Met à jour une ligne de facturation
   */
  updateLineItem(id: string, updates: Partial<LineItem>) {
    const lineItems = this.invoice.lineItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.updateInvoice({ lineItems });
  }

  /**
   * Ajoute une nouvelle ligne de facturation
   */
  addLineItem() {
    const newId = (Math.max(...this.invoice.lineItems.map(item => parseInt(item.id))) + 1).toString();
    const newItem: LineItem = {
      id: newId,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0
    };
    this.updateInvoice({
      lineItems: [...this.invoice.lineItems, newItem]
    });
  }

  /**
   * Supprime une ligne de facturation
   */
  removeLineItem(id: string) {
    if (this.invoice.lineItems.length > 1) {
      const lineItems = this.invoice.lineItems.filter(item => item.id !== id);
      this.updateInvoice({ lineItems });
    }
  }

  /**
   * Génère automatiquement le numéro de facture suivant
   */
  generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const counter = this.getNextCounter();
    return `FACT-${year}-${counter.toString().padStart(3, '0')}`;
  }

  /**
   * Active la numérotation automatique
   */
  enableAutoNumbering() {
    const newNumber = this.generateInvoiceNumber();
    this.updateInvoice({ invoiceNumber: newNumber });
  }

  /**
   * Met à jour la période (mois/année) et ajuste la description et la date
   */
  updatePeriod(month: number, year: number) {
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    const monthName = monthNames[month];
    const lastDay = new Date(year, month + 1, 0).getDate();
    const invoiceDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${lastDay}`;
    
    // Mettre à jour la première ligne avec la nouvelle période
    const updatedLineItems = this.invoice.lineItems.map((item, index) => {
      if (index === 0) {
        return {
          ...item,
          description: `Prestation de développement / consulting (${monthName})`
        };
      }
      return item;
    });
    
    this.updateInvoice({
      lineItems: updatedLineItems,
      invoiceDate
    });
  }

  /**
   * Sauvegarde le brouillon dans localStorage
   */
  saveDraft(invoice: Invoice = this.invoice) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(invoice));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon:', error);
    }
  }

  /**
   * Charge le brouillon depuis localStorage
   */
  loadDraft(): Invoice {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // S'assurer que la structure est complète
        return { ...DEFAULT_INVOICE, ...parsed };
      }
    } catch (error) {
      console.error('Erreur lors du chargement du brouillon:', error);
    }
    return { ...DEFAULT_INVOICE };
  }

  /**
   * Vérifie si un brouillon existe
   */
  hasDraft(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * Remet les valeurs par défaut
   */
  resetToDefaults() {
    const defaults = { ...DEFAULT_INVOICE };
    defaults.invoiceNumber = this.generateInvoiceNumber();
    defaults.invoiceDate = this.getDefaultInvoiceDate();
    this.invoiceSignal.set(defaults);
    this.saveDraft(defaults);
  }

  /**
   * Applique un preset de client
   */
  applyClientPreset(preset: 'synanto' | 'nouveau') {
    this.updateClient(CLIENT_PRESETS[preset]);
  }

  /**
   * Exporte la facture en JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.invoice, null, 2);
  }

  /**
   * Importe une facture depuis un fichier JSON
   */
  async importJSON(file: File): Promise<void> {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      // Validation basique de la structure
      if (!imported.seller || !imported.client || !imported.lineItems) {
        throw new Error('Format de fichier invalide');
      }
      
      // S'assurer que la structure est complète
      const invoice = { ...DEFAULT_INVOICE, ...imported };
      this.invoiceSignal.set(invoice);
      this.saveDraft(invoice);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw new Error('Impossible d\'importer le fichier. Vérifiez le format.');
    }
  }

  /**
   * Génère et télécharge le PDF
   */
  async exportPDF(): Promise<void> {
    const target = document.getElementById('invoice');
    if (!target) {
      throw new Error('Élément de facture introuvable');
    }

    try {
      // Configuration html2canvas pour une meilleure qualité
      const canvas = await html2canvas(target, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // Marges de 10mm
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      // Calculer les dimensions de l'image
      const imgWidth = contentWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Découpage en pages si nécessaire
      let yOffset = 0;
      let pageNumber = 1;
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      while (yOffset < imgHeight) {
        if (pageNumber > 1) {
          pdf.addPage();
        }
        
        // Calculer la hauteur de cette page
        const currentPageHeight = Math.min(contentHeight, imgHeight - yOffset);
        const sourceY = (yOffset / imgHeight) * canvas.height;
        const sourceHeight = (currentPageHeight / imgHeight) * canvas.height;
        
        // Créer un canvas temporaire pour cette page
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
          
          // Ajouter l'image à la page PDF
          pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, currentPageHeight);
        }
        
        // Ajouter le numéro de page
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${pageNumber} / ${totalPages}`, pageWidth - 20, pageHeight - 5);
        
        yOffset += contentHeight;
        pageNumber++;
      }
      
      // Télécharger le PDF
      pdf.save(`${this.invoice.invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Erreur lors de la génération du PDF');
    }
  }

  /**
   * Valide un IBAN français (algorithme mod97)
   */
  validateIBAN(iban: string): boolean {
    if (!iban) return true; // Optionnel
    
    // Nettoyer l'IBAN
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    // Vérifier le format français (FR + 2 chiffres + 23 caractères)
    if (!/^FR\d{2}[A-Z0-9]{23}$/.test(cleanIban)) {
      return false;
    }
    
    // Déplacer les 4 premiers caractères à la fin
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
    
    // Remplacer les lettres par des chiffres (A=10, B=11, ..., Z=35)
    const numeric = rearranged.replace(/[A-Z]/g, (char: string) => (char.charCodeAt(0) - 55).toString());
    
    // Calculer le modulo 97
    let remainder = 0;
    for (let i = 0; i < numeric.length; i++) {
      remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
    }
    
    return remainder === 1;
  }

  /**
   * Valide un BIC
   */
  validateBIC(bic: string): boolean {
    if (!bic) return true; // Optionnel
    
    const cleanBic = bic.replace(/\s/g, '').toUpperCase();
    // Format BIC : 4 lettres + 2 lettres + 2 caractères + optionnellement 3 caractères
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanBic);
  }

  /**
   * Formate un nombre en devise française
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }

  /**
   * Formate une date en français
   */
  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });
  }

  /**
   * Convertit une date en format ISO (YYYY-MM-DD)
   */
  toISO(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }

  /**
   * Ajoute des jours à une date
   */
  addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return this.toISO(date);
  }

  /**
   * Obtient le compteur suivant pour la numérotation
   */
  private getNextCounter(): number {
    const year = new Date().getFullYear();
    const key = `${this.COUNTER_KEY}-${year}`;
    
    try {
      const stored = localStorage.getItem(key);
      const counter = stored ? parseInt(stored) : 0;
      const nextCounter = counter + 1;
      localStorage.setItem(key, nextCounter.toString());
      return nextCounter;
    } catch (error) {
      console.error('Erreur lors de la gestion du compteur:', error);
      return 1;
    }
  }

  /**
   * Obtient la date de facture par défaut (30 septembre de l'année courante)
   */
  private getDefaultInvoiceDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    return `${year}-09-30`;
  }
}
