import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import penSVG from "../../../assets/icons/manage.svg";
import { BrandText } from "../../components/BrandText";
import { SVG } from "../../components/SVG";
import { TertiaryBox } from "../../components/boxes/TertiaryBox";
import { PrimaryButton } from "../../components/buttons/PrimaryButton";
import { neutral17, neutral22, neutralA3 } from "../../utils/style/colors";

interface WalletHeaderProps {
  title: string;
  data: string;
  actionButton?: {
    label: string;
    onPress: () => void;
  };
}

const WalletHeaderCard: React.FC<WalletHeaderProps> = ({
  title,
  data,
  actionButton,
}) => {
  return (
    <TertiaryBox
      height={116}
      width={200}
      mainContainerStyle={{
        backgroundColor: neutral17,
      }}
      style={{
        marginLeft: 16,
      }}
    >
      <View
        style={{
          paddingVertical: 14,
          paddingHorizontal: 12,
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          width: "100%",
          height: 116,
          position: "relative",
        }}
      >
        <BrandText
          style={{
            fontSize: 12,
          }}
        >
          {title}
        </BrandText>
        <BrandText
          style={{
            fontSize: 16,
          }}
        >
          {data}
        </BrandText>
        {!!actionButton && (
          <PrimaryButton
            size="XS"
            text={actionButton.label}
            onPress={actionButton.onPress}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
          />
        )}
      </View>
    </TertiaryBox>
  );
};

export const WalletHeader: React.FC = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: neutral22,
            height: 40,
            width: 40,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          <SVG width={24} height={24} source={penSVG} />
        </TouchableOpacity>
        <View>
          <BrandText
            style={{
              color: neutralA3,
              fontSize: 14,
            }}
          >
            Hello
          </BrandText>
          <BrandText
            style={{
              fontSize: 20,
            }}
          >
            Loream ipsum
          </BrandText>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <WalletHeaderCard
          {...{
            title: "Total Balance",
            data: "$500.00",
          }}
        />
        <WalletHeaderCard
          {...{
            title: "Total Claimable Rewards",
            data: "$2.00",
            actionButton: {
              label: "Claim All",
              onPress: () => {},
            },
          }}
        />
      </View>
    </View>
  );
};
