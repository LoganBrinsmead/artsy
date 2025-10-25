import { StatusBar } from "expo-status-bar";
import { View, Text, Image, TouchableOpacity } from "react-native";
import "../global.css";

export default function ArtworkCard(data) {
  let imageURL = data["imageURL"];
  let imageTitle = data["title"];
  let imageDescription = data["description"];
  let imageAuthor = data["author"];
  let imageSource = data["source"];

  return (
    <View>
      <TouchableOpacity className="bg-white rounded-xl shadow-md overflow-hidden m-4">
        {/* placeholder image below for testing */}
        <Image
          source={{
            uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.wikia.nocookie.net%2Fsmiling-friends%2Fimages%2F3%2F33%2FPimTransparrent.png%2Frevision%2Flatest%3Fcb%3D20221016231833&f=1&nofb=1&ipt=048f81f7b86dd929a11edf7103d215722c0d8f31e8b637586a94ec604d38f759",
          }} // dummy image URL
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            Example Card Title
          </Text>
          <Text className="text-gray-600 text-sm">
            This is a short description or subtitle for your card component.
          </Text>
        </View>
      </TouchableOpacity>{" "}
    </View>
  );
}
