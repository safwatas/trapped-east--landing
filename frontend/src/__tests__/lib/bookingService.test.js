/**
 * Unit Tests for bookingService.js
 * 
 * Tests CRUD operations for rooms, bookings, time slots, and promo codes
 * via Supabase, with the Supabase client fully mocked.
 */

jest.mock('../../lib/supabase', () => ({
    supabase: {
        from: jest.fn()
    }
}));

import { supabase } from '../../lib/supabase';
import { bookingService } from '../../lib/bookingService';

/**
 * Creates a Supabase-like fluent mock where every method returns `this`
 * and the call chain resolves via any method that returns a Promise.
 * 
 * Pass `terminalMethod` to specify which method in the chain is the last one
 * that should resolve with { data, error }.
 */
function createFluentMock(resolvedValue) {
    const proxy = new Proxy({}, {
        get(target, prop) {
            if (prop === 'then' || prop === 'catch') return undefined; // Not a thenable itself
            // Return a function that returns the proxy by default
            if (!target[prop]) {
                target[prop] = jest.fn().mockReturnValue(proxy);
            }
            return target[prop];
        }
    });

    // Override to make the proxy a thenable for final resolution
    const makeTerminal = (method) => {
        const originalMock = jest.fn().mockResolvedValue(resolvedValue);
        // We can't really set on proxy, so we wrap
        return originalMock;
    };

    return proxy;
}

/**
 * Simple deep-chain mock. Every method returns the chain object itself.
 * To terminate, pick one method and have it resolve.
 */
function mockSupabaseChain(resolveWith) {
    const chain = {};
    // All methods return chain (for chaining)
    const self = () => chain;
    chain.select = jest.fn(self);
    chain.eq = jest.fn(self);
    chain.not = jest.fn(self);
    chain.order = jest.fn(self);
    chain.gte = jest.fn(self);
    chain.lte = jest.fn(self);
    chain.insert = jest.fn(self);
    chain.update = jest.fn(self);
    chain.delete = jest.fn(self);
    chain.upsert = jest.fn(self);
    chain.single = jest.fn(self);

    // Make the chain itself thenable so `await chain.method()` works  
    // This makes the entire chain resolve to resolveWith when awaited
    chain.then = (resolve) => resolve(resolveWith);

    supabase.from.mockReturnValue(chain);
    return chain;
}

