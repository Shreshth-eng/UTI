// ─── RECEIVER ───────────────────────────────────────────────
export const receiverStats = {
  total: 12,
  inTransit: 3,
  delivered: 8,
  pending: 1,
};

export const receiverOrders = [
  {
    id: "ORD-1042",
    from: "Delhi",
    to: "Amritsar",
    goods: "Electronics",
    weight: "500 kg",
    status: "In Transit",
    date: "Apr 13, 2026",
    driver: "Harjeet Singh",
    truck: "PB-10-AB-1234",
    eta: "Apr 16",
  },
  {
    id: "ORD-1038",
    from: "Mumbai",
    to: "Ludhiana",
    goods: "Textiles",
    weight: "1200 kg",
    status: "Delivered",
    date: "Apr 10, 2026",
    driver: "Ramesh Kumar",
    truck: "MH-04-CD-5678",
    eta: "Delivered",
  },
  {
    id: "ORD-1035",
    from: "Jaipur",
    to: "Amritsar",
    goods: "Furniture",
    weight: "800 kg",
    status: "Delivered",
    date: "Apr 6, 2026",
    driver: "Suresh Yadav",
    truck: "RJ-14-EF-9012",
    eta: "Delivered",
  },
  {
    id: "ORD-1030",
    from: "Chandigarh",
    to: "Amritsar",
    goods: "Food Items",
    weight: "300 kg",
    status: "Pending",
    date: "Apr 14, 2026",
    driver: "Not assigned",
    truck: "Not assigned",
    eta: "TBD",
  },
];

export const trackingSteps = [
  { label: "Order Placed", sub: "Apr 13, 9:00 AM", status: "done" },
  { label: "Picked Up by Driver", sub: "Apr 13, 2:30 PM", status: "done" },
  { label: "In Transit", sub: "Near Panipat · Live", status: "active" },
  { label: "Out for Delivery", sub: "Expected Apr 16", status: "pending" },
  { label: "Delivered", sub: "Expected Apr 16 Evening", status: "pending" },
];

export const receiverNotifications = [
  {
    id: 1,
    message: "Your order ORD-1042 is near Panipat",
    time: "10 mins ago",
    read: false,
  },
  {
    id: 2,
    message: "ORD-1038 has been delivered successfully",
    time: "2 days ago",
    read: true,
  },
  {
    id: 3,
    message: "Driver assigned for ORD-1042: Harjeet Singh",
    time: "Apr 13",
    read: true,
  },
];

// ─── SENDER ─────────────────────────────────────────────────
export const senderStats = {
  totalShipments: 24,
  active: 5,
  completed: 17,
  revenue: "₹4.2L",
};

export const senderShipments = [
  {
    id: "SHP-2041",
    to: "Amritsar",
    goods: "Electronics",
    weight: "500 kg",
    status: "In Transit",
    truck: "PB-10-AB-1234",
    driver: "Harjeet Singh",
    date: "Apr 13",
    amount: "₹18,500",
  },
  {
    id: "SHP-2038",
    to: "Ludhiana",
    goods: "Textiles",
    weight: "1200 kg",
    status: "Delivered",
    truck: "MH-04-CD-5678",
    driver: "Ramesh Kumar",
    date: "Apr 10",
    amount: "₹32,000",
  },
  {
    id: "SHP-2035",
    to: "Kolkata",
    goods: "Machine Parts",
    weight: "2000 kg",
    status: "In Transit",
    truck: "WB-06-GH-3456",
    driver: "Anil Sharma",
    date: "Apr 12",
    amount: "₹55,000",
  },
  {
    id: "SHP-2030",
    to: "Chennai",
    goods: "Chemicals",
    weight: "600 kg",
    status: "Pending",
    truck: "Not Assigned",
    driver: "Not Assigned",
    date: "Apr 14",
    amount: "₹22,000",
  },
  {
    id: "SHP-2028",
    to: "Hyderabad",
    goods: "Auto Parts",
    weight: "900 kg",
    status: "Delivered",
    truck: "TS-09-IJ-7890",
    driver: "Vikram Rao",
    date: "Apr 8",
    amount: "₹28,000",
  },
];

export const senderNotifications = [
  {
    id: 1,
    message: "SHP-2041 picked up — driver en route",
    time: "2 hrs ago",
    read: false,
  },
  {
    id: 2,
    message: "SHP-2035 crossed Nagpur checkpoint",
    time: "5 hrs ago",
    read: false,
  },
  {
    id: 3,
    message: "SHP-2038 delivered successfully",
    time: "2 days ago",
    read: true,
  },
];

// ─── TRUCK OWNER ─────────────────────────────────────────────
export const truckOwnerStats = {
  totalTrucks: 8,
  activeTrips: 3,
  available: 4,
  maintenance: 1,
};

