import * as SQLite from 'expo-sqlite';

let db = null;

/**
 * Initialize and open the database
 */
export async function openDatabase() {
  if (db) return db;
  
  try {
    db = await SQLite.openDatabaseAsync('artsy.db');
    await initializeTables();
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

/**
 * Initialize database tables
 */
async function initializeTables() {
  try {
    // Users table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        display_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Artworks table (cache artwork data)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        external_id TEXT,
        title TEXT NOT NULL,
        artist TEXT,
        image_url TEXT NOT NULL,
        date_painted TEXT,
        country_of_origin TEXT,
        description TEXT,
        department TEXT,
        style TEXT,
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(external_id, source)
      );
    `);

    // Favorites table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artwork_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        UNIQUE(user_id, artwork_id)
      );
    `);

    // Galleries table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS galleries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Gallery artworks (many-to-many relationship)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS gallery_artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gallery_id INTEGER NOT NULL,
        artwork_id INTEGER NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        UNIQUE(gallery_id, artwork_id)
      );
    `);

    // Create indexes for better performance
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_artwork ON favorites(artwork_id);
      CREATE INDEX IF NOT EXISTS idx_galleries_user ON galleries(user_id);
      CREATE INDEX IF NOT EXISTS idx_gallery_artworks_gallery ON gallery_artworks(gallery_id);
      CREATE INDEX IF NOT EXISTS idx_gallery_artworks_artwork ON gallery_artworks(artwork_id);
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call openDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase() {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
