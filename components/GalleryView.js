import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { getGalleryById, getGalleryArtworks, removeArtworkFromGallery } from '../database/services';
import ArtworkCard from './ArtworkCard';

export default function GalleryView({ route, navigation }) {
  const { galleryId } = route.params;
  const theme = useTheme();
  const [gallery, setGallery] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGallery();
  }, [galleryId]);

  async function loadGallery() {
    try {
      setLoading(true);
      const galleryData = await getGalleryById(galleryId);
      const artworkData = await getGalleryArtworks(galleryId);
      setGallery(galleryData);
      setArtworks(artworkData);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadGallery();
    setRefreshing(false);
  }

  async function handleRemoveArtwork(artworkId) {
    try {
      await removeArtworkFromGallery(galleryId, artworkId);
      setArtworks(prev => prev.filter(item => item.id !== artworkId));
    } catch (error) {
      console.error('Error removing artwork from gallery:', error);
    }
  }

  const renderItem = ({ item }) => {
    // Convert database format to component format
    const artworkData = {
      imageURL: item.image_url,
      title: item.title,
      artist: item.artist,
      datePainted: item.date_painted,
      countryOfOrigin: item.country_of_origin,
      description: item.description,
      department: item.department,
      style: item.style,
      source: item.source,
      externalId: item.external_id,
    };

    return (
      <View className="relative">
        <ArtworkCard navigation={navigation} {...artworkData} />
        <Pressable
          onPress={() => handleRemoveArtwork(item.id)}
          style={{ position: 'absolute', top: 8, right: 8, width: 40, height: 40, backgroundColor: theme.colors.surface, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}
        >
          <IconButton icon="close" iconColor="#ef4444" size={20} />
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!gallery) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 8 }}>Gallery Not Found</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          This gallery may have been deleted.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={artworks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 8 }}>{gallery.name}</Text>
            {gallery.description && (
              <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>{gallery.description}</Text>
            )}
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
              {artworks.length} artwork{artworks.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
        ListEmptyComponent={
          <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingVertical: 32 }}>
            No artworks in this gallery yet. Add some from your favorites or search results!
          </Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
