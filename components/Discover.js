import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Button, SegmentedButtons, useTheme } from 'react-native-paper';
import api from '../api';
import ArtworkCard from './ArtworkCard';

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
  const theme = useTheme();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={artworks}
        keyExtractor={(item, index) => `${item?.imageURL || item?.title || 'item'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 16 }}>Discover</Text>
            
            {/* Theme Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>Browse by Theme</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DISCOVERY_THEMES.map((themeItem) => (
                  <Pressable
                    key={themeItem.value}
                    onPress={() => setSelectedTheme(themeItem.value)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedTheme === themeItem.value ? theme.colors.primary : theme.colors.surfaceVariant,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: selectedTheme === themeItem.value ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                      }}
                    >
                      {themeItem.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.onBackground, marginBottom: 12 }}>
              {currentTheme?.label} Collection
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>Loading artworks...</Text>
            </View>
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingVertical: 32 }}>
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
