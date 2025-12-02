export default class Cleveland {
    constructor(cacheTTL = 5 * 60 * 1000) {
        this.name = "Cleveland Museum of Art";
        this.baseURL = "https://openaccess-api.clevelandart.org/api";
        // Cache with TTL: { data: [...], timestamp: Date.now() }
        this.objectsBySearchCache = {};
        // Cache TTL: configurable, defaults to 5 minutes (300000 ms)
        this.CACHE_TTL = cacheTTL;
    }

    async search(searchTerm) {

        const cached = this.objectsBySearchCache[searchTerm];
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.data;
        }

        const response = await fetch(`${this.baseURL}/artworks?search=${searchTerm}`);
        console.log("URL: ", `${this.baseURL}/artworks?search=${searchTerm}`);
        let data = await response.json();
        data = data["data"];

        // Cleveland has lots of data, let's limit it to 100
        data = data.slice(0, 100);
        for(let object of data) {
            object["imageURL"] = await this.getImageByID(object["id"]);
            object = this.formatOutput(object);
        }

        this.objectsBySearchCache[searchTerm] = {
            data: data,
            timestamp: Date.now()
        };
        return this.objectsBySearchCache[searchTerm].data;
    }

    async getImageByID(id) {
        let response = await fetch(`${this.baseURL}/artworks/${id}`);
        let data = await response.json();
        data = data["data"];
        
        try {
            if(data["images"]["web"]["url"]){
                return data["images"]["web"]["url"];
            } else if(data["images"]["print"]["url"]){
                return data["images"]["print"]["url"];
            }
            return null;
        } catch (e) {
            console.warn("Error retrieving information from Cleveland Museum of Art API, getImageByID method: ", e);
            return null;
        }
    }

  formatOutput(data) {
    if (!data) return null;
    return {
      externalId: data["id"] ? String(data["id"]) : null,
      title: data["title"] || "Untitled",
      artist: data["creators"][0]["description"] || "Artist Unknown",
      datePainted: data["date_end"] || "",
      countryOfOrigin: data["place_of_origin"] || "",
      description: data["description"] || "No description available.",
      department: data["department_title"] || "",
      style: data["style_title"] || "",
      imageURL: data["imageURL"] || null,
    };
  }

}