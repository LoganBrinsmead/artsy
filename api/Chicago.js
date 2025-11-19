export default class Chicago {
  constructor(cacheTTL = 5 * 60 * 1000) {
    this.name = "Art Institute of Chicago";
    this.baseURL = "https://api.artic.edu/api/v1";
    // Cache with TTL: { data: [...], timestamp: Date.now() }
    this.objectsBySearchCache = {};
    this.iifURL = "https://www.artic.edu/iiif/2";
    // Cache TTL: configurable, defaults to 5 minutes (300000 ms)
    this.CACHE_TTL = cacheTTL;
  }

  // TODO: turn this into search function
  //  include image URL in the data for parsing
  // parse data out so it is extendable, create a parse function to do this.
  async search(searchTerm) {
    // Check cache with TTL
    const cached = this.objectsBySearchCache[searchTerm];
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }
      // TODO: This is an EXTREMELY crude way to paginate that needs to be improved but it works for the time being
      let page = Math.floor(Math.random() * (3 - 1 + 1)) + 1;


    const dataRequestUrl = this.baseURL + `/artworks/search?q=${encodeURIComponent(searchTerm)}&page=${page}`;
    try {
      let res = await this.fetchJson(dataRequestUrl);
      const items = Array.isArray(res?.data) ? res.data : [];

      // Cap to improve responsiveness
      const MAX_OBJECTS = 60;
      const ids = items.slice(0, MAX_OBJECTS).map((d) => d?.id).filter(Boolean);

      // Batch requests in parallel with delays between batches
      const BATCH_SIZE = 15;
      const BATCH_DELAY_MS = 300;
      const out = [];
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (id) => {
            try {
              const currentObject = await this.getObjectByID(id);
              return this.formatOutput(currentObject?.data);
            } catch {
              return null;
            }
          })
        );
        for (const r of batchResults) if (r) out.push(r);
        if (i + BATCH_SIZE < ids.length) await this.sleep(BATCH_DELAY_MS);
      }

      this.objectsBySearchCache[searchTerm] = {
        data: out,
        timestamp: Date.now()
      };
      return this.objectsBySearchCache[searchTerm].data;
    } catch (e) {
      console.warn('AIC search failed:', e?.message || e);
      this.objectsBySearchCache[searchTerm] = {
        data: [],
        timestamp: Date.now()
      };
      return [];
    }
  }

  async getObjectByID(identifier) {
    const dataRequestUrl = this.baseURL + `/artworks/${identifier}`;
    return await this.fetchJson(dataRequestUrl);
  }

  getImageByID(identifier) {
    let imageURL = `https://www.artic.edu/iiif/2/${identifier}/full/843,/0/default.jpg`;
    return imageURL;
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
    if (!data) return null;
    return {
      externalId: data["id"] ? String(data["id"]) : null,
      title: data["title"] || "Untitled",
      artist: data["artist_title"] || "Artist Unknown",
      datePainted: data["date_end"] || "",
      countryOfOrigin: data["place_of_origin"] || "",
      description: data["description"] || "No description available.",
      department: data["department_title"] || "",
      style: data["style_title"] || "",
      imageURL: data["image_id"] ? this.getImageByID(data["image_id"]) : null,
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

  sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  /**
   * Clear all caches
   */
  clearCache() {
    this.objectsBySearchCache = {};
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    Object.keys(this.objectsBySearchCache).forEach(key => {
      if (now - this.objectsBySearchCache[key].timestamp >= this.CACHE_TTL) {
        delete this.objectsBySearchCache[key];
      }
    });
  }
}
