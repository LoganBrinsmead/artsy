import { View, Text, Image, TouchableOpacity } from "react-native";
import "../global.css";

export default function ArtworkCard(props) {
  const navigation = props?.navigation;
  const p = props?.route?.params ?? props;
  const imageURL = p?.imageURL || p?.uri || "";
  const title = p?.title || "Untitled";
  const datePainted = p?.datePainted || "Unknown date.";
  const countryOfOrigin = p?.countryOfOrigin || "Unknown country of origin.";
  const artist = p?.artist || "Artist Unknown";
  const description = p?.description || "No description available for this artwork.";
  const department = p?.department || "Unknown Department";
  const imageStyle = p?.style || "Unknown style.";
  const source = p?.source || "Unknown source";

  return (
    <View>
      <TouchableOpacity
        className="bg-white rounded-xl shadow-md overflow-hidden m-4"
        onPress={() => navigation?.navigate && navigation.navigate("Artwork", { imageURL, title, datePainted, countryOfOrigin, artist, description, department, source, style: imageStyle })}
      >
        {imageURL ? (
          <Image
            source={{ uri: imageURL }}
            className="w-full h-40"
            resizeMode="cover"
          />
        ) : null}
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-1">{title}</Text>
          <Text className="text-gray-600 text-sm">{artist}</Text>
          <Text className="text-gray-300 text-sm">{source}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
