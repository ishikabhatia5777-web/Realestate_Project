const fs = require('fs');

async function uploadFile() {
  const fileData = fs.readFileSync('test_upload.csv');
  const blob = new Blob([fileData], { type: 'text/csv' });
  const form = new FormData();
  form.append('file', blob, 'test_upload.csv');

  try {
    const res = await fetch('http://localhost:5000/api/admin/properties/upload-csv', {
      method: 'POST',
      body: form,
      headers: {
        Authorization: 'Bearer demo_token_507f1f77bcf86cd799439000'
      }
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

uploadFile();

uploadFile();
