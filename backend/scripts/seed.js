require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// ─── Drape Fashion Brand — Realistic Indian Seed Data ────────────────────────
// 50 customers across 6 cities with 2-3 orders each (~130 orders total)
// WHY: Realistic spend distribution ensures AI segments return varied results

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune'];

const DRAPE_PRODUCTS = [
  { name: 'Indigo Linen Kurta', category: 'kurta', price: 1899 },
  { name: 'Floral Anarkali Set', category: 'ethnic-wear', price: 3499 },
  { name: 'Straight Fit Denim', category: 'denim', price: 2199 },
  { name: 'Embroidered Palazzo Pants', category: 'ethnic-wear', price: 1699 },
  { name: 'Cotton Crop Top', category: 'western', price: 999 },
  { name: 'Printed Silk Saree', category: 'saree', price: 4999 },
  { name: 'Chikankari Kurta', category: 'kurta', price: 2799 },
  { name: 'Formal Blazer', category: 'western', price: 3999 },
  { name: 'Handloom Dupatta', category: 'accessories', price: 899 },
  { name: 'Leather Tote Bag', category: 'accessories', price: 2499 },
  { name: 'Block Print Co-ord Set', category: 'western', price: 2999 },
  { name: 'Phulkari Suit Set', category: 'ethnic-wear', price: 5499 },
  { name: 'Ripped Skinny Jeans', category: 'denim', price: 1899 },
  { name: 'Tie-Dye Maxi Dress', category: 'western', price: 2299 },
  { name: 'Bandhani Dupatta', category: 'accessories', price: 799 },
];