export const trucks = [
  {
    id: "TRK-001",
    number: "PB-10-AB-1234",
    type: "Heavy",
    capacity: "15 Ton",
    driver: "Harjeet Singh",
    status: "On Trip",
    location: "Near Panipat",
    trip: "Delhi → Amritsar",
    earning: "₹18,500",
  },
  {
    id: "TRK-002",
    number: "MH-04-CD-5678",
    type: "Medium",
    capacity: "8 Ton",
    driver: "Ramesh Kumar",
    status: "Available",
    location: "Mumbai Depot",
    trip: "—",
    earning: "₹32,000",
  },
  {
    id: "TRK-003",
    number: "WB-06-GH-3456",
    type: "Heavy",
    capacity: "20 Ton",
    driver: "Anil Sharma",
    status: "On Trip",
    location: "Near Nagpur",
    trip: "Mumbai → Kolkata",
    earning: "₹55,000",
  },
  {
    id: "TRK-004",
    number: "RJ-14-EF-9012",
    type: "Light",
    capacity: "3 Ton",
    driver: "Mohan Lal",
    status: "Available",
    location: "Jaipur Depot",
    trip: "—",
    earning: "₹12,000",
  },
  {
    id: "TRK-005",
    number: "DL-01-KL-2345",
    type: "Medium",
    capacity: "10 Ton",
    driver: "Unassigned",
    status: "Maintenance",
    location: "Delhi Workshop",
    trip: "—",
    earning: "—",
  },
];

export const truckRequests = [
  {
    id: "REQ-501",
    from: "Ludhiana",
    to: "Delhi",
    goods: "Furniture",
    weight: "800 kg",
    date: "Apr 16",
    sender: "Sharma Exports",
    amount: "₹14,000",
  },
  {
    id: "REQ-502",
    from: "Chandigarh",
    to: "Mumbai",
    goods: "Auto Parts",
    weight: "1500 kg",
    date: "Apr 17",
    sender: "Punjab Motors",
    amount: "₹42,000",
  },
  {
    id: "REQ-503",
    from: "Delhi",
    to: "Jaipur",
    goods: "Food Items",
    weight: "500 kg",
    date: "Apr 15",
    sender: "FoodCo India",
    amount: "₹9,500",
  },
];

export const truckOwnerNotifications = [
  {
    id: 1,
    message: "New booking request REQ-501 from Sharma Exports",
    time: "30 mins ago",
    read: false,
  },
  {
    id: 2,
    message: "TRK-003 has crossed Nagpur checkpoint",
    time: "3 hrs ago",
    read: false,
  },
  {
    id: 3,
    message: "TRK-002 trip completed — ₹32,000 earned",
    time: "1 day ago",
    read: true,
  },
];

// ─── DRIVER ──────────────────────────────────────────────────
export const driverStats = {
  tripsCompleted: 47,
  currentTrip: "Active",
  totalEarned: "₹1.8L",
  rating: "4.8",
};

export const driverCurrentTrip = {
  id: "TRP-3042",
  from: "Delhi",
  to: "Amritsar",
  goods: "Electronics",
  weight: "500 kg",
  sender: "TechMart India",
  receiver: "Rahul Sharma",
  truck: "PB-10-AB-1234",
  startTime: "Apr 13, 9:00 AM",
  eta: "Apr 16, 6:00 PM",
  distance: "447 km",
  covered: "210 km",
  status: "In Transit",
};

export const driverTripSteps = [
  { label: "Trip Started", sub: "Apr 13, 9:00 AM · Delhi", status: "done" },
  {
    label: "Checkpoint — Panipat",
    sub: "Apr 13, 1:30 PM · Crossed",
    status: "done",
  },
  {
    label: "Currently Near Ambala",
    sub: "Live location · Now",
    status: "active",
  },
  {
    label: "Checkpoint — Jalandhar",
    sub: "Expected Apr 15",
    status: "pending",
  },
  {
    label: "Deliver to Amritsar",
    sub: "Expected Apr 16, 6:00 PM",
    status: "pending",
  },
];

export const driverPastTrips = [
  {
    id: "TRP-3038",
    from: "Mumbai",
    to: "Ludhiana",
    date: "Apr 10",
    earned: "₹4,800",
    rating: 5,
    status: "Completed",
  },
  {
    id: "TRP-3035",
    from: "Jaipur",
    to: "Amritsar",
    date: "Apr 6",
    earned: "₹3,200",
    rating: 4,
    status: "Completed",
  },
  {
    id: "TRP-3030",
    from: "Delhi",
    to: "Chandigarh",
    date: "Apr 2",
    earned: "₹2,100",
    rating: 5,
    status: "Completed",
  },
];

export const driverNotifications = [
  {
    id: 1,
    message: "New trip assigned: Delhi → Amritsar",
    time: "2 days ago",
    read: false,
  },
  {
    id: 2,
    message: "Payment of ₹4,800 credited for TRP-3038",
    time: "4 days ago",
    read: true,
  },
  {
    id: 3,
    message: "Your rating updated: 4.8 ⭐",
    time: "5 days ago",
    read: true,
  },
];
