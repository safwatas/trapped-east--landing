/**
 * Integration Tests — Booking Data Pipeline
 * 
 * Tests multi-step flows that span multiple service modules:
 * IT-01: Booking data pipeline (room → slots → price → submit → confirm)
 * IT-02: Promo code flow (apply → recalculate → remove → revert)
 * IT-03: Double booking prevention
 * IT-05: Room deactivation flow
 */

jest.mock('../../lib/supabase', () => ({
    supabase: {
        from: jest.fn()
    }
}));

import { supabase } from '../../lib/supabase';
import { bookingService } from '../../lib/bookingService';
import { calculateBookingQuote, validatePromoCode } from '../../lib/pricingEngine';
import { roomAdapter } from '../../lib/adapters';

/**
 * Thenable chain mock — every method returns this chain,
 * and `await chain` resolves to the given value.
 */
function mockSupabaseChain(resolveWith) {
    const chain = {};
    const self = () => chain;
    ['select', 'eq', 'not', 'order', 'gte', 'lte', 'insert', 'update', 'delete', 'upsert', 'single'].forEach(m => {
        chain[m] = jest.fn(self);
    });
    chain.then = (resolve) => resolve(resolveWith);
    return chain;
}

/**
 * Sets up supabase.from to return different chains for different tables.
 */
function setupMultiTable(tableMap) {
    supabase.from.mockImplementation((table) => {
        if (tableMap[table]) {
            return tableMap[table];
        }
        // Default: return empty chain
        return mockSupabaseChain({ data: [], error: null });
    });
}

// ─────────────────────────────────────────────
// IT-01: Booking Data Pipeline
// ─────────────────────────────────────────────
describe('IT-01: Booking Data Pipeline', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Full flow: fetch room → get slots → calculate price → submit booking → get confirmation', async () => {
        // Step 1: DB room data
        const dbRoom = {
            id: 'room-uuid-1',
            slug: 'pharaohs-curse',
            name: "Pharaoh's Curse",
            min_players: 2,
            max_players: 7,
            duration: 60,
            difficulty: 'Hard',
            is_horror: true,
            horror_toggleable: true,
            non_horror_available: true,
            room_images: [{ image_url: 'img1.jpg', order_index: 0 }],
            pricing_tiers: [
                { player_count: 2, price_per_person: 470 },
                { player_count: 3, price_per_person: 460 },
                { player_count: 4, price_per_person: 450 }
            ]
        };

        // Step 1: Fetch room by slug
        const roomChain = mockSupabaseChain({ data: dbRoom, error: null });
        supabase.from.mockReturnValue(roomChain);

        const rawRoom = await bookingService.getRoomBySlug('pharaohs-curse');
        expect(rawRoom.slug).toBe('pharaohs-curse');

        // Step 2: Adapt room for frontend
        const adaptedRoom = roomAdapter(rawRoom);
        expect(adaptedRoom.pricing).toEqual({ 2: 470, 3: 460, 4: 450 });
        expect(adaptedRoom.image).toBe('img1.jpg');

        // Step 3: Check available slots
        const bookedSlotsChain = mockSupabaseChain({ data: [{ time_slot: '14:00' }], error: null });
        supabase.from.mockReturnValue(bookedSlotsChain);

        const booked = await bookingService.getBookedSlots('room-uuid-1', '2026-04-15');
        expect(booked).toEqual(['14:00']);

        // Step 4: Calculate price for 4 players (no promo)
        const offersChain = mockSupabaseChain({ data: [], error: null });
        supabase.from.mockReturnValue(offersChain);

        const quote = await calculateBookingQuote({
            roomId: 'room-uuid-1',
            date: '2026-04-15',
            timeSlot: '16:00', // available slot
            playerCount: 4,
            pricing: adaptedRoom.pricing,
            promoCode: null
        });

        expect(quote.basePricePerPerson).toBe(450);
        expect(quote.totalPrice).toBe(1800);

        // Step 5: Submit booking
        const bookingData = {
            room_id: 'room-uuid-1',
            booking_date: '2026-04-15',
            time_slot: '16:00',
            player_count: 4,
            total_price: quote.totalPrice,
            price_per_person: quote.basePricePerPerson,
            customer_name: 'Ahmed Hassan',
            customer_phone: '01012345678',
            customer_email: 'ahmed@test.com',
            status: 'pending'
        };

        const submittedBooking = { id: 'booking-uuid-123', ...bookingData };
        const insertChain = mockSupabaseChain({ data: submittedBooking, error: null });
        supabase.from.mockReturnValue(insertChain);

        const result = await bookingService.createBooking(bookingData);

        expect(result.id).toBe('booking-uuid-123');
        expect(result.total_price).toBe(1800);
        expect(result.player_count).toBe(4);

        // Verify the booking insertion was called with correct data
        expect(insertChain.insert).toHaveBeenCalledWith([bookingData]);
    });
});

