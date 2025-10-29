
export default class Chicago {
    constructor() {
        this.name= "Art Institute of Chicago";
        this.baseURL = "https://api.artic.edu/api/v1/"
        this.objectsBySearchCache = {};
        this.iifURL = "https://www.artic.edu/iiif/2";
    }

    // TODO: turn this into search function
    //  include image URL in the data for parsing
    // parse data out so it is extendable, create a parse function to do this.
    async getObjectsBySearch(searchTerm) {
        if(this.objectsBySearchCache[searchTerm]) return this.objectsBySearchCache[searchTerm];

        let dataRequestUrl = baseURL + `/artworks/search?q=${searchTerm}`;

        let data = await fetch(dataRequestUrl);

        this.objectsBySearchCache[searchTerm] = data["data"];

        return this.objectsBySearchCache[searchTerm];
    }

    getImageByID(identifier) {
        return `https://www.artic.edu/iiif/2/${identifier}/full/843,/0/default.jpg`;

    }

}
