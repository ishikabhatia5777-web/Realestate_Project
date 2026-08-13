const mongoose = require('mongoose');
const Property = require('./src/models/Property');
require('dotenv').config({ path: './.env' });

async function updateDB() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate_db');
  const properties = await Property.find({});
  for (let p of properties) {
    if (p.price > 10000) {
      p.price = p.price / 10;
    } else {
      p.price = Math.round(p.price / 5);
    }
    
    if (p.priceGuide) {
      p.priceGuide = p.priceGuide.replace(/Offers Over \$([\d,]+)/g, (match, p1) => {
        let val = parseInt(p1.replace(/,/g, ''));
        return 'Offers Over $' + (val/10).toLocaleString('en-US');
      });
      p.priceGuide = p.priceGuide.replace(/Guide: \$([\d,]+) - \$([\d,]+)/g, (match, p1, p2) => {
        let val1 = parseInt(p1.replace(/,/g, ''));
        let val2 = parseInt(p2.replace(/,/g, ''));
        return 'Guide: $' + (val1/10).toLocaleString('en-US') + ' - $' + (val2/10).toLocaleString('en-US');
      });
      p.priceGuide = p.priceGuide.replace(/Auction Guide \$([\d,]+)/g, (match, p1) => {
        let val = parseInt(p1.replace(/,/g, ''));
        return 'Auction Guide $' + (val/10).toLocaleString('en-US');
      });
    }
    
    await p.save();
  }
  console.log('Updated prices in MongoDB');
  process.exit(0);
}
updateDB();
