const fs = require('fs');
let content = fs.readFileSync('server/src/utils/seedData.js', 'utf8');

content = content.replace(/price: (\d+),/g, (match, p1) => {
  let originalPrice = parseInt(p1);
  let newPrice = originalPrice;
  if (originalPrice > 10000) {
    // Sale price - divide by 10
    newPrice = originalPrice / 10;
  } else {
    // Rent price - divide by 5 to make it realistic weekly
    newPrice = Math.round(originalPrice / 5);
  }
  return `price: ${newPrice},`;
});

// Fix price guides
content = content.replace(/Offers Over \$([\d,]+)/g, (match, p1) => {
  let originalStr = p1.replace(/,/g, '');
  let val = parseInt(originalStr);
  if (!isNaN(val)) {
    let newVal = val / 10;
    return 'Offers Over $' + newVal.toLocaleString('en-US');
  }
  return match;
});

content = content.replace(/Guide: \$([\d,]+) - \$([\d,]+)/g, (match, p1, p2) => {
  let val1 = parseInt(p1.replace(/,/g, ''));
  let val2 = parseInt(p2.replace(/,/g, ''));
  if (!isNaN(val1) && !isNaN(val2)) {
    return 'Guide: $' + (val1/10).toLocaleString('en-US') + ' - $' + (val2/10).toLocaleString('en-US');
  }
  return match;
});

content = content.replace(/Auction Guide \$([\d,]+)/g, (match, p1) => {
  let val = parseInt(p1.replace(/,/g, ''));
  if (!isNaN(val)) {
    return 'Auction Guide $' + (val/10).toLocaleString('en-US');
  }
  return match;
});

fs.writeFileSync('server/src/utils/seedData.js', content);
console.log('Updated seedData.js prices');
