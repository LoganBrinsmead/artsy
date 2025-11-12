import { HARVARD_API_KEY } from '@env';


/*
    Example object: https://api.harvardartmuseums.org/object?apikey=APIKEYHERE&q=rabbit
*/
export default class Harvard {
    constructor(cacheTTL = 5 * 60 * 1000) {
        this.apiKey = HARVARD_API_KEY;
        this.baseURL = "https://api.harvardartmuseums.org";
        this.name = "Harvard Art Museums";
        this.cacheTTL = cacheTTL;
    }

    async search(query) {
        const response = await fetch(`${this.baseURL}/object?apikey=${this.apiKey}&q=${query}`);
        const data = await response.json();

        const records = data["records"];

        for (let i = 0; i < records.length; i++) {
            records[i] = this.formatObject(records[i]);
        }

        return records;
    }

    formatObject(object) {
        const getArtist = (value) => {
            if (!value) return "Artist Unknown";
            if (Array.isArray(object["people"]) && object["people"].length > 0) {
                return object["people"][0]["displayname"];
            }
            return value;
        }
        return {
            title: object["title"] || "Untitled",
            artist: getArtist(object["people"]),
            datePainted: object["dated"] || "",
            countryOfOrigin: object["country"] || "",
            description: object["commentary"] || "No description available.",
            department: object["department"] || "",
            style: object["style"] || "",
            imageURL: object["primaryimageurl"] || null,
        };
    }
}