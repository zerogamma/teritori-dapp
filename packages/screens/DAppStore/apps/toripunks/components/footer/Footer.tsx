import { useCallback } from "react";
import { TouchableOpacity, View, Image, Linking } from "react-native";

const url = "https://www.aaa-metahuahua.com/";

export const Footer = ({
  isMinimunWindowWidth = true,
}: {
  isMinimunWindowWidth?: boolean;
}) => {
  const onPress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        style={{
          margin: "auto",
          marginTop: 50,
          backgroundColor: "#212708",
          marginBottom: isMinimunWindowWidth ? 25 : 20,
        }}
      >
        <Image
          source={require("../../assets/LOGO_REMIX.png")}
          fadeDuration={0}
          style={{
            width: 50,
            height: 50,
            tintColor: "#2AF191",
          }}
        />
      </TouchableOpacity>
    </View>
  );
};