// Raw customer data
const CUSTOMERS_DATA = [
  // High-value (totalSpend > 15000) — 10 customers
  { name: 'Ananya Sharma', email: 'ananya.sharma@gmail.com', phone: '+919876543210', city: 'Mumbai', spend: 22500, tags: ['high-value', 'repeat-buyer'] },
  { name: 'Rohan Mehta', email: 'rohan.mehta@gmail.com', phone: '+919876543211', city: 'Delhi', spend: 18900, tags: ['high-value', 'repeat-buyer'] },
  { name: 'Priya Nair', email: 'priya.nair@gmail.com', phone: '+919876543212', city: 'Bengaluru', spend: 21000, tags: ['high-value', 'ethnic-lover'] },
  { name: 'Vikram Choudhary', email: 'vikram.choudhary@gmail.com', phone: '+919876543213', city: 'Hyderabad', spend: 17400, tags: ['high-value', 'repeat-buyer'] },
  { name: 'Shreya Iyer', email: 'shreya.iyer@gmail.com', phone: '+919876543214', city: 'Mumbai', spend: 25800, tags: ['high-value', 'sale-shopper'] },
  { name: 'Aditya Kapoor', email: 'aditya.kapoor@gmail.com', phone: '+919876543215', city: 'Pune', spend: 16200, tags: ['high-value', 'western-lover'] },
  { name: 'Kavita Reddy', email: 'kavita.reddy@gmail.com', phone: '+919876543216', city: 'Chennai', spend: 19600, tags: ['high-value', 'saree-lover'] },
  { name: 'Nikhil Bose', email: 'nikhil.bose@gmail.com', phone: '+919876543217', city: 'Delhi', spend: 15500, tags: ['high-value', 'repeat-buyer'] },
  { name: 'Pooja Desai', email: 'pooja.desai@gmail.com', phone: '+919876543218', city: 'Mumbai', spend: 23100, tags: ['high-value', 'ethnic-lover'] },
  { name: 'Arjun Singh', email: 'arjun.singh@gmail.com', phone: '+919876543219', city: 'Bengaluru', spend: 17800, tags: ['high-value', 'western-lover'] },

  // Mid-tier (5000–15000) — 25 customers
  { name: 'Neha Gupta', email: 'neha.gupta@gmail.com', phone: '+919876543220', city: 'Mumbai', spend: 12300, tags: ['regular', 'kurta-lover'] },
  { name: 'Rahul Joshi', email: 'rahul.joshi@gmail.com', phone: '+919876543221', city: 'Delhi', spend: 8900, tags: ['regular'] },
  { name: 'Sanya Malhotra', email: 'sanya.malhotra@gmail.com', phone: '+919876543222', city: 'Bengaluru', spend: 11200, tags: ['regular', 'western-lover'] },
  { name: 'Karan Verma', email: 'karan.verma@gmail.com', phone: '+919876543223', city: 'Hyderabad', spend: 7600, tags: ['regular'] },
  { name: 'Divya Krishnamurthy', email: 'divya.k@gmail.com', phone: '+919876543224', city: 'Chennai', spend: 13400, tags: ['regular', 'ethnic-lover'] },
  { name: 'Manish Agarwal', email: 'manish.agarwal@gmail.com', phone: '+919876543225', city: 'Pune', spend: 9800, tags: ['regular', 'sale-shopper'] },
  { name: 'Tanvi Patil', email: 'tanvi.patil@gmail.com', phone: '+919876543226', city: 'Pune', spend: 6700, tags: ['regular'] },
  { name: 'Rishabh Khanna', email: 'rishabh.khanna@gmail.com', phone: '+919876543227', city: 'Delhi', spend: 10100, tags: ['regular', 'denim-lover'] },
  { name: 'Ishita Chatterjee', email: 'ishita.c@gmail.com', phone: '+919876543228', city: 'Mumbai', spend: 14200, tags: ['regular', 'saree-lover'] },
  { name: 'Suresh Nambiar', email: 'suresh.nambiar@gmail.com', phone: '+919876543229', city: 'Bengaluru', spend: 8300, tags: ['regular'] },
  { name: 'Pallavi Saxena', email: 'pallavi.saxena@gmail.com', phone: '+919876543230', city: 'Delhi', spend: 11900, tags: ['regular', 'ethnic-lover'] },
  { name: 'Deepak Tiwari', email: 'deepak.tiwari@gmail.com', phone: '+919876543231', city: 'Mumbai', spend: 7100, tags: ['regular', 'sale-shopper'] },
  { name: 'Anita Pillai', email: 'anita.pillai@gmail.com', phone: '+919876543232', city: 'Chennai', spend: 9400, tags: ['regular'] },
  { name: 'Siddharth Roy', email: 'siddharth.roy@gmail.com', phone: '+919876543233', city: 'Hyderabad', spend: 12700, tags: ['regular', 'repeat-buyer'] },
  { name: 'Megha Srivastava', email: 'megha.s@gmail.com', phone: '+919876543234', city: 'Delhi', spend: 6500, tags: ['regular'] },
  { name: 'Varun Bhatt', email: 'varun.bhatt@gmail.com', phone: '+919876543235', city: 'Mumbai', spend: 13800, tags: ['regular', 'western-lover'] },
  { name: 'Sunita Rao', email: 'sunita.rao@gmail.com', phone: '+919876543236', city: 'Bengaluru', spend: 9200, tags: ['regular'] },
  { name: 'Amitabh Pandey', email: 'amitabh.p@gmail.com', phone: '+919876543237', city: 'Pune', spend: 7900, tags: ['regular', 'sale-shopper'] },
  { name: 'Radhika Menon', email: 'radhika.menon@gmail.com', phone: '+919876543238', city: 'Chennai', spend: 11400, tags: ['regular', 'ethnic-lover'] },
  { name: 'Gaurav Chawla', email: 'gaurav.chawla@gmail.com', phone: '+919876543239', city: 'Hyderabad', spend: 8600, tags: ['regular'] },
  { name: 'Preethi Subramaniam', email: 'preethi.sub@gmail.com', phone: '+919876543240', city: 'Chennai', spend: 10300, tags: ['regular', 'saree-lover'] },
  { name: 'Mohit Sharma', email: 'mohit.sharma@gmail.com', phone: '+919876543241', city: 'Delhi', spend: 5800, tags: ['regular'] },
  { name: 'Ritika Ahuja', email: 'ritika.ahuja@gmail.com', phone: '+919876543242', city: 'Mumbai', spend: 14900, tags: ['regular', 'repeat-buyer'] },
  { name: 'Sandeep Kumar', email: 'sandeep.kumar@gmail.com', phone: '+919876543243', city: 'Bengaluru', spend: 7300, tags: ['regular'] },
  { name: 'Lakshmi Venkat', email: 'lakshmi.v@gmail.com', phone: '+919876543244', city: 'Hyderabad', spend: 9700, tags: ['regular', 'ethnic-lover'] },

  // Low/new/lapsed (< 5000) — 15 customers
  { name: 'Tejas Parekh', email: 'tejas.parekh@gmail.com', phone: '+919876543245', city: 'Pune', spend: 1899, tags: ['new-customer'] },
  { name: 'Nandini Goel', email: 'nandini.goel@gmail.com', phone: '+919876543246', city: 'Delhi', spend: 2799, tags: ['new-customer'] },
  { name: 'Roshan D\'Souza', email: 'roshan.dsouza@gmail.com', phone: '+919876543247', city: 'Mumbai', spend: 999, tags: ['new-customer'] },
  { name: 'Yamini Prasad', email: 'yamini.p@gmail.com', phone: '+919876543248', city: 'Bengaluru', spend: 4299, tags: ['lapsed'] },
  { name: 'Chirag Mehrotra', email: 'chirag.m@gmail.com', phone: '+919876543249', city: 'Delhi', spend: 1499, tags: ['new-customer'] },
  { name: 'Bhavna Trivedi', email: 'bhavna.t@gmail.com', phone: '+919876543250', city: 'Pune', spend: 3699, tags: ['lapsed'] },
  { name: 'Arnav Bhatia', email: 'arnav.b@gmail.com', phone: '+919876543251', city: 'Mumbai', spend: 2199, tags: ['new-customer'] },
  { name: 'Swathi Rajan', email: 'swathi.rajan@gmail.com', phone: '+919876543252', city: 'Chennai', spend: 899, tags: ['new-customer'] },
  { name: 'Hardik Shah', email: 'hardik.shah@gmail.com', phone: '+919876543253', city: 'Hyderabad', spend: 4799, tags: ['lapsed'] },
  { name: 'Simran Kaur', email: 'simran.kaur@gmail.com', phone: '+919876543254', city: 'Delhi', spend: 1299, tags: ['new-customer'] },
  { name: 'Prasad Kulkarni', email: 'prasad.k@gmail.com', phone: '+919876543255', city: 'Bengaluru', spend: 3499, tags: ['lapsed'] },
  { name: 'Ankita Ghosh', email: 'ankita.ghosh@gmail.com', phone: '+919876543256', city: 'Mumbai', spend: 799, tags: ['new-customer'] },
  { name: 'Dev Rathore', email: 'dev.rathore@gmail.com', phone: '+919876543257', city: 'Hyderabad', spend: 2499, tags: ['new-customer'] },
  { name: 'Varsha Naidu', email: 'varsha.naidu@gmail.com', phone: '+919876543258', city: 'Chennai', spend: 4099, tags: ['lapsed'] },
  { name: 'Kunal Bajaj', email: 'kunal.bajaj@gmail.com', phone: '+919876543259', city: 'Pune', spend: 1699, tags: ['new-customer'] },
];

