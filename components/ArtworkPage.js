import { View, Text, Image, ScrollView, Modal, Pressable, Animated } from "react-native";
import { useRef, useState } from 'react';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
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

