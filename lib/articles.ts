export interface Article {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  icon: string;
  image: string;
  publishedAt: string;
  sections: Section[];
}

interface Section {
  heading?: string;
  body?: string;
  list?: { label?: string; text: string }[];
  table?: { headers: string[]; rows: string[][] };
  tip?: string;
  warning?: string;
  cta?: boolean;
}

export const articles: Article[] = [
  // ─── 1. Best Routes in Cebu ───────────────────────────────────────────────
  {
    slug: 'best-routes-cebu',
    tag: 'Routes',
    title: 'Best Scooter Routes in Cebu',
    excerpt: 'From Lapu-Lapu to Moalboal — discover the routes every rider should know. Includes road conditions, fuel stops, and ride times.',
    readTime: '5 min read',
    icon: 'ph:map-trifold-fill',
    image: '/tips/routes-cebu.jpg',
    publishedAt: '2025-03-15',
    sections: [
      {
        body: "Cebu island is made for scooter travel. At 225km long and rarely more than 40km wide, nearly every corner is reachable in a day. These are the four routes we ride most — each one tested personally by the KJM team.",
      },
      {
        heading: 'Route 1: South Cebu Coastal — Lapu-Lapu to Moalboal',
        body: "This is the classic Cebu scooter ride. You'll cruise through small fishing towns, jungle-covered hills, and arrive at one of the Philippines' most beautiful coastlines.",
        list: [
          { label: 'Distance', text: '~100km one way' },
          { label: 'Ride time', text: '2.5–3 hours (no stops)' },
          { label: 'Road quality', text: 'Excellent — fully paved, wide highway most of the way' },
          { label: 'Best for', text: 'Day trips, all skill levels' },
        ],
      },
      {
        body: "Leave Lapu-Lapu early — 7am is ideal. Cross the Marcelo Fernan Bridge to Mandaue, then follow the South Road Properties (SRP) down the west coast. The SRP is a new 4-lane highway — smooth, fast, and spectacular. At Talisay the road narrows to two lanes. No stress. Traffic thins quickly.\n\nFuel up in Carcar City (~50km from Lapu-Lapu) — it's the last reliable station before Moalboal. The Carcar lechon market is also worth a quick stop for the best roast pork you'll ever eat.\n\nFrom Carcar, the highway climbs gently through hilly terrain before dropping back to the coast at Moalboal. Panagsama Beach is the main tourist strip. Sardine Run snorkeling is a 5-minute walk from shore.",
      },
      {
        tip: 'Extend the trip: continue 15km south to Kawasan Falls (see our dedicated guide). Or push another 30km to Oslob for whale shark swimming — but that\'s a very long day.',
      },
      {
        heading: 'Route 2: Mountain Loop — Cebu City to Busay & Tops',
        body: "This short but dramatic route climbs from the chaos of Cebu City to cool mountain air and a 360-degree view of the entire metro. It's a 1–2 hour loop perfect for an early morning or sunset ride.",
        list: [
          { label: 'Distance', text: '~25km round trip' },
          { label: 'Ride time', text: '45 min each way' },
          { label: 'Road quality', text: 'Paved but steep and winding above Busay' },
          { label: 'Best for', text: 'Sunrise/sunset, photography' },
        ],
      },
      {
        body: "From IT Park or Ayala, head up Salinas Drive toward JY Square, then continue climbing to Busay. The Temple of Leah is at the base — worth a quick photo. Keep climbing past the Sirao Flower Garden (Instagram central) and continue to the Tops Lookout.\n\nTops opens at 10am on weekdays, 8am on weekends. The ₱150 entry fee is worth every peso for the view. On clear mornings you can see both Mactan Island and Mandaue laid out below you.",
      },
      {
        warning: "The road above Busay is narrow with steep drop-offs. Slow down on corners — locals drive fast and hug the middle. Not recommended for first-time scooter riders.",
      },
      {
        heading: 'Route 3: North Cebu — Mandaue to Danao & the Coast',
        body: "The north route is quieter, less touristy, and rewarding for riders who want to escape the Mactan/Moalboal trail. Small fishing villages, a serious port city, and dramatic coastal scenery.",
        list: [
          { label: 'Distance', text: '~60km one way to Danao' },
          { label: 'Ride time', text: '1.5 hours' },
          { label: 'Road quality', text: 'Good — some patches north of Liloan' },
          { label: 'Best for', text: 'Half-day, off-the-beaten-track' },
        ],
      },
      {
        body: "Head north from Mandaue on the highway past Consolacion and Liloan. The coast comes into view around Compostela. Danao City is a lively port — grab lunch at any carenderia near the market. The ferry to Leyte departs from here if you want to turn a day trip into an island-hopping adventure.",
      },
      {
        heading: 'Route 4: Cross-Island — Cebu City to Dalaguete via the Mountains',
        body: "This is the most technical ride on the list — a winding mountain road that cuts across the spine of Cebu island. The reward is the Mantalongon Market and Osmeña Peak (see our dedicated guide).",
        list: [
          { label: 'Distance', text: '~75km to Dalaguete' },
          { label: 'Ride time', text: '2 hours' },
          { label: 'Road quality', text: 'Paved but steep, tight hairpin bends' },
          { label: 'Best for', text: 'Experienced riders, cool weather seekers' },
        ],
      },
      {
        tip: "Fuel up in Cebu City before heading inland. The mountain roads have no stations. Bring a jacket — temperatures drop significantly at altitude.",
      },
      { cta: true },
    ],
  },

  // ─── 2. Kawasan Falls ─────────────────────────────────────────────────────
  {
    slug: 'kawasan-falls-guide',
    tag: 'Destination',
    title: 'Getting to Kawasan Falls by Scooter',
    excerpt: "The 90km ride from Cebu City to Kawasan Falls is one of the best day trips you can do. Here's how to plan it right.",
    readTime: '4 min read',
    icon: 'ph:mountains-fill',
    image: '/tips/kawasan-falls.jpg',
    publishedAt: '2025-02-28',
    sections: [
      {
        body: "Kawasan Falls is Cebu's most spectacular waterfall — a turquoise, multi-tiered cascade hidden in a jungle canyon near Badian. The ride there is half the experience. Here's everything you need to plan the perfect day trip.",
      },
      {
        heading: 'The Route',
        body: "Starting from Lapu-Lapu or Cebu City, head south via the South Road Properties (SRP). The highway is excellent — wide, smooth, and well-signed. Follow signs through Talisay, Carcar, Barili, and Badian.\n\nThe falls are in Barangay Matutinao, Badian — about 3km off the national highway. Look for the turn-off sign in Badian town proper. From there, a rough road leads to the trailhead parking area.",
      },
      {
        table: {
          headers: ['Starting Point', 'Distance', 'Ride Time'],
          rows: [
            ['Lapu-Lapu / Airport', '95 km', '2.5 hours'],
            ['Cebu City (IT Park)', '90 km', '2 hours'],
            ['Moalboal', '18 km', '30 min'],
          ],
        },
      },
      {
        heading: 'Road Conditions',
        body: "The highway is excellent all the way to Badian. The last 3km to the falls is a bumpy concrete road — passable on any scooter, just go slow. Parking at the trailhead is free. A guide is technically required for the falls (₱150) and worth it — the trail can be muddy and confusing.",
      },
      {
        tip: "Leave Lapu-Lapu by 6:30am to arrive at the falls before the tour groups from Cebu City arrive around 10am. The turquoise pool is dramatically more photogenic without 50 other people in it.",
      },
      {
        heading: 'What to Expect at the Falls',
        body: "A 15-minute walk through a river canyon brings you to the first tier — the main pool with the iconic blue-green water. The color comes from mineral-rich underground springs. Even in dry season it runs cold.\n\nCanyoneering tours start from here — jumping off cliffs into the canyon pools above. If you want to do this, book in advance or arrange with guides at the entrance (₱900–1,200). It's a 3-4 hour adventure that finishes at the beach.",
      },
      {
        heading: 'Practical Details',
        list: [
          { label: 'Entry fee', text: '₱50 per person + ₱150 guide fee' },
          { label: 'Opening hours', text: 'Sunrise to sunset' },
          { label: 'Best time to visit', text: 'Tuesday to Friday (fewer crowds)' },
          { label: 'Swimming', text: 'Allowed — bring a change of clothes' },
          { label: 'Fuel stop', text: 'Fill up in Carcar City (50km mark) — last reliable station' },
          { label: 'Lunch', text: 'Several carenderias near the trailhead. Try the grilled fish.' },
        ],
      },
      {
        heading: 'Combine With Moalboal',
        body: "Kawasan Falls and Moalboal are 18km apart — easy to combine in one day. Stop in Moalboal first (10am–2pm) for the Sardine Run snorkeling, then ride to Kawasan for a late afternoon swim. Head back to Cebu City by 6pm to avoid riding after dark.",
      },
      {
        warning: "Don't ride back after dark. The mountain sections between Carcar and Talisay have no lighting and some surprising potholes. Always aim to be back on the highway before sunset (6pm).",
      },
      { cta: true },
    ],
  },

  // ─── 3. Osmeña Peak ───────────────────────────────────────────────────────
  {
    slug: 'osmeña-peak-guide',
    tag: 'Destination',
    title: 'Riding to Osmeña Peak',
    excerpt: "Cebu's highest point is worth the climb. We cover the road conditions, best time to go, and what to expect.",
    readTime: '3 min read',
    icon: 'ph:flag-fill',
    image: '/tips/osmena-peak.jpg',
    publishedAt: '2025-02-10',
    sections: [
      {
        body: "Osmeña Peak stands 1,013 meters above sea level — Cebu's highest point. The view from the summit is extraordinary: rolling green hills, the Tañon Strait, and on a clear day, the mountains of Negros across the water. The scooter ride to get there is an adventure in itself.",
      },
      {
        heading: 'The Route from Cebu City',
        body: "Head south from Cebu City on the highway to Carcar. In Carcar, take the mountain road inland toward Mantalongon. This is where the real ride begins — a steep, winding climb through cool mountain forest. Mantalongon Market is your landmark: a busy highland vegetable market at around 900m elevation where locals sell strawberries, lettuce, and cabbages that can't grow in the lowland heat.\n\nFrom Mantalongon, Osmeña Peak is a 10-minute walk from the roadside car park. You cannot miss the signage.",
      },
      {
        table: {
          headers: ['Route', 'Distance', 'Time'],
          rows: [
            ['Cebu City → Carcar → Mantalongon → Osmeña', '75 km', '2 hours'],
            ['Lapu-Lapu → Cebu City → Osmeña', '90 km', '2.5 hours'],
          ],
        },
      },
      {
        heading: 'Road Conditions',
        body: "The highway to Carcar is smooth and fast. The mountain road to Mantalongon is paved but narrow, steep, and full of tight hairpin bends. It's not dangerous — but it requires focused riding. Take corners slowly, stay in your lane, and watch for jeepneys coming downhill at speed.",
      },
      {
        warning: "This route is not suitable for beginner riders. If you've never ridden a manual motorcycle or haven't ridden up steep mountain roads before, choose a flatter route for your first trip.",
      },
      {
        heading: 'At the Summit',
        body: "The peak itself is a 10–15 minute walk on a clear trail. No technical hiking required. At the top: sweeping views in every direction, dramatic rolling hills, and total silence except for the wind. No entrance fee.\n\nBring a jacket — even in March it can feel surprisingly cold at the summit. Morning clouds often clear by 9–10am, making that the sweet spot for the best visibility.",
      },
      {
        heading: 'Best Time to Go',
        list: [
          { label: 'Season', text: 'December–May (dry season) for clearest views' },
          { label: 'Time of day', text: 'Arrive at Osmeña by 9am — afternoon clouds frequently obscure the view' },
          { label: 'Day of week', text: 'Weekdays — far fewer visitors than weekends' },
        ],
      },
      {
        tip: "Stop at Mantalongon Market on the way back. Buy a kilo of highland strawberries (₱80–120) to snack on during the descent. One of those simple pleasures you'll remember.",
      },
      { cta: true },
    ],
  },

  // ─── 4. Cebu Traffic Tips ─────────────────────────────────────────────────
  {
    slug: 'cebu-traffic-tips',
    tag: 'Tips',
    title: 'Surviving Cebu City Traffic on a Scooter',
    excerpt: 'Cebu traffic can be intense. Learn the best times to ride, which roads to avoid, and local rules every tourist should know.',
    readTime: '4 min read',
    icon: 'ph:traffic-sign-fill',
    image: '/tips/cebu-traffic.jpg',
    publishedAt: '2025-01-20',
    sections: [
      {
        body: "Cebu City traffic is genuinely chaotic at peak hours. Lanes are suggestions, jeepneys stop anywhere, and motorcycles fill every gap. But here's the thing — a scooter is actually the best vehicle to have in all of this. Here's how to navigate it without losing your mind.",
      },
      {
        heading: 'Rush Hours: When to Stay Off the Road',
        body: "Cebu has two brutal rush hours. If you can avoid them, your ride quality will improve dramatically.",
        list: [
          { label: 'Morning rush', text: '7:00 – 9:30 AM — entire city gridlocks as schools and BPOs fill' },
          { label: 'Evening rush', text: '5:00 – 7:30 PM — worst on Colon Street, Osmeña Blvd, and N. Bacalso' },
          { label: 'Best riding windows', text: '6–7 AM (before rush), 10 AM–3 PM (midday calm), after 8 PM' },
          { label: 'Weekends', text: 'Saturday afternoon near malls (Ayala, SM) gets heavy. Sunday morning is golden.' },
        ],
      },
      {
        heading: 'Roads to Avoid (and Alternatives)',
        body: "Some roads are traps at all hours. Knowing the alternatives saves you 20–30 minutes on a single trip.",
        list: [
          { label: 'Avoid: Colon Street', text: 'Perpetual gridlock. Alternative: Osmeña Blvd or M. Velez Street parallel route' },
          { label: 'Avoid: Escaño Bridge (Mandaue)', text: 'Nightmare at rush hour. Alternative: Marcelo Fernan Bridge is faster' },
          { label: 'Avoid: N. Bacalso at 5 PM', text: 'Solid from Carbon to Talisay. Leave before 4 PM if heading south.' },
          { label: 'Use: Subangdako Ave', text: 'Mandaue\'s fastest north-south artery for midday travel' },
          { label: 'Use: SRP (South Road Properties)', text: 'Best way in and out of the south — 4 lanes, minimal signals' },
        ],
      },
      {
        heading: 'Local Traffic Rules You Must Know',
        body: "The Philippines has specific rules that catch tourists off guard. Some are strict, others are technically enforced only when convenient. Know them all.",
        list: [
          { label: 'Helmets', text: 'Mandatory for rider AND passenger — ₱1,500 fine plus impoundment if caught without' },
          { label: 'No phone use', text: 'Holding your phone while riding is illegal — ₱5,000 fine' },
          { label: 'Yellow lane rule', text: 'In some areas, motorcycles must use the leftmost yellow-marked lane. Follow local bikes.' },
          { label: 'No counterflow', text: 'Riding against traffic — even 10 meters — is a serious violation' },
          { label: 'Loading zones', text: 'Stopping in jeepney/bus loading zones causes chaos and angry honking — move on' },
        ],
      },
      {
        warning: "If a traffic enforcer (LTFRB or LTO officer) signals you to stop — stop. Don't try to ride away. Be polite, show your license and registration, and most encounters end quickly and peacefully.",
      },
      {
        heading: 'Parking in Cebu City',
        body: "Scooter parking is generally more flexible than cars, but not unlimited.",
        list: [
          { label: 'Malls', text: 'Ayala, SM, and Robinsons have dedicated motorcycle parking — ₱20–30 flat rate' },
          { label: 'Street parking', text: 'Look for rows of motorbikes — that\'s where it\'s acceptable. Don\'t block sidewalks.' },
          { label: 'IT Park', text: 'Each BPO building has ground-floor motorcycle bays — use them' },
          { label: 'Always lock', text: 'Use the built-in disc lock and/or steering lock whenever you park, even briefly' },
        ],
      },
      {
        heading: 'One Cebu Riding Habit to Adopt Immediately',
        body: "Use your horn constantly and without apology. In the Philippines, honking isn't aggression — it's communication. A short beep at a junction means 'I'm here.' A beep at a bus says 'I'm passing.' Locals horn freely and it prevents accidents. Do the same.",
      },
      { cta: true },
    ],
  },

  // ─── 5. Philippines Driving License ──────────────────────────────────────
  {
    slug: 'philippines-driving-license',
    tag: 'Legal',
    title: 'Driving in the Philippines as a Tourist',
    excerpt: "Everything about licenses, IDPs, road rules, and what to do if you get pulled over. Stay legal, stay safe.",
    readTime: '6 min read',
    icon: 'ph:identification-card-fill',
    image: '/tips/driving-license.jpg',
    publishedAt: '2025-01-05',
    sections: [
      {
        body: "This is the question we get most from tourists: 'Can I legally rent and ride a scooter in the Philippines?' The answer is yes — with the right documents. Here's the complete legal picture so you can ride with confidence.",
      },
      {
        heading: 'The Basic Rule: You Need a Valid License',
        body: "To legally operate a motorcycle in the Philippines, you must have one of the following:",
        list: [
          { label: 'Option A', text: "A valid foreign driver's license that includes motorcycle/scooter category (the most common situation)" },
          { label: 'Option B', text: "A valid foreign driver's license PLUS an International Driving Permit (IDP) issued in your home country" },
          { label: 'Option C', text: "A Philippine driver's license (for residents/long-term visitors who got one locally)" },
        ],
      },
      {
        heading: 'Do I Need an International Driving Permit (IDP)?',
        body: "This is where tourists get confused. The Philippines is a signatory to the 1968 Vienna Convention on Road Traffic, which means a foreign license is technically valid — but in practice, having an IDP as a companion document makes everything smoother if stopped.\n\nAn IDP is simply a translation of your home license into multiple languages. It's NOT a standalone document — your original license must accompany it. Most countries issue them through their automobile associations (AAA, AA, etc.) for around $20–25.",
        list: [
          { label: 'Do I legally need it?', text: "Technically no, if your home license is valid and in English. But practically — get one. It protects you." },
          { label: 'Duration', text: "Valid for 90 days for tourists. After 90 days you need a Philippine license." },
          { label: 'License category', text: "Your license must cover motorcycles. In most countries this is category A or a motorcycle endorsement. Check your license before you travel." },
        ],
      },
      {
        tip: "Your driver's license must have a photo and your name in Roman (Latin) alphabet. If it's in a non-Latin script (Chinese, Arabic, Thai, etc.), bring an IDP — it will translate your details.",
      },
      {
        heading: 'Country-Specific Notes',
        table: {
          headers: ['Country', 'License Valid?', 'IDP Recommended?', 'Notes'],
          rows: [
            ['USA', 'Yes', 'Recommended', 'Motorcycle endorsement required on license'],
            ['UK', 'Yes', 'Recommended', 'Category A on license'],
            ['Germany', 'Yes', 'Yes', 'IDP strongly recommended'],
            ['France', 'Yes', 'Yes', 'IDP strongly recommended'],
            ['Australia', 'Yes', 'Recommended', 'R class endorsement'],
            ['Japan', 'Technically', 'Required', 'Japanese licenses are often challenged without IDP'],
            ['China', 'No', 'N/A', 'Chinese licenses are not valid — you must get a Philippine license'],
            ['South Korea', 'Yes', 'Required', 'IDP required in practice'],
          ],
        },
      },
      {
        heading: 'What to Carry While Riding',
        body: "Every time you ride, have these with you:",
        list: [
          { label: '1.', text: "Original driver's license (from your home country)" },
          { label: '2.', text: "IDP (if your license is not in English or Roman script)" },
          { label: '3.', text: "Your KJM booking confirmation (serves as rental agreement)" },
          { label: '4.', text: "Passport or a clear photocopy of your passport" },
          { label: '5.', text: "Scooter registration document (OR — we include this with every rental)" },
        ],
      },
      {
        heading: 'What Happens If You Get Pulled Over',
        body: "Stay calm. The vast majority of tourist-rider encounters with Philippine traffic enforcers are brief and civil. Here's what to do:",
        list: [
          { label: 'Step 1', text: "Pull over immediately and safely when signaled. Turn off your engine." },
          { label: 'Step 2', text: "Keep your helmet on until the officer approaches — it shows you're following the law." },
          { label: 'Step 3', text: "Greet politely. 'Good morning, officer' goes a long way in Filipino culture." },
          { label: 'Step 4', text: "Present your license, IDP if applicable, and the scooter registration." },
          { label: 'Step 5', text: "If given a ticket (traffic citation), sign it — it's not an admission of guilt, it's acknowledgment. Pay at the traffic enforcement office later." },
          { label: 'Important', text: "Never offer money directly to an officer. This is bribery and can make your situation dramatically worse." },
        ],
      },
      {
        heading: 'The Most Common Violations (and Fines)',
        table: {
          headers: ['Violation', 'Fine (approx.)'],
          rows: [
            ['No helmet (rider)', '₱1,500'],
            ['No helmet (passenger)', '₱1,500'],
            ['Using phone while riding', '₱5,000'],
            ['No OR/CR (registration)', '₱300–500'],
            ['No license', '₱3,000 + impound'],
            ['Counterflow', '₱2,000'],
            ['Reckless driving', '₱2,000+'],
          ],
        },
      },
      {
        tip: "KJM rentals come with the OR (Official Receipt) and CR (Certificate of Registration) in a clear sleeve attached to the scooter. Don't remove it — you'll need it if stopped.",
      },
      { cta: true },
    ],
  },

  // ─── 6. Packing List ──────────────────────────────────────────────────────
  {
    slug: 'packing-scooter-trip',
    tag: 'Tips',
    title: 'What to Pack for a Scooter Trip in Cebu',
    excerpt: 'Sunscreen, rain gear, phone mount — our checklist for a comfortable multi-day ride around the island.',
    readTime: '3 min read',
    icon: 'ph:backpack-fill',
    image: '/tips/packing.jpg',
    publishedAt: '2025-03-01',
    sections: [
      {
        body: "Packing for a scooter trip is different from packing for a beach holiday. You need to move light, stay protected from sun and rain, and keep everything accessible. Here's the exact checklist we give to every KJM customer planning a multi-day tour.",
      },
      {
        heading: 'What KJM Provides (Don\'t Pack These)',
        list: [
          { label: '✓', text: "Full-face or open-face helmet (cleaned before every rental)" },
          { label: '✓', text: "Phone mount (universal fit, secure on all handlebars)" },
          { label: '✓', text: "Scooter registration (OR/CR) in attached sleeve" },
          { label: '✓', text: "Full tank of fuel on pickup" },
        ],
      },
      {
        heading: 'Sun Protection (Non-Negotiable)',
        body: "The Philippines is close to the equator, and riding creates a wind-cooling effect that tricks you into thinking you're not burning. You are burning.",
        list: [
          { label: 'SPF 50+ sunscreen', text: "Apply to arms, neck, and face before every ride. Reapply every 90 minutes." },
          { label: 'Long-sleeve light shirt', text: "A thin long-sleeve covers your arms without cooking you. Polyester wicks better than cotton." },
          { label: 'Sun gloves', text: "Optional but great for long rides — your hands are always exposed." },
          { label: 'UV-blocking visor', text: "If your helmet has a clear visor, add clip-on UV glasses or upgrade to a tinted visor." },
        ],
      },
      {
        heading: 'Rain Gear',
        body: "Cebu gets afternoon showers year-round, and during the wet season (June–November) you will definitely get rained on. A good rain layer weighs almost nothing but makes a huge difference.",
        list: [
          { label: 'Packable rain jacket', text: "Get one that fits in a ball. Uniqlo, Decathlon, and Lazada all have options for under ₱500." },
          { label: 'Waterproof bag cover', text: "If you're carrying a backpack, get a dry bag cover. Your clothes will thank you." },
          { label: 'Ziplock bags', text: "Phone, passport, and documents go in ziplock bags before you leave. Free, and works better than most pouches." },
        ],
      },
      {
        tip: "If rain catches you on the highway: pull into a petrol station (every 20–30km) and wait it out. Philippine afternoon rains are intense but usually pass within 20–40 minutes.",
      },
      {
        heading: 'Documents & Money',
        list: [
          { label: 'Driver\'s license', text: "And IDP if needed — see our legal guide" },
          { label: 'Passport copy', text: "Leave the original at your hotel safe. Carry a clear photocopy." },
          { label: 'Cash (PHP)', text: "Rural Cebu is still mostly cash. Carry ₱1,500–2,000/day for fuel, food, and entry fees." },
          { label: 'GCash/Maya', text: "Set these up before you go — they're accepted almost everywhere in cities now" },
        ],
      },
      {
        heading: 'Comfort Essentials',
        list: [
          { label: 'Water bottle (1L+)', text: "Fill up whenever you see a 7-Eleven. Dehydration sneaks up on riders." },
          { label: 'Snacks', text: "Bananas, biscuits, and nuts for energy on long stretches. Cebu has lots of roadside carinderias for proper meals." },
          { label: 'Offline maps', text: "Download your route on Maps.me before you leave — works without internet in the mountains." },
          { label: 'Power bank', text: "The phone mount uses your phone for navigation constantly. A 10,000mAh bank covers a full day." },
          { label: 'Light backpack (15–20L)', text: "Enough for your day kit without hanging too far off your back at speed." },
        ],
      },
      {
        heading: 'For Multi-Day Trips',
        body: "If you're keeping the scooter for several days, add these to your kit:",
        list: [
          { label: 'Bungee cords (2)', text: "Strap a bag to the rear seat rack — every KJM scooter has one." },
          { label: 'Small padlock', text: "For securing your helmet to the bike when you park and go exploring." },
          { label: 'Basic first aid', text: "Bandages, antiseptic wipes, and ibuprofen. Small kit, big peace of mind." },
          { label: 'KJM WhatsApp saved', text: "Save +63 975 298 4845 — we're available 24/7 for any issues on the road." },
        ],
      },
      {
        warning: "Don't overpay. Lots of tourist shops near Mactan Airport sell 'scooter travel kits' at inflated prices. Everything on this list is available at SM Supermarket or Lazada for normal prices.",
      },
      { cta: true },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
