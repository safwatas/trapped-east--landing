import { supabase } from './supabase';

/**
 * Pricing Engine - Single Source of Truth for all price calculations
 * 
 * This service handles:
 * - Base pricing from pricing_tiers
 * - Promo code validation and application
 * - Offer validation and application
 * - Returns a complete BookingQuote
 */

/**
 * @typedef {Object} BookingQuote
 * @property {number} basePricePerPerson - Original price per person from pricing_tiers
 * @property {number} finalPricePerPerson - Final price per person after discounts
 * @property {number} baseTotal - Original total (basePricePerPerson × players)
 * @property {number} totalPrice - Final total after discounts
 * @property {number} discountAmount - Total discount applied
 * @property {Object|null} appliedOffer - Applied offer details
 * @property {Object|null} appliedPromo - Applied promo code details
 * @property {Array} discountBreakdown - Array of applied discounts
 */

/**
 * @typedef {Object} PromoValidationResult
 * @property {boolean} valid - Whether the promo is valid
 * @property {string|null} error - Error message if invalid
 * @property {Object|null} promo - Promo code data if valid
 */

/**
 * Validates a promo code against all DB rules
 */
export async function validatePromoCode(code, { roomId, playerCount, date }) {
    if (!code || !code.trim()) {
        return { valid: false, error: 'Please enter a promo code', promo: null };
    }

    const { data: promo, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .single();

    if (error || !promo) {
        return { valid: false, error: 'Invalid promo code', promo: null };
    }

    // Check if active
    if (!promo.active) {
        return { valid: false, error: 'This promo code is no longer active', promo: null };
    }

    // Check expiry
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
        return { valid: false, error: 'This promo code is not yet active', promo: null };
    }
    if (promo.valid_to && new Date(promo.valid_to) < now) {
        return { valid: false, error: 'This promo code has expired', promo: null };
    }

    // Check usage limit
    if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
        return { valid: false, error: 'This promo code has reached its usage limit', promo: null };
    }

    // Check min players
    if (promo.min_players && playerCount < promo.min_players) {
        return {
            valid: false,
            error: `This promo requires at least ${promo.min_players} players`,
            promo: null
        };
    }

    // Check allowed rooms (if promo has room restrictions - future enhancement)
    // For now, promos apply to all rooms

    return { valid: true, error: null, promo };
}

/**
 * Fetches active offers for a room
 */
export async function getActiveOffersForRoom(roomId, date) {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0-6 (Sunday-Saturday)
    const dateStr = date; // YYYY-MM-DD format

    const { data: offers, error } = await supabase
        .from('offers')
        .select('*')
        .eq('active', true);

    if (error || !offers) return [];

    // Filter offers that apply to this room and date
    return offers.filter(offer => {
        // Check if offer applies to this room
        if (offer.room_ids && offer.room_ids.length > 0) {
            if (!offer.room_ids.includes(roomId)) {
                return false;
            }
        }

        // Check day of week
        if (offer.day_of_week !== null && offer.day_of_week !== dayOfWeek) {
            return false;
        }

        // Check date range
        if (offer.start_date && dateStr < offer.start_date) {
            return false;
        }
        if (offer.end_date && dateStr > offer.end_date) {
            return false;
        }

        return true;
    });
}

/**
 * Calculates discount amount based on type and value
 */
function calculateDiscount(basePrice, discountType, discountValue) {
    if (discountType === 'percentage') {
        return Math.round(basePrice * (discountValue / 100));
    } else if (discountType === 'fixed') {
        return Math.min(discountValue, basePrice); // Can't discount more than the price
    }
    return 0;
}

/**
 * Main pricing function - calculates complete booking quote
 */
export async function calculateBookingQuote({
    roomId,
    date,
    timeSlot,
    playerCount,
    pricing, // pricing object from room { 2: 470, 3: 460, ... }
    promoCode = null
}) {
    // 1. Get base price from pricing tiers
    const basePricePerPerson = pricing?.[playerCount] || pricing?.[Math.max(...Object.keys(pricing).map(Number))] || 420;
    const baseTotal = basePricePerPerson * playerCount;

    // Initialize quote
    const quote = {
        basePricePerPerson,
        finalPricePerPerson: basePricePerPerson,
        baseTotal,
        totalPrice: baseTotal,
        discountAmount: 0,
        appliedOffer: null,
        appliedPromo: null,
        discountBreakdown: []
    };

    // 2. Check for active offers
    if (date) {
        const offers = await getActiveOffersForRoom(roomId, date);
        if (offers.length > 0) {
            // Apply the best offer (highest discount)
            const bestOffer = offers.reduce((best, current) => {
                const currentDiscount = calculateDiscount(quote.totalPrice, current.discount_type, current.discount_value);
                const bestDiscount = best ? calculateDiscount(quote.totalPrice, best.discount_type, best.discount_value) : 0;
                return currentDiscount > bestDiscount ? current : best;
            }, null);

            if (bestOffer) {
                const offerDiscount = calculateDiscount(quote.totalPrice, bestOffer.discount_type, bestOffer.discount_value);
                quote.discountAmount += offerDiscount;
                quote.totalPrice -= offerDiscount;
                quote.appliedOffer = {
                    id: bestOffer.id,
                    name: bestOffer.name,
                    discountType: bestOffer.discount_type,
                    discountValue: bestOffer.discount_value,
                    discountAmount: offerDiscount
                };
                quote.discountBreakdown.push({
                    type: 'offer',
                    name: bestOffer.name,
                    amount: offerDiscount
                });
            }
        }
    }

    // 3. Apply promo code if provided
    if (promoCode) {
        const validation = await validatePromoCode(promoCode, { roomId, playerCount, date });
        if (validation.valid && validation.promo) {
            const promo = validation.promo;
            const promoDiscount = calculateDiscount(quote.totalPrice, promo.discount_type, promo.discount_value);
            quote.discountAmount += promoDiscount;
            quote.totalPrice -= promoDiscount;
            quote.appliedPromo = {
                code: promo.code,
                discountType: promo.discount_type,
                discountValue: promo.discount_value,
                discountAmount: promoDiscount
            };
            quote.discountBreakdown.push({
                type: 'promo',
                name: `Promo: ${promo.code}`,
                amount: promoDiscount
            });
        }
    }

    // 4. Calculate final price per person
    quote.finalPricePerPerson = Math.round(quote.totalPrice / playerCount);

    // Ensure minimum price
    if (quote.totalPrice < 0) quote.totalPrice = 0;
    if (quote.finalPricePerPerson < 0) quote.finalPricePerPerson = 0;

    return quote;
}

/**
 * Fetches all active offers (for displaying on room cards)
 */
export async function getAllActiveOffers() {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('active', true);

    if (error) return [];
    return data || [];
}

/**
 * Check if a room has any active offers
 */
export async function roomHasActiveOffer(roomId) {
    const offers = await getAllActiveOffers();
    return offers.some(offer => {
        if (!offer.room_ids || offer.room_ids.length === 0) {
            return true; // Offer applies to all rooms
        }
        return offer.room_ids.includes(roomId);
    });
}
