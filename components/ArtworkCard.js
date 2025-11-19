import React from 'react';
import { View, Text, Image } from "react-native";
import { Card, useTheme } from 'react-native-paper';

function ArtworkCard(props) {
  const theme = useTheme();
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
  const externalId = p?.externalId || imageURL; // fallback to imageURL as unique identifier

  return (
    <View>
      <Card style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: theme.colors.surface }} onPress={() => navigation?.navigate && navigation.navigate("Artwork", { imageURL, title, datePainted, countryOfOrigin, artist, description, department, source, style: imageStyle, externalId })}>
        {imageURL ? (
          <Image source={{ uri: imageURL }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
        ) : null}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.dark ? '#ffffff' : theme.colors.onBackground, marginBottom: 4 }}>{title}</Text>
          <Text style={{ color: theme.dark ? '#ffffff' : theme.colors.onBackground, opacity: theme.dark ? 0.9 : 0.7, fontSize: 14 }}>{artist}</Text>
          <Text style={{ color: theme.dark ? '#ffffff' : theme.colors.onBackground, opacity: theme.dark ? 0.7 : 0.4, fontSize: 12, marginTop: 2 }}>{source}</Text>
        </View>
      </Card>
    </View>
  );
}

export default React.memo(ArtworkCard);
