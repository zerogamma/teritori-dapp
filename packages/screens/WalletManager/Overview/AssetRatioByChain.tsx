import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import { SvgProps } from "react-native-svg";

import busdSVG from "../../../../assets/icons/busd-circle.svg";
import cosmosHubSVG from "../../../../assets/icons/cosmos-hub-circle.svg";
import ethereumSVG from "../../../../assets/icons/ethereum-circle.svg";
import solanaSVG from "../../../../assets/icons/solana-circle.svg";
import terraSVG from "../../../../assets/icons/terra-circle.svg";
import { BrandText } from "../../../components/BrandText";
import { SVG } from "../../../components/SVG";
import { neutral33 } from "../../../utils/style/colors";

interface AssetRatioData {
  icon: React.FC<SvgProps>;
  title: string;
  percent: number;
}

const DATA: AssetRatioData[] = [
  {
    icon: solanaSVG,
    title: "Solana",
    percent: 80,
  },
  {
    icon: cosmosHubSVG,
    title: "Cosmos Hub",
    percent: 20,
  },
  {
    icon: ethereumSVG,
    title: "Ethereum",
    percent: 0,
  },
  {
    icon: terraSVG,
    title: "Terra",
    percent: 0,
  },
  {
    icon: busdSVG,
    title: "BUSD",
    percent: 0,
  },
];

export const ProgressBar: React.FC<Pick<AssetRatioData, "percent">> = ({
  percent,
}) => {
  return (
    <View
      style={{
        height: 4,
        borderRadius: 4,
        backgroundColor: neutral33,
        width: 200,
        position: "relative",
      }}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
        colors={["#5433FF", "#20BDFF", "#A5FECB"]}
        style={{
          width: (percent / 100) * 200,
          height: 4,
          position: "absolute",
          top: 0,
          left: 0,
          borderRadius: 4,
        }}
      />
    </View>
  );
};

const ListItem: React.FC<AssetRatioData> = ({ title, icon, percent }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <SVG width={24} height={24} source={icon} />

      <BrandText
        style={{
          width: 200,
          marginLeft: 8,
          fontSize: 14,
        }}
      >
        {title}
      </BrandText>
      <ProgressBar percent={percent} />
      <BrandText
        style={{
          width: 80,
          textAlign: "right",
          fontSize: 14,
        }}
      >
        {percent}%
      </BrandText>
    </View>
  );
};

export const AssetRatioByChain: React.FC = () => {
  return (
    <View>
      <BrandText
        style={{
          marginBottom: 24,
          fontSize: 20,
        }}
      >
        Asset Ratio by Chain
      </BrandText>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: neutral33,
        }}
      >
        {DATA.map((item) => (
          <ListItem key={item.title} {...item} />
        ))}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 32,
          }}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.5, 1]}
            colors={["#5433FF", "#20BDFF", "#A5FECB"]}
            style={{
              width: 16,
              height: 16,
              borderRadius: 12,
              marginRight: 12,
            }}
          />
          <BrandText
            style={{
              fontSize: 14,
            }}
          >
            Available Balance
          </BrandText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 32,
          }}
        >
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 12,
              backgroundColor: "#5C26F5",
              marginRight: 12,
            }}
          />
          <BrandText
            style={{
              fontSize: 14,
            }}
          >
            Staked Balance
          </BrandText>
        </View>
      </View>
    </View>
  );
};
