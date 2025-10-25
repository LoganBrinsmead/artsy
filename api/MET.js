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

    /*
        Returns object ID's for items that contain keywords in their objects
        to get images, use this in conjunction with Object method
    */
    async search(searchTerm) {
        if (this.searchDataCache[searchTerm]) return this.searchDataCache[searchTerm];

        let searchFragment = `/public/collection/v1/search?q="${searchTerm}"`;

        let data = await fetch(this.baseUrl + searchFragment);

        return await data.json();

        return this.searchDataCache;

    }

    /*
        Returns images, description, and more according to ID for object
        see documentation on website for more information
    */
   async getObject(objectId) {
        let objectFragment = `/public/collection/v1/objects/${objectID}`;

        let data = await fetch(this.baseUrl + objectFragment);

        return await data.json();
   }
}

const metAPI = new MetAPI(metBaseURL);
const data = await metAPI.search('flowers');
console.log(data)