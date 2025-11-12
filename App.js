import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Animated, Easing, FlatList, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArtworkPage from './components/ArtworkPage';
import React, { useState } from 'react';
import ArtworkCard from './components/ArtworkCard';
import api from './api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, TextInput, Button, MD3LightTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Showcase from './components/Showcase';
import Discover from './components/Discover';
import Favorites from './components/Favorites';
import Profile from './components/Profile';
import GalleryView from './components/GalleryView';
import { UserProvider } from './context/UserContext';
import "./global.css";

const Stack = createNativeStackNavigator();

function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const placeholderCount = 6;
  const [placeholders] = useState(
    Array.from({ length: placeholderCount }, () => new Animated.Value(0))
  );
  const [version, setVersion] = useState(0); // bump to force FlatList refresh when order changes

  const renderItem = React.useCallback(({ item, index }) => (
    <ArtworkCard navigation={navigation} {...item} />
  ), [navigation]);

  const keyExtractor = React.useCallback((item, index) => `${item?.imageURL || item?.title || 'item'}-${index}`,[ ]);


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

  // Debounce manual search if user taps quickly
  const searchRef = React.useRef(null);
  const onPressSearch = () => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => performSearch(), 200);
  };

  // Staggered fade-in for loading skeletons
  React.useEffect(() => {
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
    <SafeAreaView className="flex-1 bg-white">
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
              <Text className="text-3xl font-bold text-black mb-3">Search</Text>
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
                <Text className="text-red-600 mt-2">{error}</Text>
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
                  className="bg-white rounded-xl shadow-sm overflow-hidden mb-4"
                >
                  <View className="w-full h-40 bg-gray-200" />
                  <View className="p-4">
                    <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <View className="h-3 bg-gray-200 rounded w-1/3" />
                  </View>
                </Animated.View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 px-4 py-6">No results yet. Try searching for Monet, Van Gogh, or Sunflowers.</Text>
          )}
          extraData={version}
        />
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({ navigation }) {
  const [tab, setTab] = useState('Showcase');

  const renderTab = () => {
    switch (tab) {
      case 'Showcase':
        return <Showcase navigation={navigation} />;
      case 'Search':
        return <SearchScreen navigation={navigation} />;
      case 'Discover':
        return <Discover navigation={navigation} />;
      case 'Favorites':
        return <Favorites navigation={navigation} />;
      case 'Profile':
        return <Profile navigation={navigation} />;
      default:
        return <Showcase navigation={navigation} />;
    }
  };

  const TabButton = ({ label }) => (
    <Pressable onPress={() => setTab(label)} style={{ flex: 1, paddingVertical: 10 }}>
      <Text className={`text-center ${tab === label ? 'text-black font-bold' : 'text-gray-500'}`}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {renderTab()}
      </View>
      <View className="border-t border-gray-200 bg-white">
        <View className="flex-row">
          <TabButton label="Showcase" />
          <TabButton label="Search" />
          <TabButton label="Discover" />
          <TabButton label="Favorites" />
          <TabButton label="Profile" />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [artObjects, setObjects] = useState([]); 

  const theme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#000000',
      secondary: '#000000',
      surface: '#ffffff',
      background: '#ffffff',
      onSurface: '#000000',
      onBackground: '#000000',
    },
  };

  return (
    <UserProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Artwork" component={ArtworkPage} options={{ title: 'Artwork' }} />
              <Stack.Screen name="Gallery" component={GalleryView} options={{ title: 'Gallery' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </PaperProvider>
    </UserProvider>
  );
}
