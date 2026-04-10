import { CalculatePriceUseCase } from "../app/calcul-price.usecase";
import type { Product } from "../app/calcul-price.usecase";
import {describe} from "vitest";

class StubReductionGateway implements ReductionGateway {
    private reductions = new Map<string, Discount>();

    feed(discount: Discount) {
        this.reductions.set(discount.code, discount);
    }

    async getReductionByCode(code: string): Promise<Discount | null> {
        return this.reductions.get(code) ?? null;
    }
}

describe('CalculatePriceUseCase', () => {
    let reductionGateway: StubReductionGateway;
    let calculatePrice: CalculatePriceUseCase;

    beforeEach(() => {
        reductionGateway = new StubReductionGateway();
        calculatePrice = new CalculatePriceUseCase(reductionGateway);
    });

    // Test 1 : panier vide
    it('should return 0 when cart is empty', async () => {
        const total = await calculatePrice.execute([], []);
        expect(total).toBe(0);
    });

    //Test 2 : somme du panier sans réduction
    it('should return the sum of all products without discounts', async () => {
        const products: Product[] = [
            { name: 'T-shirt', quantity: 2, type: 'TSHIRT', price: 20 },
            { name: 'Pull', quantity: 1, type: 'PULL', price: 50 },
        ];
        const total = await calculatePrice.execute(products, []);
        expect(total).toBe(90);
    })

    // Test 3 : appliquer une réduction de 10% sur le panier
    it('should apply a percentage discount on total', async () => {
        reductionGateway.feed({
            code: 'DISCOUNTPERCENT10',
            type: 'PERCENTAGE',
            value: 10,
        });
        const products: Product[] = [
            { name: 'T-shirt', price: 100, quantity: 1, type: 'TSHIRT' },
        ];

        const total = await calculatePrice.execute(products, ['DISCOUNTPERCENT10']);

        expect(total).toBe(90); // 100 - 10%
    });

    // Test 4 : ne pas appliquer la réduction si le seuil n'est pas atteint
    it('should not apply percentage discount if order is below minOrder', async () => {
        reductionGateway.feed({
            code: 'DISCOUNTPERCENT10',
            type: 'PERCENTAGE',
            value: 10,
            minOrder: 30,
        });
        const products: Product[] = [
            { name: 'T-shirt', price: 20, quantity: 1, type: 'TSHIRT' },
        ];

        const total = await calculatePrice.execute(products, ['DISCOUNTPERCENT10']);

        expect(total).toBe(20); // seuil 30€ non atteint → pas de réduction
    });

    //Test 5 : appliquer une réduction de 30€ sur le panier
    it('should apply a fixed discount on total', async () => {
        reductionGateway.feed({
            code: 'DISCOUNTEURO30',
            type: 'FIXED',
            value: 30,
        });
        const products: Product[] = [
            { name: 'T-shirt', price: 100, quantity: 1, type: 'TSHIRT' },
        ];

        const total = await calculatePrice.execute(products, ['DISCOUNTEURO30']);

        expect(total).toBe(70); // 100 - 30€
    });

});

