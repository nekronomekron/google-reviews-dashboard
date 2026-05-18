import { Command } from 'commander'

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
    .action((str, options) => {
        const limit = options.first ? 1 : undefined
        console.log(str.split(options.separator, limit))
    })

program.parse()
