/**
 * Unit Tests for RoomCard.jsx
 * 
 * UT-RC-01: Renders room name, difficulty badge, and player count
 * UT-RC-02: Displays offer badge when hasOffer is true
 * UT-RC-03: Links to correct room detail page (/rooms/:slug) and booking (/book/:slug)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-router-dom — provide Link and MemoryRouter stubs
jest.mock('react-router-dom', () => ({
    Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
    MemoryRouter: ({ children }) => <div>{children}</div>,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => jest.fn()
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'rooms.players': 'Players',
                'rooms.minutes': 'min',
                'rooms.easy': 'Easy',
                'rooms.medium': 'Medium',
                'rooms.hard': 'Hard',
                'rooms.expert': 'Expert',
                'rooms.learnMore': 'Learn More',
                'nav.bookNow': 'Book Now'
            };
            return translations[key] || key;
        }
    })
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Users: (props) => <span data-testid="users-icon" {...props} />,
    Clock: (props) => <span data-testid="clock-icon" {...props} />,
    Puzzle: (props) => <span data-testid="puzzle-icon" {...props} />,
    Skull: (props) => <span data-testid="skull-icon" {...props} />,
    Star: (props) => <span data-testid="star-icon" {...props} />,
    Percent: (props) => <span data-testid="percent-icon" {...props} />
}));

// Mock the Button and Badge UI components
jest.mock('../../components/ui/button', () => ({
    Button: ({ children, ...props }) => <button {...props}>{children}</button>
}));
jest.mock('../../components/ui/badge', () => ({
    Badge: ({ children, ...props }) => <span data-testid="badge" {...props}>{children}</span>
}));

const defaultRoom = {
    id: 'room-1',
    slug: 'pharaohs-curse',
    name: "Pharaoh's Curse",
    tagline: 'Can you escape the ancient tomb?',
    description: 'An immersive experience in an ancient Egyptian tomb.',
    image: '/images/pharaoh.jpg',
    minPlayers: 2,
    maxPlayers: 7,
    duration: 60,
    difficulty: 'Hard',
    isHorror: false,
    horrorToggleable: false,
    rating: 4,
    pricing: { 2: 470, 3: 460, 4: 450 }
};

import RoomCard from '../../components/rooms/RoomCard';

describe('RoomCard', () => {
    // ──────────────────────────────────
    // UT-RC-01: Renders room name, difficulty, player count
    // ──────────────────────────────────
    test('UT-RC-01: renders room name, difficulty badge, and player count', () => {
        render(<RoomCard room={defaultRoom} />);

        // Room name
        expect(screen.getByText("Pharaoh's Curse")).toBeInTheDocument();

        // Player count
        expect(screen.getByText(/2-7/)).toBeInTheDocument();
        expect(screen.getByText(/Players/)).toBeInTheDocument();

        // Duration
        expect(screen.getByText(/60/)).toBeInTheDocument();
        expect(screen.getByText(/min/)).toBeInTheDocument();

        // Difficulty (translated)
        expect(screen.getByText('Hard')).toBeInTheDocument();

        // Tagline
        expect(screen.getByText('Can you escape the ancient tomb?')).toBeInTheDocument();

        // Description
        expect(screen.getByText(/immersive experience/)).toBeInTheDocument();
    });

    // ──────────────────────────────────
    // UT-RC-02: Offer badge
    // ──────────────────────────────────
    test('UT-RC-02: displays offer badge when hasOffer is true', () => {
        render(<RoomCard room={defaultRoom} hasOffer={true} offerText="20% OFF" />);

        expect(screen.getByText('20% OFF')).toBeInTheDocument();
    });

    test('UT-RC-02b: does NOT display offer badge when hasOffer is false', () => {
        render(<RoomCard room={defaultRoom} hasOffer={false} />);

        expect(screen.queryByText('20% OFF')).not.toBeInTheDocument();
        expect(screen.queryByText('Offer')).not.toBeInTheDocument();
    });

    test('UT-RC-02c: displays default "Offer" text when hasOffer is true but no offerText', () => {
        render(<RoomCard room={defaultRoom} hasOffer={true} />);

        expect(screen.getByText('Offer')).toBeInTheDocument();
    });

    // ──────────────────────────────────
    // UT-RC-03: Correct links
    // ──────────────────────────────────
    test('UT-RC-03: links to correct room detail page and booking page', () => {
        render(<RoomCard room={defaultRoom} />);

        // "Learn More" link → /rooms/pharaohs-curse
        const learnMoreLink = screen.getByText('Learn More').closest('a');
        expect(learnMoreLink).toHaveAttribute('href', '/rooms/pharaohs-curse');

        // "Book Now" link → /book/pharaohs-curse
        const bookNowLink = screen.getByText('Book Now').closest('a');
        expect(bookNowLink).toHaveAttribute('href', '/book/pharaohs-curse');
    });

    // ──────────────────────────────────
    // Additional: Horror badge
    // ──────────────────────────────────
    test('displays horror badge when room is horror', () => {
        const horrorRoom = { ...defaultRoom, isHorror: true };
        render(<RoomCard room={horrorRoom} />);

        expect(screen.getByText('Horror')).toBeInTheDocument();
    });

    test('does NOT display horror badge when room is not horror', () => {
        render(<RoomCard room={defaultRoom} />);

        expect(screen.queryByText('Horror')).not.toBeInTheDocument();
    });

    // ──────────────────────────────────
    // Rating stars
    // ──────────────────────────────────
    test('renders correct number of rating stars', () => {
        render(<RoomCard room={defaultRoom} />);

        const stars = screen.getAllByTestId('star-icon');
        expect(stars).toHaveLength(4); // rating: 4
    });

    test('renders no stars when rating is 0', () => {
        const noRatingRoom = { ...defaultRoom, rating: 0 };
        render(<RoomCard room={noRatingRoom} />);

        expect(screen.queryAllByTestId('star-icon')).toHaveLength(0);
    });

    // ──────────────────────────────────
    // Room image
    // ──────────────────────────────────
    test('renders room image with correct alt text', () => {
        render(<RoomCard room={defaultRoom} />);

        const img = screen.getByAltText("Pharaoh's Curse");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/images/pharaoh.jpg');
    });
});
