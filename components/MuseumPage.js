import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Animated, Easing } from 'react-native';
import { useTheme } from 'react-native-paper';
import api from '../api';
import ArtworkCard from './ArtworkCard';

export default function MuseumPage({ navigation, route }) {
  const theme = useTheme();
  const { museum, label } = route.params || {};
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const placeholderCount = 6;
  const [placeholders] = useState(
    Array.from({ length: placeholderCount }, () => new Animated.Value(0))
  );

  useEffect(() => {
    if (loading) {
      placeholders.forEach(v => v.setValue(0));
      Animated.stagger(
        150,
        placeholders.map((v) =>
          Animated.timing(v, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        )
      ).start();
    } else {
      placeholders.forEach(v => v.setValue(0));
    }
  }, [loading]);

  useEffect(() => {
    if (museum) {
      loadArtworks();
    }
  }, [museum]);

  async function loadArtworks() {
    try {
      setLoading(true);
      // Search for artworks and filter by museum source
      const results = await api.search(label || museum);
      const filtered = results.filter(r => r.source === museum);
      filtered.sort(() => Math.random() - 0.5); // randomize results
      setArtworks(filtered.slice(0, 100)); // Show up to 100 artworks
    } catch (error) {
      console.error('Error loading museum artworks:', error);
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={artworks}
        keyExtractor={(item, index) => `${item?.imageURL || item?.title || 'item'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 8 }}>
              {label || museum}
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              Explore the collection from {label || museum}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
        ListEmptyComponent={loading ? (
          <View>
            {placeholders.map((opacity, i) => (
              <Animated.View
                key={`ph-${i}`}
                style={{ opacity, backgroundColor: theme.colors.surface, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}
              >
                <View style={{ width: '100%', height: 160, backgroundColor: theme.colors.surfaceVariant }} />
                <View style={{ padding: 16 }}>
                  <View style={{ height: 16, backgroundColor: theme.colors.surfaceVariant, borderRadius: 4, width: '50%', marginBottom: 8 }} />
                  <View style={{ height: 12, backgroundColor: theme.colors.surfaceVariant, borderRadius: 4, width: '33%' }} />
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <Text style={{ color: theme.colors.onSurfaceVariant, paddingHorizontal: 16, paddingVertical: 24 }}>
            No artworks found from this museum.
          </Text>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
