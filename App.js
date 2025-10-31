import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import "./global.css";
import ArtworkPage from './components/ArtworkPage';
import React, { useState } from 'react';
import ArtworkCard from './components/ArtworkCard';
import api from './api';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const performSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.search(trimmed);
      setResults(Array.isArray(data) ? data : []);
      
    } catch (e) {
      setError('Failed to fetch results.');
      setResults([]);
    } finally {
      setLoading(false);
    }
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-6 gap-4">
          <Text className="text-3xl font-bold text-gray-900">Search</Text>

          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Search for artworks…"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={performSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              className="bg-indigo-600 rounded-lg px-5 py-3"
              onPress={performSearch}
            >
              <Text className="text-white font-semibold">Search</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text className="text-red-600">{error}</Text>
          ) : null}

          {/* Loading skeletons with staggered fade-in */}
          {loading ? (
            <View className="mt-2">
              {placeholders.map((opacity, i) => (
                <Animated.View
                  key={`ph-${i}`}
                  style={{ opacity }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden m-4"
                >
                  <View className="w-full h-40 bg-gray-200" />
                  <View className="p-4 gap-2">
                    <View className="h-4 bg-gray-200 rounded w-1/2" />
                    <View className="h-3 bg-gray-200 rounded w-1/3" />
                  </View>
                </Animated.View>
              ))}
            </View>
          ) : (
            <View className="mt-2">
              {results?.map((item, idx) => (
                <ArtworkCard key={idx} navigation={navigation} {...item} />
              ))}
              {!results?.length && (
                <Text className="text-gray-500 px-4 py-6">No results yet. Try searching for Monet, Van Gogh, or Sunflowers.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [artObjects, setObjects] = useState([]); 

  // async function getObjectsBySearchTerm(searchTerm) {
  //   await api.search(searchTerm);
  //   if(statusCode === "200") {
  //     setLoading(false);
  //     setObjects()
  //   }
  // }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Search">
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Artwork" component={ArtworkPage} options={{ title: 'Artwork' }} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}
