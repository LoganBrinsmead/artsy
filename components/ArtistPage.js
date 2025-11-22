import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Title } from 'react-native-paper';
import ArtworkCard from './ArtworkCard';
import api from '../api';

export default function ArtistPage({ route }) {
  // Ensure we have navigation from route if not passed directly
  const navigation = route?.params?.navigation || useNavigation();
  const { artistName } = route.params;
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistInfo, setArtistInfo] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    loadArtistData();
  }, [artistName]);

  async function loadArtistData() {
    try {
      setLoading(true);
      
      // Search for artworks by this artist
      const results = await api.search(artistName);
      
      // Filter to only include artworks by this exact artist
      const filteredResults = results.filter(artwork => 
        artwork.artist && artwork.artist.toLowerCase() === artistName.toLowerCase()
      );
      
      setArtworks(filteredResults);
      
      // If we have any results, use the first one to get artist info
      if (filteredResults.length > 0) {
        setArtistInfo({
          name: filteredResults[0].artist,
          // Add more artist info here if available in your API
        });
      }
    } catch (error) {
      console.error('Error loading artist data:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }) => (
    <ArtworkCard navigation={navigation} {...item} />
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4" style={{ color: theme.colors.onSurfaceVariant }}>
          Loading artist information...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={artworks}
        keyExtractor={(item, index) => `${item?.imageURL || item?.title || 'artwork'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 12 }}>
              {artistInfo?.name || artistName}
            </Text>
            {artistInfo?.bio && (
              <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
                {artistInfo.bio}
              </Text>
            )}
            <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.onBackground, marginBottom: 12 }}>
              Featured Works
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No artworks found for this artist.
            </Text>
          </View>
        }
      />
    </View>
  );
}

