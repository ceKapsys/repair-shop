/**
 * Every user-facing string on the public site, emails and admin toasts.
 * Wording is locked (build prompt §10): edit here only, never inline in components.
 * `{placeholders}` are filled from Settings / the database with `fill()`.
 */

export type Vars = Record<string, string | number | undefined | null>;

/** Replace `{name}` placeholders. Unknown placeholders are left out rather than shown raw. */
export function fill(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

export const copy = {
  nav: {
    services: "Services",
    devices: "Devices",
    emergency: "Emergency",
    blog: "Blog",
    contact: "Contact",
    book: "Book a repair",
    menu: "Menu",
    closeMenu: "Close menu",
    skip: "Skip to content",
    home: "Home",
  },

  home: {
    eyebrow: "Doorstep repair in {city}",
    h1: "Your device, fixed at your door.",
    sub: "Phones, laptops, tablets, consoles, watches and audio. A technician comes to you, repairs it on the spot, and every repair has a written warranty.",
    book: "Book a repair",
    emergencyCall: "Emergency? Call now",
    trust: {
      warranty: "Up to {maxWarranty}-day warranty",
      inFront: "Repaired in front of you",
      priceAgreed: "Price agreed before we start",
      rating: "{rating} on Google ({reviewCount} reviews)",
    },
    picker: { title: "What needs fixing?", sub: "Pick your device to see repairs and prices." },
    how: {
      title: "Three steps, no shop visit",
      steps: [
        { title: "Book in a minute.", body: "Tell us the device and the problem, pick a time." },
        { title: "We come to you.", body: "A technician arrives in your time window with the parts." },
        { title: "Fixed on the spot.", body: "You watch the repair, test it, then pay." },
      ],
    },
    services: { title: "Common repairs", all: "See all services" },
    emergencyBand: {
      title: "Can't wait until tomorrow?",
      body: "Emergency repairs today: a technician calls you within {responseMinutes} minutes of booking.",
      cta: "Book emergency repair",
    },
    reviews: { title: "What customers say on Google", all: "Read all reviews" },
    gallery: { title: "Recent repairs", all: "See the gallery" },
    blog: { title: "Repair advice", all: "Read the blog" },
    faq: { title: "Questions before you book" },
    final: { title: "Ready when you are.", body: "Book online, message us on WhatsApp, or call {phone}." },
  },

  service: {
    listTitle: "Repair services",
    h1: "{service} in {city}",
    lead: "We {verbPhrase} at your home or office. Most repairs take {duration}.",
    leadNoDuration: "We {verbPhrase} at your home or office.",
    facts: { time: "Time", warranty: "Warranty", parts: "Parts", warrantyValue: "{warrantyDays} days" },
    priceFrom: "From {price}",
    priceHidden: "Price after a free check",
    priceNote: "The final price is confirmed before any work starts.",
    book: "Book this repair",
    devices: "Devices we do this for",
    faq: "Questions about this repair",
    related: "Other repairs",
    emergencyAvailable: "Available as an emergency repair",
  },

  device: {
    listTitle: "Devices we repair",
    brandH1: "{brand} repair",
    h1: "{brand} {model} repair",
    lead: "Choose what's wrong with your {model}.",
    empty: "We haven't listed repairs for this model yet. Message us and we'll tell you if we can fix it.",
    specs: "Specifications",
    notListed: "My model isn't listed",
  },

  booking: {
    title: "Book a repair",
    progress: ["Device", "Problem", "Time and place", "Your details"],
    device: {
      title: "Which device?",
      searchPlaceholder: "Search model, e.g. Galaxy S23",
      notListed: "My model isn't listed",
      customLabel: "Device brand and model",
      change: "Change",
    },
    problem: {
      title: "What's wrong?",
      help: "Choose one or more. Not sure? Pick \"Something else\" and describe it.",
      somethingElse: "Something else",
      note: "Anything else we should know? (optional)",
      photos: "Add photos (optional, up to 3)",
    },
    when: {
      title: "When and where?",
      date: "Date",
      window: "Time window",
      full: "Full",
      address: "Address",
      area: "Area",
      areaOther: "Somewhere else",
      weVisit: "We currently visit: {areas}.",
      outside: "We don't cover this area yet. Call {phone} and we'll see what we can do.",
      mapPin: "Map link (optional)",
      noSlots: "No times are open online right now. Call {phone} and we'll fit you in.",
    },
    contact: {
      title: "How do we reach you?",
      name: "Name",
      phone: "Phone",
      phoneHelp: "The technician will call this number before arriving.",
      whatsapp: "Send updates on WhatsApp",
      email: "Email (optional)",
    },
    summary: {
      title: "Your booking",
      estimate: "Estimated price: {price}",
      afterCheck: "after a free check",
      confirm: "Confirm booking",
      sending: "Sending…",
      back: "Back",
      next: "Continue",
    },
    success: {
      title: "You're booked!",
      body: "Booking {bookingNo}. We'll call {phone} to confirm your time.",
      bodyNoPhone: "Booking {bookingNo}. We'll call you to confirm your time.",
      whatsapp: "Message us on WhatsApp",
      home: "Back to home",
    },
  },

  emergency: {
    h1: "Emergency repair, today",
    open: "Book now and a technician calls you within {responseMinutes} minutes. Emergency fee: {fee}.",
    openNoFee: "Book now and a technician calls you within {responseMinutes} minutes.",
    closed: "Emergency service is closed right now. It opens {nextOpenDay} at {openTime}. You can book the next available slot below.",
    closedNoOpening: "Emergency service is closed right now. You can book the next available slot below.",
    call: "Call {phone}",
    request: "Request emergency repair",
    success: "Request {bookingNo} received. Keep your phone close; we're calling you within {responseMinutes} minutes.",
    successTitle: "Request received",
    today: "today",
    tomorrow: "tomorrow",
  },

  errors: {
    required: "Please enter your {field}.",
    phone: "Enter a valid 10-digit phone number, e.g. (305) 911-7372.",
    email: "That email doesn't look right. Check for a missing @ or dot.",
    photoSize: "That photo is over 8 MB. Try a smaller one.",
    send: "We couldn't send your booking. Check your connection and try again; your details are saved.",
    server: "Something went wrong on our side. Try again, or call {phone} and we'll book it for you.",
    rateLimit: "Too many tries in a short time. Please wait a few minutes or call {phone}.",
    notFound: "This page isn't here. Try the services list or book a repair.",
    notFoundTitle: "Page not found",
    pickDevice: "Please pick your device, or describe it.",
    pickProblem: "Please choose a repair, or describe the problem.",
    pickDate: "Please pick a date.",
    pickWindow: "Please pick a time window.",
    pickArea: "Please pick your area.",
    slotTaken: "That time was just taken. Please pick another.",
    emergencyClosed: "Emergency service is closed right now. You can book the next available slot instead.",
    stale: "Something you picked is no longer offered. Please choose again.",
  },

  fields: { name: "name", phone: "phone number", address: "address", device: "device", problem: "problem" },

  admin: {
    saved: "Saved. Live on the site in a few seconds.",
    deleted: "Deleted.",
    undo: "Undo",
    noBookingsToday: "No bookings yet today.",
  },

  email: {
    adminSubject: "New booking {bookingNo}: {device}, {service} — {date} {window}",
    emergencySubject: "EMERGENCY {bookingNo}: {device}, {service} — call within {responseMinutes} min",
    customerSubject: "Your {shop} booking {bookingNo}",
    customerBody:
      "Hi {name}, thanks for booking. A technician will visit {address} on {date}, {window}, for your {device} ({service}). We'll call {phone} before we arrive. Need to change something? Reply to this email or message us on WhatsApp. — {shop}",
    customerEmergencyBody:
      "Hi {name}, we have your emergency request for your {device} ({service}) at {address}. We're calling {phone} within {responseMinutes} minutes. — {shop}",
  },

  whatsapp: {
    home: "Hi {shop}, I need a repair.",
    service: "Hi {shop}, I'd like to book {service}.",
    device: "Hi {shop}, I need a repair for my {brand} {model}.",
    booking: "Hi {shop}, about my booking {bookingNo}.",
    label: "Message us on WhatsApp",
    callLabel: "Call {phone}",
  },

  reviews: {
    title: "Customer reviews",
    fromGoogle: "Review from Google",
    summary: "{rating} out of 5 from {reviewCount} Google reviews",
    viewProfile: "See us on Google",
    empty: "Reviews will appear here once our Google profile is connected.",
  },

  gallery: {
    title: "Recent repairs",
    all: "All",
    before: "Before",
    after: "After",
    empty: "Photos of our repairs are on the way.",
    close: "Close",
    previous: "Previous photo",
    next: "Next photo",
  },

  blog: {
    title: "Repair advice",
    intro: "Plain answers on fixing, protecting and looking after your devices.",
    minutes: "{minutes} min read",
    empty: "No posts yet.",
    back: "All posts",
    category: "{category} posts",
  },

  contact: {
    title: "Contact",
    intro: "Call, message or email us. We answer during opening hours.",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    address: "Address",
    hours: "Opening hours",
    closed: "Closed",
    map: "Map showing where {shop} is",
  },

  serviceArea: {
    title: "Service area",
    intro: "A technician comes to your home or office in these areas of {city}.",
    outside: "Not on the list? Call {phone} and we'll see what we can do.",
  },

  about: { title: "About {shop}" },
  legal: { privacy: "Privacy policy", terms: "Terms of service", updated: "Last updated {date}" },

  footer: {
    repairs: "Repairs",
    company: "Company",
    help: "Help",
    allServices: "All services",
    emergencyRepair: "Emergency repair",
    about: "About",
    reviews: "Reviews",
    gallery: "Gallery",
    serviceArea: "Service area",
    privacy: "Privacy",
    terms: "Terms",
    rights: "© {year} {shop}. All rights reserved.",
    theme: { label: "Theme", light: "Light", dark: "Dark", system: "System" },
  },

  deviceTypes: {
    phone: "Phones",
    laptop: "Laptops & PCs",
    tablet: "Tablets",
    console: "Consoles",
    smartwatch: "Smartwatches",
    audio: "Audio devices",
    other: "Other devices",
  },

  meta: {
    serviceTitle: "{service} in {city}",
    serviceDesc: "{what} at your door in {city}. {duration}, {warrantyDays}-day warranty. Book online or call {phone}.",
    serviceDescShort: "{what} at your door in {city}. Book online or call {phone}.",
    servicesDesc: "Every repair we do at your door in {city}, with the time, warranty and price shown before you book.",
    devicesDesc: "Phones, laptops, tablets, consoles, smartwatches and audio devices we repair at your door in {city}.",
    brandDesc: "{brand} repair at your door in {city}. Pick your model to see repairs and prices.",
    deviceDesc: "{brand} {model} repair at your door in {city}. See each repair and its price, then book a time.",
    emergencyDesc: "Emergency device repair in {city}, today. A technician calls you back within minutes and comes to you.",
    bookDesc: "Book a doorstep repair in {city} in about a minute: pick your device, the problem and a time.",
    reviewsDesc: "What customers say about {shop} on Google.",
    galleryDesc: "Photos of recent repairs by {shop} in {city}.",
    contactDesc: "Phone, WhatsApp, email, address and opening hours for {shop} in {city}.",
    serviceAreaDesc: "The areas of {city} where {shop} repairs devices at your home or office.",
    aboutDesc: "Who we are and how {shop} repairs devices at your door in {city}.",
  },

  static: {
    callUs: "Call us",
    openMap: "Open in Google Maps",
    today: "Today",
    emergencyHours: "Emergency hours",
    notAvailable: "Not available",
    beforeAfter: "Before and after: {caption}",
    slider: "Show more of the before or after photo",
    postedIn: "Posted in",
    photoOf: "Photo {index} of {total}",
    manual: "Customer testimonial",
  },

  misc: {
    models: "{count} models",
    oneModel: "1 model",
    searchModels: "Search {brand} models",
    noModelMatch: "No model matches that. Check the spelling, or book and describe your device.",
    noModels: "We haven't listed models for this brand yet.",
    noServices: "Our repair list is being updated. Call {phone} and we'll tell you the price.",
    emergencyToday: "Need it today?",
    released: "Released {year}",
    repairsFor: "Repairs for the {model}",
    trustLabel: "Why customers book us",
  },
} as const;

export type Copy = typeof copy;
