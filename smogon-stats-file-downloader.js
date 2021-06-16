const fs = require('fs')
const request = require('request');

export class SmogonStatsFileDownloader {
    
    constructor() {
    }

    // Need to fix error if dest directory does not exist
    download(url, directory, filePath, cb) {
        // If file does not exist, check if directory exists. If not, create it
        if (!fs.existsSync(directory)) {
            console.log("Directory does not exist - creating directory: " + directory);
            fs.mkdirSync(directory);
        }

        // Send request
        const file = fs.createWriteStream(filePath);
        const sendReq = request.get(url);
        
        // Verify response code
        sendReq.on('response', (response) => {
            if (response.statusCode !== 200) {
                return cb('Response status was ' + response.statusCode);
            }

            sendReq.pipe(file);
        });

        // close() is async, call cb after close completes
        file.on('finish', () => {
            console.log("Finished downloading file");
            file.close(cb)
        });

        // Check for request errors
        sendReq.on('error', (err) => {
            console.log(4)
            fs.unlink(filePath);
            return cb(err.message);
        });

        file.on('error', (err) => { // Handle errors
            console.log("error: " + err.message)
            fs.unlink(filePath); // Delete the file async. (But we don't check the result)
            return cb(err.message);
        });
    };
}


export class SmogonStatsUrlBuilder {
    gen
    format
    rating
    date

    constructor() {
    }

    setGen(gen) {
        this.gen = gen;
        return this;
    }

    setFormat(format) {
        this.format = format;
        return this;
    }

    setRating(rating) {
        this.rating = rating;
        return this;
    }

    setDate(date) {
        this.date = date;
        return this;
    }

    toString() {
        var smogonBaseUrl = "https://smogon.com/stats/";
        var fileName = "gen" + this.gen + this.format + "-" + this.rating + ".json";
        return smogonBaseUrl + this.date + "/chaos/" + fileName;
    }
}
