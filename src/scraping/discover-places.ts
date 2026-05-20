import type { Page } from 'puppeteer'
import { closeBrowser, gotoPage, initializeBrowser } from '../browser/index.ts'
import config from '../config.json' with { type: 'json' }
import fs from 'fs'

export class DiscoverPlaces {
    private _discoveries: {
        [id: string]: { name: string; uri: string; queries: string[] }
    } = {}

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
                const placeElements =
                    await this.extractPlaceElementsFromFeed(page)
                placeElements.forEach((place: any) => {
                    const id = this.extractPlaceIdFromURI(place.uri)
                    if (id) {
                        if (!this._discoveries[id]) {
                            this._discoveries[id] = {
                                name: place.name,
                                uri: place.uri,
                                queries: [],
                            }
                        }

                        this._discoveries[id].queries.push(query)
                    }
                })

                await page.close()
            }
        }

        await closeBrowser(browser)
    }

    saveDiscoveriesToFile(filePath: string) {
        fs.writeFile(
            filePath,
            JSON.stringify(this._discoveries, null, 4),
            'utf8',
            () => {
                console.log(`Data written to ${filePath} as JSON.`)
            }
        )
    }

    private extractPlaceIdFromURI(uri: string): string {
        const decodedUri = decodeURIComponent(uri)
        const matches = decodedUri.match(/!1s([^!/?&]+)/)

        if (matches && matches.length > 1) return matches[1]!.trim()

        return ''
    }

    private async extractPlaceElementsFromFeed(page: any) {
        return await page.$$eval(
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
    }

    private async scrollToEndOfFeed(page: Page) {
        const feedEl: any = await page.$(config.selectors.feedContainer)
        if (!feedEl) {
            throw new Error('Feed container not found')
        }

        let reachedEnd = false
        const maxScrollAttempts = 400
        for (let attempt = 0; attempt < maxScrollAttempts; attempt += 1) {
            const feedEndIndicator = await page.$(
                config.selectors.feedEndIndicator
            )

            if (!feedEndIndicator) {
                await page.evaluate(feed => {
                    feed.scrollBy({
                        top: Math.random() * 1000 + 500,
                        behavior: 'smooth',
                    })
                }, feedEl)

                await new Promise(function (resolve) {
                    setTimeout(resolve, Math.random() * 1000 + 500)
                })
            } else {
                reachedEnd = true
                break
            }
        }

        if (!reachedEnd) {
            throw new Error('End-of-list marker not found after scrolling')
        }
    }
}
