import { View, Text, Image, ScrollView, Modal, Pressable, Animated } from "react-native";
import { useRef, useState } from 'react';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Text as PaperText } from 'react-native-paper';

export default function ArtworkPage(props) {
  const p = props?.route?.params ?? props;
  const imageURL = p?.imageURL || p?.uri ||
    "Error loading artwork.";
  const title = p?.title || "Untitled";
  const artist = p?.artist || "Artist Unknown";
  const description = p?.description || "No description available for this artwork.";
  const department = p?.department || "Unknown Department";
  const source = p?.source || "Error loading source.";

  const [modalVisible, setModalVisible] = useState(false);
  // persistent zoom model: baseScale * pinchScale
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  const baseScaleNum = useRef(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const onPinchEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });

  // Limit pan range to a small area (e.g., ±80 px)
  const MAX_PAN = 80;
  const onPanEvent = ({ nativeEvent }) => {
    const tx = clamp(nativeEvent.translationX, -MAX_PAN, MAX_PAN);
    const ty = clamp(nativeEvent.translationY, -MAX_PAN, MAX_PAN);
    translateX.setValue(tx);
    translateY.setValue(ty);
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
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 24 }}>
        <Pressable onPress={() => setModalVisible(true)}>
          <View className="w-full h-72 bg-gray-100">
            <Image source={{ uri: imageURL }} resizeMode="cover" className="w-full h-full" />
          </View>
        </Pressable>

        <View className="px-5 py-6">
          <PaperText variant="titleLarge">{title}</PaperText>
          <Text className="text-black text-sm mt-1">{artist}</Text>
          <Text className="text-black text-sm mt-1">{source}</Text>
          <Text className="text-black text-sm mt-1">{department}</Text>
          <Text className="text-black text-base leading-6 mt-3">{description}</Text>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <GestureHandlerRootView className="flex-1 bg-black">
          <Pressable className="absolute top-0 right-0 left-0 h-16 z-20" onPress={() => setModalVisible(false)} />
          <View className="flex-1">
            <PinchGestureHandler
              ref={pinchRef}
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={handlePinchStateChange}
              simultaneousHandlers={panRef}
              minPointers={2}
            >
              <Animated.View className="flex-1 items-center justify-center">
                <PanGestureHandler
                  ref={panRef}
                  onGestureEvent={onPanEvent}
                  simultaneousHandlers={pinchRef}
                >
                  <Animated.Image
                    source={{ uri: imageURL }}
                    resizeMode="contain"
                    style={{ width: '100%', height: '100%', transform: [{ scale }, { translateX }, { translateY }] }}
                  />
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </GestureHandlerRootView>
  );
}

