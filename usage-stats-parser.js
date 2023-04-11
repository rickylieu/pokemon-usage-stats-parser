export class UsageStatsParser {
    
    constructor() {
    }

    setPokemon(pokemon) {
        this.pokemon = pokemon;
    }

    setGen(gen) {
        this.gen = gen;
    }

    setFormat(format) {
        this.format = format;
    }

    setYear(year) {
        this.year = year;
    }

    setMonth(month) {
        this.month = month;
    }

    setRating(rating) {
        this.rating = rating;
    }

    getPokemon() {
        return this.pokemon;
    }

    getGen() {
        return this.gen;
    }

    getFormat() {
        return this.format;
    }

    getYear() {
        return this.year;
    }

    getMonth() {
        return this.month;
    }

    getRating() {
        return this.rating;
    }

    withPokemon(pokemon) {
        this.pokemon = pokemon;
        return this;
    }

    withGen(gen) {
        this.gen = gen;
        return this;
    }

    withFormat(format) {
        this.format = format;
        return this;
    }

    withYear(year) {
        this.year = year;
        return this;
    }

    withMonth(month) {
        this.month = month;
        return this;
    }

    withRating(rating) {
        this.rating = rating;
        return this;
    }

    async toJSON() {
        var pokedex = require('./data/pokedex.js')['BattlePokedex'];
        var moves = require('./data/moves.js')['BattleMovedex'];
        var abilities = require('./data/abilities.js')['BattleAbilities'];
        var items = require('./data/items.js')['BattleItems'];

        var date = this.getYear() + "-" + this.getMonth();
        
        var fileName = "gen" + this.getGen() + this.getFormat() + "-" + this.getRating() + ".json";
        var directory = "./downloads/stats/" + date;
        var filePath = directory + "/" + fileName;

        var download = require('./smogon-stats-file-downloader.js');
        var fs = require('fs');
        // Only download file if not downloaded already or file cannot be parsed
        if (fs.existsSync(filePath)) {
            console.log("File exists?")
            var file = fs.readFileSync(filePath, 'utf-8');
            try {
                data = JSON.parse(file)['data'];
                return await getStats(this.getPokemon(), null);
            } catch {
                console.log("Failed to parse json. Re-downloading");
            }
        }
        var url = new download.SmogonStatsUrlBuilder()
                .setGen(this.getGen())
                .setFormat(this.getFormat())
                .setDate(date)
                .setRating(this.getRating())
                .toString();
        console.log("Downloading file: " + url);
        return await new download.SmogonStatsFileDownloader()
            .download(url, directory, filePath, this.getPokemon(), getStats)
            .then(resolve => {
                return resolve;
            });


        // Main callback function     
        async function getStats(pokemon, error) {
            if (error != null) {
                console.log("error: " + error);
                return;
            }
            // Grab all JSON data
            var file = fs.readFileSync(filePath, 'utf-8');
            var data;
            
            var maxAttempts = 1000000;
            var attempts = 0;
            try {
                data = JSON.parse(file)['data'];
            } catch (error) {
                Promise.reject("{}");
                return "{}";
            }            

            if (pokedex[pokemon] == null) {
                console.log("Invalid pokemon name");
                return "{}";
            }
            var pokemonDisplayName = pokedex[pokemon]['name'];
            var pokemonData = data[pokemonDisplayName];
            if (pokemonData == null) {
                console.log("No data - either the Pokemon does not exist, is banned, or is never used in this format");
                return "{}";
            }
    
            //Processing steps. Convert to percentage and sort
            var processor = require('./stats-processor.js');
            pokemon = pokedex[pokemon]['name'];
            var sortedMoves = new processor.StatsProcessor(pokemonData['Moves'], moves, 4).process();
            var sortedAbilities = new processor.StatsProcessor(pokemonData['Abilities'], abilities, 1).process();
            var sortedItems = new processor.StatsProcessor(pokemonData['Items'], items, 1).process();

            // Build stats and return
            var stats = require('./usage-stats.js');
            var usageStats = new stats.UsageStatsBuilder(pokemon)
                .setMoves(sortedMoves)
                .setAbilities(sortedAbilities)
                .setItems(sortedItems)
                .build();

            const json = await JSON.stringify(usageStats.toJSON(), null, 2);
            return json;
        }
    }
}