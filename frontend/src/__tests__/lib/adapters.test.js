/**
 * Unit Tests for adapters.js
 * 
 * Tests the adapter layer that transforms Supabase database objects
 * into the format expected by frontend components.
 */

import { roomAdapter, getLocalizedRoom, bookingAdapter } from '../../lib/adapters';

// ──────────────────────────────────
// roomAdapter tests
// ──────────────────────────────────
describe('roomAdapter', () => {
    const mockDbRoom = {
        id: 'room-uuid-1',
        slug: 'pharaohs-curse',
        name: "Pharaoh's Curse",
        name_ar: 'لعنة الفرعون',
        tagline: 'Can you escape the ancient tomb?',
        tagline_ar: 'هل يمكنك الهروب من المقبرة القديمة؟',
        description: 'An immersive experience...',
        description_ar: 'تجربة غامرة...',
        min_players: 2,
        max_players: 7,
        duration: 60,
        difficulty: 'Hard',
        is_horror: true,
        horror_toggleable: true,
        non_horror_available: true,
        room_images: [
            { image_url: 'img3.jpg', order_index: 2 },
            { image_url: 'img1.jpg', order_index: 0 },
            { image_url: 'img2.jpg', order_index: 1 }
        ],
        pricing_tiers: [
            { player_count: 2, price_per_person: 470 },
            { player_count: 3, price_per_person: 460 },
            { player_count: 4, price_per_person: 450 }
        ]
    };

    test('UT-AD-01: transforms raw Supabase data to frontend format', () => {
        const adapted = roomAdapter(mockDbRoom);

        expect(adapted.id).toBe('room-uuid-1');
        expect(adapted.slug).toBe('pharaohs-curse');
        expect(adapted.name).toBe("Pharaoh's Curse"); // Default language is en
        expect(adapted.minPlayers).toBe(2);
        expect(adapted.maxPlayers).toBe(7);
        expect(adapted.duration).toBe(60);
        expect(adapted.difficulty).toBe('Hard');
        expect(adapted.isHorror).toBe(true);
        expect(adapted.horrorToggleable).toBe(true);

        // Images should be sorted by order_index
        expect(adapted.image).toBe('img1.jpg'); // First image (order_index 0)
        expect(adapted.images).toEqual(['img1.jpg', 'img2.jpg', 'img3.jpg']);

        // Pricing should be mapped as { playerCount: pricePerPerson }
        expect(adapted.pricing).toEqual({ 2: 470, 3: 460, 4: 450 });
    });

    test('UT-AD-02: returns Arabic content when language is ar', () => {
        const adapted = roomAdapter(mockDbRoom, 'ar');

        expect(adapted.name).toBe('لعنة الفرعون');
        expect(adapted.tagline).toBe('هل يمكنك الهروب من المقبرة القديمة؟');
        expect(adapted.description).toBe('تجربة غامرة...');
    });

    test('falls back to English when Arabic content is missing', () => {
        const roomNoArabic = { ...mockDbRoom, name_ar: null, tagline_ar: null, description_ar: null };
        const adapted = roomAdapter(roomNoArabic, 'ar');

        expect(adapted.name).toBe("Pharaoh's Curse");
        expect(adapted.tagline).toBe('Can you escape the ancient tomb?');
        expect(adapted.description).toBe('An immersive experience...');
    });

    test('returns null for null input', () => {
        expect(roomAdapter(null)).toBeNull();
    });

    test('handles room with no images — uses fallback', () => {
        const roomNoImages = { ...mockDbRoom, room_images: [] };
        const adapted = roomAdapter(roomNoImages);

        expect(adapted.image).toContain('trappedegypt.com');
        expect(adapted.images).toEqual([]);
    });

    test('handles room with no pricing tiers', () => {
        const roomNoPricing = { ...mockDbRoom, pricing_tiers: null };
        const adapted = roomAdapter(roomNoPricing);

        expect(adapted.pricing).toEqual({});
    });
});

// ──────────────────────────────────
// getLocalizedRoom tests
// ──────────────────────────────────
describe('getLocalizedRoom', () => {
    const adaptedRoom = {
        id: '1',
        name: 'Default Name',
        name_en: 'English Name',
        name_ar: 'اسم عربي',
        tagline: 'Default Tagline',
        tagline_en: 'English Tagline',
        tagline_ar: 'شعار عربي',
        description: 'Default Desc',
        description_en: 'English Desc',
        description_ar: 'وصف عربي',
    };

    test('returns English content for en language', () => {
        const localized = getLocalizedRoom(adaptedRoom, 'en');
        expect(localized.name).toBe('English Name');
        expect(localized.tagline).toBe('English Tagline');
        expect(localized.description).toBe('English Desc');
    });

    test('returns Arabic content for ar language', () => {
        const localized = getLocalizedRoom(adaptedRoom, 'ar');
        expect(localized.name).toBe('اسم عربي');
        expect(localized.tagline).toBe('شعار عربي');
        expect(localized.description).toBe('وصف عربي');
    });

    test('returns null for null input', () => {
        expect(getLocalizedRoom(null, 'en')).toBeNull();
    });
});

// ──────────────────────────────────
// bookingAdapter tests
// ──────────────────────────────────
describe('bookingAdapter', () => {
    test('transforms booking database object to frontend format', () => {
        const dbBooking = {
            id: 'booking-uuid-1',
            customer_name: 'Ahmed',
            customer_phone: '01012345678',
            customer_email: 'ahmed@test.com',
            rooms: { name: "Pharaoh's Curse", slug: 'pharaohs-curse' },
            booking_date: '2026-03-15',
            time_slot: '14:00',
            player_count: 4,
            total_price: 1800,
            status: 'confirmed',
            internal_notes: 'VIP customer',
            utm_source: 'facebook',
            utm_medium: 'cpc',
            utm_campaign: 'spring_deal',
            utm_adset: null,
            utm_ad: null,
            fbclid: 'fb123',
            created_at: '2026-03-14T10:00:00Z'
        };

        const adapted = bookingAdapter(dbBooking);

        expect(adapted.id).toBe('booking-uuid-1');
        expect(adapted.customerName).toBe('Ahmed');
        expect(adapted.customerPhone).toBe('01012345678');
        expect(adapted.roomName).toBe("Pharaoh's Curse");
        expect(adapted.date).toBe('2026-03-15');
        expect(adapted.timeSlot).toBe('14:00');
        expect(adapted.players).toBe(4);
        expect(adapted.totalPrice).toBe(1800);
        expect(adapted.status).toBe('confirmed');
        expect(adapted.notes).toBe('VIP customer');
        expect(adapted.utmSource).toBe('facebook');
    });

    test('handles missing room data gracefully', () => {
        const dbBooking = {
            id: 'booking-uuid-1',
            customer_name: 'Test',
            customer_phone: '010',
            rooms: null,
            booking_date: '2026-03-15',
            time_slot: '14:00',
            player_count: 2,
            total_price: 940,
            status: 'pending',
            created_at: '2026-03-14T10:00:00Z'
        };

        const adapted = bookingAdapter(dbBooking);
        expect(adapted.roomName).toBe('Unknown Room');
        expect(adapted.notes).toBe('');
    });

    test('returns null for null input', () => {
        expect(bookingAdapter(null)).toBeNull();
    });
});
