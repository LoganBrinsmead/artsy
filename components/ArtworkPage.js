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
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const onPinchEvent = Animated.event([{ nativeEvent: { scale: scale } }], {
    useNativeDriver: true,
  });

  const onPanEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const handlePinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 24 }}>
        <Pressable onPress={() => setModalVisible(true)}>
          <View className="w-full h-72 bg-gray-200">
            <Image source={{ uri: imageURL }} resizeMode="cover" className="w-full h-full" />
          </View>
        </Pressable>

        <View className="px-5 py-6">
          <PaperText variant="titleLarge">{title}</PaperText>
          <Text className="text-indigo-700 text-sm font-medium mt-1">{artist}</Text>
          <Text className="text-indigo-700 text-sm font-medium mt-1">{source}</Text>
          <Text className="text-indigo-700 text-sm font-medium mt-1">{department}</Text>
          <Text className="text-gray-700 text-base leading-6 mt-3">{description}</Text>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <GestureHandlerRootView className="flex-1 bg-black">
          <Pressable className="absolute top-0 right-0 left-0 h-16 z-20" onPress={() => setModalVisible(false)} />
          <View className="flex-1">
            <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={handlePinchStateChange}>
              <Animated.View className="flex-1 items-center justify-center">
                <PanGestureHandler onGestureEvent={onPanEvent}>
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

