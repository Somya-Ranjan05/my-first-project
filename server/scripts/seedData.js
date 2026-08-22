import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ReportRepo, MatchRepo, NotificationRepo } from '../db/database.js';
import { AIProvider } from '../services/aiProvider.js';
import { MatchingEngine } from '../services/matchingEngine.js';
import { CAMPUS_LOCATIONS } from '../db/campusLocations.js';
import { UPLOADS_DIR } from '../services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check or create sample image files
function getOrGeneratePhoto(filename, label, colorHex, iconShape) {
  const jpgName = filename.replace('.svg', '.jpg');
  const jpgPath = path.join(UPLOADS_DIR, jpgName);
  if (fs.existsSync(jpgPath)) {
    return `/uploads/${jpgName}`;
  }

  const fullPath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(fullPath)) return `/uploads/${filename}`;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-${filename.replace(/[^a-z0-9]/gi, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="glow-${filename.replace(/[^a-z0-9]/gi, '')}" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="${colorHex}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${colorHex}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="600" height="450" fill="url(#bg-${filename.replace(/[^a-z0-9]/gi, '')})" rx="16"/>
  <circle cx="300" cy="200" r="160" fill="url(#glow-${filename.replace(/[^a-z0-9]/gi, '')})"/>

  <!-- Visual Item Representation -->
  <g filter="url(#shadow)" transform="translate(300, 195)">
    <rect x="-100" y="-80" width="200" height="160" rx="20" fill="#1e293b" stroke="${colorHex}" stroke-width="3" stroke-opacity="0.8"/>
    <circle cx="0" cy="0" r="45" fill="${colorHex}" fill-opacity="0.2"/>
    <text x="0" y="8" font-family="system-ui, sans-serif" font-size="34" font-weight="bold" fill="${colorHex}" text-anchor="middle">
      ${iconShape}
    </text>
  </g>

  <!-- Title Pill -->
  <rect x="50" y="340" width="500" height="65" rx="14" fill="#0f172a" fill-opacity="0.9" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  <text x="300" y="380" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#f8fafc" text-anchor="middle">
    ${label}
  </text>
</svg>`;

  fs.writeFileSync(fullPath, svgContent, 'utf-8');
  return `/uploads/${filename}`;
}

export const SAMPLE_REPORTS = [
  // --- PAIR 1: AirPods Pro (Electronics) ---
  {
    id: 'rep_lost_airpods_01',
    type: 'lost',
    title: 'Apple AirPods Pro 2 in Midnight Navy Case',
    description: 'Lost my AirPods Pro 2nd Gen while studying on the 2nd floor silent study area. They are inside a dark navy blue silicone protective case with a small metal ring clip.',
    category: 'electronics',
    photo_file: 'lost_airpods.jpg',
    photo_label: 'Apple AirPods Pro (Navy Case)',
    photo_color: '#3b82f6',
    photo_icon: '🎧',
    extracted_attributes: {
      item_type: 'Wireless Earbuds',
      brand: 'Apple',
      color: 'Midnight Navy Blue',
      material: 'Silicone & Plastic',
      unique_marks: 'Metal carabiner ring clip on silicone case',
      estimated_condition: 'Good Condition'
    },
    location_name: 'Central Library (Main Commons & 2nd Floor)',
    location_lat: 37.4275,
    location_lng: -122.1697,
    location_zone: 'North Academic',
    date_time: '2026-08-21T14:30:00Z',
    contact_name: 'Alex Rivera',
    contact_email: 'alex.rivera@stanford.edu',
    contact_phone: '(650) 555-0142'
  },
  {
    id: 'rep_found_airpods_01',
    type: 'found',
    title: 'Found Apple AirPods Pro with Navy Silicone Cover',
    description: 'Found a pair of Apple AirPods Pro inside a navy blue rubber sleeve resting on table 14 near the second-floor reference stacks in the library.',
    category: 'electronics',
    photo_file: 'found_airpods.svg',
    photo_label: 'Found AirPods Pro Cover',
    photo_color: '#60a5fa',
    photo_icon: '🎧',
    extracted_attributes: {
      item_type: 'Wireless Earbuds',
      brand: 'Apple',
      color: 'Navy Blue',
      material: 'Silicone Cover',
      unique_marks: 'Attached ring clip on top corner',
      estimated_condition: 'Like New'
    },
    location_name: 'Central Library (Main Commons & 2nd Floor)',
    location_lat: 37.4275,
    location_lng: -122.1697,
    location_zone: 'North Academic',
    date_time: '2026-08-21T16:00:00Z',
    contact_name: 'Library Front Desk',
    contact_email: 'library-circulation@campus.edu',
    contact_phone: '(650) 555-0100'
  },

  // --- PAIR 2: Hydro Flask (Water Bottle) ---
  {
    id: 'rep_lost_bottle_02',
    type: 'lost',
    title: 'Pacific Blue 32oz Hydro Flask with National Park Stickers',
    description: 'Left my wide-mouth 32oz Hydro Flask at the weight room bench press station. Has distinctive Yosemite and Grand Canyon stickers and a straw lid.',
    category: 'water_bottle',
    photo_file: 'lost_hydroflask.svg',
    photo_label: 'Blue Hydro Flask with Stickers',
    photo_color: '#06b6d4',
    photo_icon: '🚰',
    extracted_attributes: {
      item_type: 'Insulated Water Bottle',
      brand: 'Hydro Flask',
      color: 'Pacific Blue',
      material: 'Stainless Steel',
      unique_marks: 'Yosemite & Grand Canyon national park stickers',
      estimated_condition: 'Good with sticker wear'
    },
    location_name: 'Arrillaga Athletic Center & Field House',
    location_lat: 37.4280,
    location_lng: -122.1610,
    location_zone: 'East Recreation',
    date_time: '2026-08-20T17:15:00Z',
    contact_name: 'Maya Chen',
    contact_email: 'mchen@campus.edu',
    contact_phone: '(650) 555-0199'
  },
  {
    id: 'rep_found_bottle_02',
    type: 'found',
    title: 'Found Blue Hydro Flask Bottle with Outdoor Stickers',
    description: 'Found a blue insulated metal water bottle by the gym weight room rack. Covered with outdoor nature stickers and has a black flex straw cap.',
    category: 'water_bottle',
    photo_file: 'found_hydroflask.jpg',
    photo_label: 'Found Hydro Flask Gym',
    photo_color: '#22d3ee',
    photo_icon: '🚰',
    extracted_attributes: {
      item_type: 'Water Bottle',
      brand: 'Hydro Flask',
      color: 'Blue',
      material: 'Stainless Steel',
      unique_marks: 'Multiple colorful outdoor nature stickers',
      estimated_condition: 'Good'
    },
    location_name: 'Arrillaga Athletic Center & Field House',
    location_lat: 37.4280,
    location_lng: -122.1610,
    location_zone: 'East Recreation',
    date_time: '2026-08-20T18:45:00Z',
    contact_name: 'Gym Equipment Desk',
    contact_email: 'gym-desk@campus.edu',
    contact_phone: '(650) 555-0180'
  },

  // --- PAIR 3: Nike Backpack (Bag) ---
  {
    id: 'rep_lost_bag_03',
    type: 'lost',
    title: 'Black Nike Brasilia Backpack with Broken Front Zipper',
    description: 'Accidentally left my black Nike backpack underneath a corner booth table in the dining hall. The front pocket zipper pull is replaced with a silver paperclip.',
    category: 'bag',
    photo_file: 'lost_nike_bag.jpg',
    photo_label: 'Black Nike Backpack',
    photo_color: '#a855f7',
    photo_icon: '🎒',
    extracted_attributes: {
      item_type: 'Backpack',
      brand: 'Nike',
      color: 'Black with White Swoosh',
      material: 'Durable Polyester Canvas',
      unique_marks: 'Silver paperclip attached as front zipper pull',
      estimated_condition: 'Worn'
    },
    location_name: 'Tressider Student Union & Food Court',
    location_lat: 37.4240,
    location_lng: -122.1710,
    location_zone: 'Central Campus',
    date_time: '2026-08-19T13:00:00Z',
    contact_name: 'David Kim',
    contact_email: 'dkim99@campus.edu',
    contact_phone: '(650) 555-0128'
  },
  {
    id: 'rep_found_bag_03',
    type: 'found',
    title: 'Black Nike Bag Left by Food Court Booths',
    description: 'Turned in a black Nike backpack found unattended in the Student Union dining area. Front zipper has a paperclip temporary pull.',
    category: 'bag',
    photo_file: 'found_nike_bag.jpg',
    photo_label: 'Found Black Nike Backpack',
    photo_color: '#c084fc',
    photo_icon: '🎒',
    extracted_attributes: {
      item_type: 'Backpack',
      brand: 'Nike',
      color: 'Black',
      material: 'Canvas Fabric',
      unique_marks: 'Paperclip makeshift zipper pull on front pocket',
      estimated_condition: 'Good'
    },
    location_name: 'Tressider Student Union & Food Court',
    location_lat: 37.4240,
    location_lng: -122.1710,
    location_zone: 'Central Campus',
    date_time: '2026-08-19T14:20:00Z',
    contact_name: 'Union Info Booth',
    contact_email: 'union-services@campus.edu',
    contact_phone: '(650) 555-0111'
  },

  // --- PAIR 4: MacBook Air (Electronics) ---
  {
    id: 'rep_lost_macbook_04',
    type: 'lost',
    title: 'Silver Apple M2 MacBook Air 13-inch',
    description: 'Forgot my silver MacBook Air in Engineering Hall Room 104 during CS class. Has a small GitHub Octocat holographic sticker in the bottom right corner.',
    category: 'electronics',
    photo_file: 'lost_macbook.jpg',
    photo_label: 'Silver MacBook Air (GitHub Sticker)',
    photo_color: '#94a3b8',
    photo_icon: '💻',
    extracted_attributes: {
      item_type: 'Laptop Computer',
      brand: 'Apple',
      color: 'Silver Aluminum',
      material: 'Anodized Aluminum',
      unique_marks: 'Holographic GitHub Octocat sticker on bottom right palm rest',
      estimated_condition: 'Excellent'
    },
    location_name: 'Engineering & Technology Hall (Packard Quad)',
    location_lat: 37.4290,
    location_lng: -122.1730,
    location_zone: 'North Academic',
    date_time: '2026-08-21T11:00:00Z',
    contact_name: 'Sophia Patel',
    contact_email: 'spatel@campus.edu',
    contact_phone: '(650) 555-0167'
  },
  {
    id: 'rep_found_macbook_04',
    type: 'found',
    title: 'Silver Apple Laptop Found in Packard 104',
    description: 'Found a silver 13" Apple MacBook on a lecture desk in Room 104 Packard Engineering. Has an Octocat holographic decal.',
    category: 'electronics',
    photo_file: 'found_macbook.jpg',
    photo_label: 'Found Apple Laptop (Packard)',
    photo_color: '#cbd5e1',
    photo_icon: '💻',
    extracted_attributes: {
      item_type: 'Laptop',
      brand: 'Apple',
      color: 'Silver',
      material: 'Aluminum',
      unique_marks: 'Holographic cat sticker on lower corner',
      estimated_condition: 'Excellent'
    },
    location_name: 'Engineering & Technology Hall (Packard Quad)',
    location_lat: 37.4290,
    location_lng: -122.1730,
    location_zone: 'North Academic',
    date_time: '2026-08-21T12:15:00Z',
    contact_name: 'CS Department Office',
    contact_email: 'cs-office@campus.edu',
    contact_phone: '(650) 555-0150'
  },

  // --- PAIR 5: Toyota Car Keys (Keys) ---
  {
    id: 'rep_lost_keys_05',
    type: 'lost',
    title: 'Toyota Smart Key Fob on Blue Stanford Lanyard',
    description: 'Dropped my car key while sitting on the Memorial Oval lawn. Black 3-button Toyota key fob attached to a blue university lanyard with a brass house key.',
    category: 'keys',
    photo_file: 'lost_keys.jpg',
    photo_label: 'Toyota Key on Blue Lanyard',
    photo_color: '#eab308',
    photo_icon: '🔑',
    extracted_attributes: {
      item_type: 'Key Ring / Key Fob',
      brand: 'Toyota',
      color: 'Black fob on Blue Lanyard',
      material: 'Plastic, Fabric & Brass',
      unique_marks: 'Blue campus lanyard and round brass key',
      estimated_condition: 'Normal'
    },
    location_name: 'The Memorial Oval & Main Quad Grass',
    location_lat: 37.4295,
    location_lng: -122.1695,
    location_zone: 'Central Quad',
    date_time: '2026-08-20T15:30:00Z',
    contact_name: 'Jordan Lee',
    contact_email: 'jlee@campus.edu',
    contact_phone: '(650) 555-0133'
  },
  {
    id: 'rep_found_keys_05',
    type: 'found',
    title: 'Toyota Remote Key with Blue Campus Lanyard',
    description: 'Found a set of keys with a Toyota electronic fob and blue lanyard on the grass by the Oval fountain.',
    category: 'keys',
    photo_file: 'found_keys.jpg',
    photo_label: 'Found Toyota Keys Oval',
    photo_color: '#fde047',
    photo_icon: '🔑',
    extracted_attributes: {
      item_type: 'Key Set',
      brand: 'Toyota',
      color: 'Black / Blue',
      material: 'Plastic & Metal',
      unique_marks: 'Blue university lanyard attached',
      estimated_condition: 'Good'
    },
    location_name: 'The Memorial Oval & Main Quad Grass',
    location_lat: 37.4295,
    location_lng: -122.1695,
    location_zone: 'Central Quad',
    date_time: '2026-08-20T17:00:00Z',
    contact_name: 'Campus Public Safety',
    contact_email: 'safety-dispatch@campus.edu',
    contact_phone: '(650) 555-0109'
  },

  // --- PAIR 6: Ray-Ban Glasses (Accessories) ---
  {
    id: 'rep_lost_glasses_06',
    type: 'lost',
    title: 'Ray-Ban Clubmaster Tortoise Prescription Glasses',
    description: 'Left my brown tortoise shell Ray-Ban prescription eyeglasses in Chem 101 lecture hall in the Science Complex. Inside a brown Ray-Ban leather case.',
    category: 'accessories',
    photo_file: 'lost_glasses.jpg',
    photo_label: 'Ray-Ban Clubmaster Tortoise',
    photo_color: '#f97316',
    photo_icon: '👓',
    extracted_attributes: {
      item_type: 'Prescription Glasses',
      brand: 'Ray-Ban',
      color: 'Tortoise Brown & Gold',
      material: 'Acetate & Metal',
      unique_marks: 'Clubmaster classic frame with brown case',
      estimated_condition: 'Like New'
    },
    location_name: 'Science & Chemistry Research Complex',
    location_lat: 37.4310,
    location_lng: -122.1680,
    location_zone: 'North Academic',
    date_time: '2026-08-19T10:00:00Z',
    contact_name: 'Rachel Adams',
    contact_email: 'radams@campus.edu',
    contact_phone: '(650) 555-0177'
  },
  {
    id: 'rep_found_glasses_06',
    type: 'found',
    title: 'Tortoise Ray-Ban Eyeglasses in Case',
    description: 'Brown tortoise shell glasses in leather case found in Science building lecture hall Chem 101 row F.',
    category: 'accessories',
    photo_file: 'found_glasses.jpg',
    photo_label: 'Found Ray-Ban Eyeglasses',
    photo_color: '#fb923c',
    photo_icon: '👓',
    extracted_attributes: {
      item_type: 'Eyeglasses',
      brand: 'Ray-Ban',
      color: 'Brown Tortoise',
      material: 'Acetate & Gold Rim',
      unique_marks: 'Brown protective case included',
      estimated_condition: 'Good'
    },
    location_name: 'Science & Chemistry Research Complex',
    location_lat: 37.4310,
    location_lng: -122.1680,
    location_zone: 'North Academic',
    date_time: '2026-08-19T11:30:00Z',
    contact_name: 'Chemistry Dept Lost & Found',
    contact_email: 'chem-admin@campus.edu',
    contact_phone: '(650) 555-0145'
  },

  // --- UNMATCHED SINGLE ITEMS ---
  {
    id: 'rep_lost_calc_07',
    type: 'lost',
    title: 'Casio fx-991EX Scientific Calculator',
    description: 'Black and white Casio advanced scientific calculator with "JD" engraved in pencil on back cover. Lost near Engineering Hall benches.',
    category: 'electronics',
    photo_file: 'lost_calc.svg',
    photo_label: 'Casio fx-991EX Calculator',
    photo_color: '#64748b',
    photo_icon: '🧮',
    extracted_attributes: {
      item_type: 'Scientific Calculator',
      brand: 'Casio',
      color: 'Black & White',
      material: 'Plastic',
      unique_marks: 'JD engraved on reverse side',
      estimated_condition: 'Good'
    },
    location_name: 'Engineering & Technology Hall (Packard Quad)',
    location_lat: 37.4290,
    location_lng: -122.1730,
    location_zone: 'North Academic',
    date_time: '2026-08-18T16:00:00Z',
    contact_name: 'John Doe',
    contact_email: 'johnd@campus.edu',
    contact_phone: '(650) 555-0188'
  },
  {
    id: 'rep_found_id_08',
    type: 'found',
    title: 'Stanford Student ID Card - Sarah Jenkins',
    description: 'Found campus student ID badge on the walkway towards the Transit Hub shuttle bus loop.',
    category: 'id_card',
    photo_file: 'found_id.svg',
    photo_label: 'Campus Student ID Card',
    photo_color: '#ef4444',
    photo_icon: '🪪',
    extracted_attributes: {
      item_type: 'Student ID Card',
      brand: 'Campus Card Services',
      color: 'Red & White',
      material: 'Plastic Smart Card',
      unique_marks: 'Name: Sarah Jenkins, Class of 2027',
      estimated_condition: 'Good'
    },
    location_name: 'Campus Transit Center & Bus Loop',
    location_lat: 37.4300,
    location_lng: -122.1630,
    location_zone: 'East Perimeter',
    date_time: '2026-08-21T18:00:00Z',
    contact_name: 'Transit Booth',
    contact_email: 'transit@campus.edu',
    contact_phone: '(650) 555-0105'
  }
];

export async function seedDatabase() {
  console.log('🌱 Seeding Smart Campus Lost & Found database...');

  // Clear existing
  ReportRepo.clearAll();

  // Insert reports with embeddings & generated photos
  const createdReports = [];
  for (const item of SAMPLE_REPORTS) {
    const photoUrl = getOrGeneratePhoto(item.photo_file, item.photo_label, item.photo_color, item.photo_icon);

    const attrText = Object.entries(item.extracted_attributes || {})
      .map(([k, v]) => (v ? `${k}: ${v}` : ''))
      .join(', ');

    const textToEmbed = `${item.title}. ${item.description}. Category: ${item.category}. Attributes: ${attrText}. Location: ${item.location_name}.`;
    const embedding = await AIProvider.generateEmbedding(textToEmbed);

    const report = ReportRepo.create({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      category: item.category,
      photo_url: photoUrl,
      extracted_attributes: item.extracted_attributes,
      location_name: item.location_name,
      location_lat: item.location_lat,
      location_lng: item.location_lng,
      location_zone: item.location_zone,
      date_time: item.date_time,
      contact_name: item.contact_name,
      contact_email: item.contact_email,
      contact_phone: item.contact_phone,
      status: 'open',
      embedding: embedding
    });

    createdReports.push(report);
  }

  console.log(`✅ Created ${createdReports.length} reports.`);

  // Run matching engine pairwise across all lost vs found reports
  console.log('🤖 Running AI Matching Engine across all reports...');
  let totalMatches = 0;
  for (const rep of createdReports) {
    if (rep.type === 'lost') {
      const matches = await MatchingEngine.processMatchesForReport(rep.id);
      totalMatches += matches.length;
    }
  }

  const highConfMatches = MatchRepo.findAllHighConfidence(70);
  console.log(`🎯 Generated ${totalMatches} total match candidates. Found ${highConfMatches.length} high-confidence matches (>70%).`);

  return {
    reportsCount: createdReports.length,
    matchesCount: totalMatches,
    highConfidenceCount: highConfMatches.length
  };
}

// Standalone execution script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then((res) => {
      console.log('🎉 Seed complete!', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}
