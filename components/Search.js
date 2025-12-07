import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, Easing, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, useTheme } from 'react-native-paper';
import ArtworkCard from './ArtworkCard';
import api from '../api';

export default function Search({ navigation }) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]); // Store all fetched results
  const [displayedCount, setDisplayedCount] = useState(20); // Number of items to display
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [error, setError] = useState('');
  const placeholderCount = 6;
  const [placeholders] = useState(
    Array.from({ length: placeholderCount }, () => new Animated.Value(0))
  );
  const [version, setVersion] = useState(0);

  const renderItem = useCallback(({ item }) => (
    <ArtworkCard navigation={navigation} {...item} />
  ), [navigation]);

  const keyExtractor = useCallback((item, index) => `${item?.imageURL || item?.title || 'item'}-${index}`,[ ]);

  const performSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setDisplayedCount(20); // Reset to initial count
    try {
      const data = await api.search(trimmed);
      const arr = Array.isArray(data) ? data : [];
      setAllResults(arr);
      setVersion(v => v + 1);
    } catch (e) {
      setError('Failed to fetch results.');
      setAllResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchRef = useRef(null);
  const onPressSearch = () => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => performSearch(), 200);
  };

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

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.clearCaches();
      await performSearch();
    } catch (error) {
      console.error('Refresh error:', error);
      setError('Failed to refresh. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMoreContent) return;
    
    setLoadingMore(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      setDisplayedCount(prev => prev + 20);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMoreContent]);

  // Update displayed results when displayedCount or allResults change
  useEffect(() => {
    setResults(allResults.slice(0, displayedCount));
    setHasMoreContent(displayedCount < allResults.length);
  }, [displayedCount, allResults]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={loading ? [] : results}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16, paddingTop: 8 }}
          ListHeaderComponent={(
            <View style={{ paddingHorizontal: 8, paddingBottom: 12 }}>
              <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 12 }}>Search</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    mode="outlined"
                    placeholder="Search for artworks…"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={performSearch}
                    returnKeyType="search"
                  />
                </View>
                <View style={{ width: 12 }} />
                <Button mode="contained" onPress={onPressSearch}>
                  Search
                </Button>
              </View>
              {error ? (
                <Text style={{ color: theme.colors.error, marginTop: 8 }}>{error}</Text>
              ) : null}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? null : loadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : !hasMoreContent && results.length > 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={{ 
                  color: theme.colors.onSurfaceVariant, 
                  fontSize: 14,
                  fontStyle: 'italic'
                }}>
                  You've seen the entire collection for this category
                </Text>
              </View>
            ) : null
          }
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
            <Text style={{ color: theme.colors.onSurfaceVariant, paddingHorizontal: 16, paddingVertical: 24 }}>No results yet. Try searching for Monet, Van Gogh, or Sunflowers.</Text>
          )}
          extraData={version}
        />
      </View>
    </SafeAreaView>
  );
}
