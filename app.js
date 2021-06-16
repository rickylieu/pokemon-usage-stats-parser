var http = require('http');
var hostname = '127.0.0.1';
var port = 3000;
var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    console.log("Start: " + Date.now());
    var fs = require('fs');
    var request = require('request');
    var yargs = require('yargs');
    var https = require('https');
 
    //Parse command line args
    var args = yargs
        .option("pokemon", {
            alias: "p",
            description: "The Pokemon to return stats for",
            type: "string"
        })
        .demandOption("pokemon")
        .option("gen", {
            alias: "g",
            description: "Pokemon generation",
            type: "string"
        })
        .demandOption("gen")
        .option("format", {
            alias: "f",
            description: "Pokemon format (ou, uu, vgc, etc.)",
            type: "string"
        })
        .demandOption("format")
        .option("month", {
            alias: "m",
            description: "Month of stats",
            type: "string"
        })
        .demandOption("year")
        .option("year", {
            alias: "y",
            description: "Year of stats",
            type: "string"
        })
        .demandOption("year")
        .option("rating", {
            alias: "r",
            description: "User smogon rating",
            type: "string"
        })
        .demandOption("rating")
        .argv;

    var pokedex = require('./data/pokedex.js')['BattlePokedex'];
    var moves = require('./data/moves.js')['BattleMovedex'];
    var abilities = require('./data/abilities.js')['BattleAbilities'];
    var items = require('./data/items.js')['BattleItems'];


    var pokemon = args.pokemon.toLowerCase();
    var gen = args.gen;
    var format = args.format.toLowerCase();
    var year = args.year;
    var month = args.month;
    var date = year + "-" + month;
    var rating = args.rating;
    
    var fileName = "gen" + gen + format + "-" + rating + ".json";
    var directory = "./downloads/stats/" + date;
    var filePath = directory + "/" + fileName;

    var download = require('./smogonstatsfiledownloader.js');
    // Only download file if not downloaded already. May want to look into checking the last updated time to download. Or just force download
    if (fs.existsSync(filePath)) {
        res.end(JSON.stringify(getStats(null)));
    }
    else {
        var url = new download.SmogonStatsUrlBuilder()
            .setGen(gen)
            .setFormat(format)
            .setDate(date)
            .setRating(rating)
            .toString();
        console.log("File does not exist - downloading: " + url);
        new download.SmogonStatsFileDownloader().download(url, directory, filePath, getStats);
    }


    // Main callback function     
    function getStats(error) {
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
        var processor = require('./statsprocessor.js');
        pokemon = pokedex[pokemon]['name'];
        var sortedMoves = new processor.StatsProcessor(pokemonData['Moves'], moves, 4).process();
        var sortedAbilities = new processor.StatsProcessor(pokemonData['Abilities'], abilities, 1).process();
        var sortedItems = new processor.StatsProcessor(pokemonData['Items'], items, 1).process();
        
        // Build stats and return
        var stats = require('./usagestats.js');
        var usageStats = new stats.UsageStatsBuilder(pokemon)
            .setMoves(sortedMoves)
            .setAbilities(sortedAbilities)
            .setItems(sortedItems)
            .build();
        console.log(JSON.stringify(usageStats.toJSON(), null, 2));
        console.log("End: " + Date.now());
        return usageStats.toJSON();
    }
    
    // Need to fix error if dest directory does not exist
    function download(url, dest, cb) {
        var file = fs.createWriteStream(dest);
        var sendReq = request.get(url);
        // verify response code
        sendReq.on('response', function (response) {
            if (response.statusCode !== 200) {
                return cb('Response status was ' + response.statusCode);
            }
            sendReq.pipe(file);
        });
        // close() is async, call cb after close completes
        file.on('finish', function () { return file.close(cb); });
        // check for request errors
        sendReq.on('error', function (err) {
            fs.unlink(dest);
            return cb(err.message);
        });
        file.on('error', function (err) {
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            return cb(err.message);
        });
    };
});
server.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});
