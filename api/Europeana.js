
export default class Europeana {
    constructor() {
        this.baseURL = "https://api.europeana.eu/record/v2";
        this.apiKey = 'keyhere';
        console.log(this.apiKey);
        this.objectsBySearchCache = {};
    }

    async search(searchTerm) {
        if (searchTerm in this.objectsBySearchCache) return this.objectsBySearchCache[searchTerm];

        let dataRequestUrl = this.baseURL + `/search.json?wskey=${this.apiKey}&query=${encodeURIComponent(searchTerm)}~`;
        try {
            console.log(dataRequestUrl);

            let res = await fetch(dataRequestUrl);
            let items = await res.json();

            items = Array.isArray(items["items"]) ? items["items"] : [];
           console.log(items); 
            console.log("I am here");
            this.objectsBySearchCache[searchTerm] = items;

            for(let i = 0; i < items.length; i++) {
                console.log(`item ${i}: ${items[i]}`);
                items[i] = this.formatOutput(items[i]);
            }

            // let formattedItems = items.map(this.formatOutput);
            console.log(items);
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
        return {
            title: data["title"][0] || "Untitled",
            imageURL: data["edmIsShownBy"][0] || null,
            artist: data["artistDisplayName"] || "Artist Unknown",
            datePainted: data["objectDate"] || "",
            countryOfOrigin: data["country"][0] || "",
            description: data["creditLine"][0] || "No description available.",
            department: data["department"] || "",
            style: data["edmConceptLabel"][0] ||"No style (e.g. contemporary) available.",
            source: data["dataProvider"][0] || "Europeana",
        }
    }
}