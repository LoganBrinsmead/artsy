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

export default class MetAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.name = "The Metropolitan Museum of Art";
        this.searchCache = {};   // searchCache[searchTerm] = [array of image URLs for associated search term]
        this.objectIDsBySearchTermCache = {}; // objectIDsBySearchTermCache[searchTerm] = [array of object IDs]
        this.objectCache = {};
    }

    /*
        Returns object ID's for items that contain keywords in their objects
        to get images, use this in conjunction with Object method
    */
    async objectIDsBySearchTerm(searchTerm) {
        if (this.objectIDsBySearchTermCache[searchTerm]) return this.objectIDsBySearchTermCache[searchTerm];

        let searchFragment = `/public/collection/v1/search?q="${searchTerm}"`;

        let data = await fetch(this.baseUrl + searchFragment);

        let processedData = await data.json();

        objectIDsBySearchTermCache[searchTerm] = processedData["objectIDs"];

        return this.objectIDsBySearchTermCache[searchTerm];

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

   // returns array of image URLs according to search term
   async search(searchTerm) {
        
   }
}

const metAPI = new MetAPI(metBaseURL);
const data = await metAPI.search('flowers');
console.log(data)