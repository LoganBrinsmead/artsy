import { StatusBar } from "expo-status-bar";
import { View, Text, Image, TouchableOpacity } from "react-native";
import "../global.css";

export default function ArtworkCard(p) {
  const p = props?.route?.params ?? props;
  const imageURL = p?.imageURL || p?.uri || "Error loading artwork.";
  const title = p?.title || "Untitled";
  const datePainted = p?.datePained || "Unknown date.";
  const countryOfOrigin = p?.countryOfOrigin || "Unknown country of origin.";
  const artist = p?.artist || "Artist Unknown";
  const description =
    p?.description || "No description available for this artwork.";
  const department = p?.department || p?.source || "Unknown Department";
  const imageStyle = p?.style || "Unknown style.";

  return (
    <View>
      <TouchableOpacity className="bg-white rounded-xl shadow-md overflow-hidden m-4">
        <Image
          source={{
            uri: { imageURL },
          }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </Text>
          <Text className="text-gray-600 text-sm">{artist}</Text>
        </View>
      </TouchableOpacity>{" "}
    </View>
  );
}
