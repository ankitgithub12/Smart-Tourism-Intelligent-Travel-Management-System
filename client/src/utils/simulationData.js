// Simulation helper utilities for generating realistic real-time travel and smart city data

export const initialAgencyData = {
  stats: [
    { label: 'Active Bookings', value: 45, icon: 'Users', color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Revenue (Month)', value: '₹2.4L', icon: 'DollarSign', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Listed Properties', value: 12, icon: 'Building2', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Average Rating', value: '4.8', icon: 'Star', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ],
  packages: [
    { id: 1, name: 'Ocean Breeze Escape', destination: 'Baga, Goa', duration: '3 Days, 2 Nights', price: 12500, status: 'Active', bookings: 24, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60' },
    { id: 2, name: 'Mountain Peak Trekking', destination: 'Manali, HP', duration: '5 Days, 4 Nights', price: 18900, status: 'Active', bookings: 18, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop&q=60' },
    { id: 3, name: 'Royal Heritage Quest', destination: 'Jaipur, Rajasthan', duration: '4 Days, 3 Nights', price: 15400, status: 'Active', bookings: 31, image: 'https://images.unsplash.com/photo-1477584308800-b44223df0b15?w=500&auto=format&fit=crop&q=60' },
    { id: 4, name: 'Desert Dune Safari', destination: 'Jaisalmer, Rajasthan', duration: '2 Days, 1 Night', price: 8900, status: 'Active', bookings: 12, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60' },
  ],
  tours: [
    { id: 'T-101', package: 'Ocean Breeze Escape', date: '2026-05-25', time: '09:00 AM', guide: 'Arun Kumar', status: 'Upcoming', capacity: 15, filled: 12 },
    { id: 'T-102', package: 'Royal Heritage Quest', date: '2026-05-26', time: '10:30 AM', guide: 'Meera Sen', status: 'Fully Booked', capacity: 20, filled: 20 },
    { id: 'T-103', package: 'Desert Dune Safari', date: '2026-05-28', time: '04:00 PM', guide: 'Rajesh Yadav', status: 'Upcoming', capacity: 25, filled: 15 },
  ],
  vehicles: [
    { id: 'V-001', model: 'Toyota Innova Crysta', type: 'Cab', driver: 'Sanjay Dutt', currentLoad: 4, status: 'Active', fuel: 82, location: 'Near Airport' },
    { id: 'V-002', model: 'Force Traveller (17 str)', type: 'Mini Bus', driver: 'Karan Singh', currentLoad: 12, status: 'Active', fuel: 65, location: 'City Center' },
    { id: 'V-003', model: 'Mahindra Scorpio', type: 'SUV', driver: 'Vikram Pal', currentLoad: 0, status: 'Idle', fuel: 90, location: 'Office Depot' },
    { id: 'V-004', model: 'Tempo Traveller (12 str)', type: 'Mini Bus', driver: 'Rajesh Nair', currentLoad: 0, status: 'Maintenance', fuel: 40, location: 'Service Workshop' },
  ],
  guides: [
    { id: 'G-201', name: 'Arun Kumar', specialty: 'Goa Heritage & Beaches', rating: 4.9, status: 'Assigned', activeTours: 2, contact: '+91 98765 43210' },
    { id: 'G-202', name: 'Meera Sen', specialty: 'Historical Architecture', rating: 4.8, status: 'Assigned', activeTours: 1, contact: '+91 98765 43211' },
    { id: 'G-203', name: 'Rajesh Yadav', specialty: 'Desert survival & culture', rating: 4.7, status: 'Available', activeTours: 0, contact: '+91 98765 43212' },
    { id: 'G-204', name: 'Sneha Sharma', specialty: 'Himalayan Mountaineering', rating: 4.9, status: 'Available', activeTours: 0, contact: '+91 98765 43213' },
  ],
  bookings: [
    { id: 'B-8901', customer: 'Rahul Sharma', listing: 'Ocean Breeze Escape', dates: '25 May - 28 May', amount: 25000, status: 'Confirmed', time: '5 mins ago' },
    { id: 'B-8902', customer: 'Priya Patel', listing: 'Cab Service (V-001)', dates: '24 May', amount: 3500, status: 'Pending', time: '15 mins ago' },
    { id: 'B-8903', customer: 'Amit Kumar', listing: 'Royal Heritage Quest', dates: '26 May - 30 May', amount: 30800, status: 'Confirmed', time: '1 hour ago' },
    { id: 'B-8904', customer: 'Deepak Rao', listing: 'Desert Dune Safari', dates: '28 May - 29 May', amount: 8900, status: 'Cancelled', time: '3 hours ago' },
  ]
};

export const initialAdminData = {
  crowdZones: [
    { id: 'zone-1', name: 'Beach Road Boardwalk', density: 78, status: 'Critical', visitors: 1420 },
    { id: 'zone-2', name: 'Old Town Square', density: 64, status: 'High', visitors: 980 },
    { id: 'zone-3', name: 'City Museum Complex', density: 42, status: 'Moderate', visitors: 450 },
    { id: 'zone-4', name: 'Central Transit Hub', density: 85, status: 'Critical', visitors: 2100 },
    { id: 'zone-5', name: 'Shopping Arcade East', density: 31, status: 'Low', visitors: 320 }
  ],
  trafficPoints: [
    { id: 'tf-1', name: 'Airport Expressway', speed: 68, congestion: 'Low', status: 'Clear' },
    { id: 'tf-2', name: 'Museum Bypass Junction', speed: 22, congestion: 'Heavy', status: 'Congested' },
    { id: 'tf-3', name: 'Coastal Ring Road', speed: 45, congestion: 'Moderate', status: 'Alert' },
    { id: 'tf-4', name: 'Market Main Blvd', speed: 12, congestion: 'Severe', status: 'Gridlocked' }
  ],
  publicTransports: [
    { id: 'BUS-104', line: 'Blue Route 4A', capacity: 60, currentLoad: 52, status: 'On Time', speed: 38 },
    { id: 'BUS-211', line: 'Green Loop 12', capacity: 45, currentLoad: 12, status: 'Delayed', speed: 25 },
    { id: 'METRO-L1', line: 'Metro Line 1 (Coastal)', capacity: 400, currentLoad: 310, status: 'On Time', speed: 70 },
    { id: 'BUS-098', line: 'Airport Shuttle', capacity: 30, currentLoad: 28, status: 'On Time', speed: 50 }
  ],
  emergencies: [
    { id: 'EMG-412', location: 'Beach Road (Zone 1)', type: 'Medical Aid Required', severity: 'High', status: 'Dispatched', reporter: 'CCTV AI Cam 3', time: '2 mins ago' },
    { id: 'EMG-413', location: 'Museum Bypass', type: 'Minor Fender Bender', severity: 'Medium', status: 'En Route', reporter: 'Traffic Police', time: '12 mins ago' },
    { id: 'EMG-414', location: 'Central Hub Level 2', type: 'Crowd Gate Blockage', severity: 'Low', status: 'Resolved', reporter: 'Staff Checkpoint', time: '40 mins ago' }
  ],
  resources: {
    wasteBins: [
      { id: 'WB-01', location: 'Boardwalk A', fillLevel: 89, status: 'Action Needed' },
      { id: 'WB-02', location: 'Boardwalk D', fillLevel: 42, status: 'Normal' },
      { id: 'WB-03', location: 'Museum Gate', fillLevel: 95, status: 'Critical' },
      { id: 'WB-04', location: 'Central Hub Plaza', fillLevel: 25, status: 'Normal' }
    ],
    powerUsage: [
      { hour: '08:00', load: 320 },
      { hour: '10:00', load: 450 },
      { hour: '12:00', load: 580 },
      { hour: '14:00', load: 610 },
      { hour: '16:00', load: 570 },
      { hour: '18:00', load: 740 },
      { hour: '20:00', load: 810 },
      { hour: '22:00', load: 620 },
    ],
    waterConsumption: [
      { hour: '08:00', flow: 120 },
      { hour: '10:00', flow: 180 },
      { hour: '12:00', flow: 210 },
      { hour: '14:00', flow: 190 },
      { hour: '16:00', flow: 165 },
      { hour: '18:00', flow: 220 },
      { hour: '20:00', flow: 240 },
      { hour: '22:00', flow: 150 },
    ]
  },
  agencies: [
    { id: 'AG-901', name: 'Pristine Beach Tours', owner: 'Vikram Joshi', license: 'L-Goa-44129', status: 'Pending', rating: 0, date: 'May 20, 2026' },
    { id: 'AG-902', name: 'Peak Adventure Co.', owner: 'Tenzing Norgay Jr.', license: 'L-HP-10023', status: 'Pending', rating: 0, date: 'May 21, 2026' },
    { id: 'AG-903', name: 'Desert Nomads Group', owner: 'Salim Khan', license: 'L-Raj-55312', status: 'Approved', rating: 4.6, date: 'May 10, 2026' },
    { id: 'AG-904', name: 'Agra City Guides', owner: 'Rashid Ali', license: 'L-UP-00892', status: 'Rejected', rating: 2.1, date: 'May 08, 2026' }
  ],
  sustainability: {
    ecoScore: 78,
    carbonOffset: 12.4, // tonnes
    totalPlasticsCollected: 450, // kg
    greenFleetRatio: 65, // %
  }
};

// Generates next incremental tick of data simulation for realistic real-time dashboard updates
export const tickAgencyData = (current) => {
  // Update bookings/stats/vehicles randomly
  const newStats = current.stats.map(s => {
    if (s.label === 'Active Bookings') {
      const delta = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      return { ...s, value: Math.max(10, s.value + delta) };
    }
    if (s.label === 'Revenue (Month)') {
      const numericVal = parseFloat(s.value.replace('₹', '').replace('L', ''));
      const delta = Math.random() > 0.7 ? 0.1 : 0;
      return { ...s, value: `₹${(numericVal + delta).toFixed(1)}L` };
    }
    return s;
  });

  const newVehicles = current.vehicles.map(v => {
    if (v.status === 'Active') {
      const fuelUse = Math.random() > 0.8 ? 1 : 0;
      const loadChange = Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      return {
        ...v,
        fuel: Math.max(10, v.fuel - fuelUse),
        currentLoad: Math.max(0, Math.min(15, v.currentLoad + loadChange))
      };
    }
    return v;
  });

  // Maybe add a booking
  let newBookings = [...current.bookings];
  if (Math.random() > 0.9) {
    const customers = ['Aditya Verma', 'Karishma Kapoor', 'Siddharth Roy', 'Neha Sen', 'Rohan Gupta'];
    const p = current.packages[Math.floor(Math.random() * current.packages.length)];
    const newB = {
      id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      listing: p.name,
      dates: '28 May - 31 May',
      amount: p.price,
      status: Math.random() > 0.15 ? 'Confirmed' : 'Pending',
      time: 'Just now'
    };
    newBookings = [newB, ...newBookings.slice(0, 5)];
  }

  return {
    ...current,
    stats: newStats,
    vehicles: newVehicles,
    bookings: newBookings
  };
};

export const tickAdminData = (current) => {
  // Update crowd zones
  const newZones = current.crowdZones.map(z => {
    const delta = Math.floor((Math.random() - 0.5) * 6);
    const newDensity = Math.max(10, Math.min(100, z.density + delta));
    let status = 'Low';
    if (newDensity > 75) status = 'Critical';
    else if (newDensity > 55) status = 'High';
    else if (newDensity > 30) status = 'Moderate';

    return {
      ...z,
      density: newDensity,
      visitors: Math.max(50, z.visitors + delta * 15),
      status
    };
  });

  // Update traffic points
  const newTraffic = current.trafficPoints.map(t => {
    const deltaSpeed = Math.floor((Math.random() - 0.5) * 8);
    const newSpeed = Math.max(5, Math.min(90, t.speed + deltaSpeed));
    let congestion = 'Low';
    let status = 'Clear';
    if (newSpeed < 20) {
      congestion = 'Severe';
      status = 'Gridlocked';
    } else if (newSpeed < 35) {
      congestion = 'Heavy';
      status = 'Congested';
    } else if (newSpeed < 55) {
      congestion = 'Moderate';
      status = 'Alert';
    }
    return { ...t, speed: newSpeed, congestion, status };
  });

  // Update waste bins fill level
  const newWasteBins = current.resources.wasteBins.map(b => {
    const deltaFill = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0;
    const newFill = Math.min(100, b.fillLevel + deltaFill);
    return {
      ...b,
      fillLevel: newFill,
      status: newFill > 85 ? 'Critical' : newFill > 70 ? 'Action Needed' : 'Normal'
    };
  });

  // Live emergency addition
  let newEmergencies = [...current.emergencies];
  if (Math.random() > 0.95) {
    const locations = ['Airport Expressway', 'Boardwalk D', 'Old Town Square', 'Tech Hub Stn'];
    const types = ['Traffic Stagnation', 'Fire Alarm Tripped', 'Lost Child Report', 'Suspicious Package'];
    const severities = ['Low', 'Medium', 'High'];
    const newE = {
      id: `EMG-${Math.floor(400 + Math.random() * 200)}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: 'Pending Review',
      reporter: 'AI Visual Agent ' + Math.floor(1 + Math.random() * 5),
      time: 'Just now'
    };
    newEmergencies = [newE, ...newEmergencies.slice(0, 4)];
  }

  // Update public transports loads
  const newTransports = current.publicTransports.map(pt => {
    const loadChange = Math.floor((Math.random() - 0.5) * 6);
    return {
      ...pt,
      currentLoad: Math.max(0, Math.min(pt.capacity, pt.currentLoad + loadChange))
    };
  });

  return {
    ...current,
    crowdZones: newZones,
    trafficPoints: newTraffic,
    emergencies: newEmergencies,
    publicTransports: newTransports,
    resources: {
      ...current.resources,
      wasteBins: newWasteBins
    }
  };
};
