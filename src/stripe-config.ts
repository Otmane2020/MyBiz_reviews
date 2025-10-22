export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1SL2hlEfti9t9nN9UyxW3xEw',
    name: 'Starter',
    description: '1 établissement Google My Business - 50 avis/réponses automatiques par mois - Réponses IA basiques (GPT-4) - Alertes email sur nouveaux avis - Tableau de bord basique - Accès API Google My Business vérifié',
    price: 9.90,
    currency: 'EUR',
    mode: 'subscription'
  },
  {
    priceId: 'price_1SL2jpEfti9t9nN9ZXFFYzfB',
    name: 'Starter Annual',
    description: '1 établissement Google My Business - 50 avis/réponses automatiques par mois - Réponses IA basiques (GPT-4) - Alertes email sur nouveaux avis - Tableau de bord basique - Accès API Google My Business vérifié',
    price: 95.04,
    currency: 'EUR',
    mode: 'subscription'
  },
  {
    priceId: 'price_1SL2kQEfti9t9nN9bkvtaHjl',
    name: 'Pro',
    description: 'Jusqu\'à 3 établissements Google My Business300 avis/réponses automatiques par moisRéponses IA premium (GPT-4.1)Notifications temps réelStatistiques avancéesSupport prioritaireAPI Google My Business complète',
    price: 29.90,
    currency: 'EUR',
    mode: 'subscription'
  },
  {
    priceId: 'price_1SL2lrEfti9t9nN9DmXMHQbc',
    name: 'Pro Annual',
    description: 'Jusqu\'à 3 établissements Google My Business300 avis/réponses automatiques par moisRéponses IA premium (GPT-4.1)Notifications temps réelStatistiques avancéesSupport prioritaireAPI Google My Business complète',
    price: 287.04,
    currency: 'EUR',
    mode: 'subscription'
  },
  {
    priceId: 'price_1SL2mKEfti9t9nN90NfUmlFU',
    name: 'Business',
    description: 'Établissements Google My Business illimités1000 avis/réponses automatiques par moisIA premium + posts automatiquesAPI & webhooks avancésManager dédiéRapports personnalisésAccès API Business Profile complet',
    price: 79.90,
    currency: 'EUR',
    mode: 'subscription'
  },
  {
    priceId: 'price_1SL2muEfti9t9nN9peLC7Ta1',
    name: 'Business Annual',
    description: 'Établissements Google My Business illimités1000 avis/réponses automatiques par moisIA premium + posts automatiquesAPI & webhooks avancésManager dédiéRapports personnalisésAccès API Business Profile complet',
    price: 767.04,
    currency: 'EUR',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};