import { getDatabase } from './db';

// ============ USER SERVICES ============

/**
 * Create a new user
 */
export async function createUser(username, email = null, displayName = null) {
  const db = getDatabase();
  try {
    const result = await db.runAsync(
      'INSERT INTO users (username, email, display_name) VALUES (?, ?, ?)',
      [username, email, displayName]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  const db = getDatabase();
  try {
    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username) {
  const db = getDatabase();
  try {
    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return user;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId, updates) {
  const db = getDatabase();
  const { email, displayName } = updates;
  try {
    await db.runAsync(
      'UPDATE users SET email = ?, display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [email, displayName, userId]
    );
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  const db = getDatabase();
  try {
    const users = await db.getAllAsync('SELECT * FROM users ORDER BY created_at DESC');
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// ============ ARTWORK SERVICES ============

/**
 * Save or get artwork (ensures artwork exists in database)
 */
export async function saveArtwork(artworkData) {
  const db = getDatabase();
  const {
    externalId,
    title,
    artist,
    imageURL,
    datePainted,
    countryOfOrigin,
    description,
    department,
    style,
    source
  } = artworkData;

  try {
    // Try to find existing artwork
    const existing = await db.getFirstAsync(
      'SELECT id FROM artworks WHERE external_id = ? AND source = ?',
      [externalId, source]
    );

    if (existing) {
      return existing.id;
    }

    // Insert new artwork
    const result = await db.runAsync(
      `INSERT INTO artworks (external_id, title, artist, image_url, date_painted, 
       country_of_origin, description, department, style, source) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [externalId, title, artist, imageURL, datePainted, countryOfOrigin, 
       description, department, style, source]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error saving artwork:', error);
    throw error;
  }
}

/**
 * Get artwork by ID
 */
export async function getArtworkById(artworkId) {
  const db = getDatabase();
  try {
    const artwork = await db.getFirstAsync(
      'SELECT * FROM artworks WHERE id = ?',
      [artworkId]
    );
    return artwork;
  } catch (error) {
    console.error('Error getting artwork:', error);
    throw error;
  }
}

// ============ FAVORITES SERVICES ============

/**
 * Add artwork to favorites
 */
export async function addFavorite(userId, artworkData) {
  const db = getDatabase();
  try {
    // First, ensure artwork exists in database
    const artworkId = await saveArtwork(artworkData);

    // Then add to favorites
    await db.runAsync(
      'INSERT OR IGNORE INTO favorites (user_id, artwork_id) VALUES (?, ?)',
      [userId, artworkId]
    );
    return artworkId;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

/**
 * Remove artwork from favorites
 */
export async function removeFavorite(userId, artworkId) {
  const db = getDatabase();
  try {
    await db.runAsync(
      'DELETE FROM favorites WHERE user_id = ? AND artwork_id = ?',
      [userId, artworkId]
    );
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

/**
 * Check if artwork is favorited by user
 */
export async function isFavorited(userId, artworkData) {
  const db = getDatabase();
  try {
    const { externalId, source } = artworkData;
    
    const result = await db.getFirstAsync(
      `SELECT f.id FROM favorites f
       JOIN artworks a ON f.artwork_id = a.id
       WHERE f.user_id = ? AND a.external_id = ? AND a.source = ?`,
      [userId, externalId, source]
    );
    return !!result;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
}

/**
 * Get all favorites for a user
 */
export async function getUserFavorites(userId) {
  const db = getDatabase();
  try {
    const favorites = await db.getAllAsync(
      `SELECT a.*, f.created_at as favorited_at
       FROM favorites f
       JOIN artworks a ON f.artwork_id = a.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return favorites;
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
}

// ============ GALLERY SERVICES ============

/**
 * Create a new gallery
 */
export async function createGallery(userId, name, description = null) {
  const db = getDatabase();
  try {
    const result = await db.runAsync(
      'INSERT INTO galleries (user_id, name, description) VALUES (?, ?, ?)',
      [userId, name, description]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating gallery:', error);
    throw error;
  }
}

/**
 * Get all galleries for a user
 */
export async function getUserGalleries(userId) {
  const db = getDatabase();
  try {
    const galleries = await db.getAllAsync(
      `SELECT g.*, COUNT(ga.id) as artwork_count
       FROM galleries g
       LEFT JOIN gallery_artworks ga ON g.id = ga.gallery_id
       WHERE g.user_id = ?
       GROUP BY g.id
       ORDER BY g.created_at DESC`,
      [userId]
    );
    return galleries;
  } catch (error) {
    console.error('Error getting galleries:', error);
    throw error;
  }
}

/**
 * Get gallery by ID
 */
export async function getGalleryById(galleryId) {
  const db = getDatabase();
  try {
    const gallery = await db.getFirstAsync(
      'SELECT * FROM galleries WHERE id = ?',
      [galleryId]
    );
    return gallery;
  } catch (error) {
    console.error('Error getting gallery:', error);
    throw error;
  }
}

/**
 * Update gallery
 */
export async function updateGallery(galleryId, name, description) {
  const db = getDatabase();
  try {
    await db.runAsync(
      'UPDATE galleries SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, galleryId]
    );
  } catch (error) {
    console.error('Error updating gallery:', error);
    throw error;
  }
}

/**
 * Delete gallery
 */
export async function deleteGallery(galleryId) {
  const db = getDatabase();
  try {
    await db.runAsync('DELETE FROM galleries WHERE id = ?', [galleryId]);
  } catch (error) {
    console.error('Error deleting gallery:', error);
    throw error;
  }
}

/**
 * Add artwork to gallery
 */
export async function addArtworkToGallery(galleryId, artworkData) {
  const db = getDatabase();
  try {
    // First, ensure artwork exists in database
    const artworkId = await saveArtwork(artworkData);

    // Then add to gallery
    await db.runAsync(
      'INSERT OR IGNORE INTO gallery_artworks (gallery_id, artwork_id) VALUES (?, ?)',
      [galleryId, artworkId]
    );
    return artworkId;
  } catch (error) {
    console.error('Error adding artwork to gallery:', error);
    throw error;
  }
}

/**
 * Remove artwork from gallery
 */
export async function removeArtworkFromGallery(galleryId, artworkId) {
  const db = getDatabase();
  try {
    await db.runAsync(
      'DELETE FROM gallery_artworks WHERE gallery_id = ? AND artwork_id = ?',
      [galleryId, artworkId]
    );
  } catch (error) {
    console.error('Error removing artwork from gallery:', error);
    throw error;
  }
}

/**
 * Get all artworks in a gallery
 */
export async function getGalleryArtworks(galleryId) {
  const db = getDatabase();
  try {
    const artworks = await db.getAllAsync(
      `SELECT a.*, ga.added_at
       FROM gallery_artworks ga
       JOIN artworks a ON ga.artwork_id = a.id
       WHERE ga.gallery_id = ?
       ORDER BY ga.added_at DESC`,
      [galleryId]
    );
    return artworks;
  } catch (error) {
    console.error('Error getting gallery artworks:', error);
    throw error;
  }
}

/**
 * Check if artwork is in gallery
 */
export async function isArtworkInGallery(galleryId, artworkData) {
  const db = getDatabase();
  try {
    const { externalId, source } = artworkData;
    
    const result = await db.getFirstAsync(
      `SELECT ga.id FROM gallery_artworks ga
       JOIN artworks a ON ga.artwork_id = a.id
       WHERE ga.gallery_id = ? AND a.external_id = ? AND a.source = ?`,
      [galleryId, externalId, source]
    );
    return !!result;
  } catch (error) {
    console.error('Error checking artwork in gallery:', error);
    return false;
  }
}
