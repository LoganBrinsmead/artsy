import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, FlatList } from 'react-native';
import { Card } from 'react-native-paper';
import api from '../api';
import ArtworkCard from './ArtworkCard';

// Featured artists that rotate daily
const FEATURED_ARTISTS = [
  { name: 'Vincent van Gogh', searchTerm: 'Van Gogh', bio: 'Dutch Post-Impressionist painter known for bold colors and emotional honesty.' },
  { name: 'Claude Monet', searchTerm: 'Monet', bio: 'French Impressionist painter famous for his water lilies and landscape paintings.' },
  { name: 'Pablo Picasso', searchTerm: 'Picasso', bio: 'Spanish painter and sculptor, co-founder of Cubism and one of the most influential artists of the 20th century.' },
  { name: 'Rembrandt van Rijn', searchTerm: 'Rembrandt', bio: 'Dutch Golden Age painter known for his masterful use of light and shadow.' },
  { name: 'Frida Kahlo', searchTerm: 'Frida Kahlo', bio: 'Mexican painter known for her self-portraits and works inspired by Mexican culture.' },
  { name: 'Georgia O\'Keeffe', searchTerm: 'O\'Keeffe', bio: 'American modernist artist known for her paintings of flowers and Southwest landscapes.' },
  { name: 'Édouard Manet', searchTerm: 'Manet', bio: 'French painter who bridged Realism and Impressionism in 19th century art.' },
  { name: 'Paul Cézanne', searchTerm: 'Cézanne', bio: 'French Post-Impressionist painter whose work laid foundations for Cubism.' },
  { name: 'Wassily Kandinsky', searchTerm: 'Kandinsky', bio: 'Russian painter and art theorist, pioneer of abstract art.' },
];

// Get artist for today based on day of year
function getTodaysArtist() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % FEATURED_ARTISTS.length;
  return FEATURED_ARTISTS[index];
}

export default function Showcase({ navigation }) {
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysShowcase();
  }, []);

  async function loadTodaysShowcase() {
    try {
      setLoading(true);
      const todaysArtist = getTodaysArtist();
      setArtist(todaysArtist);

      // Search for artworks by this artist
      const results = await api.search(todaysArtist.searchTerm);

      for(let result of results) {
        if(result.name !== todaysArtist.name) {
          results.splice(results.indexOf(result), 1);
        }
      }

      setArtworks(results.slice(0, 12)); // Show up to 12 artworks
    } catch (error) {
      console.error('Error loading showcase:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }) => (
    <ArtworkCard navigation={navigation} {...item} />
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-600 mt-4">Loading today's showcase...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={artworks}
        keyExtractor={(item, index) => `${item?.imageURL || item?.title || 'item'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-3xl font-bold text-black mb-2">Today's Showcase</Text>
            <Card className="bg-gray-50 mb-4">
              <Card.Content>
                <Text className="text-2xl font-bold text-black mb-2">{artist?.name}</Text>
                <Text className="text-gray-700 leading-6">{artist?.bio}</Text>
                <Text className="text-gray-500 text-sm mt-3">
                  Featured artist changes daily
                </Text>
              </Card.Content>
            </Card>
            <Text className="text-xl font-semibold text-black mb-3">Featured Works</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-6" />}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center py-8">
            No artworks found for today's featured artist.
          </Text>
        }
      />
    </View>
  );
}
