const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1', // Change to your region
});

const S3_BUCKET = process.env.S3_BUCKET_NAME;

module.exports = { s3, S3_BUCKET }; 