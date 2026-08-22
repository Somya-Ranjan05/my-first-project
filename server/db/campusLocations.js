// Predefined Campus Locations with geographic coordinates, zones, and popular spots

export const CAMPUS_LOCATIONS = [
  {
    id: 'lib_main',
    name: 'Central Library (Main Commons & 2nd Floor)',
    shortName: 'Central Library',
    lat: 37.4275,
    lng: -122.1697,
    zone: 'North Academic',
    color: '#6366f1',
    description: 'Main campus study hub, computer labs, reference desks, 24/7 study floor',
    popular_spots: ['2nd Floor Silent Stacks', '1st Floor Information Commons', 'Cafe Entrance', 'Group Study Room B', 'Computer Lab 102']
  },
  {
    id: 'eng_hall',
    name: 'Engineering & Technology Hall (Packard Quad)',
    shortName: 'Engineering Hall',
    lat: 37.4290,
    lng: -122.1730,
    zone: 'North Academic',
    color: '#3b82f6',
    description: 'Robotics labs, maker space, software auditoriums, CS lecture halls',
    popular_spots: ['Packard Room 104', 'Maker Space & 3D Print Lab', 'Atrium Couches', 'Robotics Wing', 'Courtyard Patio']
  },
  {
    id: 'gates_cs',
    name: 'Gates Computer Science Building',
    shortName: 'Gates CS Building',
    lat: 37.4302,
    lng: -122.1738,
    zone: 'North Academic',
    color: '#0284c7',
    description: 'AI & Systems research labs, faculty offices, graduate computer lounges',
    popular_spots: ['Lobby Lounge', 'CS Basement Lab', '4th Floor Conference Room', 'Byte Cafe']
  },
  {
    id: 'sci_complex',
    name: 'Science & Chemistry Research Complex',
    shortName: 'Science Complex',
    lat: 37.4310,
    lng: -122.1680,
    zone: 'North Academic',
    color: '#06b6d4',
    description: 'Bio labs, chemistry lecture auditoriums, physics study lounge',
    popular_spots: ['Chem 101 Lecture Hall', 'Physics Reference Room', 'Organic Lab Foyer', 'Outdoor Fountain Steps']
  },
  {
    id: 'stu_union',
    name: 'Tressider Student Union & Food Court',
    shortName: 'Student Union',
    lat: 37.4240,
    lng: -122.1710,
    zone: 'Central Campus',
    color: '#f59e0b',
    description: 'Main dining hall, student club rooms, campus bookstore, coffee lounge, mail center',
    popular_spots: ['Food Court Corner Booths', 'Upstairs Lounge & Ballroom', 'Campus Bookstore Foyer', 'Outdoor Dining Patio', 'Package Center']
  },
  {
    id: 'bookstore_plaza',
    name: 'White Memorial Plaza & Campus Bookstore',
    shortName: 'White Plaza & Bookstore',
    lat: 37.4250,
    lng: -122.1700,
    zone: 'Central Campus',
    color: '#ea580c',
    description: 'Central outdoor pedestrian plaza, bookstore apparel section, student info tables',
    popular_spots: ['Plaza Fountain Benches', 'Bookstore 1st Floor Cafe', 'Bicycle Parking Racks']
  },
  {
    id: 'oval_lawn',
    name: 'The Memorial Oval & Main Quad Grass',
    shortName: 'The Oval & Main Quad',
    lat: 37.4295,
    lng: -122.1695,
    zone: 'Central Quad',
    color: '#14b8a6',
    description: 'Historic central quadrangle, palm drive lawn, church steps, fountain circles',
    popular_spots: ['Oval Lawn South End', 'Memorial Church Arcades', 'Building 200 Courtyard', 'Fountain Circle']
  },
  {
    id: 'rec_gym',
    name: 'Arrillaga Athletic Center & Field House',
    shortName: 'Athletic Center & Gym',
    lat: 37.4280,
    lng: -122.1610,
    zone: 'East Recreation',
    color: '#ef4444',
    description: 'Weight room, cardio pavilion, indoor basketball courts, locker rooms',
    popular_spots: ['Free Weights Area', 'Locker Room B', 'Basketball Court 2', 'Squash Courts', 'Front Check-in Desk']
  },
  {
    id: 'avery_aquatics',
    name: 'Avery Aquatic Center & Pool Stadium',
    shortName: 'Aquatic Center & Pool',
    lat: 37.4315,
    lng: -122.1605,
    zone: 'East Recreation',
    color: '#38bdf8',
    description: 'Competition lap pools, recreation diving well, spectator stands',
    popular_spots: ['Lap Pool Bleachers', 'Outdoor Showers Area', 'Locker Room Entrance']
  },
  {
    id: 'arts_pavilion',
    name: 'Bing Concert Hall & Arts Pavilion',
    shortName: 'Arts Pavilion',
    lat: 37.4330,
    lng: -122.1650,
    zone: 'North Arts',
    color: '#ec4899',
    description: 'Concert auditoriums, design studios, music practice rooms, art gallery',
    popular_spots: ['Concert Hall Main Foyer', 'Practice Room 12', 'Cantor Museum Lawn', 'Design Studio Benches']
  },
  {
    id: 'dorm_east',
    name: 'East Campus Residence Halls & Dining',
    shortName: 'East Dorms (Stern/Wilbur)',
    lat: 37.4220,
    lng: -122.1640,
    zone: 'South Residential',
    color: '#8b5cf6',
    description: 'Undergraduate residence halls, dining halls, courtyard lawns, laundry suites',
    popular_spots: ['Stern Dining Hall', 'Wilbur Courtyard Lawn', 'East Laundry Room', 'Dorm Common Lounge']
  },
  {
    id: 'dorm_west',
    name: 'West Campus Dorms & Roble Hall',
    shortName: 'West Dorms (Roble/Lagunita)',
    lat: 37.4245,
    lng: -122.1760,
    zone: 'South Residential',
    color: '#a855f7',
    description: 'Historic west dormitories, dining hall, arts studio, courtyards',
    popular_spots: ['Roble Courtyard', 'Lagunita Lakeside Lawn', 'Dining Room Tables']
  },
  {
    id: 'med_center',
    name: 'Stanford Medical Center & Health Sciences',
    shortName: 'Medical Center',
    lat: 37.4350,
    lng: -122.1750,
    zone: 'Northwest Medical',
    color: '#10b981',
    description: 'School of medicine lecture halls, hospital lobby, medical library',
    popular_spots: ['Hospital Main Atrium', 'Lane Medical Library 1st Floor', 'Hospital Cafeteria']
  },
  {
    id: 'gsb_quad',
    name: 'Graduate School of Business (Knight Quad)',
    shortName: 'Business School Quad',
    lat: 37.4285,
    lng: -122.1635,
    zone: 'East Academic',
    color: '#d97706',
    description: 'Business school auditoriums, Arbuckle dining pavilion, team study break-out rooms',
    popular_spots: ['Arbuckle Cafe', 'Bass Center Lounge', 'Courtyard Study Pods']
  },
  {
    id: 'transit_hub',
    name: 'Campus Transit Center & Bus Loop',
    shortName: 'Transit Hub',
    lat: 37.4300,
    lng: -122.1630,
    zone: 'East Perimeter',
    color: '#059669',
    description: 'Marguerite shuttle bus stops, bike sharing hub, rideshare pickup pavilion',
    popular_spots: ['Bus Stop A Shelter', 'Bike Repair Station', 'Transit Waiting Pavilion']
  },
  {
    id: 'stadium_lot',
    name: 'Stanford Stadium & Athletic Fields',
    shortName: 'Stadium & Sports Fields',
    lat: 37.4335,
    lng: -122.1580,
    zone: 'East Perimeter',
    color: '#e11d48',
    description: 'Football stadium, soccer fields, track & field grandstands, parking lot',
    popular_spots: ['Gate 2 Entrance', 'Track Bleachers', 'Tailgate Lot B']
  }
];

export function findLocationByName(name) {
  if (!name) return CAMPUS_LOCATIONS[0];
  const lower = name.toLowerCase();
  return (
    CAMPUS_LOCATIONS.find(
      (loc) => loc.name.toLowerCase().includes(lower) || loc.shortName.toLowerCase().includes(lower)
    ) || CAMPUS_LOCATIONS[0]
  );
}
