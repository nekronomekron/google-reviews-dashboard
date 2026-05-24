import puppeteer, { Browser, Page } from 'puppeteer'

import config from '../config.json' with { type: 'json' }
import { generateRandomUserAgent } from '../utils/agents.ts'

export async function initializeBrowser(): Promise<Browser> {
    const browser = await puppeteer.launch({ headless: false })
    return browser
}

export async function closeBrowser(browser: Browser): Promise<void> {
    await browser.close()
}

export async function gotoPage(page: Page, uri: string): Promise<Page> {
    const userAgent = generateRandomUserAgent('windows', 'chrome')

    console.log(`Using user agent: ${userAgent}`)

    await page.setUserAgent(userAgent)
    await page.goto(uri, { waitUntil: 'networkidle0' })

    const acceptButton = await page.$(config.selectors.consentAcceptButton)
    if (acceptButton) {
        await Promise.all([
            page.waitForNavigation({
                waitUntil: 'networkidle0',
                timeout: 15000,
            }),
            acceptButton.click(),
        ])
    }

    return page
}
