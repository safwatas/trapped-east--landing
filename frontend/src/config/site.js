/**
 * Site Configuration - Single Source of Truth
 * All contact info, social links, and brand assets are defined here.
 * Import this file wherever you need these values.
 */

export const siteConfig = {
    // Brand
    name: 'Trapped Egypt',
    branch: 'New Cairo',
    tagline: 'Escape Or Get Caught!',
    description: "Egypt's #1 Escape Room Experience. Can you escape before time runs out?",

    // Logo
    logo: '/logo.svg',
    logoAlt: 'Trapped Egypt Logo',

    // Contact
    phone: '+201028885599',
    phoneDisplay: '+20 102 888 5599',
    whatsapp: '+201028885599',
    email: 'info@trappedegypt.com',

    // Address
    address: 'Fifth Settlement, Street 90, Behind Momen & Bashar Supermarket, New Cairo ',
    addressShort: 'New Cairo - Fifth Settlement',

    // Social Links
    facebook: 'https://www.facebook.com/profile.php?id=61574052269695&mibextid=wwXIfr&rdid=qtXJgNVqrxdZV3Qs&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DQDpEo8oz%2F%3Fmibextid%3DwwXIfr#',
    instagram: 'https://www.instagram.com/trapped.east',

    // Maps
    googleMapsUrl: 'https://www.google.com/maps/place/Trapped+Egypt+(East)/@30.0298352,31.4619737,17z/data=!4m16!1m9!3m8!1s0x14583ce7eb01906f:0xb83683269119b2ca!2sTrapped+Egypt+(East)!8m2!3d30.0298352!4d31.4619737!9m1!1b1!16s%2Fg%2F11bxdz6p9q!3m5!1s0x14583ce7eb01906f:0xb83683269119b2ca!8m2!3d30.0298352!4d31.4619737!16s%2Fg%2F11bxdz6p9q!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D',
    googleMapsEmbed: '2FH6+WQ قسم أول القاهرة الجديدة',

    // Opening Hours
    openingHours: {
        everyday: '3:00 PM - 3:00 AM',
        lastSlot: '1:30 AM'
    }
};

// Helper to get WhatsApp link
export const getWhatsAppLink = (message = '') => {
    const phone = siteConfig.whatsapp.replace('+', '');
    return message
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${phone}`;
};

// Helper to get phone link
export const getPhoneLink = () => `tel:${siteConfig.phone}`;

// Helper to get email link
export const getEmailLink = () => `mailto:${siteConfig.email}`;

export default siteConfig;
