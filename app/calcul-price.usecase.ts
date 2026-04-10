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

// Test 5 : après refactorisation → Pattern Strategy
// Use case : CalculatePriceUseCase { chaque type de réduction = une Strategy }

// --- Interface Strategy ---
interface DiscountStrategy {
    apply(total: number, products: Product[], discount: Discount): number;
}

// --- Stratégie PERCENTAGE ---
class PercentageDiscountStrategy implements DiscountStrategy {
    apply(total: number, products: Product[], discount: Discount): number {
        return total - (total * discount.value!) / 100;
    }
}

// --- Stratégie FIXED ---
class FixedDiscountStrategy implements DiscountStrategy {
    apply(total: number, products: Product[], discount: Discount): number {
        return total - discount.value!;
    }
}

// --- Use case mis à jour ---
export class CalculatePriceUseCase {
    constructor(private reductionGateway: ReductionGateway) {}

    private strategies: Record<string, DiscountStrategy> = {
        PERCENTAGE: new PercentageDiscountStrategy(),
        FIXED:      new FixedDiscountStrategy(),
    };

    async execute(products: Product[], codes: string[] = []): Promise<number> {
        let total = this.computeSubtotal(products);

        for (const code of codes) {
            const discount = await this.reductionGateway.getReductionByCode(code);
            if (!discount) continue;
            total = this.applyDiscount(total, discount, products);
        }

        return total;
    }

    private applyDiscount(total: number, discount: Discount, products: Product[]): number {
        if (!this.isApplicable(total, discount)) {
            return total;
        }

        const strategy = this.strategies[discount.type];
        if (!strategy) return total;

        return strategy.apply(total, products, discount);
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



