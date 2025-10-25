import { CHICAGO_URL } from '../utils/constants';

let dataCache = {};

/*
    data is stored and returned in format:

    data["data"]: contains the JSON data for the object
    data["imageURL"]: contains IIIF URL forr image
*/
export default ChicagoAPI = (searchTerm) => {
    const [data, setData] = useState(null);

    if(dataCache[searchTerm]) {
        return dataCache[searchTerm];
    }


    let dataRequestURL = `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&is_public_domain=true`

    // TODO: make data request here. REMEMBER TO PUT IDENTIFICATION IN HEADER
    const dataRequest = "placeholder for request";

    let imageId = dataRequest["image_id"];


    let imageDataRequestURL = `https://api.artic.edu/api/v1/artworks/${imageId}?fields=id,title,image_id`

    // make image data request here REMEMBER TO PUT IDENTIFICATION IN HEADER

    const imageDataRequest = "placeholder for request";

    let iiifIdentification = imageDataRequest["IIIF"];

    let imageURL = `https://www.artic.edu/iiif/2/${iiifIdentification}/full/843,/0/default.jpg`

    dataCache[searchTerm] = {
        "data": dataRequest,
        "imageURL" : imageURL
    };

    return dataCache[searchTerm]

}