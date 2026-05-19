import { closeBrowser, gotoPage, initializeBrowser } from '../browser/index.ts'
import config from '../config.json' with { type: 'json' }

export class DiscoverPlaces {
    constructor() {}

    async discover() {
        const browser = await initializeBrowser()

        for (const postcode of config.scraping.postcodes) {
            for (const query of config.scraping.queries) {
                console.log(
                    `Discovering places for postcode [${postcode.postcode} ${postcode.city}] and query ${query}...`
                )

                const searchString = `${query} ${postcode.postcode} ${postcode.city}`
                const uri = `https://www.google.com/maps/search/${encodeURI(searchString)}?hl=de`

                const page = await gotoPage(browser, uri)

                await this.scrollToEndOfFeed(page)
                const discoveries = await this.extractPlacesFromFeed(page)

                console.log(discoveries)

                await page.close()
            }
        }

        await closeBrowser(browser)
    }

    private extractPlaceIdFromURI(uri: string): string {
        const decodedUri = decodeURIComponent(uri)
        const matches = decodedUri.match(/!1s([^!/?&]+)/)

        if (matches && matches.length > 1) return matches[1]!.trim()

        return ''
    }

    private async extractPlacesFromFeed(page: any) {
        const placeElements = await page.$$eval(
            'a[href*="https://www.google.com/maps/place/"]',
            (elements: any) =>
                elements
                    .map((el: any) => {
                        return {
                            name: el.getAttribute('aria-label'),
                            uri: el.href,
                        }
                    })
                    .filter((place: any) => place.name !== null)
        )

        return [
            ...placeElements.map((place: any) => {
                return {
                    ...place,
                    id: this.extractPlaceIdFromURI(place.uri),
                }
            }),
        ]
    }

    private async scrollToEndOfFeed(page: any) {
        const feed = await page.waitForSelector('div[role="feed"]', {
            timeout: 15000,
        })
        if (!feed) {
            throw new Error('Feed container not found')
        }

        let reachedEnd = false
        const maxScrollAttempts = 400
        for (let attempt = 0; attempt < maxScrollAttempts; attempt += 1) {
            reachedEnd = await page.$eval(
                'div[role="feed"]',
                async (feedEl: any, config: any) => {
                    const endSpan = Array.from(
                        feedEl.querySelectorAll('span')
                    ).find(
                        (span: any) =>
                            span.textContent?.trim() ===
                            config.general.feedEndIndicator
                    )
                    if (endSpan) {
                        return true
                    }
                    feedEl.scrollBy({
                        top: Math.random() * 1000 + 500,
                        behavior: 'smooth',
                    })
                    return false
                },
                config
            )

            if (reachedEnd) {
                break
            }

            await new Promise(function (resolve) {
                setTimeout(resolve, Math.random() * 1000 + 500)
            })
        }

        if (!reachedEnd) {
            throw new Error('End-of-list marker not found after scrolling')
        }
    }
}
