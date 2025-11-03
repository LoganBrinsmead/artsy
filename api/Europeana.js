export default class Europeana {
    constructor() {
        this.baseURL = "https://api.europeana.eu/record/v2/";
        this.apiKey = process.env.EUROPEANA_API_KEY;
        console.log(this.apiKey);
        this.objectsBySearchCache = {};
    }

    async search(searchTerm) {
        if (searchTerm in this.objectsBySearchCache) return this.objectsBySearchCache[searchTerm];

        const dataRequestUrl = this.baseURL + `/search.json?wskey=${this.apiKey}&query=${encodeURIComponent(searchTerm)}~`;
        try {

            let res = await this.fetchJson(dataRequestUrl);
            const items = Array.isArray(res?.data) ? res.data : [];
            this.objectsBySearchCache[searchTerm] = items;

            const formattedItems = items.map(this.formatOutput);
            return formattedItems;
            
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
            title: data["title"] || "Untitled",
            imageURL: data["edmIsShownBy"] || null,
            artist: data["artistDisplayName"] || "Artist Unknown",
            datePainted: data["objectDate"] || "",
            countryOfOrigin: data["country"] || "",
            description: data["creditLine"] || "No description available.",
            department: data["department"] || "",
            style: data["edmConceptLabel"][9] ||"No style (e.g. contemporary) available.",
            source: data["dataProvider"] || "Europeana",
        }
    }
}