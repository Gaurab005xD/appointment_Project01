// ---------------------------------------------------------------
// Business content for the prototype.
// In the full system this comes from the admin "website content"
// settings (BusinessSettings, Service, FAQ tables).
// ---------------------------------------------------------------

export const business = {
    name: "Easy Financial and Tax Solution Inc.",
    accountant: "Abdullatif Rizayee, CPA",
    tagline: "Personal and small-business accounting in Calgary",
    phone: "(403) 555-0142",
    phoneHref: "tel:+14035550142",
    email: "latifrizayee@northline.com",
    address: "Suite 210, Downtown Calgary, AB",
    serviceArea: "In person in Calgary, online anywhere in Alberta",
    timezone: "America/Edmonton",
};

export type AppointmentMode = "In person" | "Online" | "In person or online";

export type Service = {
    id: string;
    name: string;
    summary: string;
    description: string;
    includes: string[];
    duration: number; // minutes
    price?: number;
    currency: "CAD";
    mode: AppointmentMode;
    location?: string;
    active: boolean;
    buffer: number; // minutes kept free after the appointment
    maxClients: number;
};

export const services: Service[] = [
    {
        id: "tax-preparation",
        name: "Tax Preparation",
        summary: "Your personal T1 return, prepared and filed.",
        description:
            "We review your slips, receipts and credits, prepare your return, and file it with the CRA. Couples can book one appointment for both returns.",
        includes: [
            "T4, T5 and RRSP slips",
            "Medical, tuition and childcare credits",
            "E-filing and a copy for your records",
        ],
        duration: 60,
        price: 180,
        currency: "CAD",
        mode: "In person or online",
        location: "Calgary office or video call",
        active: true,
        buffer: 15,
        maxClients: 1,
    },
    {
        id: "bookkeeping",
        name: "Bookkeeping",
        summary: "Clean, reconciled books for your business.",
        description:
            "A working session to reconcile accounts, categorize transactions and set up a monthly routine you can keep up with.",
        includes: [
            "Bank and credit card reconciliation",
            "QuickBooks or Xero clean-up",
            "Monthly checklist for your team",
        ],
        duration: 60,
        price: 150,
        currency: "CAD",
        mode: "Online",
        location: "Video call",
        active: true,
        buffer: 15,
        maxClients: 1,
    },
    {
        id: "accounting-consultation",
        name: "Accounting Consultation",
        summary: "A focused half hour for your questions.",
        description:
            "Starting a business, planning a big purchase, or unsure about a CRA letter? Bring your questions and leave with clear next steps.",
        includes: [
            "Business structure and registration",
            "CRA letters and reassessments",
            "Written summary after the call",
        ],
        duration: 30,
        price: 75,
        currency: "CAD",
        mode: "In person or online",
        location: "Calgary office or video call",
        active: true,
        buffer: 0,
        maxClients: 1,
    },
    {
        id: "business-tax",
        name: "Small Business Tax Filing",
        summary: "Sole proprietor and corporate returns.",
        description:
            "Year-end review and filing for sole proprietors (T2125) and small corporations (T2), including a plan for next year's instalments.",
        includes: [
            "T2125 or T2 return",
            "Expense and vehicle log review",
            "Instalment plan for next year",
        ],
        duration: 90,
        price: 420,
        currency: "CAD",
        mode: "In person",
        location: "Calgary office",
        active: true,
        buffer: 15,
        maxClients: 1,
    },
    {
        id: "gst-filing",
        name: "GST Return Filing",
        summary: "Quarterly or annual GST, done on time.",
        description:
            "We calculate your GST collected and input tax credits, file the return, and remind you before the next one is due.",
        includes: [
            "GST/HST calculation",
            "Input tax credit review",
            "Filing reminder for next period",
        ],
        duration: 30,
        price: 95,
        currency: "CAD",
        mode: "Online",
        location: "Video call",
        active: true,
        buffer: 0,
        maxClients: 1,
    },
];

export const activeServices = services.filter((service) => service.active);

export function getService(id: string | null | undefined) {
    return services.find((service) => service.id === id);
}

