import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useUser } from '../context/UserContext';
import { getUserFavorites, removeFavorite } from '../database/services';
import ArtworkCard from './ArtworkCard';
import { IconButton, useTheme } from 'react-native-paper';

export default function Favorites({ navigation }) {
  const { user, isLoggedIn } = useUser();
  const theme = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  async function loadFavorites() {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getUserFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }

  async function handleRemoveFavorite(artworkId) {
    try {
      await removeFavorite(user.id, artworkId);
      setFavorites(prev => prev.filter(item => item.id !== artworkId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  const renderItem = ({ item }) => {
    // Convert database format to component format
    const artworkData = {
      imageURL: item.image_url,
      title: item.title,
      artist: item.artist,
      datePainted: item.date_painted,
      countryOfOrigin: item.country_of_origin,
      description: item.description,
      department: item.department,
      style: item.style,
      source: item.source,
      externalId: item.external_id,
    };

    return (
      <View className="relative">
        <ArtworkCard navigation={navigation} {...artworkData} />
        <Pressable
          onPress={() => handleRemoveFavorite(item.id)}
          style={{ position: 'absolute', top: 8, right: 8, width: 40, height: 40, backgroundColor: theme.colors.surface, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}
        >
          <IconButton icon="heart" iconColor="#ef4444" size={20} />
        </Pressable>
      </View>
    );
  };

  if (!isLoggedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 8 }}>Not Logged In</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          Please log in from the Profile tab to save favorites.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 16, paddingHorizontal: 8 }}>Favorites</Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
        ListEmptyComponent={
          <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingVertical: 32 }}>
            No favorites yet. Start exploring and save artworks you love!
          </Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
