import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

import { ButtonLabel } from "../components/buttonLabel/ButtonLabel";
import { Label } from "../components/label/Label";
import { useContentContext } from "../context/ContentProvider";

interface HistoryItem {
  round: number;
  text: string;
}
const datumWidth = 720;
const roundWidth = 52;
const data: HistoryItem[] = [
  {
    round: 1,
    text: "150 000 $TORI WON",
  },
  {
    round: 2,
    text: "150 000 $TORI WON",
  },
  {
    round: 3,
    text: "150 000 $TORI WON",
  },
  {
    round: 4,
    text: "150 000 $TORI WON",
  },
];

const HeaderItem = ({ text }: { text: string }) => (
  <View
    style={{
      justifyContent: "center",
      width: text === "" ? roundWidth : datumWidth,
    }}
  >
    <Label
      styleType="T2_Bebas_20"
      style={{
        justifyContent: "center",
        textAlign: "center",
        color: "#E8E1EF",
      }}
    >
      {text}
    </Label>
  </View>
);

const RoundNumber: React.FC<{ round: number }> = ({ round }) => (
  <View
    style={{
      justifyContent: "center",
    }}
  >
    <Label
      styleType="T2_Bebas_20"
      style={{
        color: "#E8E1EF",
        transform: [{ rotate: "-90deg" }],
      }}
    >
      Round {round}
    </Label>
  </View>
);

const Datum: React.FC<{ value: string }> = ({ value }) => (
  <View
    style={{
      backgroundColor: "#28f191",
      padding: 30,
      width: datumWidth,
    }}
  >
    <Label
      styleType="H1_Bebas_80"
      style={{ textAlign: "center", color: "#E8E1EF" }}
    >
      {value}
    </Label>
  </View>
);

const ListItem: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const header = ["", " "]; // yes " " hack :(
  return (
    <View
      style={{
        alignItems: "center",
        width: "100%",
      }}
    >
      <FlatList
        contentContainerStyle={{
          width: "100%",
        }}
        data={header}
        numColumns={2}
        renderItem={({ item }) => <HeaderItem text={item} />}
      />

      <View
        style={{
          flexDirection: "row",
          flexWrap: "nowrap",
          width: "100%",
        }}
      >
        <RoundNumber round={item.round} />

        <Datum value={item.text} />
      </View>
    </View>
  );
};

export const LotteryHistory = () => {
  const { setSelectedSectionHandler } = useContentContext();
  return (
    <View
      style={{
        flexWrap: "nowrap",
        alignItems: "center",
        marginBottom: "3em",
        marginTop: 90,
      }}
    >
      <View
        style={{
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
        }}
      >
        <Label
          styleType="H2_DHBS_80"
          style={{
            textAlign: "center",
            color: "#FFD753",
            transform: [{ rotate: "-90deg" }],
            position: "absolute",
            left: -500,
            width: "max-content",
          }}
        >
          gigantic lottery
        </Label>
        <FlatList
          contentContainerStyle={{
            alignItems: "center",
            marginBottom: "7em",
          }}
          data={data}
          renderItem={({ item }) => <ListItem item={item} />}
        />
      </View>
      <TouchableOpacity onPress={() => setSelectedSectionHandler("lottery")}>
        <ButtonLabel text="BACK" size="S" actionable />
      </TouchableOpacity>
    </View>
  );
};