// ─────────────────────────────────────────────
// IT-02: Promo Code Flow
// ─────────────────────────────────────────────
describe('IT-02: Promo Code Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Apply valid promo → price recalculates → remove promo → price reverts', async () => {
        const pricing = { 2: 470, 3: 460, 4: 450 };
        const mockPromo = {
            code: 'EGYPT20',
            active: true,
            discount_type: 'percentage',
            discount_value: 20,
            min_players: 0,
            valid_from: null,
            valid_to: null,
            usage_limit: null,
            used_count: 0
        };

        // Step 1: Calculate without promo
        supabase.from.mockImplementation((table) => {
            if (table === 'offers') {
                return mockSupabaseChain({ data: [], error: null });
            }
            return mockSupabaseChain({ data: null, error: null });
        });

        const quoteNoPromo = await calculateBookingQuote({
            roomId: 'room-1',
            date: '2026-04-15',
            timeSlot: '16:00',
            playerCount: 4,
            pricing,
            promoCode: null
        });

        expect(quoteNoPromo.totalPrice).toBe(1800);
        expect(quoteNoPromo.discountAmount).toBe(0);

        // Step 2: Calculate WITH promo
        supabase.from.mockImplementation((table) => {
            if (table === 'offers') {
                return mockSupabaseChain({ data: [], error: null });
            }
            if (table === 'promo_codes') {
                const chain = mockSupabaseChain({ data: mockPromo, error: null });
                return chain;
            }
            return mockSupabaseChain({ data: null, error: null });
        });

        const quoteWithPromo = await calculateBookingQuote({
            roomId: 'room-1',
            date: '2026-04-15',
            timeSlot: '16:00',
            playerCount: 4,
            pricing,
            promoCode: 'EGYPT20'
        });

        expect(quoteWithPromo.totalPrice).toBe(1440); // 1800 - 20%
        expect(quoteWithPromo.discountAmount).toBe(360);
        expect(quoteWithPromo.appliedPromo.code).toBe('EGYPT20');

        // Step 3: Remove promo (recalculate without it)
        supabase.from.mockImplementation((table) => {
            if (table === 'offers') {
                return mockSupabaseChain({ data: [], error: null });
            }
            return mockSupabaseChain({ data: null, error: null });
        });

        const quoteReverted = await calculateBookingQuote({
            roomId: 'room-1',
            date: '2026-04-15',
            timeSlot: '16:00',
            playerCount: 4,
            pricing,
            promoCode: null
        });

        // Price reverts to original
        expect(quoteReverted.totalPrice).toBe(1800);
        expect(quoteReverted.appliedPromo).toBeNull();
    });
});

