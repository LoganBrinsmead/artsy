import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import "./global.css";
import ArtworkPage from './components/ArtworkPage';
import { useState } from 'react';
import ArtworkCard from './components/ArtworkCard';
import api from './api';

const Stack = createNativeStackNavigator();

function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-10 gap-4">
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

        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : null}

        {error ? (
          <Text className="text-red-600">{error}</Text>
        ) : null}

        <View className="mt-2">
          {results?.map((item, idx) => (
            <ArtworkCard key={idx} navigation={navigation} {...item} />
          ))}
        </View>
      </View>
    </ScrollView>
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
    <View>
      <Text>Test</Text>
      
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Artwork" component={ArtworkPage} options={{ title: 'Artwork' }} />
      </Stack.Navigator>
    </NavigationContainer>
    </View>

  );
}
