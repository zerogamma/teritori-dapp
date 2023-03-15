import { useFonts } from "expo-font";
import { View } from "react-native";

import { Background } from "../components/background/Background";
import { MenuLink } from "../components/menu-link/MenuLink";
import { useContentContext } from "../context/ContentProvider";
import { Login } from "./Login";
import { Main } from "./Main";

export const Content = () => {
  const { selectedSection } = useContentContext();

  const [fontsLoaded] = useFonts({
    "Bebas Neue": require("../assets/font/Bebas_Neue/BebasNeue-Regular.ttf"),
    "Dafter Harder Better Stronger": require("../assets/font/Dafter_Harder_Better_Stronger/Dafter Harder Better Stronger.ttf"),
  });

  const Section = () => {
    if (selectedSection === "login") return <Login />;
    if (selectedSection === "main") return <Main />;
    // if (selectedSection === "raffle") return <Main />;
    // if (selectedSection === "comicgood") return <Main />;
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Background type={selectedSection}>
      <>
        {selectedSection !== "login" && <MenuLink />}
        <View
          style={{
            flexDirection: "column",
            flexWrap: "wrap",
            justifyContent: "center",
            alignContent: "center",
            height: "35em",
          }}
        >
          {Section()}
        </View>
      </>
    </Background>
  );
};
