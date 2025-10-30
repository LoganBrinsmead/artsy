import { MetAPI } from './MET';
import { Chicago } from './Chicago';

class API {
    constructor() {
        this.apis = [ MetAPI, Chicago ]
        this.dataCache = {};
    }

    async search(searchTerm) {
        let data = [];
        /*
            In format
            {
                source: Metropolitan Museum Of Art,
                data: array_of_objects
            }
        */
        let currentData = {};
        for(let i = 0; i < this.apis.length; i++) {
            let api = this.apis[i];
            let curObjects = await api.search(searchTerm);        // array of objects
            let currentSource = api.name;
            currentData["source"] = currentSource;
            currentData["data"] = curObjects;

            data[i] = currentData;
        }

        return data;
    }
}