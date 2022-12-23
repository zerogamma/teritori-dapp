import React from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";

import { gameBgData } from "../../utils/game";
import { useAppNavigation } from "../../utils/navigation";
import { neutral00 } from "../../utils/style/colors";
import { headerHeight } from "../../utils/style/layout";
import { CenterSection } from "./component/CenterSection";
import { GameBgCard } from "./component/GameBgCard";
import { GameBgOverlay } from "./component/GameBgOverlay";
import { RiotGameHeader } from "./component/RiotGameHeader";
import {useGame} from "../../context/GameProvider";

export const RiotGameScreen = () => {
  const navigation = useAppNavigation();
  // const {stopAudio, setEnteredInGame} = useAudioVideoZ()
  const {stopAudio, setEnteredInGame} = useGame()

  // variables
  const { width, height } = useWindowDimensions();
  const cardSize = {
    height: (height - headerHeight) / 5,
    width: width / 10,
  };

  const onPressStart = () => {
    setEnteredInGame(true)
    navigation.navigate("RiotGameEnroll");
  };

  // returns
  return (
    <View style={styles.container}>
      <RiotGameHeader hideMenu />

      <View style={styles.positionRelative}>
        <FlatList
          data={gameBgData}
          numColumns={10}
          extraData={{ width, height }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <GameBgCard
              width={cardSize.width}
              height={cardSize.height}
              hidePlus={index < 10}
              item={item}
            />
          )}
        />
        <CenterSection
          onPress={onPressStart}
          cardWidth={cardSize.width}
          cardHeight={cardSize.height}
        />
        <GameBgOverlay type="top" />
        <GameBgOverlay type="bottom" />
        <GameBgOverlay type="left" />
        <GameBgOverlay type="right" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neutral00,
  },
  positionRelative: {
    flex: 1,
    position: "relative",
  },
});
