/**
 * Adapter Layer
 * Maps Supabase database objects to the format expected by the frontend components.
 */

export const roomAdapter = (dbRoom, language = 'en') => {
    if (!dbRoom) return null;

    // Sort images by order_index
    const sortedImages = dbRoom.room_images
        ? [...dbRoom.room_images].sort((a, b) => a.order_index - b.order_index)
        : [];

    // Get localized content based on language
    // If Arabic content exists and language is 'ar', use Arabic; otherwise fallback to English
    const getName = () => {
        if (language === 'ar' && dbRoom.name_ar) return dbRoom.name_ar;
        return dbRoom.name;
    };

    const getTagline = () => {
        if (language === 'ar' && dbRoom.tagline_ar) return dbRoom.tagline_ar;
        return dbRoom.tagline;
    };

    const getDescription = () => {
        if (language === 'ar' && dbRoom.description_ar) return dbRoom.description_ar;
        return dbRoom.description;
    };

    return {
        id: dbRoom.id,
        slug: dbRoom.slug,
        name: getName(),
        name_en: dbRoom.name,
        name_ar: dbRoom.name_ar || null,
        tagline: getTagline(),
        tagline_en: dbRoom.tagline,
        tagline_ar: dbRoom.tagline_ar || null,
        description: getDescription(),
        description_en: dbRoom.description,
        description_ar: dbRoom.description_ar || null,
        minPlayers: dbRoom.min_players,
        maxPlayers: dbRoom.max_players,
        duration: dbRoom.duration,
        difficulty: dbRoom.difficulty,
        isHorror: dbRoom.is_horror,
        horrorToggleable: dbRoom.horror_toggleable,
        nonHorrorAvailable: dbRoom.non_horror_available,
        // Use first image as main image
        image: sortedImages[0]?.image_url || 'https://trappedegypt.com/wp-content/uploads/2022/11/TRAPPED-NEW-CAIRO-ROOMS.jpg.webp',
        images: sortedImages.map(img => img.image_url),
        // Map pricing tiers to object
        pricing: dbRoom.pricing_tiers?.reduce((acc, tier) => {
            acc[tier.player_count] = tier.price_per_person;
            return acc;
        }, {}) || {}
    };
};

/**
 * Get localized room data based on current language
 */
export const getLocalizedRoom = (room, language) => {
    if (!room) return null;

    return {
        ...room,
        name: language === 'ar' && room.name_ar ? room.name_ar : room.name_en || room.name,
        tagline: language === 'ar' && room.tagline_ar ? room.tagline_ar : room.tagline_en || room.tagline,
        description: language === 'ar' && room.description_ar ? room.description_ar : room.description_en || room.description
    };
};


export const bookingAdapter = (dbBooking) => {
    if (!dbBooking) return null;
    return {
        id: dbBooking.id,
        customerName: dbBooking.customer_name,
        customerPhone: dbBooking.customer_phone,
        customerEmail: dbBooking.customer_email,
        roomName: dbBooking.rooms?.name || 'Unknown Room',
        date: dbBooking.booking_date,
        timeSlot: dbBooking.time_slot,
        players: dbBooking.player_count,
        totalPrice: dbBooking.total_price,
        status: dbBooking.status,
        notes: dbBooking.internal_notes || '',
        utmSource: dbBooking.utm_source,
        utmMedium: dbBooking.utm_medium,
        utmCampaign: dbBooking.utm_campaign,
        utmAdset: dbBooking.utm_adset,
        utmAd: dbBooking.utm_ad,
        fbclid: dbBooking.fbclid,
        createdAt: dbBooking.created_at
    };
};
