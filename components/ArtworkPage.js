import { View, Text, Image, ScrollView } from "react-native";
import "../global.css";

export default function ArtworkPage(props) {
  const p = props?.route?.params ?? props;
  const imageURL = p?.imageURL || p?.uri ||
    "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=1200&q=80&auto=format&fit=crop";
  const title = p?.title || "Untitled";
  const description = p?.description || "No description available for this artwork.";
  const department = p?.department || p?.source || "Unknown Department";

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="w-full h-72 bg-gray-200">
        <Image
          source={{ uri: imageURL }}
          resizeMode="cover"
          className="w-full h-full"
        />
      </View>

      <View className="px-5 py-6 gap-3">
        <Text className="text-2xl font-bold text-gray-900">{title}</Text>
        <Text className="text-sm font-medium text-indigo-600">{department}</Text>
        <Text className="text-base leading-6 text-gray-700">{description}</Text>
      </View>
    </ScrollView>
  );
}

