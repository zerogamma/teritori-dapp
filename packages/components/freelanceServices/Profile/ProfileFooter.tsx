import React from "react";
import {View} from "react-native";
import {neutral33} from "../../../utils/style/colors";
import {PrimaryButton} from "../../buttons/PrimaryButton";

export const ProfileFooter: React.FC = () => {
  return (
    <View style={{flexDirection:"column"}}>
      <View
        style={{
          height: 1,
          backgroundColor: neutral33,
          marginTop: 24,
          marginBottom: 5
        }}
      />
      <View style={{marginTop: 10, alignItems: "flex-end"}}>
        <PrimaryButton style={{marginRight: 20}} size={"SM"} text={"Continue"} onPress={()=>{}} />
      </View>
    </View>
  )
}
