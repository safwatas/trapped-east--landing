import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, GraduationCap, Cake, CheckCircle, Users, Clock, Shield, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import EventForm from './EventForm';
import ErrorBoundary from '../ErrorBoundary';
import { PartnersSection, TestimonialsSection } from './PartnersSection';
import { eventFormConfig, eventTypes } from '../../data/eventConfig';
import { analytics } from '../../lib/analytics';

const iconMap = {
    'building': Building2,
    'graduation-cap': GraduationCap,
    'cake': Cake
};

// Hero images for each event type - using local images
const heroImages = {
    corporate: '/images/events/corporate.jpg',
    school: '/images/events/school-trips.png',
    birthday: '/images/events/birthday.png'
};

function EventDetailPageContent({ eventType }) {
    const { t, i18n } = useTranslation();
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Map event ID to translation key
    const getEventTranslationKey = (eventId) => {
        const keyMap = {
            'corporate': 'corporate',
            'school': 'school',
            'birthday': 'birthday'
        };
        return keyMap[eventId] || eventId;
    };

    const translationKey = getEventTranslationKey(eventType);

    // Get translated content
    const eventTitle = t(`events.${translationKey}.title`);
    const eventShortDesc = t(`events.${translationKey}.shortDesc`);
    const eventBullets = t(`events.${translationKey}.bullets`, { returnObjects: true }) || [];

    // Get translated benefits
    const benefitsItems = t(`events.${translationKey}.benefitsItems`, { returnObjects: true }) || [];

    // Get how it works steps
    const howItWorksSteps = [
        { title: t('events.howItWorks.step1Title'), desc: t('events.howItWorks.step1Desc') },
        { title: t('events.howItWorks.step2Title'), desc: t('events.howItWorks.step2Desc') },
        { title: t('events.howItWorks.step3Title'), desc: t('events.howItWorks.step3Desc') }
    ];

    // Safe data access with fallbacks
    const eventInfo = eventTypes?.find(e => e.id === eventType) || null;
    const formConfig = eventFormConfig?.[eventType] || null;
    const Icon = iconMap[eventInfo?.icon] || Building2;
    const heroImage = heroImages[eventType];

    // Icons for benefits
    const benefitIcons = [Users, Clock, Shield, Star];

    useEffect(() => {
        if (eventType) {
            analytics.track('ViewEventPage', {
                event_type: eventType,
                page: `/events/${eventType === 'school' ? 'school-trips' : eventType}`,
                language: i18n.language
            });
        }
    }, [eventType, i18n.language]);

    // Defensive check - render fallback if config is missing
    if (!eventInfo || !formConfig) {
        return (
            <div className="min-h-screen bg-[color:var(--bg-base)]">
                <Navbar />
                <div className="flex items-center justify-center py-24 px-4">
                    <div className="text-center max-w-md">
                        <h1 className="text-2xl font-bold text-white mb-4">{t('events.notFound')}</h1>
                        <p className="text-[color:var(--text-muted)] mb-6">
                            {t('events.notFoundDesc')}
                        </p>
                        <Link to="/events">
                            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]">
                                {t('events.viewAll')}
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[color:var(--bg-base)]">
            <Navbar />

            {/* Back Button */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
                <Link to="/events" className="inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors ltr-flex">
                    <ArrowLeft className="w-4 h-4" />
                    {t('events.backToEvents')}
                </Link>
            </div>

            {/* Hero Section */}
            <section className="py-12 md:py-20 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <div className="space-y-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${eventInfo.color} border border-white/10 ltr-flex`}>
                                <Icon className="w-5 h-5 text-[color:var(--brand-accent)]" />
                                <span className="text-sm font-medium text-white">{t('nav.specialEvents')}</span>
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">
                                {eventTitle}
                            </h1>

                            <p className="text-lg text-[color:var(--text-secondary)] leading-relaxed">
                                {eventShortDesc}
                            </p>

                            {/* Bullets */}
                            {Array.isArray(eventBullets) && eventBullets.length > 0 && (
                                <ul className="space-y-3 pt-4">
                                    {eventBullets.map((bullet, index) => (
                                        <li key={index} className="flex items-start gap-3 text-[color:var(--text-secondary)]">
                                            <CheckCircle className="w-5 h-5 text-[color:var(--brand-accent)] flex-shrink-0 mt-0.5" />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* CTA */}
                            <div className="pt-6">
                                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 px-10 rounded-xl text-lg">
                                            {t('events.requestQuote')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[color:var(--bg-elevated)] border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="font-display text-xl text-white">
                                                {eventTitle}
                                            </DialogTitle>
                                            <p className="text-sm text-[color:var(--text-muted)]">
                                                {t('events.formSubtitle')}
                                            </p>
                                        </DialogHeader>
                                        {formConfig && (
                                            <EventForm
                                                eventType={eventType}
                                                config={formConfig}
                                                onSuccess={() => setTimeout(() => setIsFormOpen(false), 3000)}
                                            />
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Hero Image + Benefits Grid */}
                        <div className="space-y-6">
                            {/* Hero Image */}
                            {heroImage && (
                                <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl">
                                    <img
                                        src={heroImage}
                                        alt={eventTitle}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.style.opacity = '0.5';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Floating badge */}
                                    <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 right-4 flex justify-between items-end">
                                        <div className="bg-[color:var(--brand-accent)] text-black px-4 py-2 rounded-xl text-sm font-semibold">
                                            ⭐ 4.5 / 5 {t('events.fromReviews')}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Benefits Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {Array.isArray(benefitsItems) && benefitsItems.map((benefit, index) => {
                                    const BenefitIcon = benefitIcons[index] || Star;
                                    return (
                                        <div
                                            key={index}
                                            className="p-4 rounded-xl bg-[color:var(--bg-surface)] border border-white/10 hover:border-[color:var(--brand-accent)]/30 transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-[color:var(--brand-accent)]/10 flex items-center justify-center mb-2">
                                                <BenefitIcon className="w-4 h-4 text-[color:var(--brand-accent)]" />
                                            </div>
                                            <h3 className="font-display font-semibold text-white text-sm mb-0.5">{benefit.title}</h3>
                                            <p className="text-xs text-[color:var(--text-muted)] leading-relaxed">{benefit.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 md:py-24 px-4 md:px-8 bg-[color:var(--bg-surface)]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-12">
                        {t('events.howItWorks.title')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {howItWorksSteps.map((step, index) => (
                            <div key={index} className="space-y-4">
                                <div className="w-12 h-12 rounded-full bg-[color:var(--brand-accent)] text-black font-display font-bold text-xl flex items-center justify-center mx-auto">
                                    {index + 1}
                                </div>
                                <h3 className="font-display font-semibold text-white">{step.title}</h3>
                                <p className="text-sm text-[color:var(--text-muted)]">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Section - Only for Corporate */}
            {eventType === 'corporate' && (
                <PartnersSection
                    title={t('events.partners.title')}
                    subtitle={t('events.partners.subtitle')}
                    variant="surface"
                />
            )}

            {/* Testimonials */}
            <TestimonialsSection />

            {/* CTA Section */}
            <section className="py-16 md:py-20 px-4 md:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                        {t('events.ctaTitle', { eventType: eventTitle })}
                    </h2>
                    <p className="text-[color:var(--text-muted)] mb-8">
                        {t('events.ctaSubtitle')}
                    </p>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 px-10 rounded-xl text-lg">
                                {t('events.requestQuote')}
                            </Button>
                        </DialogTrigger>
                    </Dialog>
                </div>
            </section>

            <Footer />
        </div>
    );
}

// Wrap with ErrorBoundary for crash protection
export default function EventDetailPage({ eventType }) {
    return (
        <ErrorBoundary
            title="Event Page Error"
            message="We encountered an issue loading this event page. Please try again."
        >
            <EventDetailPageContent eventType={eventType} />
        </ErrorBoundary>
    );
}
