const { s3, S3_BUCKET } = require('../s3');

// Create a folder in S3 (folders are just keys ending with '/')
async function createS3Folder(folderPath) {
  return s3.putObject({
    Bucket: S3_BUCKET,
    Key: folderPath.endsWith('/') ? folderPath : folderPath + '/',
    Body: ''
  }).promise();
}

// Upload a file to a specific S3 folder
async function uploadFileToS3(folderPath, file) {
  const key = `${folderPath.endsWith('/') ? folderPath : folderPath + '/'}${file.originalname}`;
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  await s3.upload(params).promise();
  return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
}

module.exports = { createS3Folder, uploadFileToS3 }; 