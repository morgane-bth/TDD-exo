export type ProductsType = "TSHIRT" | "PULL";

export type Product = {
  name: string;
  quantity: number;
  type: ProductsType;
  price: number;
};

export type DiscountType = "PERCENTAGE" | "FIXED" | "BUY_ONE_GET_ONE" | "BLACK_FRIDAY";

export type Discount = {
  code: string;
  type: DiscountType;
  value?: number; // Pour pourcentage ou fixe
  minOrder?: number; // Seuil pour appliquer
  applicableTypes?: ProductsType[]; // Types de produits concernés
  startDate?: Date;
  endDate?: Date;
};

export interface ReductionGateway {
    getReductionByCode(code: string): Promise<Discount | null>;
}

// Test 2 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase { execute → somme brute }
export class CalculatePriceUseCase {
    constructor(private reductionGateway: ReductionGateway) {}

    async execute(products: Product[], codes: string[] = []): Promise<number> {
        return this.computeSubtotal(products);
    }

    private computeSubtotal(products: Product[]): number {
        return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    }
}



