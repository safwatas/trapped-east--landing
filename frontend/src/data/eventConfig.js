/**
 * Event Form Configurations
 * Defines form fields for each event type based on business requirements
 */

export const eventFormConfig = {
    corporate: {
        title: 'Corporate Team Building',
        subtitle: 'Request a quote for your team event',
        fields: [
            {
                name: 'companyName',
                label: 'Company Name',
                type: 'text',
                required: true,
                placeholder: 'Enter your company name'
            },
            {
                name: 'contactPerson',
                label: 'Contact Person',
                type: 'text',
                required: true,
                placeholder: 'Full name of contact person'
            },
            {
                name: 'phone',
                label: 'Phone Number',
                type: 'tel',
                required: true,
                placeholder: '+20 1XX XXX XXXX'
            },
            {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                required: false,
                placeholder: 'work@company.com'
            },
            {
                name: 'teamSize',
                label: 'Team Size',
                type: 'select',
                required: true,
                options: [
                    { value: '5-10', label: '5-10 people' },
                    { value: '11-20', label: '11-20 people' },
                    { value: '21-30', label: '21-30 people' },
                    { value: '31-50', label: '31-50 people' },
                    { value: '50+', label: '50+ people' }
                ]
            },
            {
                name: 'preferredDate',
                label: 'Preferred Date',
                type: 'date',
                required: true
            },
            {
                name: 'preferredTime',
                label: 'Preferred Time',
                type: 'select',
                required: false,
                options: [
                    { value: 'morning', label: 'Morning (10 AM - 1 PM)' },
                    { value: 'afternoon', label: 'Afternoon (1 PM - 5 PM)' },
                    { value: 'evening', label: 'Evening (5 PM - 10 PM)' },
                    { value: 'flexible', label: 'Flexible' }
                ]
            },
            {
                name: 'activityType',
                label: 'What are you looking for?',
                type: 'multiselect',
                required: false,
                options: [
                    { value: 'escape-rooms', label: 'Escape Rooms' },
                    { value: 'team-building', label: 'Team Building Activities' },
                    { value: 'private-event', label: 'Private Venue Booking' },
                    { value: 'competition', label: 'Team Competition/Tournament' }
                ]
            },
            {
                name: 'budget',
                label: 'Estimated Budget (EGP)',
                type: 'select',
                required: false,
                options: [
                    { value: 'under-5000', label: 'Under 5,000 EGP' },
                    { value: '5000-10000', label: '5,000 - 10,000 EGP' },
                    { value: '10000-20000', label: '10,000 - 20,000 EGP' },
                    { value: '20000+', label: '20,000+ EGP' },
                    { value: 'flexible', label: 'Flexible / Discuss' }
                ]
            },
            {
                name: 'additionalNotes',
                label: 'Additional Notes',
                type: 'textarea',
                required: false,
                placeholder: 'Any special requirements or requests?'
            }
        ]
    },

    school: {
        title: 'School Trip',
        subtitle: 'Plan an educational adventure for your students',
        fields: [
            {
                name: 'schoolName',
                label: 'School Name',
                type: 'text',
                required: true,
                placeholder: 'Enter school name'
            },
            {
                name: 'coordinatorName',
                label: 'Trip Coordinator Name',
                type: 'text',
                required: true,
                placeholder: 'Full name'
            },
            {
                name: 'phone',
                label: 'Phone Number',
                type: 'tel',
                required: true,
                placeholder: '+20 1XX XXX XXXX'
            },
            {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                required: false,
                placeholder: 'school@email.com'
            },
            {
                name: 'studentCount',
                label: 'Number of Students',
                type: 'select',
                required: true,
                options: [
                    { value: '10-20', label: '10-20 students' },
                    { value: '21-40', label: '21-40 students' },
                    { value: '41-60', label: '41-60 students' },
                    { value: '61-80', label: '61-80 students' },
                    { value: '80+', label: '80+ students' }
                ]
            },
            {
                name: 'gradeLevel',
                label: 'Grade Level',
                type: 'select',
                required: true,
                options: [
                    { value: 'elementary', label: 'Elementary (Grades 1-5)' },
                    { value: 'middle', label: 'Middle School (Grades 6-8)' },
                    { value: 'high', label: 'High School (Grades 9-12)' },
                    { value: 'mixed', label: 'Mixed Grades' }
                ]
            },
            {
                name: 'chaperoneCount',
                label: 'Number of Chaperones',
                type: 'number',
                required: false,
                placeholder: 'e.g., 5'
            },
            {
                name: 'preferredDate',
                label: 'Preferred Trip Date',
                type: 'date',
                required: true
            },
            {
                name: 'alternateDate',
                label: 'Alternate Date (Optional)',
                type: 'date',
                required: false
            },
            {
                name: 'tripDuration',
                label: 'Trip Duration',
                type: 'select',
                required: false,
                options: [
                    { value: '2-hours', label: '2 Hours' },
                    { value: '3-hours', label: '3 Hours' },
                    { value: 'half-day', label: 'Half Day (4+ hours)' },
                    { value: 'full-day', label: 'Full Day' }
                ]
            },
            {
                name: 'specialRequirements',
                label: 'Special Requirements',
                type: 'textarea',
                required: false,
                placeholder: 'Any accessibility needs, dietary restrictions, or special requests?'
            }
        ]
    },

    birthday: {
        title: 'Birthday Party',
        subtitle: 'Celebrate with an unforgettable escape room experience',
        fields: [
            {
                name: 'parentName',
                label: 'Parent/Guardian Name',
                type: 'text',
                required: true,
                placeholder: 'Full name'
            },
            {
                name: 'childName',
                label: 'Birthday Child Name',
                type: 'text',
                required: true,
                placeholder: 'Child\'s name'
            },
            {
                name: 'phone',
                label: 'Phone Number',
                type: 'tel',
                required: true,
                placeholder: '+20 1XX XXX XXXX'
            },
            {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                required: false,
                placeholder: 'your@email.com'
            },
            {
                name: 'childAge',
                label: 'Child\'s Age',
                type: 'number',
                required: true,
                placeholder: 'Age in years',
                min: 6,
                max: 18
            },
            {
                name: 'guestCount',
                label: 'Number of Guests (including birthday child)',
                type: 'select',
                required: true,
                options: [
                    { value: '4-6', label: '4-6 guests' },
                    { value: '7-10', label: '7-10 guests' },
                    { value: '11-15', label: '11-15 guests' },
                    { value: '16-20', label: '16-20 guests' },
                    { value: '20+', label: '20+ guests' }
                ]
            },
            {
                name: 'partyDate',
                label: 'Party Date',
                type: 'date',
                required: true
            },
            {
                name: 'preferredTime',
                label: 'Preferred Time',
                type: 'select',
                required: true,
                options: [
                    { value: '3pm', label: '3:00 PM' },
                    { value: '4pm', label: '4:00 PM' },
                    { value: '5pm', label: '5:00 PM' },
                    { value: '6pm', label: '6:00 PM' },
                    { value: '7pm', label: '7:00 PM' }
                ]
            },
            {
                name: 'packageType',
                label: 'Party Package',
                type: 'select',
                required: false,
                options: [
                    { value: 'basic', label: 'Basic (Escape Room Only)' },
                    { value: 'standard', label: 'Standard (Room + Party Area)' },
                    { value: 'premium', label: 'Premium (Full Package with Catering)' },
                    { value: 'undecided', label: 'Not Sure - Need Guidance' }
                ]
            },
            {
                name: 'partyTheme',
                label: 'Preferred Room Theme',
                type: 'select',
                required: false,
                options: [
                    { value: 'any', label: 'Any Room' },
                    { value: 'adventure', label: 'Adventure/Mystery' },
                    { value: 'scary', label: 'Scary/Horror (Age 12+)' },
                    { value: 'detective', label: 'Detective/Investigation' }
                ]
            },
            {
                name: 'addOns',
                label: 'Additional Services',
                type: 'multiselect',
                required: false,
                options: [
                    { value: 'cake', label: 'Birthday Cake' },
                    { value: 'decorations', label: 'Party Decorations' },
                    { value: 'photographer', label: 'Photographer' },
                    { value: 'catering', label: 'Food & Beverages' }
                ]
            },
            {
                name: 'specialRequests',
                label: 'Special Requests',
                type: 'textarea',
                required: false,
                placeholder: 'Any allergies, special themes, or requests?'
            }
        ]
    }
};