// Helper: pick a random element
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper: random integer in range
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate orders for a customer based on their total spend target
function generateOrders(customerId, targetSpend, lastOrderDate) {
  const orders = [];
  const orderCount = targetSpend > 10000 ? 3 : targetSpend > 4000 ? 2 : 1;
  let remaining = targetSpend;

  for (let i = 0; i < orderCount; i++) {
    const isLast = i === orderCount - 1;
    const amount = isLast ? remaining : Math.floor(remaining / (orderCount - i) * (0.8 + Math.random() * 0.4));
    remaining -= amount;

    // Generate items that roughly add up to the order amount
    const itemCount = randInt(1, 3);
    const items = [];
    let itemTotal = 0;
    for (let j = 0; j < itemCount; j++) {
      const product = pick(DRAPE_PRODUCTS);
      const qty = j === itemCount - 1 ? 1 : randInt(1, 2);
      items.push({ name: product.name, category: product.category, qty, price: product.price });
      itemTotal += product.price * qty;
    }

    // Spread orders over last 12 months
    const daysAgo = randInt(i * 30, (i + 1) * 120);
    const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    orders.push({
      customerId,
      amount: Math.max(amount, 499),
      date: orderDate,
      items,
    });
  }

  return orders;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Customer.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing customers and orders');

    // Compute lastOrderDate — most recent order date, simulated here as recent
    const now = new Date();

    let totalOrders = 0;

    for (const data of CUSTOMERS_DATA) {
      // Lapsed customers: last order > 90 days ago
      const isLapsed = data.tags.includes('lapsed');
      const daysAgo = isLapsed ? randInt(91, 180) : randInt(1, 60);
      const lastOrderDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      const customer = await Customer.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        totalSpend: data.spend,
        lastOrderDate,
        tags: data.tags,
      });

      const orders = generateOrders(customer._id, data.spend, lastOrderDate);
      await Order.insertMany(orders);
      totalOrders += orders.length;

      process.stdout.write('.');
    }

    console.log(`\n✅ Seeded ${CUSTOMERS_DATA.length} customers and ${totalOrders} orders`);
    console.log('🎉 Drape CRM is ready!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
