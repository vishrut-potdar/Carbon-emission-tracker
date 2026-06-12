import { 
  IndustryCarbon, 
  RegionalGridIntensity, 
  SwapAlternative, 
  DailyInsightTip, 
  WisdomReflection 
} from '../types';

// Emission factors in kg CO2e (Cites EPA eGRID 2022, DEFRA, and IPCC reports)
export const EMISSION_FACTORS = {
  commute: {
    'drive-ice': 0.18, // kg per km of standard combustion car
    'drive-ev': 0.04,  // kg per km of electrical vehicle (average grid)
    'rail': 0.03,      // kg per km of commuter rail
    'bus': 0.07,       // kg per km of public transit bus
    'flight-domestic': 0.25, // kg per passenger-km (takeoff penalty included)
    'flight-intl': 0.16,     // kg per passenger-km
  },
  diet: {
    'vegan': 0.6,       // kg per daily diet equivalent
    'vegetarian': 1.3, // kg per daily diet equivalent
    'mediterranean': 1.8, // kg per daily diet equivalent
    'poultry-centric': 2.7, // kg per daily diet equivalent
    'beef-centric': 6.8, // kg per daily diet equivalent or heavy red meat meal
  },
  procurement: {
    'garments': 20.5,    // kg per clothing piece (industry manufacture average)
    'electronics': 175.0, // kg CO2e embodied impact for average premium laptop/phone
    'books': 1.2,        // kg CO2e per physical publication
    'appliances': 340.0, // average raw manufacturing footprint
    'furniture': 65.0,   // average wooden/metal household item
    'general': 4.5,      // per generic item
  }
};

export const APPLIANCE_PRESETS = [
  { id: 'hvac', name: 'Central AC / Heater (Combustion/Resistance)', watts: 3200, typicalMultiplier: 0.38, placeholder: 'Heating or cooling system (non heat pump)' },
  { id: 'heatpump', name: 'Air Source Heat Pump (Thermodynamic)', watts: 1500, typicalMultiplier: 0.12, placeholder: 'High efficiency heat pump' },
  { id: 'fridge', name: 'Household Refrigerator', watts: 180, typicalMultiplier: 0.38, placeholder: 'Always-on refrigeration' },
  { id: 'dryer', name: 'Clothes Clothes Dryer', watts: 2800, typicalMultiplier: 0.38, placeholder: 'Heavy resistance drying Cycle' },
  { id: 'computer', name: 'Workstation / Monitor Set', watts: 250, typicalMultiplier: 0.38, placeholder: 'Scholarly desk setup' },
  { id: 'lighting', name: 'Incandescent/Ambient Lighting (10 Bulbs)', watts: 600, typicalMultiplier: 0.38, placeholder: 'Legacy resistance yellow bulbs' },
  { id: 'lighting-led', name: 'LED Ambient Lighting (10 Bulbs)', watts: 80, typicalMultiplier: 0.38, placeholder: 'Modern high efficacy light diodes' },
  { id: 'boiler', name: 'Gas Water Boiler (Baseline equivalence)', watts: 2200, typicalMultiplier: 0.42, placeholder: 'Thermal baseline' }
];