export const eventTypes = [
    {
        id: 'corporate',
        title: 'Corporate Team Building',
        shortDescription: 'Boost team morale and collaboration with immersive escape room challenges.',
        image: '/images/events/corporate.jpg',
        bullets: [
            'Custom packages for teams of any size',
            'Private venue booking available',
            'Team competition & leaderboards',
            'Catering & refreshments options',
            'Certificate of completion for all participants'
        ],
        color: 'from-blue-500/20 to-blue-600/10',
        icon: 'building'
    },
    {
        id: 'school',
        title: 'School Trips',
        shortDescription: 'Educational adventures that develop problem-solving and teamwork skills.',
        image: '/images/events/school.jpg',
        bullets: [
            'Age-appropriate room selection',
            'Educational learning outcomes',
            'Group discounts available',
            'Flexible scheduling for school hours',
            'Safe, supervised environment'
        ],
        color: 'from-green-500/20 to-green-600/10',
        icon: 'graduation-cap'
    },
    {
        id: 'birthday',
        title: 'Birthday Parties',
        shortDescription: 'Create unforgettable memories with a thrilling escape room birthday celebration.',
        image: '/images/events/birthday.jpg',
        bullets: [
            'Exclusive party packages',
            'Private party area included',
            'Customizable themes',
            'Birthday cake & decoration add-ons',
            'Photo opportunities & souvenirs'
        ],
        color: 'from-purple-500/20 to-purple-600/10',
        icon: 'cake'
    }
];
