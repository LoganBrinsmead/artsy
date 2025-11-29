import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import ArtworkCard from './ArtworkCard';

// Featured artists that rotate daily
const FEATURED_ARTISTS = [
  { name: 'Vincent van Gogh', searchTerm: 'Van Gogh', bio: 'Dutch Post-Impressionist painter known for bold colors and emotional honesty.' },
  { name: 'Claude Monet', searchTerm: 'Monet', bio: 'French Impressionist painter famous for his water lilies and landscape paintings.' },
  { name: 'Pablo Picasso', searchTerm: 'Picasso', bio: 'Spanish painter and sculptor, co-founder of Cubism and one of the most influential artists of the 20th century.' },
  { name: 'Rembrandt van Rijn', searchTerm: 'Rembrandt', bio: 'Dutch Golden Age painter known for his masterful use of light and shadow.' },
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
  const theme = useTheme();

  useEffect(() => {
    loadTodaysShowcase();
  }, []);

  async function getNotificationsModule() {
    try {
      const Notifications = (await import('expo-notifications')).default || (await import('expo-notifications'));
      return Notifications;
    } catch (e) {
      console.warn('expo-notifications not available; skipping notifications');
      return null;
    }
  }

  async function maybeNotifyNewArtist(name) {
    try {
      const last = await AsyncStorage.getItem('showcase:lastArtist');
      if (last !== name) {
        const Notifications = await getNotificationsModule();
        if (Notifications && Notifications.scheduleNotificationAsync) {
          // Ask permission if needed
          try {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
              await Notifications.requestPermissionsAsync();
            }
          } catch {}
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "New Artist Showcase",
              body: `${name} is today's featured artist. Tap to explore their works!`,
            },
            trigger: null,
          });
        }
        await AsyncStorage.setItem('showcase:lastArtist', name);
      }
    } catch (e) {
      // non-fatal
    }
  }

  async function loadTodaysShowcase() {
    try {
      setLoading(true);
      const todaysArtist = getTodaysArtist();
      setArtist(todaysArtist);

      // Search for artworks by this artist
      const results = await api.search(todaysArtist.searchTerm);
      
      // Filter to only include artworks by this exact artist
      const filteredResults = results.filter(artwork => 
        artwork.artist && 
        artwork.artist.toLowerCase() === todaysArtist.name.toLowerCase()
      );
      
      // Remove duplicates by imageURL
      const uniqueResults = [];
      const seen = new Set();
      for (const item of filteredResults) {
        if (item.imageURL && !seen.has(item.imageURL)) {
          seen.add(item.imageURL);
          uniqueResults.push(item);
        }
      }
      
      setArtworks(uniqueResults.slice(0, 12)); // Show up to 12 artworks
      await maybeNotifyNewArtist(todaysArtist.name);
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
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>Loading today's showcase...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={artworks}
        keyExtractor={(item, index) => `${item?.imageURL || item?.title || 'item'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 8 }}>Today's Showcase</Text>
            <Card style={{ backgroundColor: theme.colors.surfaceVariant, marginBottom: 16 }}>
              <Card.Content>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 8 }}>{artist?.name}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, lineHeight: 24 }}>{artist?.bio}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14, marginTop: 12 }}>
                  Featured artist changes daily
                </Text>
              </Card.Content>
            </Card>
            <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.onBackground, marginBottom: 12 }}>Featured Works</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
        ListEmptyComponent={
          <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingVertical: 32 }}>
            No artworks found for today's featured artist.
          </Text>
        }
      />
    </View>
  );
}