export const INDUSTRIES_DATA: IndustryCarbon[] = [
  {
    id: 'energy',
    name: 'Power & Heat Generation',
    percentage: 31.8,
    annualGigaTons: 15.2,
    subSectors: [
      { name: 'Grid Electricity', percentage: 68 },
      { name: 'District Commercial Heating', percentage: 22 },
      { name: 'Fugitive Energy Extraction', percentage: 10 }
    ],
    editorialDescription: 'The largest carbon driver globally. Built on centuries of thermal legacy grids. Transitioning the baseline load via localized photovoltaic networks and synchronous geothermal blocks.'
  },
  {
    id: 'transport',
    name: 'Mobility & Freight Logistics',
    percentage: 16.2,
    annualGigaTons: 7.7,
    subSectors: [
      { name: 'Road Vehicles & Logistics', percentage: 74 },
      { name: 'Aviation Air Passages', percentage: 11 },
      { name: 'Maritime Cargo Vessels', percentage: 10 },
      { name: 'Rail Transit Networks', percentage: 5 }
    ],
    editorialDescription: 'High-energy kinetics driven almost exclusively by fossilized fluid energy. Swapping high-mass vehicles for mass transit and clean energy battery cells is the critical shift.'
  },
  {
    id: 'manufacturing',
    name: 'Heavy Industry & Metallurgy',
    percentage: 20.8,
    annualGigaTons: 9.9,
    subSectors: [
      { name: 'Iron, Steel & Smelting', percentage: 32 },
      { name: 'Cement & Concrete Curing', percentage: 28 },
      { name: 'Chemical Synthesis & Plastics', percentage: 25 },
      { name: 'Food Processing Machinery', percentage: 15 }
    ],
    editorialDescription: 'High-temperature thermal operations demanding specialized direct heat, often exceeding standard electric capability. Demands green hydrogen exploration.'
  },
  {
    id: 'agriculture',
    name: 'Agricultural Land Cultivation',
    percentage: 18.4,
    annualGigaTons: 8.8,
    subSectors: [
      { name: 'Enteric Beef Fermentation', percentage: 40 },
      { name: 'Nitrous Oxide Synthetic Fertilizer', percentage: 28 },
      { name: 'Peatland Drainage & Burning', percentage: 18 },
      { name: 'Rice Paddy Anaerobic Methane', percentage: 14 }
    ],
    editorialDescription: 'Biochemical pathways driven by global food demand metrics. Transitioning diets toward highly plant-stabilized cycles represents immediate carbon relief.'
  }
];

export const REGIONAL_INTENSITIES: RegionalGridIntensity[] = [
  {
    code: 'US-NW',
    name: 'US Pacific Northwest (Hydro Heavy)',
    carbonIntensity: 186,
    primarySource: 'Hydroelectric (48%)',
    secondarySource: 'Fossil gas (24%)',
    status: 'decarbonized',
    description: 'Relies on standard mountain hydropower corridors, leaving individual electricity usage highly insulated from carbon density.'
  },
  {
    code: 'US-TX',
    name: 'US Texas Grid (ERCOT Wind Hybrid)',
    carbonIntensity: 345,
    primarySource: 'Natural Gas (42%)',
    secondarySource: 'Wind / Solars (38%)',
    status: 'transitional',
    description: 'An aggressive wind expansion rapidly displaces coal base blocks, causing massive daily carbon-amplitude fluctuation.'
  },
  {
    code: 'EU-DE',
    name: 'Central Europe (German Grid Bloc)',
    carbonIntensity: 380,
    primarySource: 'Coal / Lignite (31%)',
    secondarySource: 'Solar / Wind (46%)',
    status: 'transitional',
    description: 'Navigates high-intensity industrial baselines. Renewable solar offsets peak hours but coal blocks stabilize baseline winter gaps.'
  },
  {
    code: 'EU-FR',
    name: 'France Grid (Nuclear Sourced)',
    carbonIntensity: 56,
    primarySource: 'Nuclear Fission (72%)',
    secondarySource: 'Hydroelectric (12%)',
    status: 'decarbonized',
    description: 'Extremely clean baselines driven by atomic standard fleet. Heating electric systems remains highly insulated here.'
  },
  {
    code: 'APAC-AU',
    name: 'Eastern Australia (Coal Heavy Network)',
    carbonIntensity: 620,
    primarySource: 'Pulverized Coal (68%)',
    secondarySource: 'Rooftop Solars (22%)',
    status: 'critical',
    description: 'High carbon density grid with exceptional fossil reliance. Residential electricity conservation generates extreme carbon avoidance.'
  },
  {
    code: 'APAC-IN',
    name: 'India Central Grid Alliance',
    carbonIntensity: 710,
    primarySource: 'Thermal Coal (74%)',
    secondarySource: 'Hydropower / Photovoltaic',
    status: 'critical',
    description: 'A growing structural grid with massive industrial needs. Highly vulnerable to base efficiency leaps and massive solar investments.'
  }
];

