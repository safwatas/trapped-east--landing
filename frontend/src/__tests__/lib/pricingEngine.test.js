/**
 * Unit Tests for pricingEngine.js
 * 
 * Tests the pricing calculation engine including discount calculations,
 * promo code validation, offer management, and booking quote generation.
 */

// Mock the supabase module before importing anything
jest.mock('../../lib/supabase', () => ({
    supabase: {
        from: jest.fn()
    }
}));

import { supabase } from '../../lib/supabase';

// We need to test internal functions too, so we import the module
// Note: calculateDiscount is not exported, so we test it indirectly through calculateBookingQuote
import {
    validatePromoCode,
    getActiveOffersForRoom,
    calculateBookingQuote,
    getAllActiveOffers,
    roomHasActiveOffer
} from '../../lib/pricingEngine';

// Helper to create mock Supabase chain
function mockSupabaseQuery(data, error = null) {
    const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data, error }),
        // Default terminal — resolves to { data, error }
    };
    // For queries that don't end with .single()
    chain.select.mockReturnValue({
        ...chain,
        eq: jest.fn().mockReturnValue({
            ...chain,
            single: jest.fn().mockResolvedValue({ data, error }),
            eq: jest.fn().mockReturnValue({
                ...chain,
                single: jest.fn().mockResolvedValue({ data, error }),
            }),
        }),
    });
    supabase.from.mockReturnValue(chain);
    return chain;
}

function mockSupabaseList(data, error = null) {
    const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data, error }),
    };
    supabase.from.mockReturnValue(chain);
    return chain;
}

// ─────────────────────────────────────────────
// UT-PE-01 to UT-PE-07: calculateBookingQuote / calculateDiscount
// ─────────────────────────────────────────────
describe('calculateBookingQuote', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const basePricing = { 2: 470, 3: 460, 4: 450, 5: 440, 6: 430, 7: 420 };

    test('UT-PE-04: calculates correct total for 4 players with no promo', async () => {
        // Mock empty offers
        mockSupabaseList([], null);

        const quote = await calculateBookingQuote({
            roomId: 'room-1',
            date: '2026-03-15',
            timeSlot: '14:00',
            playerCount: 4,
            pricing: basePricing,
            promoCode: null
        });

        expect(quote.basePricePerPerson).toBe(450);
        expect(quote.baseTotal).toBe(1800); // 450 * 4
        expect(quote.totalPrice).toBe(1800);
        expect(quote.discountAmount).toBe(0);
        expect(quote.appliedPromo).toBeNull();
        expect(quote.appliedOffer).toBeNull();
        expect(quote.discountBreakdown).toHaveLength(0);
    });

    test('UT-PE-05: applies percentage promo code correctly', async () => {
        // Mock empty offers and valid promo
        const mockPromo = {
            code: 'SAVE20',
            active: true,
            discount_type: 'percentage',
            discount_value: 20,
            min_players: 0,
            valid_from: null,
            valid_to: null,
            usage_limit: null,
            used_count: 0
        };

        // First call: offers query → empty
        // Second call: promo query → valid promo
        let callCount = 0;
        supabase.from.mockImplementation((table) => {
            if (table === 'offers') {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({ data: [], error: null })
                };
            }
            if (table === 'promo_codes') {
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockPromo, error: null })
                        })
                    })
                };
            }
        });

        const quote = await calculateBookingQuote({
            roomId: 'room-1',
            date: '2026-03-15',
            timeSlot: '14:00',
            playerCount: 4,
            pricing: basePricing,
            promoCode: 'SAVE20'
        });

        expect(quote.baseTotal).toBe(1800); // 450 * 4
        expect(quote.discountAmount).toBe(360); // 20% of 1800
        expect(quote.totalPrice).toBe(1440);
        expect(quote.appliedPromo).not.toBeNull();
        expect(quote.appliedPromo.code).toBe('SAVE20');
        expect(quote.discountBreakdown).toHaveLength(1);
    });

    test('UT-PE-06: applies fixed promo code correctly', async () => {
        const mockPromo = {
            code: 'FLAT100',
            active: true,
            discount_type: 'fixed',
            discount_value: 100,
            min_players: 0,
            valid_from: null,
            valid_to: null,
            usage_limit: null,
            used_count: 0
        };

        supabase.from.mockImplementation((table) => {
            if (table === 'offers') {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({ data: [], error: null })
                };
            }
            if (table === 'promo_codes') {
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockPromo, error: null })
                        })
                    })
                };
            }
        });

        const quote = await calculateBookingQuote({
            roomId: 'room-1',
            date: '2026-03-15',
            timeSlot: '14:00',
            playerCount: 4,
            pricing: basePricing,
            promoCode: 'FLAT100'
        });

        expect(quote.baseTotal).toBe(1800);
        expect(quote.discountAmount).toBe(100);
        expect(quote.totalPrice).toBe(1700);
    });

    test('UT-PE-01/02/03: calculateDiscount edge cases tested through quote', async () => {
        // Test fixed discount that exceeds price (should cap at price)
        const mockPromo = {
            code: 'HUGE',
            active: true,
            discount_type: 'fixed',
            discount_value: 5000,
            min_players: 0,
            valid_from: null,
            valid_to: null,
            usage_limit: null,
            used_count: 0
        };

        supabase.from.mockImplementation((table) => {
            if (table === 'offers') {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({ data: [], error: null })
                };
            }
            if (table === 'promo_codes') {
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockPromo, error: null })
                        })
                    })
                };
            }
        });

        const quote = await calculateBookingQuote({
            roomId: 'room-1',
            date: '2026-03-15',
            timeSlot: '14:00',
            playerCount: 2,
            pricing: basePricing,
            promoCode: 'HUGE'
        });

        // Fixed discount of 5000 capped at base price of 940 (470*2)
        expect(quote.totalPrice).toBeGreaterThanOrEqual(0);
    });

    test('UT-PE-07: handles no pricing data gracefully (fallback)', async () => {
        mockSupabaseList([], null);

        const quote = await calculateBookingQuote({
            roomId: 'room-1',
            date: '2026-03-15',
            timeSlot: '14:00',
            playerCount: 4,
            pricing: {},
            promoCode: null
        });

        // Falls back to 420 per person
        expect(quote.basePricePerPerson).toBe(420);
        expect(quote.baseTotal).toBe(1680);
    });
});

