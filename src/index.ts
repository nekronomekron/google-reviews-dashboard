import puppeteer from 'puppeteer'

function extractPlaceIdFromURI(uri: string): string {
    const decodedUri = decodeURIComponent(uri)
    const matches = decodedUri.match(/!1s([^!/?&]+)/)

    if (matches && matches.length > 1) return matches[1]!.trim()

    return ''
}

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()

const uri = `https://www.google.com/maps/search/${encodeURI('restaurant 84036 Landshut')}?hl=de`
await page.goto(uri, { waitUntil: 'networkidle0' })

const acceptButton = await page.locator('::-p-aria(Alle akzeptieren)')
if (acceptButton) {
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
        acceptButton.click(),
    ])
} else {
    console.warn('Accept button not found; continuing without redirect wait.')
}

const feed = await page.waitForSelector('div[role="feed"]', { timeout: 15000 })
if (!feed) {
    throw new Error('Feed container not found')
}

let reachedEnd = false
const maxScrollAttempts = 400
for (let attempt = 0; attempt < maxScrollAttempts; attempt += 1) {
    reachedEnd = await page.$eval('div[role="feed"]', feedEl => {
        const endSpan = Array.from(feedEl.querySelectorAll('span')).find(
            span =>
                span.textContent?.trim() === 'Das Ende der Liste ist erreicht.'
        )
        if (endSpan) {
            return true
        }
        feedEl.scrollBy({ top: 1000 })
        return false
    })

    if (reachedEnd) {
        break
    }

    await new Promise(function (resolve) {
        setTimeout(resolve, 750)
    })
}

if (!reachedEnd) {
    throw new Error('End-of-list marker not found after scrolling')
}

console.log('Found "Das Ende der Liste ist erreicht." in the feed')

const placeElements = await page.$$eval(
    'a[href*="https://www.google.com/maps/place/"]',
    elements =>
        elements
            .map(el => {
                return {
                    name: el.getAttribute('aria-label'),
                    uri: el.href,
                }
            })
            .filter(place => place.name !== null)
)

const discoveries = [
    ...placeElements.map(place => {
        return {
            ...place,
            id: extractPlaceIdFromURI(place.uri),
        }
    }),
]

// .filter((label): label is string => label !== null)
console.log(discoveries)

await browser.close()