// ─────────────────────────────────────────────
// IT-03: Double Booking Prevention
// ─────────────────────────────────────────────
describe('IT-03: Double Booking Prevention', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Attempt to book already-booked slot → graceful error message', async () => {
        // Step 1: Slot appears available in booked list check
        const bookedChain = mockSupabaseChain({ data: [], error: null });
        supabase.from.mockReturnValue(bookedChain);

        const bookedSlots = await bookingService.getBookedSlots('room-1', '2026-04-15');
        expect(bookedSlots).toEqual([]);

        // Step 2: But someone else books it simultaneously
        // When we try to insert, DB returns unique constraint violation
        const conflictChain = mockSupabaseChain({
            data: null,
            error: { code: '23505', message: 'unique_violation' }
        });
        supabase.from.mockReturnValue(conflictChain);

        await expect(
            bookingService.createBooking({
                room_id: 'room-1',
                booking_date: '2026-04-15',
                time_slot: '14:00',
                player_count: 4,
                total_price: 1800,
                price_per_person: 450,
                customer_name: 'Ahmed',
                customer_phone: '01012345678',
            })
        ).rejects.toThrow('This slot was just taken. Please choose another time.');
    });
});

// ─────────────────────────────────────────────
// IT-05: Room Deactivation Flow
// ─────────────────────────────────────────────
describe('IT-05: Room Deactivation Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Admin deactivates room → public rooms list no longer shows it', async () => {
        // Step 1: Room is initially in the active list
        const activeRooms = [
            { id: 'room-1', name: 'Pharaoh', active: true, room_images: [] },
            { id: 'room-2', name: 'Atlantis', active: true, room_images: [] }
        ];
        let deactivatedRoom = null;

        const listChain = mockSupabaseChain({ data: activeRooms, error: null });
        supabase.from.mockReturnValue(listChain);

        const initialRooms = await bookingService.getRooms();
        expect(initialRooms).toHaveLength(2);

        // Step 2: Admin deactivates room-1
        const deactivateChain = mockSupabaseChain({ error: null });
        supabase.from.mockReturnValue(deactivateChain);

        const result = await bookingService.deleteRoom('room-1');
        expect(result).toBe(true);

        // Verify the update was called with active: false
        expect(deactivateChain.update).toHaveBeenCalledWith({ active: false });

        // Step 3: Public rooms list now only shows 1 room
        const remainingRooms = activeRooms.filter(r => r.id !== 'room-1');
        const newListChain = mockSupabaseChain({ data: remainingRooms, error: null });
        supabase.from.mockReturnValue(newListChain);

        const updatedRooms = await bookingService.getRooms();
        expect(updatedRooms).toHaveLength(1);
        expect(updatedRooms[0].name).toBe('Atlantis');
    });
});

// ─────────────────────────────────────────────
// IT-06: External Customer Export
// ─────────────────────────────────────────────
describe('IT-06: External Customer CSV Export', () => {
    test('Customer data → CSV generation → valid format', async () => {
        // Import the pure functions (no API mocking needed for CSV gen)
        const { generateCustomerCSV, maskPhoneNumber, normalizePhoneForMeta } = require('../../lib/externalCustomerService');

        const customers = [
            { firstname: 'Ahmed', lastname: 'Hassan', phonenumber: '01012345678', email: 'ahmed@test.com' },
            { firstname: 'Sara', lastname: 'Ali', phonenumber: '01098765432', email: 'sara@test.com' },
            { firstname: 'Omar', lastname: 'Khaled', phonenumber: '01155544433', email: 'omar@test.com' }
        ];

        // Step 1: Verify phone masking for display
        expect(maskPhoneNumber(customers[0].phonenumber)).toBe('010****5678');

        // Step 2: Generate standard CSV
        const standardCSV = generateCustomerCSV(customers);
        const standardLines = standardCSV.split('\n');
        expect(standardLines).toHaveLength(4); // header + 3 rows
        expect(standardLines[0]).toContain('firstname');

        // Step 3: Generate Meta Ads CSV
        const metaCSV = generateCustomerCSV(customers, { metaFormat: true });
        const metaLines = metaCSV.split('\n');
        expect(metaLines[0]).toBe('phone,email,fn,ln');

        // Verify E.164 normalization in Meta format
        expect(metaLines[1]).toContain('+201012345678');
        expect(metaLines[2]).toContain('+201098765432');

        // Step 4: Verify all customers are in the export
        expect(metaLines).toHaveLength(4);
    });
});
