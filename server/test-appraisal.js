const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Property = require('./src/models/Property');
const { generateAppraisal } = require('./src/controllers/propertyController');
require('dotenv').config();

const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log(`[Response] Status: ${this.statusCode || 200}`);
    if (data.report) {
      console.log('\n--- JSON Appraisal Report Successfully Returned ---\n');
      console.log(JSON.stringify(data.report, null, 2));
      console.log('\n----------------------------------------------------\n');
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }
};

const mockNext = (err) => {
  console.error('[Error from next]', err);
};

const runTest = async () => {
  try {
    console.log('Connecting to real Aura Estate MongoDB database...');
    await connectDB();
    
    console.log('Fetching a real subject property from MongoDB...');
    let subjectProperty = await Property.findOne({ status: 'Published' }).lean();
    if (!subjectProperty) {
      subjectProperty = await Property.findOne().lean();
    }

    if (!subjectProperty) {
      console.log('No properties found in the real database. Cannot proceed.');
      process.exit(1);
    }
    
    console.log(`Selected Real Subject Property: ${subjectProperty.title} (ID: ${subjectProperty._id})`);
    
    const mockReq = {
      params: { id: subjectProperty._id.toString() }
    };
    
    console.log('Calling generateAppraisal controller...');
    await generateAppraisal(mockReq, mockRes, mockNext);
    
    console.log('Test finished successfully.');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
};

runTest();

