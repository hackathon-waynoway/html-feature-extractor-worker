const fs = require('fs');
const readline = require('readline');

const AWS = require('aws-sdk');
const program = require('commander');

const date = new Date();

const options = program
    .option('-v, --verbose', 'verbose', false)
    .requiredOption('-i, --input <value>', 'File with urls to crawl (one per line)')
    .requiredOption('-q, --queue <value>', 'SQS Queue URL to send messages to')
    .option('-c, --count <value>', 'Number of urls to crawl', 100)
    .option('-p, --prefix <value>', 'S3 prefix', `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`)
    .parse(process.argv).opts();

console.log(options);

const sqs = new AWS.SQS();

async function main() {
    return new Promise((resolve) => {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(options.input)
        });

        let count = 0;
        const maxCount = +options.count;
        const queueUrl = options.queue;
        const s3Prefix = options.prefix;

        readInterface.on('line', async (line) => {
            try {
                if (count >= maxCount) { readInterface.close(); return; }

                const url = line.trim();
                const message = { url: url, source: s3Prefix };
                console.log('sending message ' + url);
                count++;
                await sqs.sendMessage({ QueueUrl: queueUrl, MessageBody: JSON.stringify(message) }).promise();

            } catch (e) {
                console.error(`Error trying to send line: '${line}'`, e);
            }
        });

        readInterface.on('close', function () {
            resolve({count});
        });
    });
}

main()
    .then((processed) => console.log('DONE!', processed))
    .catch((e) => {
        console.error('ERROR', e);
        process.exit(1);
    });
