const { s3Client, S3_BUCKET } = require('../s3');
const {
  PutObjectCommand,
  UploadPartCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand
} = require('@aws-sdk/client-s3');

// Create a folder in S3 (folders are just keys ending with '/')
async function createS3Folder(folderPath) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: folderPath.endsWith('/') ? folderPath : folderPath + '/',
    Body: ''
  });
  return await s3Client.send(command);
}

// Upload a file to a specific S3 folder
async function uploadFileToS3(folderPath, file) {
  const key = `${folderPath.endsWith('/') ? folderPath : folderPath + '/'}${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });
  await s3Client.send(command);
  return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
}

// Delete all files in a folder (prefix) in S3
async function deleteS3Folder(folderPath) {
  const prefix = folderPath.endsWith('/') ? folderPath : folderPath + '/';
  // List all objects under the prefix
  const listCommand = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: prefix
  });
  const listedObjects = await s3Client.send(listCommand);
  if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;
  // Prepare objects for deletion
  const deleteParams = {
    Bucket: S3_BUCKET,
    Delete: { Objects: [] }
  };
  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });
  const deleteCommand = new DeleteObjectsCommand(deleteParams);
  await s3Client.send(deleteCommand);
  // If there are more objects, recursively delete
  if (listedObjects.IsTruncated) {
    await deleteS3Folder(folderPath);
  }
}

module.exports = { createS3Folder, uploadFileToS3, deleteS3Folder }; 