import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, Easing, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import ArtworkCard from './ArtworkCard';
import api from '../api';
import { useThemeMode } from '../context/ThemeContext';

export default function Search({ navigation }) {
  const { isDark } = useThemeMode();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
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
    try {
      const data = await api.search(trimmed);
      const arr = Array.isArray(data) ? data : [];
      setResults(arr);
      setVersion(v => v + 1);
    } catch (e) {
      setError('Failed to fetch results.');
      setResults([]);
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

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className="flex-1">
        <FlatList
          data={loading ? [] : results}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16, paddingTop: 8 }}
          ListHeaderComponent={(
            <View className="px-2 pb-3">
              <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-3`}>Search</Text>
              <View className="flex-row items-center">
                <View className="flex-1">
                  <TextInput
                    mode="outlined"
                    placeholder="Search for artworks…"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={performSearch}
                    returnKeyType="search"
                  />
                </View>
                <View className="w-3" />
                <Button mode="contained" onPress={onPressSearch}>
                  Search
                </Button>
              </View>
              {error ? (
                <Text className="text-red-400 mt-2">{error}</Text>
              ) : null}
            </View>
          )}
          ItemSeparatorComponent={() => <View className="h-6" />}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews
          ListEmptyComponent={loading ? (
            <View>
              {placeholders.map((opacity, i) => (
                <Animated.View
                  key={`ph-${i}`}
                  style={{ opacity }}
                  className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-xl shadow-sm overflow-hidden mb-4`}
                >
                  <View className={`w-full h-40 ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
                  <View className="p-4">
                    <View className={`${isDark ? 'bg-neutral-800' : 'bg-gray-200'} h-4 rounded w-1/2 mb-2`} />
                    <View className={`${isDark ? 'bg-neutral-800' : 'bg-gray-200'} h-3 rounded w-1/3`} />
                  </View>
                </Animated.View>
              ))}
            </View>
          ) : (
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} px-4 py-6`}>No results yet. Try searching for Monet, Van Gogh, or Sunflowers.</Text>
          )}
          extraData={version}
        />
      </View>
    </SafeAreaView>
  );
}
