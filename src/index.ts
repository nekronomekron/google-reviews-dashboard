import puppeteer from 'puppeteer'
// Or import puppeteer from 'puppeteer-core';

// Launch the browser and open a new blank page.
const browser = await puppeteer.launch()
const page = await browser.newPage()

const uri = `https://www.google.com/maps/search/${encodeURI('restaurant 84036 Landshut')}?hl=de`

// Navigate the page to a URL.
await page.goto(uri)

// Set screen size.
// await page.setViewport({ width: 1080, height: 1024 })

// Open the search menu using the keyboard.
// await page.keyboard.press('/')

// Type into search box using accessible input name.
// await page.locator('::-p-aria(Suche)').fill('automate beyond recorder')

// // Wait and click on first result.
// await page.locator('.devsite-result-item-link').click()

// // Locate the full title with a unique string.
// const textSelector = await page
//     .locator('::-p-text(Customize and automate)')
//     .waitHandle()
// const fullTitle = await textSelector?.evaluate(el => el.textContent)

// // Print the full title.
// console.log('The title of this blog post is "%s".', fullTitle)

// const test = await page.waitForSelector("xpath///div[@role='article']")
const test = await page.$$eval(
    '//div[@role="feed"]',
    elements => elements.length
)

//  elements =>
//     elements.map(div => div.getHTML())
// )

// const test = await page.locator('::-p-aria([role="button"])').waitHandle()

console.log(test)

await browser.close()
