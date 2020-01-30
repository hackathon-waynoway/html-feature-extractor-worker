const puppeteer = require('puppeteer');

/**
 * Scrape a url to return back all html elements with positional and style features
 * @param {string} url 
 */
async function scrape(url) {
    const startTime = new Date();
    const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser', args: ['--disable-dev-shm-usage'] });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(1000 * 2 * 60);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitFor(3000);

    const screenshot = await page.screenshot({ fullPage: true, type: 'png', encoding: 'binary' });

    const pageFeatures = await page.evaluate(() => {
        const processedElements = [];
        function isVisible(element) {
            return true;
        }

        /**
         * Process a single html Element
         * @param {Element} element 
         */
        function callback(element) {
            // need to add on window scroll to get absolute position
            const boundingBox = element.getBoundingClientRect();
            const top = boundingBox.top + window.scrollY;
            const left = boundingBox.left + window.scrollX;
            const width = boundingBox.width;
            const height = boundingBox.height;

            const itemType = element.getAttribute("itemtype");
            const itemProp = element.getAttribute("itemprop");

            const style = window.getComputedStyle(element);

            processedElements.push({
                top: top,
                left: left,
                width: width,
                height: height,
                itemType: itemType,
                itemProp: itemProp,
                tagName: element.tagName,
                elementId: element.id,
                classList: [...element.classList],
                fontSize: style.fontSize,
                fontStyle: style.fontStyle,
                font: style.font,
                fontWeight: style.fontWeight,
                lineHeight: style.lineHeight,
                opacity: style.opacity,
                color: style.color,
                backgroundColor: style.backgroundColor,
                backgroundImage: style.backgroundImage,
                background: style.background,
                textContent: element.textContent,
                // outerHtml: element.outerHTML
            });
        }

        function iterateAllNodes(cb) {
            const allNodes = [];
            for (let i = 0; i < document.children.length; i++) {
                allNodes.push(document.children[i]);
            }

            while (allNodes.length > 0) {
                const nextNode = allNodes.shift();
                cb(nextNode);

                for (let i = 0; i < nextNode.children.length; i++) {
                    allNodes.push(nextNode.children[i]);
                }
            }
        }

        iterateAllNodes(callback);

        return {
            elements: processedElements,
        };
    });

    await browser.close();

    const endTime = new Date();

    return {
        data: {
            ...pageFeatures,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            totalMs: endTime - startTime,
            status: 'PARSED',
            url: page.url()

        },
        screenshot: screenshot
    };
}

exports.scrape = scrape;