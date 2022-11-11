import React from "react";
import { View } from "react-native";

import searchSVG from "../../../../assets/icons/search.svg";
import { neutral33 } from "../../../utils/style/colors";
import { BrandText } from "../../BrandText/BrandText";
import { SVG } from "../../SVG";
import { Separator } from "../../Separator";
import { TextInputCustom } from "../../inputs/TextInputCustom";

export const FreelanceServicesHeader: React.FC = () => {
  return (
    <View>
      <BrandText style={{ fontSize: 28, alignSelf: "center", marginTop: 50 }}>
        Find the Perfect Freelance Services for your Business
      </BrandText>
      <TextInputCustom<{ Search: string }>
        label=""
        name="Search"
        width={430}
        placeHolder="Search..."
        style={{ alignSelf: "center", marginTop: 30 }}
        mainContainerStyle={{
          backgroundColor: "black",
          borderColor: neutral33,
        }}
      >
        <SVG
          source={searchSVG}
          width={22}
          height={22}
          style={{ marginRight: 12 }}
        />
      </TextInputCustom>
      <Separator style={{ width: 320, alignSelf: "center", marginTop: 50 }} />
    </View>
  );
};
