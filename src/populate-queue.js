
const AWS = require('aws-sdk');
const shortid = require('shortid');

const source = shortid.generate();
const sqs = new AWS.SQS();

async function main() {

    // TODO: read as input the schema_Event.gz file, get all unique urls which contain Event.
    // TODO: don't want to spam sites, so maybe only take unique domains?
    // TODO: Might want to filter only webpages which are in the USA 
    // TODO: limit this list to ~100 to start and send those SQS messages

    const queueUrl = `https://sqs.us-east-1.amazonaws.com/109628666462/html-feature-extractor-worker-queue`
    const message = { url: 'https://losangeles.eventful.com/events/categories/music', source: source };
    const result = await sqs.sendMessage({ QueueUrl: queueUrl, MessageBody: JSON.stringify(message) }).promise();

    console.log(result);
}

main()
    .then(() => console.log('DONE!'))
    .catch((e) => {
        console.error('ERROR', e);
        process.exit(1);
    });
