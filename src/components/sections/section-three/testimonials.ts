/**
 * The ONLY testimonial content shown in Section Three's scrolling cards.
 *
 * One entry = one card. Edit / add / remove entries here and
 * categoryScenes.ts re-flows the cards into scenes automatically.
 *
 * `image` is a path under /public (a leading "/" is added for you). The
 * photos need to live in public/images/corousals/ — until a file exists the
 * card falls back to the initials circle.
 */

export type Testimonial = {
    name: string;
    role: string;
    highlight: string;
    quote: string;
    image: string;
};

export const TESTIMONIALS: Testimonial[] = [
    {
        name: "Ronny Turiaf",
        role: "NBA Champion | former LA Lakers Player",
        highlight: "‘Gregorio Avanzini is a warrior of light.",
        quote: "I have no doubt he will help humanity going forward, in an amazing matter, by empowering others to reconnect to their hearts and souls. My life changed for the better by crossing paths with him.’",
        image: "images/corousals/ronny-turiaf_blue.jpg",
    },
    {
        name: "Jeffrey Perlman",
        role: "CSO - Mindvalley | former Global CMO - Zumba",
        highlight: "‘Gregorio will guide you through the fear and into the truth.",
        quote: "I have come to realize that we are here to learn how to love, period. For those of us that have the courage to truly commit to this mandate, choose Gregorio as your coach.’",
        image: "images/corousals/jeffrey-perlam.jpg",
    },
    {
        name: "Jess Lively",
        role: "Founder - The Lively Show",
        highlight: "‘An incredible experience, unlike anything I’ve ever tried.",
        quote: "It was a deep, intense, and a powerful way to blow past the constraints of the mind into greater awareness.’",
        image: "images/corousals/jess-lively-testimonial-op.jpg",
    },
    {
        name: "David Block",
        role: "Composer/Producer - The Human Experience - Gone Gone Beyond",
        highlight: "‘An experience of union, liberation, power, and surrender.",
        quote: "Gregorio will guide you on one of the most magical journeys of your life.’",
        image: "images/corousals/david-block-testimonial-op.jpg",
    },
    {
        name: "Mark Lawrence",
        role: "Founder and CEO - SpotHero",
        highlight: "‘Coaching with Gregorio has brought new heights to my life.",
        quote: "He guides from the heart a profound way of thinking that can only be described as \"Gregorio\". He exudes warm energy that allows you to open up to find your inner truth.’",
        image: "images/corousals/mark-lawrence.jpg",
    },
    {
        name: "Nadav Wilf",
        role: "Founder and CEO - Head Alignment Coach | former Chief Possibilities Officer - HeroX",
        highlight: "‘I don’t say this lightly, breathwork with Gregorio changed my life forever.",
        quote: "I saw that there’s more than just our bodies and that I could go there anytime through meditation. Gregorio is a pure-hearted masterful facilitator that will take you to new heights.’",
        image: "images/corousals/nadav-wilf-testimonial-op.jpg",
    },
    {
        name: "Mario Almondo",
        role: "General Manager of Performance Division - Brembo S.p.A | former COO Industrial Director SVP - Ferrari S.p.A",
        highlight: "‘Driven by professionals like Gregorio and Andrea, you’ll be part of a wide and energetic experience.",
        quote: "Unsuspected intimate and refreshing stream of emotion. Good food for the soul.’",
        image: "images/corousals/mario-almondo-testimonial.jpg",
    },
    {
        name: "Helena Wasserman Erikson",
        role: "Impact Investor | TEDx Speaker | Forbes 30 under 30",
        highlight: "‘I had one of the craziest experiences of my life.",
        quote: "I experienced the oneness I had just read about and felt deeply connected with everyone in the world.’",
        image: "images/corousals/Copy-of-helena-op.jpg",
    },
    {
        name: "Andrea Aicaradi",
        role: "VP of Growth - Neosensory Inc. | MIT Graduate",
        highlight: "‘A transformational experience that will unlock your hidden energy.",
        quote: "Unlike many ‘holistic’ practices, it’s rooted in science. A mind-bending journey, inspiring even the most skeptical.’",
        image: "images/corousals/andrea-aicardi-testimonial-op.jpg",
    },
    {
        name: "Tom Chi",
        role: "Founding Partner - At One Ventures | former Head of Experience - Google X",
        highlight: "‘Gregorio led a large group into a breathing exercise with a mixture of confidence, care, and joy.",
        quote: "He is dedicated to being a skillful practitioner and guide.’",
        image: "images/corousals/tom-chi-testimonial.jpg",
    },
    {
        name: "Andy Kaul",
        role: "Manager - Microsoft Consulting | former Director SAM - Microsoft",
        highlight: "‘I highly recommend coaching with Gregorio!",
        quote: "He unlocked new doors and advanced me tremendously. Embraced by a bubble of trust I opened up quickly and effortlessly working through tough questions finding surprisingly simple truths and new approaches that I pursued. A wonderful and enriching experience.’",
        image: "images/corousals/andy-kaul.jpg",
    },
];