import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SvgProps } from "react-native-svg";

import { borderRadius, ButtonsSize, height } from "../../utils/style/buttons";
import { neutral33, neutral44, neutral77 } from "../../utils/style/colors";
import { fontSemibold14 } from "../../utils/style/fonts";
import { BrandText } from "../BrandText";
import { SVG } from "../SVG";
import { TertiaryBox } from "../boxes/TertiaryBox";

export const TertiaryButton: React.FC<{
  size: ButtonsSize;
  text: string;
  width?: number;
  onPress?: () => void;
  squaresBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  iconSVG?: React.FC<SvgProps>;
  disabled?: boolean;
  fullWidth?: boolean;
}> = ({
  // If no width, the buttons will fit the content including paddingHorizontal 20
  width,
  size,
  text,
  onPress,
  squaresBackgroundColor,
  style,
  iconSVG,
  disabled = false,
  fullWidth = false,
}) => {
  return (
    <TertiaryBox
      onPress={onPress}
      borderRadius={borderRadius(size)}
      backgroundColor={neutral33}
      height={height(size)}
      paddingHorizontal={20}
      disabled={disabled}
      style={style}
      squaresBackgroundColor={squaresBackgroundColor}
      width={width}
      fullWidth={fullWidth}
      borderColor={neutral44}
      mainContainerStyle={{ flexDirection: "row" }}
    >
      {iconSVG ? (
        <SVG
          source={iconSVG}
          width={16}
          height={16}
          style={{ marginRight: 8 }}
        />
      ) : null}

      <BrandText
        style={[
          fontSemibold14,
          { color: disabled ? neutral77 : "#FFFFFF", textAlign: "center" },
        ]}
      >
        {text}
      </BrandText>
    </TertiaryBox>
  );
};
