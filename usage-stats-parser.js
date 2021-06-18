export class UsageStatsParser {
    
    constructor() {
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

    toJSON() {
        var pokedex = require('./data/pokedex.js')['BattlePokedex'];
        var moves = require('./data/moves.js')['BattleMovedex'];
        var abilities = require('./data/abilities.js')['BattleAbilities'];
        var items = require('./data/items.js')['BattleItems'];

        var date = this.year + "-" + this.month;
        
        var fileName = "gen" + this.gen + this.format + "-" + this.rating + ".json";
        var directory = "./downloads/stats/" + date;
        var filePath = directory + "/" + fileName;

        var download = require('./smogon-stats-file-downloader.js');
        var fs = require('fs');
        // Only download file if not downloaded already. May want to look into checking the last updated time to download. Or just force download
        if (fs.existsSync(filePath)) {
            return JSON.stringify(getStats(this.pokemon, null));
        }
        else {
            var url = new download.SmogonStatsUrlBuilder()
                .setGen(this.gen)
                .setFormat(this.format)
                .setDate(this.date)
                .setRating(this.rating)
                .toString();
            console.log("File does not exist - downloading: " + url);
            new download.SmogonStatsFileDownloader().download(url, directory, filePath, this.pokemon, getStats);
        }

        // Main callback function     
        function getStats(pokemon, error) {
            if (error != null) {
                console.log("error: " + error);
                return;
            }
            // Grab all JSON data
            var data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))['data'];
            if (pokedex[pokemon] == null) {
                console.log("Invalid pokemon name");
                return;
            }
            var pokemonDisplayName = pokedex[pokemon]['name'];
            var pokemonData = data[pokemonDisplayName];
            if (pokemonData == null) {
                console.log("No data - either the Pokemon does not exist, is banned, or is never used in this format");
                return;
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
            console.log(JSON.stringify(usageStats.toJSON(), null, 2));
            console.log("End: " + Date.now());
            return usageStats.toJSON();
        }
    }

}