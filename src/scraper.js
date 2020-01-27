const puppeteer = require('puppeteer');
const fullPageScreenshot = require('puppeteer-full-page-screenshot');

/**
 * Wait a specified number of milliseconds
 * @param {number} milliseconds 
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**
 * Scrape a url to return back all html elements with positional and style features
 * @param {string} url 
 */
async function scrape(url) {
    const startTime = new Date();
    const browser = await puppeteer.launch({ args: ['--disable-dev-shm-usage', '--no-sandbox'] });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(1000 * 2 * 60);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    await sleep(2000);

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
            // height, width, top_left_x, top_left_y, bottom_right_x, bottom_right_y,
            // screenshot, text of element, html_tag, html_class_names, html_id, font_size, number_of_font_sizes, avg_font_size,
            // max_font_size, min_font_size, foreground_color, number_of_different_colors?,
            // how_deep_elements_nested, how_deep_this_element_is, font_weight

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

        const nodeList = document.querySelectorAll('[itemtype="http://schema.org/Event"]');
        const elements = [];

        nodeList.forEach(node => elements.push({ outerHtml: node.outerHTML }));

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