import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ibanValidator, bicValidator, positiveNumberValidator, requiredValidator, emailValidator, phoneValidator } from './custom.validators';

describe('Validateurs personnalisés', () => {
  
  describe('ibanValidator', () => {
    const validator = ibanValidator();
    
    it('devrait accepter un IBAN français valide', () => {
      const control = new FormControl('FR1420041010050500013M02606');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait accepter un IBAN vide (optionnel)', () => {
      const control = new FormControl('');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait rejeter un IBAN avec mauvais format', () => {
      const control = new FormControl('FR123456789');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['ibanFormat']).toBeDefined();
    });
    
    it('devrait rejeter un IBAN avec mauvaise clé de contrôle', () => {
      const control = new FormControl('FR1420041010050500013M02607');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['ibanChecksum']).toBeDefined();
    });
    
    it('devrait accepter un IBAN avec espaces', () => {
      const control = new FormControl('FR14 2004 1010 0505 0001 3M02 606');
      const result = validator(control);
      expect(result).toBeNull();
    });
  });
  
  describe('bicValidator', () => {
    const validator = bicValidator();
    
    it('devrait accepter un BIC valide (8 caractères)', () => {
      const control = new FormControl('BNPAFRPP');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait accepter un BIC valide (11 caractères)', () => {
      const control = new FormControl('BNPAFRPPXXX');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait accepter un BIC vide (optionnel)', () => {
      const control = new FormControl('');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait rejeter un BIC trop court', () => {
      const control = new FormControl('BNPAFRP');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['bicFormat']).toBeDefined();
    });
    
    it('devrait rejeter un BIC avec caractères invalides', () => {
      const control = new FormControl('BNPAFRPP@');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['bicFormat']).toBeDefined();
    });
  });
  
  describe('positiveNumberValidator', () => {
    const validator = positiveNumberValidator();
    
    it('devrait accepter un nombre positif', () => {
      const control = new FormControl(100);
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait accepter zéro', () => {
      const control = new FormControl(0);
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait accepter une chaîne vide (optionnel)', () => {
      const control = new FormControl('');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait rejeter un nombre négatif', () => {
      const control = new FormControl(-10);
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['positiveNumber']).toBeDefined();
    });
    
    it('devrait rejeter une chaîne non numérique', () => {
      const control = new FormControl('abc');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['positiveNumber']).toBeDefined();
    });
  });
  
  describe('requiredValidator', () => {
    const validator = requiredValidator();
    
    it('devrait accepter une valeur non vide', () => {
      const control = new FormControl('test');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait rejeter une chaîne vide', () => {
      const control = new FormControl('');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['required']).toBeDefined();
    });
    
    it('devrait rejeter une chaîne avec seulement des espaces', () => {
      const control = new FormControl('   ');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['required']).toBeDefined();
    });
    
    it('devrait rejeter null', () => {
      const control = new FormControl(null);
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['required']).toBeDefined();
    });
  });
  
  describe('emailValidator', () => {
    const validator = emailValidator();
    
    it('devrait accepter un email valide', () => {
      const control = new FormControl('test@example.com');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait accepter un email vide (optionnel)', () => {
      const control = new FormControl('');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait rejeter un email invalide', () => {
      const control = new FormControl('invalid-email');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['emailFormat']).toBeDefined();
    });
    
    it('devrait rejeter un email sans @', () => {
      const control = new FormControl('testexample.com');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['emailFormat']).toBeDefined();
    });
  });
  
  describe('phoneValidator', () => {
    const validator = phoneValidator();
    
    it('devrait accepter un numéro français valide', () => {
      const control = new FormControl('06 12 34 56 78');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait accepter un numéro avec format international', () => {
      const control = new FormControl('+33 6 12 34 56 78');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait accepter un numéro vide (optionnel)', () => {
      const control = new FormControl('');
      const result = validator(control);
      expect(result).toBeNull();
    });
    
    it('devrait rejeter un numéro trop court', () => {
      const control = new FormControl('06 12 34');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['phoneFormat']).toBeDefined();
    });
    
    it('devrait rejeter un numéro commençant par 00', () => {
      const control = new FormControl('00 6 12 34 56 78');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result!['phoneFormat']).toBeDefined();
    });
  });
});