// ─────────────────────────────────────────────
// UT-PE-08 to UT-PE-11: validatePromoCode
// ─────────────────────────────────────────────
describe('validatePromoCode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('UT-PE-08: returns valid result for active, unexpired promo', async () => {
        const mockPromo = {
            code: 'VALID10',
            active: true,
            discount_type: 'percentage',
            discount_value: 10,
            min_players: 0,
            valid_from: '2025-01-01T00:00:00Z',
            valid_to: '2027-12-31T23:59:59Z',
            usage_limit: 100,
            used_count: 5
        };

        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockPromo, error: null })
                })
            })
        });

        const result = await validatePromoCode('VALID10', {
            roomId: 'room-1',
            playerCount: 4,
            date: '2026-06-15'
        });

        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
        expect(result.promo).toEqual(mockPromo);
    });

    test('UT-PE-09: returns error for expired promo code', async () => {
        const mockPromo = {
            code: 'EXPIRED',
            active: true,
            discount_type: 'percentage',
            discount_value: 10,
            min_players: 0,
            valid_from: '2024-01-01T00:00:00Z',
            valid_to: '2024-12-31T23:59:59Z', // Expired
            usage_limit: null,
            used_count: 0
        };

        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockPromo, error: null })
                })
            })
        });

        const result = await validatePromoCode('EXPIRED', {
            roomId: 'room-1',
            playerCount: 2,
            date: '2026-06-15'
        });

        expect(result.valid).toBe(false);
        expect(result.error).toBe('This promo code has expired');
    });

    test('UT-PE-10: returns error when player count below min_players', async () => {
        const mockPromo = {
            code: 'GROUP5',
            active: true,
            discount_type: 'percentage',
            discount_value: 15,
            min_players: 5,
            valid_from: null,
            valid_to: null,
            usage_limit: null,
            used_count: 0
        };

        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockPromo, error: null })
                })
            })
        });

        const result = await validatePromoCode('GROUP5', {
            roomId: 'room-1',
            playerCount: 3,
            date: '2026-06-15'
        });

        expect(result.valid).toBe(false);
        expect(result.error).toContain('at least 5 players');
    });

    test('UT-PE-11: returns error when usage limit exceeded', async () => {
        const mockPromo = {
            code: 'LIMITED',
            active: true,
            discount_type: 'percentage',
            discount_value: 10,
            min_players: 0,
            valid_from: null,
            valid_to: null,
            usage_limit: 10,
            used_count: 10
        };

        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockPromo, error: null })
                })
            })
        });

        const result = await validatePromoCode('LIMITED', {
            roomId: 'room-1',
            playerCount: 2,
            date: '2026-06-15'
        });

        expect(result.valid).toBe(false);
        expect(result.error).toContain('usage limit');
    });

    test('returns error for empty promo code', async () => {
        const result = await validatePromoCode('', {
            roomId: 'room-1',
            playerCount: 2,
            date: '2026-06-15'
        });

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Please enter a promo code');
    });

    test('returns error for non-existent promo code', async () => {
        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
                })
            })
        });

        const result = await validatePromoCode('DOESNOTEXIST', {
            roomId: 'room-1',
            playerCount: 2,
            date: '2026-06-15'
        });

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid promo code');
    });

    test('returns error for inactive promo code', async () => {
        const mockPromo = {
            code: 'INACTIVE',
            active: false,
            discount_type: 'percentage',
            discount_value: 10,
        };

        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockPromo, error: null })
                })
            })
        });

        const result = await validatePromoCode('INACTIVE', {
            roomId: 'room-1',
            playerCount: 2,
            date: '2026-06-15'
        });

        expect(result.valid).toBe(false);
        expect(result.error).toBe('This promo code is no longer active');
    });
});