export const THE_SHIFT_PROTOCOL: SwapAlternative[] = [
  {
    id: 'swap-heat',
    title: 'Domestic Thermal Exchange',
    legacyName: 'Gas-Fired Combustion Boiler',
    legacyEmissionsYearly: 3100,
    legacyDescription: 'Burns fossil methane locally. Releases steady streams of warm CO₂ and localized particulate matter.',
    swapName: 'Air Source Thermoelectric Heat Pump',
    swapEmissionsYearly: 750,
    swapDescription: 'Uses energy to shift heat rather than generate it. Leverages electricity efficiently (COP up to 4.0).',
    effortScale: 'High',
    financialCost: 'Substantial',
    wisdomQuote: 'Replacing fire with thermal flow is the defining architectural step toward a quiet personal carbon discipline.'
  },
  {
    id: 'swap-commute',
    title: 'Individual Kinetic Device',
    legacyName: 'Combustion Engine Sedan (Gasoline)',
    legacyEmissionsYearly: 4400,
    legacyDescription: 'Propels 1.5 tons of steel via controlled explosions of refined petroleum. Tailpipe emissions are unmitigated.',
    swapName: 'Light electric commuter vehicle / Rail Pass',
    swapEmissionsYearly: 820,
    swapDescription: 'Draws from standardized rail grids or high-efficiency lithium cells, utilizing up to 88% kinetic-to-grid efficiency.',
    effortScale: 'Medium',
    financialCost: 'Moderate',
    wisdomQuote: 'In stillness and localized orbits, we recover both geographical connection and immense atmospheric ease.'
  },
  {
    id: 'swap-diet',
    title: 'Dietary Substance Protein Sourcing',
    legacyName: 'Ruminant Beef Focus Pattern',
    legacyEmissionsYearly: 2480,
    legacyDescription: 'Relies on heavy cattle land footprint and enteric methane release streams, coupled with complex feed silage lines.',
    swapName: 'Agroclimatic Plant & Pulse Cycle',
    swapEmissionsYearly: 220,
    swapDescription: 'Bypasses animal bio-conversions completely. Soil nutrients go directly to sustenance, improving local biodiversity.',
    effortScale: 'Low',
    financialCost: 'Low',
    wisdomQuote: 'Eating simply is a quiet feast of beans, legumes, and direct solar cycles.'
  },
  {
    id: 'swap-dryer',
    title: 'Laundry Moisture Extraction',
    legacyName: 'Electrical Resistance Clothes Dryer',
    legacyEmissionsYearly: 450,
    legacyDescription: 'Generates intense heating coil resistance, consuming several kilowatts per cycle to evaporate moisture into space.',
    swapName: 'Passive Solar Line Drying (Ventilation)',
    swapEmissionsYearly: 0,
    swapDescription: 'Employs ambient air currents and solar radiation to draw water compounds naturally with zero energy draw.',
    effortScale: 'Low',
    financialCost: 'Low',
    wisdomQuote: 'Letting clean linen rest in wind and bright light is a beautiful wabi-sabi ritual.'
  }
];

