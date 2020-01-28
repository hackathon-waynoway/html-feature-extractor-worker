const fs = require('fs');

const program = require('commander');
const filenamifyUrl = require('filenamify-url');

const scraper = require('./scraper');

const options = program
    .option('-v, --verbose', 'verbose', false)
    .option('-o, --out <value>', 'output folder', 'output')
    .option('-s, --src <value>', 'url to crawl', 'https://losangeles.eventful.com/events/categories/music')
    .parse(process.argv).opts();

if (options.verbose) console.log(options);

if (!fs.existsSync(options.out)) {
    console.error('Path does not exist ' + options.out);
    return;
}

async function main() {
    const result = await scraper.scrape(options.src);
    const filenameUrl = filenamifyUrl(result.data.url);
    const outputFile = `${options.out}/${filenameUrl}`

    fs.writeFileSync(`${outputFile}.png`, result.screenshot);
    fs.writeFileSync(`${outputFile}.json`, JSON.stringify(result.data, undefined, 2));

    if (options.verbose) console.log(result.data);
}

main()
    .then(() => console.log('DONE!'))
    .catch((e) => {
        console.error('ERROR', e);
        process.exit(1);
    });
