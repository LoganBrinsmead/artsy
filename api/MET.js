/*
    Retrieves artwork from The Metropolitan Museum of Art
    Documentation: https://metmuseum.github.io/
*/

const metBaseURL = "https://collectionapi.metmuseum.org"

/*
    data is stored and returned in format:

    data["data"]: contains the JSON data for the image
    data["imageURL"]: contains IIIF URL forr image
*/

class MetAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.searchDataCache = {}
    }

    async search(searchTerm) {
        if (this.searchDataCache[searchTerm]) return this.searchDataCache[searchTerm];

        let searchFragment = `/public/collection/v1/search?q="${searchTerm}"`;

        let data = await fetch(this.baseUrl + searchFragment);

        return await data.json();

        return this.searchDataCache;

    }
}

const metAPI = new MetAPI(metBaseURL);
const data = await metAPI.search('flowers');
console.log(data)