export const TIPS_STRATEGIES: DailyInsightTip[] = [
  {
    id: 'tip-phantom',
    title: 'Phantom Load Mitigation',
    category: 'Household Power',
    impactLabel: 'Significant avoidance',
    savingsKgYearly: 240,
    actionRequired: 'Unplug chargers, standby televisions, and idle computer units using physical smart-switches.',
    citation: 'IEA Space Energy Report 2021'
  },
  {
    id: 'tip-cold-wash',
    title: 'Mechanical Wash Cold Shift',
    category: 'Water Heating',
    impactLabel: 'Moderate impact',
    savingsKgYearly: 110,
    actionRequired: 'Configure utility cycle temperatures to 20°C (68°F), bypassing domestic boiler resistance.',
    citation: 'EPA Energy Star Technical Update'
  },
  {
    id: 'tip-procurement',
    title: 'Consuming Fewer Textiles',
    category: 'Procurement',
    impactLabel: 'Drastic avoidance',
    savingsKgYearly: 320,
    actionRequired: 'Decline fast-fashion cycles. Limit wardrobe accumulation to robust, mended canvas or wool.',
    citation: 'Ellen MacArthur Textile Circularity'
  },
  {
    id: 'tip-fridge-coil',
    title: 'Compressor Coil De-dusting',
    category: 'Household Power',
    impactLabel: 'Quiet efficiency',
    savingsKgYearly: 85,
    actionRequired: 'Vacuum the rear compressor dust grid of the primary refrigerator to avoid heat insulation.',
    citation: 'Appliance Manufacture Circular'
  },
  {
    id: 'tip-active-transit',
    title: 'Walking the First Mile',
    category: 'Mobility',
    impactLabel: 'Dual benefit',
    savingsKgYearly: 410,
    actionRequired: 'Swap any vehicle orbit under two kilometers for reflective pedestrian paths or bicycling.',
    citation: 'WHO Health & Mobility Research'
  }
];

export const COMMUNITY_DISCOURSE: WisdomReflection[] = [
  {
    id: 'discourse-1',
    author: 'Sarasvati N.',
    location: 'Kyoto, Japan',
    reflection: 'Mending our gas boiler felt like saving an old friend, but when we finally installed the air-to-water heat pump, the quiet was breathtaking. No more violent ignition rumbling—just a soft, steady hum conforming to local outdoor air currents.',
    scribeDate: '2026-05-14',
    consensus: 42
  },
  {
    id: 'discourse-2',
    author: 'Caelen M.',
    location: 'Oregon Coast',
    reflection: 'I have started treating my daily carbon ledger not as a scorecard, but as a translation ledger of my biological presence on this earth. Transitioning to cold-water wash cycles is surprisingly peaceful when you watch the clothes dry slowly over the porch in the sea breeze.',
    scribeDate: '2026-06-02',
    consensus: 27
  },
  {
    id: 'discourse-3',
    author: 'Elena R.',
    location: 'Toulouse, France',
    reflection: 'Our nuclear-backed grid in France means our electric heating is already low-carbon, but my procurement footprint was heavy. By committing to standard second-hand linen and mending my own denim, I’ve saved nearly 400kg CO2e this year alone. Mend, do feel shame in threadbare clothing; it tells a story.',
    scribeDate: '2026-06-08',
    consensus: 51
  },
  {
    id: 'discourse-4',
    author: 'Ji-Min H.',
    location: 'Incheon, S. Korea',
    reflection: 'Commuting by express rail is a sanctuary for reading. Bypassing rush hours gave me two hours every day of focused scholarship and saved 3.1 tons of carbon over driving. Quietness is efficiency.',
    scribeDate: '2026-06-10',
    consensus: 68
  }
];

export const TWELVE_MONTHS_TREND = [
  { month: 'Jul', unmitigated: 980, disciplined: 620, offsets: 100 },
  { month: 'Aug', unmitigated: 1010, disciplined: 590, offsets: 120 },
  { month: 'Sep', unmitigated: 890, disciplined: 520, offsets: 150 },
  { month: 'Oct', unmitigated: 910, disciplined: 480, offsets: 180 },
  { month: 'Nov', unmitigated: 1050, disciplined: 410, offsets: 200 },
  { month: 'Dec', unmitigated: 1120, disciplined: 430, offsets: 250 },
  { month: 'Jan', unmitigated: 1100, disciplined: 380, offsets: 220 },
  { month: 'Feb', unmitigated: 1040, disciplined: 360, offsets: 240 },
  { month: 'Mar', unmitigated: 920, disciplined: 340, offsets: 250 },
  { month: 'Apr', unmitigated: 850, disciplined: 310, offsets: 300 },
  { month: 'May', unmitigated: 810, disciplined: 290, offsets: 300 },
  { month: 'Jun', unmitigated: 830, disciplined: 270, offsets: 310 }
];
