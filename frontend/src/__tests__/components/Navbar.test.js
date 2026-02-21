/**
 * Unit Tests for Navbar.jsx
 * 
 * UT-NB-01: Renders all navigation links (Home, Rooms, Special Events, Find Us, Contact)
 * UT-NB-02: "Book Now" CTA button is visible and links to /rooms
 * UT-NB-03: Language switcher is rendered
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-router-dom — provide Link, useLocation
jest.mock('react-router-dom', () => ({
    Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => jest.fn()
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'nav.home': 'Home',
                'nav.rooms': 'Rooms',
                'nav.specialEvents': 'Special Events',
                'nav.findUs': 'Find Us',
                'nav.contact': 'Contact',
                'nav.bookNow': 'Book Now'
            };
            return translations[key] || key;
        },
        i18n: {
            language: 'en',
            changeLanguage: jest.fn()
        }
    })
}));

// Mock the LanguageSwitcher component
jest.mock('../../components/ui/LanguageSwitcher', () => {
    return function MockLanguageSwitcher({ variant }) {
        return <button data-testid="language-switcher" data-variant={variant}>EN | عربي</button>;
    };
});

// Mock site config
jest.mock('../../config/site', () => ({
    siteConfig: {
        logo: '/logo.svg',
        logoAlt: 'Trapped Egypt Logo',
        phone: '+201028885599',
        phoneDisplay: '+20 102 888 5599'
    },
    getPhoneLink: () => 'tel:+201028885599'
}));

// Mock the Sheet components from radix-ui
jest.mock('../../components/ui/sheet', () => ({
    Sheet: ({ children }) => <div>{children}</div>,
    SheetContent: ({ children }) => <div data-testid="sheet-content">{children}</div>,
    SheetTrigger: ({ children }) => <div data-testid="sheet-trigger">{children}</div>
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Menu: (props) => <span data-testid="menu-icon" {...props} />,
    X: (props) => <span data-testid="x-icon" {...props} />,
    Phone: (props) => <span data-testid="phone-icon" {...props} />
}));

// Mock UI button
jest.mock('../../components/ui/button', () => ({
    Button: ({ children, ...props }) => <button {...props}>{children}</button>
}));

import Navbar from '../../components/layout/Navbar';

describe('Navbar', () => {
    // ──────────────────────────────────
    // UT-NB-01: All navigation links
    // ──────────────────────────────────
    test('UT-NB-01: renders all navigation links', () => {
        render(<Navbar />);

        // Desktop + mobile nav links
        expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Rooms').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Special Events').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Find Us').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1);
    });

    test('UT-NB-01b: navigation links point to correct paths', () => {
        render(<Navbar />);

        const links = screen.getAllByRole('link');
        const pathsPresent = links.map(l => l.getAttribute('href'));

        expect(pathsPresent).toContain('/');
        expect(pathsPresent).toContain('/rooms');
        expect(pathsPresent).toContain('/events');
        expect(pathsPresent).toContain('/find-us');
        expect(pathsPresent).toContain('/contact');
    });

    // ──────────────────────────────────
    // UT-NB-02: Book Now CTA
    // ──────────────────────────────────
    test('UT-NB-02: "Book Now" CTA button is visible and links to /rooms', () => {
        render(<Navbar />);

        // There are multiple "Book Now" buttons (desktop + mobile)
        const bookNowButtons = screen.getAllByText('Book Now');
        expect(bookNowButtons.length).toBeGreaterThanOrEqual(1);

        // At least one should be wrapped in a link to /rooms
        const bookNowLink = bookNowButtons[0].closest('a');
        expect(bookNowLink).toHaveAttribute('href', '/rooms');
    });

    // ──────────────────────────────────
    // UT-NB-03: Language switcher
    // ──────────────────────────────────
    test('UT-NB-03: language switcher is rendered', () => {
        render(<Navbar />);

        const switchers = screen.getAllByTestId('language-switcher');
        expect(switchers.length).toBeGreaterThanOrEqual(1);

        // Verify it gets the minimal variant
        expect(switchers[0]).toHaveAttribute('data-variant', 'minimal');
    });

    // ──────────────────────────────────
    // Logo rendering
    // ──────────────────────────────────
    test('renders logo with link to home page', () => {
        render(<Navbar />);

        const logoImg = screen.getAllByAltText('Trapped Egypt Logo');
        expect(logoImg.length).toBeGreaterThanOrEqual(1);

        const homeLink = logoImg[0].closest('a');
        expect(homeLink).toHaveAttribute('href', '/');
    });

    // ──────────────────────────────────
    // Phone number display
    // ──────────────────────────────────
    test('displays phone number with correct tel: link', () => {
        render(<Navbar />);

        const phoneLinks = screen.getAllByText('+20 102 888 5599');
        expect(phoneLinks.length).toBeGreaterThanOrEqual(1);

        const telLink = phoneLinks[0].closest('a');
        expect(telLink).toHaveAttribute('href', 'tel:+201028885599');
    });

    // ──────────────────────────────────
    // Mobile menu
    // ──────────────────────────────────
    test('renders mobile menu trigger', () => {
        render(<Navbar />);

        const trigger = screen.getByTestId('sheet-trigger');
        expect(trigger).toBeInTheDocument();
    });
});
