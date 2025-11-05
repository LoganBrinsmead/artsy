import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { IconButton } from 'react-native-paper';
import { getGalleryById, getGalleryArtworks, removeArtworkFromGallery } from '../database/services';
import ArtworkCard from './ArtworkCard';

export default function GalleryView({ route, navigation }) {
  const { galleryId } = route.params;
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
          className="absolute top-2 right-2 bg-white rounded-full shadow-lg"
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
        >
          <IconButton icon="close" iconColor="#ef4444" size={20} />
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!gallery) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-xl font-bold text-black mb-2">Gallery Not Found</Text>
        <Text className="text-gray-600 text-center">
          This gallery may have been deleted.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={artworks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-3xl font-bold text-black mb-2">{gallery.name}</Text>
            {gallery.description && (
              <Text className="text-gray-600 mb-2">{gallery.description}</Text>
            )}
            <Text className="text-gray-500 text-sm">
              {artworks.length} artwork{artworks.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-6" />}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center py-8">
            No artworks in this gallery yet. Add some from your favorites or search results!
          </Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
