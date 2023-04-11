var http = require('http');
const { UsageStats } = require('./usage-stats.js');
var hostname = '127.0.0.1';
var port = 3000;
var server = http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
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

    var pokemon = args.pokemon.toLowerCase();
    var gen = args.gen;
    var format = args.format.toLowerCase();
    var year = args.year;
    var month = args.month;
    var date = year + "-" + month;
    var rating = args.rating;

    var parser = require("./usage-stats-parser.js");
    var usageStatsParser = new parser.UsageStatsParser()
        .withPokemon(pokemon)
        .withGen(gen)
        .withFormat(format)
        .withYear(year)
        .withMonth(month)
        .withRating(rating);
    usageStatsParser.toJSON().then((response) => {
        console.log("responseJSON: " + response)
    });

    usageStatsParser.setPokemon("raikou");
    usageStatsParser.toJSON().then((response) => {
        console.log("responseJSON: " + response)
    });

    usageStatsParser.setGen("7");
    usageStatsParser.toJSON().then((response) => {
        console.log("responseJSON: " + response)
        //res.end(response);
    });

});
server.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});
