import { Command } from 'commander'
import { DiscoverPlaces } from './scraping/discover-places.ts'

const program = new Command()

program
    .name('Google Reviews Dashboard')
    .description(
        'CLI to scrape Google Places information and creating a dashboard'
    )
    .version('0.1.0')

program
    .command('discover-places')
    .description(
        'Discover places in using the zip codes from the configuration file'
    )
    .action(async () => {
        const scraper = new DiscoverPlaces()
        await scraper.discover()

        scraper.saveDiscoveriesToFile('./output/discoveries.json')
    })

program.parse()
