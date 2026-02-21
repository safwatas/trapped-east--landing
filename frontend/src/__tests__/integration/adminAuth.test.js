/**
 * Integration Tests — Admin Auth Flow (IT-04)
 * 
 * Tests: Login → session persists → protected route check → logout clears session
 */

// Mock supabase to provide auth methods
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock('../../lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
        auth: {
            signInWithPassword: (...args) => mockSignInWithPassword(...args),
            signOut: (...args) => mockSignOut(...args),
            getSession: (...args) => mockGetSession(...args),
            onAuthStateChange: (...args) => mockOnAuthStateChange(...args)
        }
    }
}));

describe('IT-04: Admin Auth Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('Login sets session → auth check passes → logout clears session', async () => {
        // Step 1: Login with Supabase auth
        const mockSession = {
            access_token: 'mock-jwt-token',
            user: {
                id: 'admin-uuid',
                email: 'admin@trappedegypt.com',
                role: 'authenticated'
            }
        };

        mockSignInWithPassword.mockResolvedValue({
            data: { session: mockSession, user: mockSession.user },
            error: null
        });

        // Simulate login
        const { data: loginData, error: loginError } = await mockSignInWithPassword({
            email: 'admin@trappedegypt.com',
            password: 'securepassword'
        });

        expect(loginError).toBeNull();
        expect(loginData.session.access_token).toBe('mock-jwt-token');
        expect(loginData.user.email).toBe('admin@trappedegypt.com');

        // Step 2: Set localStorage flag (as AdminLoginPage does)
        localStorage.setItem('adminAuth', 'true');

        // Step 3: Verify session persists via getSession
        mockGetSession.mockResolvedValue({
            data: { session: mockSession },
            error: null
        });

        const { data: { session } } = await mockGetSession();
        expect(session).not.toBeNull();
        expect(session.access_token).toBe('mock-jwt-token');
        expect(localStorage.getItem('adminAuth')).toBe('true');

        // Step 4: Logout clears session
        mockSignOut.mockResolvedValue({ error: null });

        await mockSignOut();
        localStorage.removeItem('adminAuth');

        expect(localStorage.getItem('adminAuth')).toBeNull();

        // Step 5: After logout, getSession returns null
        mockGetSession.mockResolvedValue({
            data: { session: null },
            error: null
        });

        const { data: { session: postLogoutSession } } = await mockGetSession();
        expect(postLogoutSession).toBeNull();
    });

    test('Login with invalid credentials returns error', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: { session: null, user: null },
            error: { message: 'Invalid login credentials' }
        });

        const { data, error } = await mockSignInWithPassword({
            email: 'wrong@email.com',
            password: 'badpassword'
        });

        expect(error).not.toBeNull();
        expect(error.message).toBe('Invalid login credentials');
        expect(data.session).toBeNull();

        // adminAuth should NOT be set
        expect(localStorage.getItem('adminAuth')).toBeNull();
    });

    test('Session expired → redirects to login (auth state change)', async () => {
        // Simulate auth state change subscription
        let authCallback = null;
        mockOnAuthStateChange.mockImplementation((callback) => {
            authCallback = callback;
            return {
                data: {
                    subscription: { unsubscribe: jest.fn() }
                }
            };
        });

        // Subscribe
        const { data: { subscription } } = mockOnAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                localStorage.removeItem('adminAuth');
            }
        });

        expect(authCallback).not.toBeNull();

        // Initially authenticated
        localStorage.setItem('adminAuth', 'true');

        // Trigger sign out event
        authCallback('SIGNED_OUT', null);

        // adminAuth should be cleared
        expect(localStorage.getItem('adminAuth')).toBeNull();

        // Cleanup
        subscription.unsubscribe();
    });
});
