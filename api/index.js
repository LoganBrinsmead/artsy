import { MetAPI, Chicago } from './MET'

class API {
    constructor() {
        this.apis = [ MetAPI, Chicago ]
        this.dataCache = {};
    }

    async search(searchTerm) {
        for(let api of this.apis) {
            api.search(searchTerm);
        }
    }
}