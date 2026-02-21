/**
 * Unit Tests for externalCustomerService.js
 * 
 * Tests utility functions for customer data handling:
 * phone masking, E.164 normalization, CSV generation, and name extraction.
 */

import {
    maskPhoneNumber,
    normalizePhoneForMeta,
    generateCustomerCSV,
    getCustomerName,
    getCustomerPhone,
    getCustomerDisplayValue
} from '../../lib/externalCustomerService';

// ──────────────────────────────────
// UT-EC-01: maskPhoneNumber
// ──────────────────────────────────
describe('maskPhoneNumber', () => {
    test('UT-EC-01: correctly masks middle digits of Egyptian phone', () => {
        expect(maskPhoneNumber('01012345678')).toBe('010****5678');
    });

    test('masks phone with spaces', () => {
        expect(maskPhoneNumber('010 1234 5678')).toBe('010****5678');
    });

    test('handles short phone numbers', () => {
        expect(maskPhoneNumber('12345')).toBe('12****');
    });

    test('returns --- for null/undefined/non-string', () => {
        expect(maskPhoneNumber(null)).toBe('---');
        expect(maskPhoneNumber(undefined)).toBe('---');
        expect(maskPhoneNumber(123)).toBe('---');
    });

    test('masks international format phone', () => {
        expect(maskPhoneNumber('+201012345678')).toBe('+20****5678');
    });
});

// ──────────────────────────────────
// UT-EC-02: normalizePhoneForMeta
// ──────────────────────────────────
describe('normalizePhoneForMeta', () => {
    test('UT-EC-02: adds +20 country code for Egyptian local format', () => {
        expect(normalizePhoneForMeta('01012345678')).toBe('+201012345678');
    });

    test('adds + prefix for Egyptian number starting with 20', () => {
        expect(normalizePhoneForMeta('201012345678')).toBe('+201012345678');
    });

    test('keeps already formatted number unchanged', () => {
        expect(normalizePhoneForMeta('+201012345678')).toBe('+201012345678');
    });

    test('handles number with spaces and dashes', () => {
        expect(normalizePhoneForMeta('010 1234 5678')).toBe('+201012345678');
    });

    test('returns empty string for null/undefined', () => {
        expect(normalizePhoneForMeta(null)).toBe('');
        expect(normalizePhoneForMeta(undefined)).toBe('');
    });
});

// ──────────────────────────────────
// UT-EC-03/04: generateCustomerCSV
// ──────────────────────────────────
describe('generateCustomerCSV', () => {
    const customers = [
        {
            firstname: 'Ahmed',
            lastname: 'Hassan',
            phonenumber: '01012345678',
            email: 'ahmed@test.com',
            createdAt: '2026-01-15T10:00:00Z'
        },
        {
            firstname: 'Sara',
            lastname: 'Ali',
            phonenumber: '01098765432',
            email: 'sara@test.com',
            createdAt: '2026-02-10T14:30:00Z'
        }
    ];

    test('UT-EC-03: produces valid CSV with correct headers', () => {
        const csv = generateCustomerCSV(customers);
        const lines = csv.split('\n');

        // First line should be headers
        expect(lines[0]).toContain('firstname');
        expect(lines[0]).toContain('lastname');
        expect(lines[0]).toContain('phonenumber');
        expect(lines[0]).toContain('email');

        // Should have header + 2 data rows
        expect(lines.length).toBe(3);

        // Data rows should contain the customer data
        expect(lines[1]).toContain('Ahmed');
        expect(lines[2]).toContain('Sara');
    });

    test('UT-EC-04: Meta format includes normalized phone and specific headers', () => {
        const csv = generateCustomerCSV(customers, { metaFormat: true });
        const lines = csv.split('\n');

        // Meta headers: phone, email, fn, ln
        expect(lines[0]).toBe('phone,email,fn,ln');

        // Phone should be normalized to E.164
        expect(lines[1]).toContain('+201012345678');
        expect(lines[2]).toContain('+201098765432');

        // Email should be lowercase
        expect(lines[1]).toContain('ahmed@test.com');
    });

    test('returns empty string for empty array', () => {
        expect(generateCustomerCSV([])).toBe('');
        expect(generateCustomerCSV(null)).toBe('');
    });
});

