export class  StatsProcessor {
    
    constructor(stats, nameMap, numSlots) {
        this.stats = stats;
        this.nameMap = nameMap;
        this.numSlots = numSlots;
        return this;
    }

    process() {
        var stats = this.convertToDisplayNames(this.stats, this.nameMap);
        var percentages = this.convertCountsToPercentages(stats, this.numSlots);
        var sortedPercentages = this.sortObject(percentages);
        return sortedPercentages;
    }

    // flareblitz -> Flare Blitz
    convertToDisplayNames(stats, nameMap) {
        var displayNames = {};
        for (var _i = 0, _a = Object.keys(stats); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            if (nameMap[name_1] != null) {
                var displayName = nameMap[name_1]['name'];
                displayNames[displayName] = stats[name_1];
            }
            else if (name_1 == "" || name_1 == "nothing") {
                //console.log("NAME:  " + name_1 + " value: " + stats[name_1]);
                displayNames["Empty"] = stats[name_1];
            }
            else {
                console.log("Failed to find name " + name_1 + " in list of display names. Using name");
                displayNames[name_1] = stats[name_1];
            }
        }
        return displayNames;
    }
    // Converts stat raw counts to percentages
    // For moves, need to multiply by 4
    convertCountsToPercentages(stats, numSlots) {
        var totalCount = this.sum(stats);
        for (var i = 0, a = Object.entries(stats); i < a.length; i++) {
            var b = a[i], key = b[0], value = b[1];
            var percentage = value / totalCount * numSlots * 100;
            stats[key] = percentage;
        }
        return stats;
    }

    sortObject(obj) {
        var items = Object.keys(obj).map(function (key) {
            return [key, obj[key]];
        });
        // Sort the array based on the second element
        items.sort(function (first, second) {
            return second[1] - first[1];
        });
        return items;
    }

    sum(obj) {
        var sum = 0;
        for (var el in obj) {
            if (obj.hasOwnProperty(el)) {
                sum += parseFloat(obj[el]);
            }
        }
        return sum;
    }
}