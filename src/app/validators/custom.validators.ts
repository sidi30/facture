import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validateurs personnalisés pour les formulaires de facturation
 */

/**
 * Valide un IBAN français (algorithme mod97)
 */
export function ibanValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const iban = control.value;
    
    if (!iban) {
      return null; // Optionnel
    }
    
    // Nettoyer l'IBAN
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    // Vérifier le format français (FR + 2 chiffres + 23 caractères)
    if (!/^FR\d{2}[A-Z0-9]{23}$/.test(cleanIban)) {
      return { ibanFormat: { message: 'Format IBAN invalide (FR + 2 chiffres + 23 caractères)' } };
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
    
    if (remainder !== 1) {
      return { ibanChecksum: { message: 'IBAN invalide (erreur de contrôle)' } };
    }
    
    return null;
  };
}

/**
 * Valide un BIC
 */
export function bicValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const bic = control.value;
    
    if (!bic) {
      return null; // Optionnel
    }
    
    const cleanBic = bic.replace(/\s/g, '').toUpperCase();
    // Format BIC : 4 lettres + 2 lettres + 2 caractères + optionnellement 3 caractères
    const isValid = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanBic);
    
    if (!isValid) {
      return { bicFormat: { message: 'Format BIC invalide (ex: XXXXFRPP ou XXXXFRPPXXX)' } };
    }
    
    return null;
  };
}

/**
 * Valide qu'un nombre est positif ou zéro
 */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      return { positiveNumber: { message: 'Le nombre doit être positif ou zéro' } };
    }
    
    return null;
  };
}

/**
 * Valide qu'un champ est requis
 */
export function requiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { required: { message: 'Ce champ est obligatoire' } };
    }
    
    return null;
  };
}

/**
 * Valide un email
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;
    
    if (!email) {
      return null; // Optionnel
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { emailFormat: { message: 'Format d\'email invalide' } };
    }
    
    return null;
  };
}

/**
 * Valide un numéro de téléphone français
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const phone = control.value;
    
    if (!phone) {
      return null; // Optionnel
    }
    
    // Nettoyer le numéro
    const cleanPhone = phone.replace(/\s/g, '');
    
    // Formats acceptés : 0X XX XX XX XX ou +33 X XX XX XX XX
    const phoneRegex = /^(0[1-9]|(\+33\s?[1-9]))[\s]?[0-9]{2}[\s]?[0-9]{2}[\s]?[0-9]{2}[\s]?[0-9]{2}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return { phoneFormat: { message: 'Format de téléphone invalide (ex: 06 12 34 56 78)' } };
    }
    
    return null;
  };
}
