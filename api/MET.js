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
        Returns array of object ID's for items that contain keywords in their objects
        to get images, use this in conjunction with Object method
    */
    async objectIDsBySearchTerm(searchTerm) {
        if (this.objectIDsBySearchTermCache[searchTerm]) return this.objectIDsBySearchTermCache[searchTerm];

        let searchFragment = `/public/collection/v1/search?q="${searchTerm}"`;

        let data = await fetch(this.baseUrl + searchFragment);

        let processedData = await data.json();

        this.objectIDsBySearchTermCache[searchTerm] = processedData["objectIDs"];

        return this.objectIDsBySearchTermCache[searchTerm];

    }

    /*
        Returns images, description, and more according to ID for object
        see documentation on website for more information
    */
   async getObject(objectID) {
        if(this.objectCache[objectID]) return this.objectCache[objectID];

        let objectFragment = `/public/collection/v1/objects/${objectID}`;

        let data = await fetch(this.baseUrl + objectFragment);

        let processedData = data.json();

        this.objectCache[objectID] = processedData;

        return this.objectCache[objectID];
   }

   /* returns json objects of image data according to search term
      see documentation on website for more information
   */ 
   async search(searchTerm) {
        if (this.searchCache[searchTerm]) return this.searchCache[searchTerm];

        let objectsArray = [];


        let objectIDsBySearchTerm = await this.objectIDsBySearchTerm(searchTerm);

        for(let i = 0; i < objectIDsBySearchTerm.length; i++) {
            let object = await this.getObject(objectIDsBySearchTerm[i])
            objectsArray[i] = this.formatData(object);
        }

        this.searchCache[searchTerm] = objectsArray;
        
        return this.searchCache;
   }

   /* Formats objects to be processed in index.js
      Example object: https://collectionapi.metmuseum.org/public/collection/v1/objects/437133

   */
  formatOutput(data) {
    let formattedObject = {
      title: data["title"],
      artist: data["artistDisplayName"],
      datePainted: data["objectDate"],
      countryOfOrigin: data["artistNationality"],
      description: "No description available.",
      department: data["department"],
      style: "No style (e.g. contemporary) available.",
    };

    return formattedObject;
  }
}