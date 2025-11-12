import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { TextInput, Button, Card, Dialog, Portal } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { getUserGalleries, createGallery, deleteGallery, updateGallery } from '../database/services';

export default function Profile({ navigation }) {
  const { user, isLoggedIn, login, logout } = useUser();
  const [username, setUsername] = useState('');
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewGalleryDialog, setShowNewGalleryDialog] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState('');
  const [newGalleryDescription, setNewGalleryDescription] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      loadGalleries();
    }
  }, [isLoggedIn, user]);

  async function loadGalleries() {
    if (!user) return;
    
    try {
      const data = await getUserGalleries(user.id);
      setGalleries(data);
    } catch (error) {
      console.error('Error loading galleries:', error);
    }
  }

  async function handleLogin() {
    if (!username.trim()) return;
    
    try {
      setLoading(true);
      await login(username.trim());
      setUsername('');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setGalleries([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  async function handleCreateGallery() {
    if (!newGalleryName.trim()) return;
    
    try {
      await createGallery(user.id, newGalleryName.trim(), newGalleryDescription.trim() || null);
      setNewGalleryName('');
      setNewGalleryDescription('');
      setShowNewGalleryDialog(false);
      await loadGalleries();
    } catch (error) {
      console.error('Error creating gallery:', error);
      alert('Failed to create gallery. Please try again.');
    }
  }

  async function handleDeleteGallery(galleryId) {
    try {
      await deleteGallery(galleryId);
      await loadGalleries();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      alert('Failed to delete gallery. Please try again.');
    }
  }

  if (!isLoggedIn) {
    return (
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-black mb-4">Profile</Text>
        
        <Card className="mb-4 bg-white">
          <Card.Content>
            <Text className="text-lg font-semibold text-black mb-3">Login or Create Account</Text>
            <TextInput
              mode="outlined"
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              className="mb-3"
            />
            <Button 
              mode="contained" 
              onPress={handleLogin}
              loading={loading}
              disabled={loading || !username.trim()}
            >
              Continue
            </Button>
          </Card.Content>
        </Card>

        <Text className="text-gray-600 text-sm">
          Enter a username to get started. If the username exists, you'll be logged in. Otherwise, a new account will be created.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-3xl font-bold text-black mb-4">Profile</Text>
      
      {/* User Info */}
      <Card className="mb-4 bg-white">
        <Card.Content>
          <Text className="text-lg font-semibold text-black mb-2">Account</Text>
          <Text className="text-gray-700 mb-1">Username: {user.username}</Text>
          {user.display_name && (
            <Text className="text-gray-700 mb-1">Display Name: {user.display_name}</Text>
          )}
          {user.email && (
            <Text className="text-gray-700 mb-3">Email: {user.email}</Text>
          )}
          <Button mode="outlined" onPress={handleLogout} className="mt-2">
            Logout
          </Button>
        </Card.Content>
      </Card>

      {/* Galleries Section */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold text-black">My Galleries</Text>
          <Button 
            mode="contained" 
            onPress={() => setShowNewGalleryDialog(true)}
            compact
          >
            New Gallery
          </Button>
        </View>

        {galleries.length === 0 ? (
          <Card className="bg-white">
            <Card.Content>
              <Text className="text-gray-600 text-center">
                No galleries yet. Create one to organize your favorite artworks!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          galleries.map((gallery) => (
            <Card key={gallery.id} className="mb-3 bg-white">
              <Card.Content>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-black">{gallery.name}</Text>
                    {gallery.description && (
                      <Text className="text-gray-600 text-sm mt-1">{gallery.description}</Text>
                    )}
                    <Text className="text-gray-500 text-xs mt-2">
                      {gallery.artwork_count} artwork{gallery.artwork_count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Pressable 
                    onPress={() => handleDeleteGallery(gallery.id)}
                    className="ml-2"
                  >
                    <Text className="text-red-600 text-sm">Delete</Text>
                  </Pressable>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button 
                  onPress={() => navigation?.navigate && navigation.navigate('Gallery', { galleryId: gallery.id })}
                >
                  View Gallery
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </View>

      {/* New Gallery Dialog */}
      <Portal>
        <Dialog visible={showNewGalleryDialog} onDismiss={() => setShowNewGalleryDialog(false)}>
          <Dialog.Title>Create New Gallery</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Gallery Name"
              value={newGalleryName}
              onChangeText={setNewGalleryName}
              className="mb-3"
            />
            <TextInput
              mode="outlined"
              label="Description (optional)"
              value={newGalleryDescription}
              onChangeText={setNewGalleryDescription}
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowNewGalleryDialog(false)}>Cancel</Button>
            <Button onPress={handleCreateGallery} disabled={!newGalleryName.trim()}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
