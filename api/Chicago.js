
export default class Chicago {
    constructor() {
        this.name= "Art Institute of Chicago";
        this.baseURL = "https://api.artic.edu/api/v1/"
        this.objectsBySearchCache = {};
    }

    async getObjectsBySearch(searchTerm) {
        if(this.objectsBySearchCache[searchTerm]) return this.objectsBySearchCache[searchTerm];

        let dataRequestUrl = baseURL + `/artworks/search?q=${searchTerm}`;

        let data = await fetch(dataRequestUrl);

        this.objectsBySearchCache[searchTerm] = data["data"];

        return this.objectsBySearchCache[searchTerm];
    }


}
