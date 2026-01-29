import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const benefitsMap = {
    corporate: [
        { icon: Users, title: 'Team Bonding', description: 'Build stronger connections through collaborative problem-solving' },
        { icon: Clock, title: 'Flexible Scheduling', description: 'Book during work hours or after for team outings' },
        { icon: Shield, title: 'Safe Environment', description: 'Professional, controlled setting for all team members' },
        { icon: Star, title: 'Memorable Experience', description: 'Create lasting memories that boost morale' }
    ],
    school: [
        { icon: Users, title: 'Social Skills', description: 'Students learn to communicate and work together' },
        { icon: Clock, title: 'Educational Value', description: 'Problem-solving, critical thinking, and time management' },
        { icon: Shield, title: 'Supervised & Safe', description: 'Adult supervision with age-appropriate challenges' },
        { icon: Star, title: 'Fun Learning', description: 'Education through immersive entertainment' }
    ],
    birthday: [
        { icon: Users, title: 'Group Fun', description: 'Perfect activity for groups of friends' },
        { icon: Clock, title: 'All-Inclusive', description: 'Room time, party area, and optional add-ons' },
        { icon: Shield, title: 'Stress-Free', description: 'We handle the logistics, you enjoy the party' },
        { icon: Star, title: 'Unforgettable', description: "A birthday they'll remember forever" }
    ]
};

// Default fallback benefits
const defaultBenefits = [
    { icon: Users, title: 'Group Experience', description: 'Perfect for groups of all sizes' },
    { icon: Clock, title: 'Flexible Options', description: 'Customizable packages to fit your needs' },
    { icon: Shield, title: 'Professional Service', description: 'Expert coordination and support' },
    { icon: Star, title: 'Memorable Moments', description: 'Create unforgettable memories' }
];

// Hero images for each event type
const heroImages = {
    corporate: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&auto=format&fit=crop',
    school: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&auto=format&fit=crop',
    birthday: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200&q=80&auto=format&fit=crop'
};

function EventDetailPageContent({ eventType }) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Safe data access with fallbacks
    const eventInfo = eventTypes?.find(e => e.id === eventType) || null;
    const formConfig = eventFormConfig?.[eventType] || null;
    const benefits = benefitsMap?.[eventType] || defaultBenefits;
    const Icon = iconMap[eventInfo?.icon] || Building2;
    const heroImage = heroImages[eventType];


    useEffect(() => {
        if (eventType) {
            analytics.track('ViewEventPage', {
                event_type: eventType,
                page: `/events/${eventType === 'school' ? 'school-trips' : eventType}`
            });
        }
    }, [eventType]);

    // Defensive check - render fallback if config is missing
    if (!eventInfo || !formConfig) {
        return (
            <div className="min-h-screen bg-[color:var(--bg-base)]">
                <Navbar />
                <div className="flex items-center justify-center py-24 px-4">
                    <div className="text-center max-w-md">
                        <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
                        <p className="text-[color:var(--text-muted)] mb-6">
                            We couldn't find the event type you're looking for.
                        </p>
                        <Link to="/events">
                            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)]">
                                View All Events
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
                <Link to="/events" className="inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>
            </div>

            {/* Hero Section */}
            <section className="py-12 md:py-20 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <div className="space-y-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${eventInfo.color} border border-white/10`}>
                                <Icon className="w-5 h-5 text-[color:var(--brand-accent)]" />
                                <span className="text-sm font-medium text-white">Special Event</span>
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">
                                {eventInfo.title}
                            </h1>

                            <p className="text-lg text-[color:var(--text-secondary)] leading-relaxed">
                                {eventInfo.shortDescription}
                            </p>

                            {/* Bullets */}
                            <ul className="space-y-3 pt-4">
                                {eventInfo.bullets.map((bullet, index) => (
                                    <li key={index} className="flex items-start gap-3 text-[color:var(--text-secondary)]">
                                        <CheckCircle className="w-5 h-5 text-[color:var(--brand-accent)] flex-shrink-0 mt-0.5" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <div className="pt-6">
                                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 px-10 rounded-xl text-lg">
                                            Request a Quote
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[color:var(--bg-elevated)] border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="font-display text-xl text-white">
                                                {formConfig.title}
                                            </DialogTitle>
                                            <p className="text-sm text-[color:var(--text-muted)]">
                                                {formConfig.subtitle}
                                            </p>
                                        </DialogHeader>
                                        <EventForm
                                            eventType={eventType}
                                            config={formConfig}
                                            onSuccess={() => setTimeout(() => setIsFormOpen(false), 3000)}
                                        />
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
                                        alt={eventInfo.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Floating badge */}
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div className="bg-[color:var(--brand-accent)] text-black px-4 py-2 rounded-xl text-sm font-semibold">
                                            ⭐ 4.5 / 5 from 9000+ reviews
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Benefits Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {benefits.map((benefit, index) => {
                                    const BenefitIcon = benefit.icon;
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
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-full bg-[color:var(--brand-accent)] text-black font-display font-bold text-xl flex items-center justify-center mx-auto">
                                1
                            </div>
                            <h3 className="font-display font-semibold text-white">Submit Request</h3>
                            <p className="text-sm text-[color:var(--text-muted)]">
                                Fill out the form with your event details and requirements
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-full bg-[color:var(--brand-accent)] text-black font-display font-bold text-xl flex items-center justify-center mx-auto">
                                2
                            </div>
                            <h3 className="font-display font-semibold text-white">Get a Quote</h3>
                            <p className="text-sm text-[color:var(--text-muted)]">
                                Our team will contact you within 24 hours with a custom quote
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-full bg-[color:var(--brand-accent)] text-black font-display font-bold text-xl flex items-center justify-center mx-auto">
                                3
                            </div>
                            <h3 className="font-display font-semibold text-white">Enjoy!</h3>
                            <p className="text-sm text-[color:var(--text-muted)]">
                                Confirm your booking and prepare for an amazing experience
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section - Only for Corporate */}
            {eventType === 'corporate' && (
                <PartnersSection
                    title="Trusted By Leading Organizations"
                    subtitle="Join hundreds of companies that have experienced our team-building programs"
                    variant="surface"
                />
            )}

            {/* Testimonials */}
            <TestimonialsSection />

            {/* CTA Section */}
            <section className="py-16 md:py-20 px-4 md:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to Book Your {eventInfo.title}?
                    </h2>
                    <p className="text-[color:var(--text-muted)] mb-8">
                        Get in touch with our events team today and let's create something unforgettable.
                    </p>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 px-10 rounded-xl text-lg">
                                Request a Quote
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

