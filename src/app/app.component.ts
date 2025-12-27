import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type VatMode = 'franchise'|'tva20'|'tva10'|'tva5_5';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Générateur de Facture – Angular';
  // Defaults for September (current year) and 7 days worked, TJM 465€
  now = new Date();
  currentYear = this.now.getFullYear();
  templateMode = signal<'standard' | 'capres'>('standard');
  capresLogoDataUrl: string | null = null;
  readonly defaultCapresLogoPath = 'assets/logo-capresco.png';
  
  private getBusinessDaysInMonth(year: number, monthIndex: number): number {
    // monthIndex: 0-11
    const holidays = this.getFrenchPublicHolidays(year);
    const date = new Date(year, monthIndex, 1);
    let count = 0;
    while (date.getMonth() === monthIndex) {
      const day = date.getDay(); // 0=Dim, 6=Sam
      const iso = this.toISO(date);
      if (day !== 0 && day !== 6 && !holidays.has(iso)) {
        count++;
      }
      date.setDate(date.getDate() + 1);
    }
    return count;
  }

  // Calcul des jours fériés France métropolitaine pour une année donnée
  private getFrenchPublicHolidays(year: number): Set<string> {
    const holidays = new Set<string>();
    const add = (d: Date) => holidays.add(this.toISO(d));

    // Fixes
    add(new Date(year, 0, 1));   // Jour de l'an (1 janv)
    add(new Date(year, 4, 1));   // Fête du Travail (1 mai)
    add(new Date(year, 4, 8));   // Victoire 1945 (8 mai)
    add(new Date(year, 6, 14));  // Fête Nationale (14 juil)
    add(new Date(year, 7, 15));  // Assomption (15 août)
    add(new Date(year, 10, 1));  // Toussaint (1 nov)
    add(new Date(year, 10, 11)); // Armistice (11 nov)
    add(new Date(year, 11, 25)); // Noël (25 déc)

    // Mobiles (basés sur Pâques)
    const easter = this.computeEasterSunday(year);
    const easterMonday = this.addDaysDate(easter, 1);
    const ascension = this.addDaysDate(easter, 39);
    const pentecostMonday = this.addDaysDate(easter, 50);

    add(easterMonday);      // Lundi de Pâques
    add(ascension);         // Ascension (jeudi)
    add(pentecostMonday);   // Lundi de Pentecôte

    return holidays;
  }

  private addDaysDate(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  // Algorithme de Butcher/Meeus pour Pâques (calendrier grégorien)
  private computeEasterSunday(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0=janvier
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }

  signatureDateISO = this.toISO(new Date());
  form = signal({
    seller_name: 'Ramzi SIDI IBRAHIM',
    seller_status: 'Entrepreneur individuel (Micro)',
    seller_addr: '343 Rue Simone Weil, villa 8\n84100 ORANGE, FRANCE',
    seller_email: 'rsidiibrahim@gmail.com',
    seller_phone: '06 50 31 47 22',
    seller_siren: '884780065',
    seller_iban: 'FR76 4061 8804 8900 0405 8514 356',
    seller_bic: 'BOUS FRPP XXX',
    client_name: 'Synanto Montpellier',
    client_addr: '610 Rue Alfred Nobel\n34000 MONTPELLIER, FRANCE',
    client_email: 'contact@synanto.fr',
    client_phone: '',
    inv_no: `FACT-${this.currentYear}-001`,
    inv_date: this.toISO(new Date()),
    due_days: 30,
    item_desc: 'Prestation de développement / consulting (septembre)',
    // Par défaut: nombre de jours ouvrés du mois de la date de facture (aujourd'hui)
    days: this.getBusinessDaysInMonth(new Date().getFullYear(), new Date().getMonth()),
    tjm: 465,
    discount: 0,
    vat_mode: 'franchise' as VatMode,
    // Champs spécifiques au modèle CAPRÈS
    capres_header_title: 'Cabinet de Prestation de Service et Commerce',
    capres_owner: 'SIDI IBRAHIM',
    capres_activity_1: 'Etudes',
    capres_activity_2: 'Formations',
    capres_activity_3: 'Prestations Diverses',
    capres_nif: '7187B/P',
    capres_rccm: 'RCCM-NE-NIM-01-2021-A10-00281',
    capres_compte: '029032780002',
    capres_reference_label: 'Objet / Référence',
    capres_reference_value: 'Prestation de service',
    capres_body_title: 'Détails de la prestation',
    capres_body_text: '',
    capres_footer_address: '1 Rue BF185 Banifandou II Niamey - Niger',
    capres_footer_email: 'isidiimyaki@gmail.com',
    capres_footer_tel_main: '(00227) 96 97 63 83',
    capres_footer_tel_alt: '94 97 63 83 / 93 97 63 83 / 92 55 36 00',
  });

  toISO(d: Date) { return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
  addDays(dStr: string, n: number) { const d = new Date(dStr); d.setDate(d.getDate()+n); return this.toISO(d); }
  dateHuman(dStr: string) { return new Date(dStr+ 'T00:00:00').toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'2-digit'}); }
  fmt(n: number) { return new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR'}).format(n||0); }

  // --- Signature ---
  private isDrawing = false;
  private lastPoint: { x: number; y: number } | null = null;
  signatureDataUrl: string | null = null;

  ngAfterViewInit() {
    // Recharger la signature sauvegardée
    const saved = localStorage.getItem('invoice-signature');
    if (saved) {
      this.signatureDataUrl = saved;
    }

    // Recharger un logo CAPRÈS si disponible
    const storedLogo = localStorage.getItem('capres-logo');
    if (storedLogo) {
      this.capresLogoDataUrl = storedLogo;
    }

    // Initialiser le canvas après un court délai pour s'assurer qu'il est dans le DOM
    setTimeout(() => {
      this.initializeSignatureCanvas();
    }, 100);
  }

  private initializeSignatureCanvas() {
    const canvas = document.getElementById('signaturePad') as HTMLCanvasElement | null;
    if (!canvas) return;
    
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (displayWidth && displayHeight) {
      canvas.width = Math.floor(displayWidth * ratio);
      canvas.height = Math.floor(displayHeight * ratio);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2.5;
      }
    }
  }

  private getCanvasAndCtx(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
    const canvas = document.getElementById('signaturePad') as HTMLCanvasElement | null;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
  }

  private getRelativePos(evt: MouseEvent | Touch): { x: number; y: number } {
    const canvas = document.getElementById('signaturePad') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    return { x: (evt.clientX - rect.left), y: (evt.clientY - rect.top) };
  }

  onPointerDown(event: MouseEvent) {
    event.preventDefault();
    this.isDrawing = true;
    this.lastPoint = this.getRelativePos(event);
  }

  onPointerMove(event: MouseEvent) {
    if (!this.isDrawing || !this.lastPoint) return;
    const ref = this.getCanvasAndCtx();
    if (!ref) return;
    const { ctx } = ref;
    const current = this.getRelativePos(event);
    ctx.beginPath();
    ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
    this.lastPoint = current;
  }

  onPointerUp() {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length > 0) {
      const t = event.touches[0];
      this.isDrawing = true;
      this.lastPoint = this.getRelativePos(t);
    }
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (!this.isDrawing || !this.lastPoint) return;
    const ref = this.getCanvasAndCtx();
    if (!ref) return;
    const { ctx } = ref;
    if (event.touches.length > 0) {
      const t = event.touches[0];
      const current = this.getRelativePos(t);
      ctx.beginPath();
      ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
      this.lastPoint = current;
    }
  }

  clearSignature() {
    const ref = this.getCanvasAndCtx();
    if (!ref) return;
    const { canvas, ctx } = ref;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.signatureDataUrl = null;
    localStorage.removeItem('invoice-signature');
  }

  saveSignature() {
    const ref = this.getCanvasAndCtx();
    if (!ref) return;
    const { canvas } = ref;
    // Exporter en PNG haute qualité
    const dataUrl = canvas.toDataURL('image/png');
    this.signatureDataUrl = dataUrl;
    localStorage.setItem('invoice-signature', dataUrl);
  }

  totals = computed(() => {
    const f = this.form();
    const line = (f.days||0) * (f.tjm||0);
    const afterDiscount = Math.max(0, line - (f.discount||0));
    const rates: Record<VatMode, number> = { franchise: 0, tva20: 0.20, tva10: 0.10, tva5_5: 0.055 };
    const vat = afterDiscount * (rates[f.vat_mode]);
    const ttc = afterDiscount + vat;
    const dueDate = this.addDays(f.inv_date, f.due_days||0);
    return { line, afterDiscount, vat, ttc, dueDate, vatRate: rates[f.vat_mode] };
  });

  updateForm(key: string, value: any) {
    // Si la date de facture change, recalcule automatiquement les jours ouvrés du mois correspondant
    if (key === 'inv_date' && typeof value === 'string' && value) {
      const d = new Date(value + 'T00:00:00');
      const businessDays = this.getBusinessDaysInMonth(d.getFullYear(), d.getMonth());
      this.form.update(current => ({ ...current, inv_date: value, days: businessDays }));
      return;
    }
    this.form.update(current => ({ ...current, [key]: value }));
  }

  loadSynantoPreset() {
    this.form.update(current => ({
      ...current,
      client_name: 'Synanto Montpellier',
      client_addr: '610 Rue Alfred Nobel\n34000 MONTPELLIER, FRANCE',
      client_email: 'contact@synanto.fr',
      client_phone: '',
    }));
  }

  loadNewClientPreset() {
    this.form.update(current => ({
      ...current,
      client_name: '',
      client_addr: '',
      client_email: '',
      client_phone: '',
    }));
  }

  setTemplate(mode: 'standard' | 'capres') {
    this.templateMode.set(mode);
    // Ré-initialiser le canvas après changement de mode
    setTimeout(() => {
      this.initializeSignatureCanvas();
    }, 100);
  }

  onCapresLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.capresLogoDataUrl = result;
      localStorage.setItem('capres-logo', result);
    };
    reader.readAsDataURL(file);
  }

  clearCapresLogo() {
    this.capresLogoDataUrl = null;
    localStorage.removeItem('capres-logo');
  }

  splitPhones(value: string): string[] {
    if (!value) return [];
    return value
      .split('/')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }

  printInvoice() {
    window.print();
  }

  async exportPDF() {
    const target = document.getElementById('invoice');
    if (!target) return;
    
    try {
      const canvas = await html2canvas(target, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculer les dimensions de l'image
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Si l'image tient sur une page, l'ajouter directement
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Pour les images longues, utiliser une approche simple
        // Ajouter l'image complète et laisser jsPDF gérer la pagination
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      pdf.save(`${this.form().inv_no}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  }
}
