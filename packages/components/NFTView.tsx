import React from "react";
import { ViewStyle, Image, View, StyleProp } from "react-native";

import certifiedSVG from "../../assets/icons/certified.svg";
import outlineStarSVG from "../../assets/icons/outline-star.svg";
import { neutral33, neutral77 } from "../utils/style/colors";
import { NFTData } from "../utils/types/nft";
import { BrandText } from "./BrandText";
import { NetworkIcon } from "./NetworkIcon";
import { SVG } from "./SVG";
import { TertiaryBox } from "./boxes/TertiaryBox";
import { SecondaryButton } from "./buttons/SecondaryButton";

export const NFTView: React.FC<{
  data: NFTData;
  style?: StyleProp<ViewStyle>;
}> = React.memo(({ data, style }) => {
  const collectionFontSize = 12;
  const favoriteCountFontSize = 12;
  const floorPriceLabelFontSize = 12;
  const contentWidth = 236;

  return (
    <TertiaryBox paddingVertical={16} width={268} style={style}>
      <Image
        source={{ uri: data.imageURI }}
        style={{
          width: contentWidth,
          height: 236,
          alignSelf: "center",
          borderRadius: 12,
        }}
      />

      <View style={{ marginHorizontal: 16, width: contentWidth }}>
        <BrandText
          style={{ marginTop: 16, fontSize: 14 }}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {data.name}
        </BrandText>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}
        >
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              alignItems: "center",
            }}
          >
            <NetworkIcon network={data.network} circle size={24} />
            <BrandText
              style={{
                fontSize: collectionFontSize,
                letterSpacing: -(collectionFontSize * 0.04),
                marginHorizontal: 4,
              }}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {data.collectionName}
            </BrandText>
            {data.isCertified && <SVG source={certifiedSVG} />}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 16,
            }}
          >
            <BrandText
              style={{
                fontSize: favoriteCountFontSize,
                letterSpacing: -(favoriteCountFontSize * 0.04),
                color: neutral77,
              }}
            >
              {data.favoritesCount}
            </BrandText>
            <SVG width={24} height={24} source={outlineStarSVG} />
          </View>
        </View>
      </View>
      <View
        style={{
          borderBottomColor: neutral33,
          borderBottomWidth: 1,
          marginBottom: 14,
          marginTop: 12,
          width: "100%",
          height: 1,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: contentWidth,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <NetworkIcon network={data.network} circle size={24} />
          <BrandText
            style={{
              marginLeft: 6,
              fontSize: floorPriceLabelFontSize,
              letterSpacing: -(floorPriceLabelFontSize * 0.04),
              color: neutral77,
            }}
          >
            {data.floorPrice ? "Floor Price" : "Not Listed"}
          </BrandText>
        </View>
        {!!data.floorPrice &&<SecondaryButton size="XS" text={data.floorPrice} />}
      </View>
    </TertiaryBox>
  );
});