export function formatPrice(service: Service) {
    if (service.price === undefined) return "Price on request";
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: service.currency,
        maximumFractionDigits: 0,
    }).format(service.price);
}

export function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

// ---------------------------------------------------------------
// Working hours. Minutes from midnight; several periods per day
// so the lunch break is excluded automatically.
// 0 = Sunday … 6 = Saturday
// ---------------------------------------------------------------
export type Period = { start: number; end: number };

export const workingHours: Record<number, Period[]> = {
    0: [],
    1: [
        { start: 9 * 60, end: 12 * 60 },
        { start: 13 * 60, end: 17 * 60 },
    ],
    2: [
        { start: 9 * 60, end: 12 * 60 },
        { start: 13 * 60, end: 17 * 60 },
    ],
    3: [
        { start: 9 * 60, end: 12 * 60 },
        { start: 13 * 60, end: 19 * 60 },
    ],
    4: [
        { start: 9 * 60, end: 12 * 60 },
        { start: 13 * 60, end: 17 * 60 },
    ],
    5: [
        { start: 9 * 60, end: 12 * 60 },
        { start: 13 * 60, end: 15 * 60 },
    ],
    6: [{ start: 10 * 60, end: 13 * 60 }],
};

export const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export const hoursSummary = [
    { days: "Monday, Tuesday, Thursday", hours: "9:00 am – 5:00 pm" },
    { days: "Wednesday", hours: "9:00 am – 7:00 pm" },
    { days: "Friday", hours: "9:00 am – 3:00 pm" },
    { days: "Saturday", hours: "10:00 am – 1:00 pm" },
    { days: "Sunday and holidays", hours: "Closed" },
];

// Alberta statutory holidays (office closed)
export const holidays: Record<string, string> = {
    "2026-11-11": "Remembrance Day",
    "2026-12-24": "Office closed",
    "2026-12-25": "Christmas Day",
    "2026-12-26": "Boxing Day",
    "2026-12-31": "Office closed",
    "2027-01-01": "New Year's Day",
    "2027-02-15": "Family Day",
    "2027-03-26": "Good Friday",
    "2027-05-24": "Victoria Day",
    "2027-07-01": "Canada Day",
};

export const policies = {
    bookingWindowDays: 60,
    minimumNoticeMinutes: 120,
    cancellationHours: 24,
    slotStep: 30,
    cancellationText:
        "You can cancel or reschedule online up to 24 hours before your appointment. Later changes need a phone call, and missed appointments may be charged in full.",
    documentsText:
        "Please bring or upload last year's notice of assessment and any slips you have received.",
};

export const faqs = [
    {
        q: "What should I bring to my tax appointment?",
        a: "Your slips (T4, T5, T3, RRSP), receipts for medical, childcare, donations and tuition, and last year's notice of assessment. If you are a new client, bring photo ID and your SIN.",
    },
    {
        q: "Can I meet online instead of in person?",
        a: "Yes. Most services can be done by video call. The service list shows which ones are online, in person, or either. You will get a meeting link in your confirmation email.",
    },
    {
        q: "How do I cancel or reschedule?",
        a: "Sign in and open My appointments. You can cancel or pick a new time up to 24 hours before the appointment. Inside 24 hours, please call the office.",
    },
    {
        q: "Do I need an account to book?",
        a: "No. You can book as a guest with your name and email. An account lets you see past appointments and change bookings without calling.",
    },
    {
        q: "When do I pay?",
        a: "Payment is taken at the end of your appointment by card or e-transfer. Online payment at booking is planned for a later version of this site.",
    },
    {
        q: "Is my information kept private?",
        a: "Your information is used only to provide your accounting services and is stored securely in Canada. We never sell or share client information.",
    },
    {
        q: "Will I get a reminder?",
        a: "Yes. You get a confirmation email when you book and a reminder the day before your appointment.",
    },
];

export const credentials = [
    { title: "Chartered Professional Accountant", detail: "CPA Alberta, since 2012" },
    { title: "Certified Financial Planner", detail: "FP Canada" },
    { title: "Registered EFILE provider", detail: "Canada Revenue Agency" },
    { title: "Member", detail: "Calgary Chamber of Commerce" },
];
