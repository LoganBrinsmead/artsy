import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { TextInput, Button, Card, Dialog, Portal, Switch, useTheme } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { useAppTheme } from '../context/ThemeContext';
import { getUserGalleries, createGallery, deleteGallery, updateGallery } from '../database/services';

export default function Profile({ navigation }) {
  const { user, isLoggedIn, login, logout } = useUser();
  const { toggle } = useAppTheme();
  const theme = useTheme();
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
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 16 }}>Profile</Text>
        
        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.onSurface, marginBottom: 12 }}>Login or Create Account</Text>
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

        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
          Enter a username to get started. If the username exists, you'll be logged in. Otherwise, a new account will be created.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', color: theme.colors.onBackground, marginBottom: 16 }}>Profile</Text>

      {/* User Info */}
      <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
        <Card.Content>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.onSurface, marginBottom: 8 }}>Account</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>Username: {user.username}</Text>
          {user.display_name && (
            <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>Display Name: {user.display_name}</Text>
          )}
          {user.email && (
            <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>Email: {user.email}</Text>
          )}
          <Button mode="outlined" onPress={handleLogout} className="mt-2">
            Logout
          </Button>
        </Card.Content>
      </Card>

      {/* Theme Toggle */}
      <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.onSurface }}>Dark Mode</Text>
            <Switch value={theme.dark} onValueChange={toggle} />
          </View>
        </Card.Content>
      </Card>

      {/* Galleries Section */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.onBackground }}>My Galleries</Text>
          <Button 
            mode="contained" 
            onPress={() => setShowNewGalleryDialog(true)}
            compact
          >
            New Gallery
          </Button>
        </View>

        {galleries.length === 0 ? (
          <Card style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content>
              <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                No galleries yet. Create one to organize your favorite artworks!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          galleries.map((gallery) => (
            <Card key={gallery.id} style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.onSurface }}>{gallery.name}</Text>
                    {gallery.description && (
                      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14, marginTop: 4 }}>{gallery.description}</Text>
                    )}
                    <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 8 }}>
                      {gallery.artwork_count} artwork{gallery.artwork_count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Pressable 
                    onPress={() => handleDeleteGallery(gallery.id)}
                    style={{ marginLeft: 8 }}
                  >
                    <Text style={{ color: theme.colors.error, fontSize: 14 }}>Delete</Text>
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
