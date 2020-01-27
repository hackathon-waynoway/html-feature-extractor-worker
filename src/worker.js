const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const filenamifyUrl = require('filenamify-url');
const shortid = require('shortid');

const scraper = require('./scraper');

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint() {
    console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
    process.exit();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm() {
    console.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
    process.exit();
})

const s3 = new AWS.S3();

if (!process.env.SQS_QUEUE_URL) return console.error(`Need to set the environment variable SQS_QUEUE_URL`);
if (!process.env.S3_BUCKET_NAME) return console.error(`Need to set the environment variable S3_BUCKET_NAME`);
if (!process.env.AWS_REGION) return console.error(`Need to set the environment variable AWS_REGION`);

const app = Consumer.create({
    region: process.env.AWS_REGION,
    queueUrl: process.env.SQS_QUEUE_URL,
    handleMessage: async (message) => {
        const { url, source } = JSON.parse(message.Body);
        const result = await scraper.scrape(url);

        const filenameUrl = filenamifyUrl(result.data.url);
        const suffix = shortid.generate();

        const key = `${source}/${filenameUrl}_${suffix}`;

        const p1 = s3.upload({ Bucket: process.env.S3_BUCKET_NAME, Key: `${key}.png`, Body: result.screenshot }).promise();
        const p2 = s3.upload({ Bucket: process.env.S3_BUCKET_NAME, Key: `${key}.json`, Body: JSON.stringify(result.data) }).promise();

        await Promise.all([p1, p2]);
    }
});

app.on('error', (err) => {
    console.error(err.message);
});

app.on('processing_error', (err) => {
    console.error(err.message);
});

app.start();