// ──────────────────────────────────
// UT-EC-05: escapeCSVField (tested indirectly)
// ──────────────────────────────────
describe('CSV escaping (via generateCustomerCSV)', () => {
    test('UT-EC-05: properly escapes commas and quotes in CSV fields', () => {
        const customers = [
            {
                firstname: 'Ahmed, Jr.',
                lastname: 'Hassan "The Great"',
                phonenumber: '01012345678',
                email: 'test@test.com'
            }
        ];

        const csv = generateCustomerCSV(customers);

        // Commas in values should be wrapped in quotes
        expect(csv).toContain('"Ahmed, Jr."');
        // Quotes in values should be doubled
        expect(csv).toContain('"Hassan ""The Great"""');
    });
});

// ──────────────────────────────────
// UT-EC-06: getCustomerName
// ──────────────────────────────────
describe('getCustomerName', () => {
    test('UT-EC-06: handles various field name combinations', () => {
        // camelCase
        expect(getCustomerName({ firstName: 'John', lastName: 'Doe' })).toBe('John Doe');

        // lowercase
        expect(getCustomerName({ firstname: 'Ahmed', lastname: 'Hassan' })).toBe('Ahmed Hassan');

        // snake_case
        expect(getCustomerName({ first_name: 'Sara', last_name: 'Ali' })).toBe('Sara Ali');

        // name field
        expect(getCustomerName({ name: 'Omar Khaled' })).toBe('Omar Khaled');

        // customerName field
        expect(getCustomerName({ customerName: 'Fatma Mohamed' })).toBe('Fatma Mohamed');
    });

    test('returns Unknown for null customer', () => {
        expect(getCustomerName(null)).toBe('Unknown');
    });

    test('returns Unknown for customer with no name fields', () => {
        expect(getCustomerName({ phone: '010' })).toBe('Unknown');
    });

    test('handles first name only', () => {
        expect(getCustomerName({ firstname: 'Ahmed' })).toBe('Ahmed');
    });
});

// ──────────────────────────────────
// getCustomerPhone
// ──────────────────────────────────
describe('getCustomerPhone', () => {
    test('extracts phone from various field names', () => {
        expect(getCustomerPhone({ phonenumber: '010' })).toBe('010');
        expect(getCustomerPhone({ phone: '011' })).toBe('011');
        expect(getCustomerPhone({ phoneNumber: '012' })).toBe('012');
        expect(getCustomerPhone({ phone_number: '015' })).toBe('015');
    });

    test('returns empty string for null customer', () => {
        expect(getCustomerPhone(null)).toBe('');
    });
});

// ──────────────────────────────────
// getCustomerDisplayValue
// ──────────────────────────────────
describe('getCustomerDisplayValue', () => {
    test('returns --- for null/undefined/empty values', () => {
        expect(getCustomerDisplayValue(null, 'name')).toBe('---');
        expect(getCustomerDisplayValue({ name: null }, 'name')).toBe('---');
        expect(getCustomerDisplayValue({ name: undefined }, 'name')).toBe('---');
        expect(getCustomerDisplayValue({ name: '' }, 'name')).toBe('---');
    });

    test('returns string value for regular fields', () => {
        expect(getCustomerDisplayValue({ name: 'Ahmed' }, 'name')).toBe('Ahmed');
    });

    test('formats date fields', () => {
        const result = getCustomerDisplayValue({ createdAt: '2026-01-15T10:00:00Z' }, 'createdAt');
        expect(result).toContain('2026');
        expect(result).toContain('Jan');
    });
});
