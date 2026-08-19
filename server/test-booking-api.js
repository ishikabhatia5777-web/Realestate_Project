const http = require('http');

http.get('http://localhost:5001/api/properties', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const properties = JSON.parse(data).data;
    if (properties && properties.length > 0) {
      const propertyId = properties[0]._id;
      
      const postData = JSON.stringify({
        propertyId: propertyId,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        type: 'In-Person',
        notes: 'Testing email notification fallback'
      });

      const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': 'Bearer demo_token_507f1f77bcf86cd799439003'
        }
      };

      const req = http.request(options, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          console.log('STATUS:', res2.statusCode);
          console.log('BODY:', data2);
          process.exit(0);
        });
      });
      req.write(postData);
      req.end();

    } else {
      console.log("No properties found!");
      process.exit(1);
    }
  });
});
