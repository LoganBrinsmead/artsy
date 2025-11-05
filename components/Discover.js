import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';
import api from '../api';
import ArtworkCard from './ArtworkCard';

// Curated discovery themes
const DISCOVERY_THEMES = [
  { label: 'Impressionism', value: 'impressionism', searchTerm: 'Impressionism' },
  { label: 'Renaissance', value: 'renaissance', searchTerm: 'Renaissance' },
  { label: 'Modern Art', value: 'modern', searchTerm: 'Modern Art' },
  { label: 'Portraits', value: 'portraits', searchTerm: 'Portrait' },
  { label: 'Landscapes', value: 'landscapes', searchTerm: 'Landscape' },
  { label: 'Abstract', value: 'abstract', searchTerm: 'Abstract' },
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

      const results = await api.search(theme.searchTerm);
      setArtworks(results.slice(0, 20)); // Show up to 20 artworks
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
