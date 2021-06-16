export class UsageStats {
    constructor(pokemon, moves, abilities, items) {
        this.pokemon = pokemon;
        this.moves = moves;
        this.abilities = abilities;
        this.items = items;
    }

    // Optional function to get only the top x most frequent moves
    getTopFrequentMoves(mostFrequent) {
        var moves = {};
        for (var i = 0; i < mostFrequent; i++) {
            moves[this.moves[i][0]] = this.moves[i][1];
        }

        return moves;
    }

    // Threshold to configure what usage % to start showing stats
    getStatsJSON(stats, threshold) {
        var json = {};
        for (var i = 0; i < stats.length; i++) {
            var count = stats[i][1];
            if (count < threshold)
                return json;

            json[stats[i][0]] = this.convertToPercentageFormat(stats[i][1], 3);
        }
        
        return json;
    }

    toJSON() {
        var json = {};
        json.pokemon = this.pokemon;
        json.abilities = this.getStatsJSON(this.abilities, 0);
        json.items = this.getStatsJSON(this.items, 0.00000001);
        json.moves = this.getStatsJSON(this.moves, 1);
        return json;
    }

    // Round to 3 decimal places and add % sign
    convertToPercentageFormat(percentage, numPlaces) {
        if (percentage > 0)
            return percentage.toFixed(numPlaces) + "%";
        
        return percentage + "%";
    }
}

export class UsageStatsBuilder {
    constructor(pokemon) {
        this.pokemon = pokemon;
    }

    setMoves(moves) {
        this.moves = moves;
        return this;
    }

    setAbilities(abilities) {
        this.abilities = abilities;
        return this;
    }


    setItems(items) {
        this.items = items;
        return this;
    }

    build() {
        return new UsageStats(this.pokemon, this.moves, this.abilities, this.items);
    }
}