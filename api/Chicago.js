export default class Chicago {
  constructor() {
    this.name = "Art Institute of Chicago";
    this.baseURL = "https://api.artic.edu/api/v1/";
    this.objectsBySearchCache = {};
    this.iifURL = "https://www.artic.edu/iiif/2";
  }

  // TODO: turn this into search function
  //  include image URL in the data for parsing
  // parse data out so it is extendable, create a parse function to do this.
  async search(searchTerm) {
    if (this.objectsBySearchCache[searchTerm])
      return this.objectsBySearchCache[searchTerm];

    let dataRequestUrl = baseURL + `/artworks/search?q=${searchTerm}`;

    // array of objects
    let data = await fetch(dataRequestUrl);
    data = data["data"];

    // insert image URL into data
    for (let i = 0; i < data.length; i++) {
      let imageIdentifier = data[i]["id"];
      data[i]["imageURL"] = getImageByID(imageIdentifier);
    }

    this.objectsBySearchCache[searchTerm] = data;

    return this.objectsBySearchCache[searchTerm];
  }

  getImageByID(identifier) {
    return `https://www.artic.edu/iiif/2/${identifier}/full/843,/0/default.jpg`;
  }

  /*
        Formats the data in a readable format for the API function
        parameter data is an object in the format returned by this API
        Example object: https://api.artic.edu/api/v1/artworks/129884

        TODO: for future "format outputs" it may be more prudent to write a single
        function that formats outputs for each api in the base api file (index.js)
        perhaps can create then pass an object that contains the respective keys
        for each API? 
    */
  formatOutput(data) {
    let formattedObject = {
      title: data["title"],
      artist: data["artist_title"],
      datePainted: data["date_end"],
      countryOfOrigin: data["place_of_origin"],
      description: data["description"],
      department: data["department_title"],
      style: data["style_title"],
    };

    return formattedObject;
  }
}
