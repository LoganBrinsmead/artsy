import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';
import api from '../api';
import ArtworkCard from './ArtworkCard';

// Curated discovery themes
// TODO: more granular discovery themes through the use of specific artist names but has the potential to become stale, let's maybe add random indexing and more artists?
const DISCOVERY_THEMES = [
  { label: 'Impressionism', value: 'impressionism', artists: ['Vincent Van Gogh', 'Claude Monet', 'Edgar Degas','Camille Pissarro']},
  { label: 'Renaissance', value: 'renaissance', artists: ['Renaissance'] },
  { label: 'Modern Art', value: 'modern', artists: ['Modern Art'] },
  { label: 'Portraits', value: 'portraits', artists: ['Portrait'] },
  { label: 'Landscapes', value: 'landscapes', artists: ['Landscape'] },
  { label: 'Abstract', value: 'abstract', artists: ['Helen Frankenthaler', 'Mark Rothko', 'Jasper Johns', 'Cy Twombly'] },
  { label: 'Surrealism', value: 'surrealism', artists: ['Salvador Dali', 'René Magritte', 'Max Ernst'] },
];

export default function Discover({ navigation }) {
  const [selectedTheme, setSelectedTheme] = useState('impressionism');
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadArtworks();
  }, [selectedTheme]);

  async function loadArtworks() {
    try {
      setLoading(true);
      const theme = DISCOVERY_THEMES.find(t => t.value === selectedTheme);
      if (!theme) return;

      const results = await Promise.all(theme.artists.map(artist => api.search(artist)));
      const flattenedResults = results.flat();
      setArtworks(flattenedResults.slice(0, 50)); // Show up to 50 artworks
    } catch (error) {
      console.error('Error loading discover artworks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadArtworks();
    setRefreshing(false);
  }

  const renderItem = ({ item }) => (
    <ArtworkCard navigation={navigation} {...item} />
  );

  const currentTheme = DISCOVERY_THEMES.find(t => t.value === selectedTheme);

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={artworks}
        keyExtractor={(item, index) => `${item?.imageURL || item?.title || 'item'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-3xl font-bold text-black mb-4">Discover</Text>
            
            {/* Theme Selection */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Browse by Theme</Text>
              <View className="flex-row flex-wrap gap-2">
                {DISCOVERY_THEMES.map((theme) => (
                  <Pressable
                    key={theme.value}
                    onPress={() => setSelectedTheme(theme.value)}
                    className={`px-4 py-2 rounded-full ${
                      selectedTheme === theme.value
                        ? 'bg-black'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedTheme === theme.value
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {theme.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text className="text-xl font-semibold text-black mb-3">
              {currentTheme?.label} Collection
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-6" />}
        ListEmptyComponent={
          loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#000" />
              <Text className="text-gray-600 mt-4">Loading artworks...</Text>
            </View>
          ) : (
            <Text className="text-gray-500 text-center py-8">
              No artworks found for this theme.
            </Text>
          )
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
