import puppeteer, { Browser, Page } from 'puppeteer'

import config from '../config.json' with { type: 'json' }
import UserAgent from 'user-agents'

export async function initializeBrowser(): Promise<Browser> {
    const browser = await puppeteer.launch({ headless: false })
    return browser
}

export async function closeBrowser(browser: Browser): Promise<void> {
    await browser.close()
}

export async function gotoPage(browser: Browser, uri: string): Promise<Page> {
    const page = await browser.newPage()

    const userAgent = new UserAgent({ deviceCategory: 'desktop' })
    await page.setUserAgent(userAgent.toString())

    await page.goto(uri, { waitUntil: 'networkidle0' })

    const acceptButton = await page.$(
        config.general.consentAcceptButtonSelector
    )
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
