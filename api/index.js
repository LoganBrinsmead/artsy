import { MetAPI } from './MET'

class API {
    constructor() {
        this.apis = [MetAPI]
        this.dataCache = {};
    }

    async search(searchTerm) {
        for(let api of this.apis) {
            api.search(searchTerm);
        }
    }
}