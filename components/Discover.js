import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Animated, Easing, Pressable, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import api from '../api';
import ArtworkCard from './ArtworkCard';

// Curated discovery themes
const DISCOVERY_THEMES = [
  { label: 'Impressionism', artistsSpecified: true, value: 'impressionism', type: 'theme', artists: ['Vincent Van Gogh', 'Claude Monet', 'Edgar Degas', 'Camille Pissarro'] },
  { label: 'Renaissance', artistsSpecified: false, value: 'renaissance', type: 'theme', artists: ['renaissance'] },
  { label: 'Modern Art', artistsSpecified: false, value: 'modern', type: 'theme', artists: ['modern'] },
  { label: 'Portraits', artistsSpecified: false, value: 'portraits', type: 'theme', artists: ['portraits'] },
  { label: 'Landscapes', artistsSpecified: false, value: 'landscapes', type: 'theme', artists: ['landscapes'] },
  { label: 'Abstract', artistsSpecified: true, value: 'abstract', type: 'theme', artists: ['Helen Frankenthaler', 'Mark Rothko', 'Jasper Johns', 'Cy Twombly'] },
  { label: 'Surrealism', artistsSpecified: true, value: 'surrealism', type: 'theme', artists: ['Salvador Dali', 'René Magritte', 'Max Ernst'] },
];

// Museums
const MUSEUMS = [
  { label: 'The Met', value: 'The Metropolitan Museum of Art', type: 'museum' },
  { label: 'Art Institute of Chicago', value: 'Art Institute of Chicago', type: 'museum' },
  { label: 'Harvard Art Museums', value: 'Harvard Art Museums', type: 'museum' },
];

// Featured Artists
const FEATURED_ARTISTS = [
  { label: 'Vincent Van Gogh', value: 'Vincent Van Gogh', type: 'artist' },
  { label: 'Claude Monet', value: 'Claude Monet', type: 'artist' },
  { label: 'Pablo Picasso', value: 'Pablo Picasso', type: 'artist' },
  { label: 'Rembrandt', value: 'Rembrandt', type: 'artist' },
  { label: 'Leonardo da Vinci', value: 'Leonardo da Vinci', type: 'artist' },
  { label: 'Salvador Dali', value: 'Salvador Dali', type: 'artist' },
  { label: 'Frida Kahlo', value: 'Frida Kahlo', type: 'artist' },
  { label: 'Andy Warhol', value: 'Andy Warhol', type: 'artist' },
];

// Random search terms for museum fallback
const MUSEUM_FALLBACK_SEARCHES = [
  'portrait', 'landscape', 'sculpture', 'painting', 'modern', 'ancient',
  'renaissance', 'impressionism', 'abstract', 'contemporary', 'classical',
  'baroque', 'romantic', 'realism', 'expressionism', 'cubism'
];

