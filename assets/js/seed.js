/* Starter content. Everything here can be edited, replaced or deleted from the admin panel. */
window.SEED = {
  settings: {
    brand_name: "Naina's",
    brand_suffix: "Beauty n Beyond",
    hero_kicker: "Bridal · Festive · Editorial",
    hero_title: "When the eyes do all the talking.",
    hero_sub: "Bridal, festive and party makeup with a cinematic finish. Skin that glows, eyes that speak, and a look that lasts from the first photo to the last dance.",
    hero_image: "assets/img/festive-green-gold.jpg",
    hero_video: "",
    story_title: "The Ritual",
    chapters: [
      { title: "The Kit", note: "Brushes · Palettes · Lashes", text: "Before the first brush touches skin, the kit is laid out. Every shade is picked for your outfit, your skin tone and the light you'll be photographed in." },
      { title: "The Base", note: "Prep · Foundation · Sponge", text: "Skin first. Foundation pressed in with a damp sponge until it melts into the skin and holds through the whole day." },
      { title: "Naina", note: "Shadow · Kohl · Lashes", text: "The eyes carry the story. Shadow blended in soft layers, a sharp kohl line and lashes that catch the light from across the room." },
      { title: "The Glow", note: "Blush · Highlight · Contour", text: "Colour swept high on the cheeks, light on the high points. The warmth that shows up in every photo." },
      { title: "The Lips", note: "Liner · Colour · Set", text: "Lined first, then filled, then blotted and set. A shade chosen for the outfit that lasts through dinner, dancing and every photo." },
      { title: "The Reveal", note: "Setting spray · Mirror · Ready", text: "A last mist of setting spray, one look in the mirror. This is the moment the whole morning builds to." }
    ],
    about_kicker: "The artist",
    about_title: "Makeup that looks like you, on your best day.",
    about_text: "I create bridal, festive and party looks for South Asian weddings, celebrations and shoots. Every booking starts with a conversation about your outfit, your jewellery and the feel you want, so the finished look fits the moment and photographs beautifully.\n\nI travel to you, bring a full professional kit, and keep the morning calm.",
    about_image: "assets/img/soft-pink-glam.jpg",
    services_title: "Services",
    work_title: "The Work",
    offers_title: "Current Offers",
    journal_title: "Journal",
    booking_title: "Book your look",
    booking_note: "Wedding season dates go first. Send a request with your date and ready-by time and you'll get a reply to confirm availability.",
    occasions: ["Bridal", "Mehndi / Sangeet", "Party / Festive", "Photoshoot", "Makeup lesson"],
    area: "Based in the UK · Travels to you",
    whatsapp: "",
    phone: "07397 527071",
    email: "Mwah2magirlies@hotmail.co.uk",
    instagram: "",
    legal_name: "",
    legal_address: "",
    legal_email: "Mwah2magirlies@hotmail.co.uk",
    notify_email: "Mwah2magirlies@hotmail.co.uk",
    owner_signoff: "Naina",
    ico_reg: "",
    deposit_text: "A deposit may be needed to secure your date. We'll tell you the amount, and whether any part of it is refundable, before you pay.",
    travel_text: "Travel within the local area is included. For other locations we'll quote any travel charge before you confirm, and it will be included in your total price.",
    retention_months: "12",
    footer_note: "When the eyes do all the talking · Bridal · Festive · Party makeup"
  },

  services: [
    { id: "svc-bridal", sort: 1, title: "Bridal Makeup", price: "from £300", duration: "2–3 hrs", description: "Full bridal look with skin prep, lashes, dupatta and jewellery setting. Trial recommended." },
    { id: "svc-mehndi", sort: 2, title: "Mehndi & Sangeet", price: "from £150", duration: "1.5 hrs", description: "Colourful, camera-ready looks for pre-wedding events, matched to your outfit." },
    { id: "svc-party", sort: 3, title: "Party & Festive Glam", price: "from £80", duration: "1 hr", description: "Diwali, Eid, birthdays and nights out. Soft glam to full drama." },
    { id: "svc-shoot", sort: 4, title: "Photoshoot & Editorial", price: "from £120", duration: "Half day", description: "Looks built for lenses and lighting, with touch-ups on set." },
    { id: "svc-lesson", sort: 5, title: "One-to-One Lesson", price: "from £90", duration: "2 hrs", description: "Learn a look on your own face using your own products." }
  ],

  offers: [
    { id: "off-trial", sort: 1, active: true, badge: "Bridal", title: "Half-price bridal trial", description: "Book your wedding-day makeup and your trial session is 50% off.", price: "£60", was_price: "£120", valid_until: "" },
    { id: "off-group", sort: 2, active: true, badge: "Groups", title: "Group glam: 4 faces or more", description: "Getting ready together? 15% off every face when you book four or more.", price: "15% off", was_price: "", valid_until: "" },
    { id: "off-festive", sort: 3, active: true, badge: "Festive", title: "Free lashes this festive season", description: "Every party or festive booking includes a pair of premium lashes.", price: "Included", was_price: "", valid_until: "" }
  ],

  posts: [
    {
      id: "post-bridal", kind: "portfolio", published: true, slug: "signature-bridal-glam",
      created_at: "2026-10-20T10:00:00Z",
      title: "Signature Bridal Glam",
      excerpt: "Soft brown smoke, fluttery lashes and a nude-rose lip under a kundan and emerald choker.",
      cover: "assets/img/signature-bridal.jpg",
      images: ["assets/img/signature-bridal.jpg"],
      tags: ["Bridal", "Kundan"],
      body: "A bridal look built around the jewellery. The emerald and kundan choker sets the tone, so the eyes stay warm and soft-smoked to let the stones shine.\n\n**The look**\n\n- Luminous, satin-finish base\n- Soft brown smoky eye with a lifted outer corner\n- Wispy lashes for depth without heaviness\n- Nude-rose lip, lined and blotted to last\n- Loose curls to frame the face"
    },
    {
      id: "post-festive", kind: "portfolio", published: true, slug: "festive-green-and-gold",
      created_at: "2026-10-18T10:00:00Z",
      title: "Festive Green & Gold",
      excerpt: "A red lip, a green bindi and gold-flecked lids to match an embroidered green suit.",
      cover: "assets/img/festive-green-gold.jpg",
      images: ["assets/img/festive-green-gold.jpg"],
      tags: ["Festive", "Evening"],
      body: "An evening festive look matched to a green embroidered suit and a kundan choker. The green bindi ties the face to the outfit, and a classic red lip gives contrast against the green.\n\n**The look**\n\n- Bronzed, warm base built for low evening light\n- Gold-flecked lids with defined lower lash line\n- Classic red lip\n- Green bindi to echo the outfit"
    },
    {
      id: "post-pink", kind: "portfolio", published: true, slug: "soft-pink-evening-glam",
      created_at: "2026-10-15T10:00:00Z",
      title: "Soft Pink Evening Glam",
      excerpt: "Winged liner, smoked-out lids and a berry-brown lip with a blush-pink outfit.",
      cover: "assets/img/soft-pink-glam.jpg",
      images: ["assets/img/soft-pink-glam.jpg"],
      tags: ["Party", "Soft glam"],
      body: "Soft glam for an evening party in blush pink. Sharp liner keeps the eyes defined, while the skin stays fresh and bright.\n\n**The look**\n\n- Fresh, glowy skin with soft contour\n- Smoked-out brown lid with a sharp wing\n- Full lashes\n- Berry-brown lip"
    },
    {
      id: "post-winter", kind: "portfolio", published: true, slug: "alpine-winter-glow",
      created_at: "2026-10-12T10:00:00Z",
      title: "Alpine Winter Glow",
      excerpt: "Hydrated skin and a glossy pink lip that hold up on a cold, bright day on the slopes.",
      cover: "assets/img/winter-glow.jpg",
      images: ["assets/img/winter-glow.jpg"],
      tags: ["Travel", "Everyday"],
      body: "A travel look for a cold, bright day in the snow. Cream products and a hydrating base stop the skin from looking dry, and a glossy pink lip adds colour against the white.\n\n**The look**\n\n- Hydrating primer and light coverage\n- Cream blush for a cold-weather flush\n- Glossy pink lip with balm underneath"
    },
    {
      id: "blog-festive", kind: "blog", published: true, slug: "festive-look-around-your-jewellery",
      created_at: "2026-10-21T09:00:00Z",
      title: "Green & gold: building a festive look around your jewellery",
      excerpt: "Start with the jewellery, not the eyeshadow. How to plan a festive face that works with your set instead of fighting it.",
      cover: "assets/img/festive-green-gold.jpg",
      images: ["assets/img/festive-green-gold.jpg"],
      tags: ["Festive", "Tips"],
      body: "Most festive looks go wrong in one place: the makeup is planned before the jewellery. A kundan choker, polki earrings or a heavy maang tikka is the loudest thing on your face. Plan around it.\n\n## 1. Start with the set\n\nLay your jewellery next to your outfit before your appointment, or send a photo of both. The stones tell you which colours to repeat and which to avoid. Green and red stones, like the choker here, sit well with warm golds and bronzes on the eyes.\n\n## 2. Pick one feature to lead\n\nWith statement jewellery, choose either a strong eye or a strong lip. Here the lip leads: a classic red that contrasts with the green suit, while the lids stay gold-flecked and soft.\n\n## 3. Let the bindi do the matching\n\nA small bindi in the outfit colour is the easiest way to tie your face to your clothes without adding more colour to the eyes.\n\n## 4. Build for the lighting\n\nEvening events mean warm, low light and lots of phone flash. Add a little more definition than feels natural: a slightly deeper lower lash line, a touch more bronzer, and a setting spray so the skin doesn't turn shiny by the second hour.\n\n## Quick checklist\n\n- Photo of outfit and jewellery sent before the booking\n- One lead feature: eyes or lips\n- Bindi or accessory to echo the outfit colour\n- Setting spray and a lipstick for touch-ups in your bag"
    },
    {
      id: "blog-pink", kind: "blog", published: true, slug: "soft-pink-glam-for-evening-parties",
      created_at: "2026-10-16T09:00:00Z",
      title: "Soft pink glam for evening parties",
      excerpt: "Fresh skin, a sharp wing and a berry lip. A party look that feels light but still shows up in photos.",
      cover: "assets/img/soft-pink-glam.jpg",
      images: ["assets/img/soft-pink-glam.jpg"],
      tags: ["Party", "Tips"],
      body: "Soft glam is the most requested party look, and the easiest to get wrong. Too soft and it disappears in photos. Too much and it stops feeling soft. The balance comes from keeping the skin light and putting the definition in the eyes.\n\n## Keep the skin fresh\n\nUse a thin layer of foundation and conceal only where you need it. Add a liquid highlighter on the high points of the cheeks so the skin catches light instead of looking flat.\n\n## Put the drama in the liner\n\nA sharp winged liner gives shape to the whole face. Smoke a soft brown shadow underneath it so the line looks intentional, not harsh, then add full lashes.\n\n## Choose a lip one step deeper than your outfit\n\nWith a blush-pink outfit, a berry-brown lip gives contrast without clashing. A pink lip on a pink outfit tends to wash out.\n\n## Your touch-up kit\n\n- Blotting papers\n- The lipstick and liner from your look\n- A cotton bud for liner smudges\n- A small setting spray\n\nThat's all you need to keep the look sharp until the end of the night."
    },
    {
      id: "blog-winter", kind: "blog", published: true, slug: "winter-glow-makeup-that-survives-the-cold",
      created_at: "2026-10-10T09:00:00Z",
      title: "Winter glow: makeup that survives the cold",
      excerpt: "Cold air and bright snow are hard on skin. Five changes that keep your makeup fresh on a winter trip.",
      cover: "assets/img/winter-glow.jpg",
      images: ["assets/img/winter-glow.jpg"],
      tags: ["Travel", "Skincare"],
      body: "Cold wind dries skin out, indoor heating dries it more, and fresh snow reflects sunlight straight back at your face. A winter trip needs a slightly different routine.\n\n## 1. Hydrate before anything else\n\nUse a richer moisturiser than usual and give it a few minutes to sink in. Makeup on dry skin cracks and clings to flaky patches.\n\n## 2. Don't skip SPF\n\nSnow reflects a lot of UV. Wear sunscreen under your makeup even when it's freezing.\n\n## 3. Swap powders for creams\n\nCream blush and cream bronzer move with the skin instead of sitting on top of it. They look more natural in cold, bright light.\n\n## 4. Gloss over a balm\n\nMatte lipsticks dry out fast in the cold. Use a lip balm first, then a tinted gloss like the soft pink here. Reapply both through the day.\n\n## 5. Let accessories frame the face\n\nA knitted hat and big sunglasses do half the work. Keep the eyes simple and let the lip and the glow carry the look."
    }
  ],

  bookings: [
    { id: "bk-sample", created_at: "2026-10-22T18:30:00Z", status: "new", name: "Sample booking", phone: "07000 000000", email: "sample@example.com", occasion: "Bridal", event_date: "2027-05-15", ready_by: "10:30", faces: 3, location: "Hayes, London", message: "This is an example request so you can see how bookings look. Delete it any time." }
  ]
};
