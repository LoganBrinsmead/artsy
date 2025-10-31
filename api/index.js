import MetAPI from './MET';
import Chicago from './Chicago';

class API {
  constructor() {
    this.apis = [
      new MetAPI('https://collectionapi.metmuseum.org'),
      new Chicago(),
    ];
  }

  async search(searchTerm) {
    const results = await Promise.all(
      this.apis.map(async (api) => {
        try {
          const items = await api.search(searchTerm);
          return Array.isArray(items)
            ? items.map((it) => ({ ...it, source: api.name }))
            : [];
        } catch (e) {
          console.log("Error: ", e);
          console.log(`Failed to fetch results from ${api.name}`);
          return [];
        }
      })
    );
    return results.flat();
  }
}
const api = new API();
export default api;