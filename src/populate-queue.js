const fs = require('fs');
const readline = require('readline');

const AWS = require('aws-sdk');
const program = require('commander');

const date = new Date();

const options = program
    .option('-v, --verbose', 'verbose', false)
    .requiredOption('-i, --input <value>', 'File with urls to crawl (one per line)')
    .option('-c, --count <value>', 'number of urls to crawl', 100)
    .option('-p, --prefix <value>', 's3 prefix', `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`)
    .parse(process.argv).opts();

console.log(options);

const sqs = new AWS.SQS();

async function main() {
    const queueUrl = `https://sqs.us-east-1.amazonaws.com/109628666462/html-feature-extractor-worker-queue`

    const readInterface = readline.createInterface({
        input: fs.createReadStream(options.input),
        output: process.stdout,
        console: false
    });

    let count = 0;

    readInterface.on('line', async (line) => {
        try {
            if (count < options.count) {
                if (!line) {
                    console.warn(`line is empty: '${line}'.`);
                    return;
                }

                const url = line.trim();
                const message = { url: url, source: options.prefix };
                await sqs.sendMessage({ QueueUrl: queueUrl, MessageBody: JSON.stringify(message) }).promise();

                count++;
            }

            if (count >= options.count) {
                console.info(`Finished sending ${count} messages to ${queueUrl}. Ending now..`);
                readInterface.removeAllListeners();
                readInterface.close();
                process.exit(0);
            }
        } catch (e) {
            console.error(`Error trying to send line: '${line}'`, e);
        }
    });
}

main()
    .then(() => console.log('DONE!'))
    .catch((e) => {
        console.error('ERROR', e);
        process.exit(1);
    });
