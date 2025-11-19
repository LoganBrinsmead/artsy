import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';
import api from '../api';
import ArtworkCard from './ArtworkCard';
import { useThemeMode } from '../context/ThemeContext';

// Curated discovery themes
// TODO: more granular discovery themes through the use of specific artist names but has the potential to become stale, let's maybe add random indexing and more artists?
const DISCOVERY_THEMES = [
  { label: 'Impressionism', artistsSpecified: true, value: 'impressionism', artists: ['Vincent Van Gogh', 'Claude Monet', 'Edgar Degas','Camille Pissarro']},
  { label: 'Renaissance', artistsSpecified: false, value: 'renaissance', artists: ['renaissance'] },
  { label: 'Modern Art', artistsSpecified: false, value: 'modern', artists: ['modern'] },
  { label: 'Portraits', artistsSpecified: false, value: 'portraits', artists: ['portraits'] },
  { label: 'Landscapes', artistsSpecified: false, value: 'landscapes', artists: ['landscapes'] },
  { label: 'Abstract', artistsSpecified: true, value: 'abstract', artists: ['Helen Frankenthaler', 'Mark Rothko', 'Jasper Johns', 'Cy Twombly'] },
  { label: 'Surrealism', artistsSpecified: true, value: 'surrealism', artists: ['Salvador Dali', 'René Magritte', 'Max Ernst'] },
];

export default function Discover({ navigation }) {
  const { isDark } = useThemeMode();
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

      let results;

      if(theme.artistsSpecified) {
        results = await Promise.all(theme.artists.map(artist => api.search(artist)));
        results = results.flat();
        results = results.filter(r => theme.artists.includes(r.artist));
        
      } else {
        results = await api.search(theme.value);
        results = results.flat();
      }
      results.sort(() => Math.random() - 0.5);    // randomize results
      setArtworks(results.slice(0, 50)); // Show up to 50 artworks
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
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <FlatList
        data={artworks}
        keyExtractor={(item, index) => `${item?.imageURL || item?.title || 'item'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-4`}>Discover</Text>
            
            {/* Theme Selection */}
            <View className="mb-4">
              <Text className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Browse by Theme</Text>
              <View className="flex-row flex-wrap gap-2">
                {DISCOVERY_THEMES.map((theme) => (
                  <Pressable
                    key={theme.value}
                    onPress={() => setSelectedTheme(theme.value)}
                    className={`px-4 py-2 rounded-full ${
                      selectedTheme === theme.value
                        ? (isDark ? 'bg-white' : 'bg-black')
                        : (isDark ? 'bg-neutral-800' : 'bg-gray-200')
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedTheme === theme.value
                          ? (isDark ? 'text-black' : 'text-white')
                          : (isDark ? 'text-gray-200' : 'text-gray-700')
                      }`}
                    >
                      {theme.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-black'} mb-3`}>
              {currentTheme?.label} Collection
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-6" />}
        ListEmptyComponent={
          loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-4`}>Loading artworks...</Text>
            </View>
          ) : (
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>
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