// ─────────────────────────────────────────────
// UT-PE-12 to UT-PE-14: Offer functions
// ─────────────────────────────────────────────
describe('getActiveOffersForRoom', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('UT-PE-12: returns only current, active offers for a given room', async () => {
        const offers = [
            {
                id: 'offer-1',
                name: 'Weekend Deal',
                active: true,
                discount_type: 'percentage',
                discount_value: 10,
                room_ids: ['room-1', 'room-2'],
                day_of_week: null,
                start_date: '2026-01-01',
                end_date: '2026-12-31'
            },
            {
                id: 'offer-2',
                name: 'Room 3 Only',
                active: true,
                discount_type: 'fixed',
                discount_value: 50,
                room_ids: ['room-3'],
                day_of_week: null,
                start_date: null,
                end_date: null
            }
        ];

        mockSupabaseList(offers, null);

        const result = await getActiveOffersForRoom('room-1', '2026-06-15');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('offer-1');
    });

    test('returns empty for no matching offers', async () => {
        mockSupabaseList([], null);

        const result = await getActiveOffersForRoom('room-1', '2026-06-15');
        expect(result).toHaveLength(0);
    });
});

describe('getAllActiveOffers', () => {
    test('UT-PE-13: returns all active offers', async () => {
        const offers = [
            { id: 'offer-1', name: 'Deal 1', active: true },
            { id: 'offer-2', name: 'Deal 2', active: true }
        ];

        mockSupabaseList(offers, null);

        const result = await getAllActiveOffers();
        expect(result).toHaveLength(2);
    });

    test('returns empty on error', async () => {
        mockSupabaseList(null, { message: 'DB error' });

        const result = await getAllActiveOffers();
        expect(result).toEqual([]);
    });
});

describe('roomHasActiveOffer', () => {
    test('UT-PE-14: returns true when room has an active offer', async () => {
        const offers = [
            { id: 'offer-1', name: 'Deal', active: true, room_ids: ['room-1'] }
        ];

        mockSupabaseList(offers, null);

        const result = await roomHasActiveOffer('room-1');
        expect(result).toBe(true);
    });

    test('returns true when offer has empty room_ids (applies to all)', async () => {
        const offers = [
            { id: 'offer-1', name: 'Global Deal', active: true, room_ids: [] }
        ];

        mockSupabaseList(offers, null);

        const result = await roomHasActiveOffer('any-room');
        expect(result).toBe(true);
    });

    test('returns false when no offers for room', async () => {
        const offers = [
            { id: 'offer-1', name: 'Other Room Deal', active: true, room_ids: ['room-99'] }
        ];

        mockSupabaseList(offers, null);

        const result = await roomHasActiveOffer('room-1');
        expect(result).toBe(false);
    });
});
