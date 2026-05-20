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
    .option(
        '-o, --output <file>',
        'Output file for discoveries',
        './output/discoveries.json'
    )
    .option(
        '-p, --postcodes <string...>',
        'List of postcodes to discover places for'
    )
    .option(
        '-q, --queries <string...>',
        'List of queries to discover places for'
    )
    .action(async options => {
        const scraper = new DiscoverPlaces(options.output)
        await scraper.discover(options.queries, options.postcodes)
    })

program.parse()
