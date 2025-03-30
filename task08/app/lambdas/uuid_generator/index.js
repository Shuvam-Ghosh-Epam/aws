import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const REGION = process.env.AWS_REGION || 'eu-west-1';
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'uuid-storage';

const s3 = new S3Client({ region: REGION });

export const handler = async () => {
    try {
        const uuidList = Array.from({ length: 10 }, () => uuidv4());
        const data = JSON.stringify({ ids: uuidList }, null, 4);
        const timestamp = new Date().toISOString();

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: timestamp,
            Body: data,
            ContentType: 'application/json',
        };

        await s3.send(new PutObjectCommand(uploadParams));
        console.log(`UUIDs successfully stored in S3: s3://${BUCKET_NAME}/${timestamp}`);
    } catch (err) {
        console.error('Upload failed:', err);
        throw err;
    }
};