export default function Discover({ navigation }) {
  const theme = useTheme();
  
  // Select random theme on mount
  const [selectedFilter, setSelectedFilter] = useState(() => {
    const randomIndex = Math.floor(Math.random() * DISCOVERY_THEMES.length);
    return DISCOVERY_THEMES[randomIndex];
  });
  
  const [artworks, setArtworks] = useState([]);
  const [allResults, setAllResults] = useState([]); // Store all fetched results
  const [displayedCount, setDisplayedCount] = useState(20); // Number of items to display
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreContent, setHasMoreContent] = useState(true);
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
    loadArtworks();
  }, [selectedFilter]);

  // Update displayed artworks when displayedCount or allResults change
  useEffect(() => {
    setArtworks(allResults.slice(0, displayedCount));
    setHasMoreContent(displayedCount < allResults.length);
  }, [displayedCount, allResults]);

  const loadArtworks = useCallback(async () => {
    try {
      setLoading(true);
      setDisplayedCount(20); // Reset to initial count
      let results;

      if (selectedFilter.type === 'theme') {
        const themeConfig = DISCOVERY_THEMES.find(t => t.value === selectedFilter.value);
        if (themeConfig.artistsSpecified) {
          results = await Promise.all(themeConfig.artists.map(artist => api.search(artist)));
          results = results.flat();
          results = results.filter(r => themeConfig.artists.includes(r.artist));
        } else {
          results = await api.search(themeConfig.value);
        }
      } else if (selectedFilter.type === 'museum') {
        // First try to get cached results
        results = await api.search(selectedFilter.label);
        results = results.filter(r => r.source === selectedFilter.value);
        
        // If no cached results, perform random searches and mix them
        if (results.length === 0) {
          const randomSearches = [];
          const numSearches = 3 + Math.floor(Math.random() * 3); // 3-5 random searches
          
          // Shuffle and pick random search terms
          const shuffled = [...MUSEUM_FALLBACK_SEARCHES].sort(() => Math.random() - 0.5);
          const selectedTerms = shuffled.slice(0, numSearches);
          
          // Also add some random artists
          const randomArtists = [...FEATURED_ARTISTS].sort(() => Math.random() - 0.5).slice(0, 2);
          selectedTerms.push(...randomArtists.map(a => a.value));
          
          // Perform all searches in parallel
          const searchResults = await Promise.all(
            selectedTerms.map(term => api.search(term).catch(() => []))
          );
          
          // Flatten and filter by museum
          results = searchResults.flat().filter(r => r.source === selectedFilter.value);
          
          // Mix results from different search terms
          results.sort(() => Math.random() - 0.5);
        }
      } else if (selectedFilter.type === 'artist') {
        results = await api.search(selectedFilter.value);
        results = results.filter(r => r.artist && r.artist.includes(selectedFilter.value));
      }

      results.sort(() => Math.random() - 0.5); // randomize results
      setAllResults(results);
    } catch (error) {
      console.error('Error loading discover artworks:', error);
      setAllResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadArtworks();
    setRefreshing(false);
  }, [loadArtworks]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMoreContent) return;
    
    setLoadingMore(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      setDisplayedCount(prev => prev + 20);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMoreContent]);

  const renderItem = useCallback(({ item }) => (
    <ArtworkCard navigation={navigation} {...item} />
  ), [navigation]);

  const keyExtractor = useCallback((item, index) => 
    `${item?.imageURL || item?.title || 'item'}-${index}`, []
  );

  const renderFilterButton = useCallback((filter) => (
    <Pressable
      key={filter.value}
      onPress={() => {
        if (selectedFilter.value !== filter.value) {
          setSelectedFilter(filter);
        }
      }}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: selectedFilter.value === filter.value 
          ? theme.colors.primary 
          : theme.colors.surfaceVariant,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: selectedFilter.value === filter.value 
            ? theme.colors.onPrimary 
            : theme.colors.onSurfaceVariant,
        }}
      >
        {filter.label}
      </Text>
    </Pressable>
  ), [selectedFilter, theme]);

  const ListHeaderComponent = useMemo(() => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 8 }}>
        Discover
      </Text>
      <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
        Explore curated collections by theme, museum, and artist
      </Text>

      {/* Themes Carousel */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.onBackground, marginBottom: 12 }}>
          Themes
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DISCOVERY_THEMES.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Museums Carousel */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.onBackground, marginBottom: 12 }}>
          Museums
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MUSEUMS.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Artists Carousel */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.onBackground, marginBottom: 12 }}>
          Artists
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FEATURED_ARTISTS.map(renderFilterButton)}
        </ScrollView>
      </View>

      <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.onBackground, marginTop: 8, marginBottom: 12 }}>
        {selectedFilter.label}
      </Text>
    </View>
  ), [theme, selectedFilter, renderFilterButton]);

  const ListEmptyComponent = useMemo(() => loading ? (
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
    <Text style={{ color: theme.colors.onSurfaceVariant, paddingVertical: 24 }}>
      No artworks found. Try refreshing.
    </Text>
  ), [loading, placeholders, theme]);

  const ItemSeparatorComponent = useCallback(() => <View style={{ height: 24 }} />, []);

  const ListFooterComponent = useMemo(() => {
    if (loading) return null; // Don't show footer while initial loading
    
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    
    if (!hasMoreContent && artworks.length > 0) {
      return (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <Text style={{ 
            color: theme.colors.onSurfaceVariant, 
            fontSize: 14,
            fontStyle: 'italic'
          }}>
            You've seen the entire collection for this category
          </Text>
        </View>
      );
    }
    
    return null;
  }, [loading, loadingMore, hasMoreContent, artworks.length, theme]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={artworks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={6}
        windowSize={5}
      />
    </View>
  );
}
