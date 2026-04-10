import { CalculatePriceUseCase } from "../app/calcul-price.usecase";
import type { Product } from "../app/calcul-price.usecase";
import {describe} from "vitest";

// STUB — remplace le gateway, retourne ce qu'on lui dit
class StubReductionGateway implements ReductionGateway {
    async getReductionByCode(code: string) {
        return null;
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

});

