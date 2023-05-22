import prisma from "../../prisma/client";

class PromoCodeService {
  static async createPromoCodes() {
    const codePromos = [
      { code: 'CODE1', discount: 0.2, expiration_date: new Date('2023-12-31') },
      { code: 'CODE2', discount: 0.1, expiration_date: new Date('2023-10-31') },
      { code: 'CODE3', discount: 0.3, expiration_date: new Date('2024-01-31') },
      // Ajoutez d'autres instances de codes promo ici
    ];

    try {
      for (const promo of codePromos) {
        await prisma.codepromo.create({ data: promo });
        console.log(`Code promo ${promo.code} créé avec succès.`);
      }
    } catch (error) {
      console.error('Erreur lors de la création des codes promos :', error);
    }
  }

  static async index() {
    try {
      const codePromos = await prisma.codepromo.findMany();
  
      return codePromos;
    } catch (e: any) {
      throw new Error('Failed to retrieve code promos');
    }
  }

}

//PromoCodeService.createPromoCodes();

export default PromoCodeService;