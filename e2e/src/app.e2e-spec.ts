import { AppPage } from './app.po';

describe('Générateur de Facture', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('devrait afficher le message de bienvenue', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Générateur de Facture – Angular');
  });
});