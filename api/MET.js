/*
    Retrieves artwork from The Metropolitan Museum of Art
    Documentation: https://metmuseum.github.io/
*/

/*
    data is stored and returned in format:

    data["data"]: contains the JSON data for the image
    data["imageURL"]: contains IIIF URL for image
*/

export default class MetAPI {
    constructor(cacheTTL = 5 * 60 * 1000) {
        this.baseUrl = "https://collectionapi.metmuseum.org";
        this.name = "The Metropolitan Museum of Art";
        // Cache with TTL: { data: [...], timestamp: Date.now() }
        this.searchCache = {};   
        this.objectIDsBySearchTermCache = {}; 
        this.objectCache = {};
        // Cache TTL: configurable, defaults to 5 minutes (300000 ms)
        this.CACHE_TTL = cacheTTL;
    }

    /*
        Returns array of object ID's for items that contain keywords in their objects
        to get images, use this in conjunction with Object method
    */
    async objectIDsBySearchTerm(searchTerm) {
        // Check cache with TTL
        const cached = this.objectIDsBySearchTermCache[searchTerm];
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.data;
        }

        const searchFragment = `/public/collection/v1/search?hasImages=true&q="${encodeURIComponent(searchTerm)}"`;
        const url = this.baseUrl + searchFragment;
        try {
            const res = await this.fetchJson(url);
            const ids = Array.isArray(res?.objectIDs) ? res.objectIDs : [];
            this.objectIDsBySearchTermCache[searchTerm] = {
                data: ids,
                timestamp: Date.now()
            };
        } catch (e) {
            console.warn('MET search failed:', e?.message || e);
            this.objectIDsBySearchTermCache[searchTerm] = {
                data: [],
                timestamp: Date.now()
            };
        }

        return this.objectIDsBySearchTermCache[searchTerm].data;
    }

    /*
        Returns images, description, and more according to ID for object
        see documentation on website for more information
    */
    async getObject(objectID) {
        // Check cache with TTL
        const cached = this.objectCache[objectID];
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.data;
        }

        const objectFragment = `/public/collection/v1/objects/${objectID}`;
        const url = this.baseUrl + objectFragment;
        try {
            const data = await this.fetchJson(url);
            this.objectCache[objectID] = {
                data: data,
                timestamp: Date.now()
            };
            return this.objectCache[objectID].data;
        } catch (e) {
            console.warn('MET getObject failed:', objectID, e?.message || e);
            throw e;
        }
    }

    /* returns array of json objects of image data according to search term
        see documentation on website for more information
    */ 
    async search(searchTerm) {
        // Check cache with TTL
        const cached = this.searchCache[searchTerm];
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.data;
        }

        const results = [];

        const objectIDsBySearchTerm = await this.objectIDsBySearchTerm(searchTerm);
        if (!objectIDsBySearchTerm || objectIDsBySearchTerm.length === 0) {
            this.searchCache[searchTerm] = {
                data: [],
                timestamp: Date.now()
            };
            return this.searchCache[searchTerm].data;
        }

        // Cap total fetched objects for responsiveness
        const MAX_OBJECTS = 60; // adjust as needed
        const ids = objectIDsBySearchTerm.slice(0, MAX_OBJECTS);

        // Rate limit: process in batches to stay well under 80 req/sec
        const BATCH_SIZE = 15;
        const BATCH_DELAY_MS = 300; // 15*3 batches/sec ~45 rps max
        for (let i = 0; i < ids.length; i += BATCH_SIZE) {
            const batch = ids.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(async (id) => {
                    try {
                        const obj = await this.getObject(id);
                        return this.formatOutput(obj);
                    } catch (e) {
                        return null;
                    }
                })
            );
            for (const r of batchResults) if (r) results.push(r);
            if (i + BATCH_SIZE < ids.length) await this.sleep(BATCH_DELAY_MS);
        }

        this.searchCache[searchTerm] = {
            data: results,
            timestamp: Date.now()
        };
        
        return this.searchCache[searchTerm].data;
    }

    /* Formats objects to be processed in index.js
        Example object: https://collectionapi.metmuseum.org/public/collection/v1/objects/437133

    */
    formatOutput(data) {
        if (!data) return null;
        return {
            externalId: data["objectID"] ? String(data["objectID"]) : null,
            title: data["title"] || "Untitled",
            imageURL: data["primaryImage"] || data["primaryImageSmall"] || null,
            artist: data["artistDisplayName"] || "Artist Unknown",
            datePainted: data["objectDate"] || "",
            countryOfOrigin: data["artistNationality"] || "",
            description: data["creditLine"] || "No description available.",
            department: data["department"] || "",
            style: "No style (e.g. contemporary) available.",
            source: "The Metropolitan Museum of Art",
        };
    }

    // Helpers
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

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.searchCache = {};
        this.objectIDsBySearchTermCache = {};
        this.objectCache = {};
    }

    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        const now = Date.now();
        
        // Clear expired search cache
        Object.keys(this.searchCache).forEach(key => {
            if (now - this.searchCache[key].timestamp >= this.CACHE_TTL) {
                delete this.searchCache[key];
            }
        });
        
        // Clear expired object IDs cache
        Object.keys(this.objectIDsBySearchTermCache).forEach(key => {
            if (now - this.objectIDsBySearchTermCache[key].timestamp >= this.CACHE_TTL) {
                delete this.objectIDsBySearchTermCache[key];
            }
        });
        
        // Clear expired object cache
        Object.keys(this.objectCache).forEach(key => {
            if (now - this.objectCache[key].timestamp >= this.CACHE_TTL) {
                delete this.objectCache[key];
            }
        });
    }
}