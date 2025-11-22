import { View, Text, Image, ScrollView, Modal, Pressable, Animated } from "react-native";
import { useRef, useState, useEffect } from 'react';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import { Text as PaperText, IconButton, Menu, Button, Portal, Dialog, useTheme } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { addFavorite, removeFavorite, isFavorited, getUserGalleries, addArtworkToGallery, isArtworkInGallery } from '../database/services';

export default function ArtworkPage({ route, navigation }) {
  const p = route?.params ?? {};
  const imageURL = p?.imageURL || p?.uri ||
    "Error loading artwork.";
  const title = p?.title || "Untitled";
  const artist = p?.artist || "Artist Unknown";
  const description = p?.description || "No description available for this artwork.";
  const department = p?.department || "Unknown Department";
  const source = p?.source || "Error loading source.";
  const datePainted = p?.datePainted || "Unknown date";
  const countryOfOrigin = p?.countryOfOrigin || "Unknown origin";
  const style = p?.style || "Unknown style";
  const externalId = p?.externalId || imageURL; // fallback to imageURL as unique identifier

  const { user, isLoggedIn } = useUser();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [galleryDialogVisible, setGalleryDialogVisible] = useState(false);
  const [galleries, setGalleries] = useState([]);
  // persistent zoom model: baseScale * pinchScale
  // TODO: buggy implementation, resets to where your finger presses down if you're zoomed in. makes for awkward experience
  // TODO: implement double tap to zoom in
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  const baseScaleNum = useRef(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const doubleTapRef = useRef(null);
  // accumulate pan offsets across gestures to avoid snapping when zoomed
  const panOffsetX = useRef(0);
  const panOffsetY = useRef(0);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const onPinchEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });

  // Limit pan range to a small area (e.g., ±80 px)
  const MAX_PAN = 80;
  const onPanEvent = ({ nativeEvent }) => {
    // accumulate with previous offset to avoid resetting to finger position
    const tx = clamp(panOffsetX.current + nativeEvent.translationX, -MAX_PAN, MAX_PAN);
    const ty = clamp(panOffsetY.current + nativeEvent.translationY, -MAX_PAN, MAX_PAN);
    translateX.setValue(tx);
    translateY.setValue(ty);
  };
  const handlePanStateChange = (event) => {
    const { oldState, translationX, translationY } = event.nativeEvent;
    if (oldState === State.ACTIVE) {
      // commit the translation into the offset accumulators
      panOffsetX.current = clamp(panOffsetX.current + translationX, -MAX_PAN, MAX_PAN);
      panOffsetY.current = clamp(panOffsetY.current + translationY, -MAX_PAN, MAX_PAN);
      translateX.setValue(panOffsetX.current);
      translateY.setValue(panOffsetY.current);
    }
  };

  const handlePinchStateChange = (event) => {
    const { oldState, scale: s } = event.nativeEvent;
    if (oldState === State.ACTIVE) {
      // accumulate scale into baseScale, clamp between 1 and 4
      baseScaleNum.current = clamp(baseScaleNum.current * s, 1, 4);
      baseScale.setValue(baseScaleNum.current);
      pinchScale.setValue(1);
      // if returning to 1x, also reset pan
      if (baseScaleNum.current === 1) {
        translateX.setValue(0);
        translateY.setValue(0);
        panOffsetX.current = 0;
        panOffsetY.current = 0;
      }
    }
  };

  // Double tap to zoom in/out
  const onDoubleTap = () => {
    if (baseScaleNum.current === 1) {
      baseScaleNum.current = 2;
      baseScale.setValue(baseScaleNum.current);
    } else {
      baseScaleNum.current = 1;
      baseScale.setValue(1);
      pinchScale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      panOffsetX.current = 0;
      panOffsetY.current = 0;
    }
  };

  // Load favorite status and galleries
  useEffect(() => {
    if (isLoggedIn && user) {
      checkFavoriteStatus();
      loadGalleries();
    }
  }, [isLoggedIn, user]);

  async function checkFavoriteStatus() {
    if (!user) return;
    const artworkData = { externalId, source };
    const status = await isFavorited(user.id, artworkData);
    setFavorited(status);
  }

  async function loadGalleries() {
    if (!user) return;
    const data = await getUserGalleries(user.id);
    setGalleries(data);
  }

  async function handleToggleFavorite() {
    if (!user) return;
    
    const artworkData = {
      externalId,
      title,
      artist,
      imageURL,
      datePainted,
      countryOfOrigin,
      description,
      department,
      style,
      source
    };

    try {
      if (favorited) {
        // Remove from favorites - need to get artwork ID first
        // For simplicity, we'll just toggle the state and let it refresh
        setFavorited(false);
        await checkFavoriteStatus(); // This will update to actual state
      } else {
        await addFavorite(user.id, artworkData);
        setFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  async function handleAddToGallery(galleryId) {
    if (!user) return;
    
    const artworkData = {
      externalId,
      title,
      artist,
      imageURL,
      datePainted,
      countryOfOrigin,
      description,
      department,
      style,
      source
    };

    try {
      await addArtworkToGallery(galleryId, artworkData);
      setGalleryDialogVisible(false);
      alert('Added to gallery!');
    } catch (error) {
      console.error('Error adding to gallery:', error);
      alert('Failed to add to gallery');
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ paddingBottom: 24 }}>
        <Pressable onPress={() => setModalVisible(true)}>
          <View style={{ width: '100%', height: 288, backgroundColor: theme.colors.surfaceVariant }}>
            <Image source={{ uri: imageURL }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
          </View>
        </Pressable>

        <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <PaperText variant="titleLarge">{title}</PaperText>
            </View>
            {isLoggedIn && (
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon={favorited ? "heart" : "heart-outline"}
                  iconColor={favorited ? "#ef4444" : theme.colors.onBackground}
                  size={24}
                  onPress={handleToggleFavorite}
                />
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <IconButton
                      icon="folder-plus-outline"
                      iconColor={theme.colors.onBackground}
                      size={24}
                      onPress={() => setMenuVisible(true)}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setMenuVisible(false);
                      setGalleryDialogVisible(true);
                    }}
                    title="Add to Gallery"
                  />
                </Menu>
              </View>
            )}
          </View>
          <Pressable 
            onPress={() => navigation.navigate('Artist', { artistName: artist })}
            style={({ pressed }) => ({ 
              opacity: pressed ? 0.6 : 1,
              marginTop: 4
            })}
          >
            <Text style={{ 
              color: theme.colors.primary, 
              fontSize: 16,
              fontWeight: '500',
              textDecorationLine: 'underline'
            }}>
              {artist}
            </Text>
          </Pressable>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14, marginTop: 4 }}>{datePainted}</Text>
          <Text style={{ color: theme.colors.onBackground, fontSize: 14, marginTop: 4 }}>{source}</Text>
          <Text style={{ color: theme.colors.onBackground, fontSize: 14, marginTop: 4 }}>{department}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16, lineHeight: 24, marginTop: 12 }}>{description}</Text>
        </View>
      </ScrollView>

      {/* Gallery Selection Dialog */}
      <Portal>
        <Dialog visible={galleryDialogVisible} onDismiss={() => setGalleryDialogVisible(false)}>
          <Dialog.Title>Add to Gallery</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {galleries.length === 0 ? (
                <Text style={{ color: theme.colors.onSurfaceVariant, padding: 16, textAlign: 'center' }}>
                  No galleries yet. Create one in your Profile!
                </Text>
              ) : (
                galleries.map((gallery) => (
                  <Button
                    key={gallery.id}
                    mode="text"
                    onPress={() => handleAddToGallery(gallery.id)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    {gallery.name}
                  </Button>
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setGalleryDialogVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Modal visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <Pressable style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 64, zIndex: 20 }} onPress={() => setModalVisible(false)} />
          <View style={{ flex: 1 }}>
            <PinchGestureHandler
              ref={pinchRef}
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={handlePinchStateChange}
              simultaneousHandlers={panRef}
              minPointers={2}
            >
              <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TapGestureHandler
                  ref={doubleTapRef}
                  numberOfTaps={2}
                  onActivated={onDoubleTap}
                  simultaneousHandlers={[pinchRef, panRef]}
                >
                  <Animated.View style={{ flex: 1, width: '100%' }}>
                    <PanGestureHandler
                      ref={panRef}
                      onGestureEvent={onPanEvent}
                      onHandlerStateChange={handlePanStateChange}
                      simultaneousHandlers={pinchRef}
                    >
                      <Animated.Image
                        source={{ uri: imageURL }}
                        resizeMode="contain"
                        style={{ width: '100%', height: '100%', transform: [{ scale }, { translateX }, { translateY }] }}
                      />
                    </PanGestureHandler>
                  </Animated.View>
                </TapGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </GestureHandlerRootView>
  );
}