describe('bookingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ──────────────────────────────────
    // UT-BS-01: getRooms
    // ──────────────────────────────────
    test('UT-BS-01: getRooms returns active rooms ordered by name', async () => {
        const mockRooms = [
            { id: '1', name: 'Atlantis', active: true, room_images: [] },
            { id: '2', name: 'Pharaoh', active: true, room_images: [] }
        ];

        const chain = mockSupabaseChain({ data: mockRooms, error: null });

        const result = await bookingService.getRooms();

        expect(supabase.from).toHaveBeenCalledWith('rooms');
        expect(chain.select).toHaveBeenCalledWith('*, room_images(*)');
        expect(chain.eq).toHaveBeenCalledWith('active', true);
        expect(chain.order).toHaveBeenCalledWith('name');
        expect(result).toEqual(mockRooms);
    });

    test('UT-BS-01b: getRooms throws on Supabase error', async () => {
        mockSupabaseChain({ data: null, error: { message: 'Database error' } });

        await expect(bookingService.getRooms()).rejects.toEqual({ message: 'Database error' });
    });

    // ──────────────────────────────────
    // UT-BS-02: getRoomBySlug
    // ──────────────────────────────────
    test('UT-BS-02: getRoomBySlug returns single room with images and pricing', async () => {
        const mockRoom = {
            id: '1',
            slug: 'pharaoh-curse',
            name: 'Pharaoh\'s Curse',
            room_images: [{ image_url: 'img1.jpg' }],
            pricing_tiers: [{ player_count: 2, price_per_person: 470 }]
        };

        const chain = mockSupabaseChain({ data: mockRoom, error: null });

        const result = await bookingService.getRoomBySlug('pharaoh-curse');

        expect(supabase.from).toHaveBeenCalledWith('rooms');
        expect(chain.select).toHaveBeenCalledWith('*, room_images(*), pricing_tiers(*)');
        expect(chain.eq).toHaveBeenCalledWith('slug', 'pharaoh-curse');
        expect(chain.single).toHaveBeenCalled();
        expect(result).toEqual(mockRoom);
    });

    // ──────────────────────────────────
    // UT-BS-03: getBookedSlots
    // ──────────────────────────────────
    test('UT-BS-03: getBookedSlots excludes cancelled bookings', async () => {
        const mockData = [
            { time_slot: '14:00' },
            { time_slot: '16:00' }
        ];

        const chain = mockSupabaseChain({ data: mockData, error: null });

        const result = await bookingService.getBookedSlots('room-1', '2026-03-15');

        expect(supabase.from).toHaveBeenCalledWith('bookings');
        expect(chain.not).toHaveBeenCalledWith('status', 'eq', 'cancelled');
        expect(result).toEqual(['14:00', '16:00']);
    });

    // ──────────────────────────────────
    // UT-BS-04: createBooking
    // ──────────────────────────────────
    test('UT-BS-04: createBooking inserts and returns booking data', async () => {
        const bookingData = {
            room_id: 'room-1',
            booking_date: '2026-03-15',
            time_slot: '14:00',
            player_count: 4,
            total_price: 1800,
            price_per_person: 450,
            customer_name: 'Ahmed',
            customer_phone: '01012345678',
        };
        const returnedBooking = { id: 'booking-1', ...bookingData };

        const chain = mockSupabaseChain({ data: returnedBooking, error: null });

        const result = await bookingService.createBooking(bookingData);

        expect(supabase.from).toHaveBeenCalledWith('bookings');
        expect(chain.insert).toHaveBeenCalledWith([bookingData]);
        expect(result).toEqual(returnedBooking);
    });

    // ──────────────────────────────────
    // UT-BS-05: createBooking — double booking
    // ──────────────────────────────────
    test('UT-BS-05: createBooking handles 23505 unique constraint (double booking)', async () => {
        mockSupabaseChain({
            data: null,
            error: { code: '23505', message: 'unique_violation' }
        });

        await expect(bookingService.createBooking({
            room_id: 'room-1',
            booking_date: '2026-03-15',
            time_slot: '14:00',
            player_count: 4,
            total_price: 1800,
            price_per_person: 450,
            customer_name: 'Ahmed',
            customer_phone: '01012345678',
        })).rejects.toThrow('This slot was just taken');
    });

    // ──────────────────────────────────
    // UT-BS-06: validatePromoCode
    // ──────────────────────────────────
    test('UT-BS-06: validatePromoCode returns null for inactive code', async () => {
        mockSupabaseChain({ data: null, error: { message: 'Not found' } });

        const result = await bookingService.validatePromoCode('BAD_CODE', 4);
        expect(result).toBeNull();
    });

    test('UT-BS-06b: validatePromoCode returns null when player count below min_players', async () => {
        const promo = { min_players: 5, active: true };
        mockSupabaseChain({ data: promo, error: null });

        const result = await bookingService.validatePromoCode('GROUP5', 3);
        expect(result).toBeNull();
    });

    // ──────────────────────────────────
    // UT-BS-07: updateBookingStatus
    // ──────────────────────────────────
    test('UT-BS-07: updateBookingStatus updates status correctly', async () => {
        const updated = [{ id: 'booking-1', status: 'confirmed' }];
        const chain = mockSupabaseChain({ data: updated, error: null });

        const result = await bookingService.updateBookingStatus('booking-1', 'confirmed');

        expect(supabase.from).toHaveBeenCalledWith('bookings');
        expect(chain.update).toHaveBeenCalledWith({ status: 'confirmed' });
    });

    // ──────────────────────────────────
    // UT-BS-08: updateBookingNotes
    // ──────────────────────────────────
    test('UT-BS-08: updateBookingNotes sets notes and updated_at', async () => {
        const updated = [{ id: 'booking-1', internal_notes: 'Test note' }];
        const chain = mockSupabaseChain({ data: updated, error: null });

        await bookingService.updateBookingNotes('booking-1', 'Test note');

        expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({
            internal_notes: 'Test note',
            updated_at: expect.any(String)
        }));
    });

    // ──────────────────────────────────
    // UT-BS-09: deleteRoom (soft delete)
    // ──────────────────────────────────
    test('UT-BS-09: deleteRoom sets active to false', async () => {
        const chain = mockSupabaseChain({ error: null });

        const result = await bookingService.deleteRoom('room-1');

        expect(supabase.from).toHaveBeenCalledWith('rooms');
        expect(chain.update).toHaveBeenCalledWith({ active: false });
        expect(result).toBe(true);
    });

    // ──────────────────────────────────
    // UT-BS-10: upsertPromoCode
    // ──────────────────────────────────
    test('UT-BS-10: upsertPromoCode creates or updates on conflict', async () => {
        const promoData = {
            code: 'SUMMER25',
            discount_type: 'percentage',
            discount_value: 25,
            active: true
        };
        const returnedPromo = [{ id: 'promo-1', ...promoData }];

        const chain = mockSupabaseChain({ data: returnedPromo, error: null });

        const result = await bookingService.upsertPromoCode(promoData);

        expect(supabase.from).toHaveBeenCalledWith('promo_codes');
        expect(chain.upsert).toHaveBeenCalledWith(promoData, { onConflict: 'code' });
    });
});
