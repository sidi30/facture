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
    inv_date: this.toISO(new Date(this.currentYear, 8, 30)), // 30 Sept (month index 8)
    due_days: 30,
    item_desc: 'Prestation de développement / consulting (septembre)',
    days: 7,
    tjm: 465,
    discount: 0,
    vat_mode: 'franchise' as VatMode,
  });

  toISO(d: Date) { return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
  addDays(dStr: string, n: number) { const d = new Date(dStr); d.setDate(d.getDate()+n); return this.toISO(d); }
  dateHuman(dStr: string) { return new Date(dStr+ 'T00:00:00').toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'2-digit'}); }
  fmt(n: number) { return new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR'}).format(n||0); }

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
