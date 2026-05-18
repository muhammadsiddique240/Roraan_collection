export const siteConfig = {
    brand: {
        name: "RORAAN",
        fullName: "RORAAN ARCHIVE",
        slogan: "Curated Modern Streetwear",
        logoText: "RORAAN",
    },
    COD_FEE: 400,
    contact: {
        whatsapp: "+92322-0073243",
        whatsappLink: "https://wa.me/923220073243",
        email: "support@roraan.com",
        address: "Garhi Shahu Near euro petrol pump Lahore",
    },
    social: {
        instagram: "https://instagram.com/roraan.archive",
        tiktok: "https://www.tiktok.com/@roraancollection?_r=1&_t=ZS-960CxYxusz",
        twitter: "https://twitter.com/rooran_archive",
        facebook: "https://facebook.com/roraan.archive",
    },

    navigation: [
        { label: "New Arrivals", path: "/shop?filter=new" },
        { label: "Sneakers", path: "/shop?category=sneakers" },
        { label: "Apparel", path: "/shop?category=apparel" },
        { label: "Contact", path: "/contact" },
    ],
    footer: {
        about: "The premier destination for authenticated modern streetwear and rare sneaker collectibles in Pakistan.",
        links: [
            { label: "Privacy Policy", path: "/privacy" },
            { label: "Terms of Service", path: "/terms" },
            { label: "Shipping Info", path: "/shipping" },
            { label: "Authenticity", path: "/authenticity" },
        ],
    },

    hero: {
        tagline: "CURATED SELECTION",
        cta: "ENTER THE ARCHIVE",
        secondaryCta: "CONCIERGE SERVICE",
        slides: [
            {
                image: '/images/download (2).jpeg',
                title: 'THE ART\nOF ARCHIVE',
                subtitle: 'Limited edition silhouettes. Curated for those who understand the value of a classic.',
                link: '/shop?category=men'
            },
            {
                image: '/images/slide_gen_1.png',
                title: 'PREMIUM\nGRADED',
                subtitle: 'Every pair hand-selected. Authenticated by experts. Built for the elite collection.',
                link: '/shop?category=women'
            },
            {
                image: '/images/slide_gen_2.png',
                title: 'THE VAULT\nUNLOCKED',
                subtitle: 'Rare finds. Uncompromising quality. The ultimate destination for sneaker purists.',
                link: '/shop?sort=new'
            },
            {
                image: '/images/slide_gen_3.png',
                title: 'VINTAGE\nREDEFINED',
                subtitle: 'Classic forms meet modern curation. Experience the heritage of sneaker culture.',
                link: '/shop?category=lifestyle'
            }
        ]
    },
    grading: [
        {
            name: 'Premium',
            image: '/images/premium.avif',
            link: '/shop?condition=premium'
        },
        {
            name: 'Excellent',
            image: '/images/excellent.avif',
            link: '/shop?condition=excellent'
        },
        {
            name: 'Very Good',
            image: '/images/very-good.avif',
            link: '/shop?condition=very-good'
        },
        {
            name: 'Good',
            image: '/images/good.avif',
            link: '/shop?condition=good'
        }
    ]
};
