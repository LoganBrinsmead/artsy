import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useUser } from '../context/UserContext';
import { getUserFavorites, removeFavorite } from '../database/services';
import ArtworkCard from './ArtworkCard';
import { IconButton } from 'react-native-paper';
import { useThemeMode } from '../context/ThemeContext';

export default function Favorites({ navigation }) {
  const { user, isLoggedIn } = useUser();
  const { isDark } = useThemeMode();
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
          className={`absolute top-2 right-2 ${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-full shadow-lg`}
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
        >
          <IconButton icon="heart" iconColor="#ef4444" size={20} />
        </Pressable>
      </View>
    );
  };

  if (!isLoggedIn) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'} p-4 justify-center items-center`}>
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}>Not Logged In</Text>
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-center`}>
          Please log in from the Profile tab to save favorites.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'} justify-center items-center`}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListHeaderComponent={
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-4 px-2`}>Favorites</Text>
        }
        ItemSeparatorComponent={() => <View className="h-6" />}
        ListEmptyComponent={
          <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>
            No favorites yet. Start exploring and save artworks you love!
          </Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
