import { EUROPEANA_API_KEY } from '@env';

export default class Europeana {
    constructor() {
        this.baseURL = "https://api.europeana.eu/record/v2";
        this.apiKey = EUROPEANA_API_KEY;
        this.objectsBySearchCache = {};
    }

    async search(searchTerm) {
        if (searchTerm in this.objectsBySearchCache) return this.objectsBySearchCache[searchTerm];

        let dataRequestUrl = this.baseURL + `/search.json?wskey=${this.apiKey}&query=${encodeURIComponent(searchTerm)}~`;
        try {

            let res = await fetch(dataRequestUrl);
            let items = await res.json();

            items = Array.isArray(items["items"]) ? items["items"] : [];
            this.objectsBySearchCache[searchTerm] = items;

            for(let i = 0; i < items.length; i++) {
                items[i] = this.formatOutput(items[i]);
            }

            return items;
            
        } catch (e) {

            console.warn('Europeana search failed:', e?.message || e);
            this.objectsBySearchCache[searchTerm] = [];
            return [];

        }
    }

    async fetchJson(url, { timeoutMs = 8000 } = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
            }
            return await res.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    formatOutput(data) {
        if (!data) return null;
        
        // Helper function to extract value from array if needed
        const getValue = (value, defaultValue) => {
            if (value === undefined || value === null) return defaultValue;
            return Array.isArray(value) ? (value[0] || defaultValue) : value;
        };
        
        return {
            title: getValue(data["title"], "Untitled"),
            imageURL: getValue(data["edmIsShownBy"], null),
            artist: getValue(data["artistDisplayName"], "Artist Unknown"),
            datePainted: getValue(data["objectDate"], ""),
            countryOfOrigin: getValue(data["country"], ""),
            description: getValue(data["creditLine"], "No description available."),
            department: getValue(data["department"], ""),
            // style: getValue(data["edmConceptLabel"], "No style (e.g. contemporary) available."),
            style: "No style (e.g. contemporary) available. (Europeana needs style parsing!)",
            source: getValue(data["dataProvider"], "Europeana"),
        }
    }
}