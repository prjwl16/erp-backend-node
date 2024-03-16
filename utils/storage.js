import { S3Client } from '@aws-sdk/client-s3'

const { DeleteObjectCommand } = require('@aws-sdk/client-s3')

const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const region = process.env.S3_REGION

export const client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: region,
})

export const deleteFileFromS3 = async ({ bucketName, files }) => {
  const keys = []

  files.forEach((file) => {
    keys.push(file.split('/').pop())
  })

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
    },
  })

  console.log('keys', command)

  try {
    const response = await client.send(command)
    return response
  } catch (error) {
    console.error('Error deleting file from S3', error)
  }
}
