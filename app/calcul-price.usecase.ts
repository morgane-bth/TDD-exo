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

// Test 3 : après refactorisation
// Use case : CalculatePriceUseCase { apply discount délégué à applyDiscount() }
export class CalculatePriceUseCase {
    constructor(private reductionGateway: ReductionGateway) {}

    async execute(products: Product[], codes: string[] = []): Promise<number> {
        let total = this.computeSubtotal(products);

        for (const code of codes) {
            const discount = await this.reductionGateway.getReductionByCode(code);
            if (!discount) continue;
            total = this.applyDiscount(total, discount, products);
        }

        return total;
    }

    // Test 4 : après refactorisation
    // Use case : CalculatePriceUseCase { garde minOrder extraite dans isApplicable() }
    private applyDiscount(total: number, discount: Discount, products: Product[]): number {
        if (!this.isApplicable(total, discount)) {
            return total;
        }

        if (discount.type === 'PERCENTAGE' && discount.value !== undefined) {
            return total - (total * discount.value) / 100;
        }

        return total;
    }

    private isApplicable(total: number, discount: Discount): boolean {
        if (discount.minOrder !== undefined && total < discount.minOrder) {
            return false;
        }
        return true;
    }

    private computeSubtotal(products: Product[]): number {
        return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    }
}



