import React from "react";
import { StyleSheet } from "react-native";
import styled from "styled-components/native";

import { fontSemibold13 } from "../../utils/style/fonts";
import { genericStyles } from "../../utils/style/genericStyles";
import { BrandText } from "../BrandText";

export type TableRowDataItem = {
  id: string;
  label?: string;
  flex: number;
};

interface TableRowDataProps {
  data: TableRowDataItem[];
  specialRender?: (item: TableRowDataItem) => React.ReactNode;
}

export const TableRowData: React.FC<TableRowDataProps> = ({
  data,
  specialRender,
}) => {
  return (
    <Row>
      {data.map(({ label, flex, id }, index) => (
        <ItemContainer
          key={label}
          flex={flex}
          isLast={data.length - 1 === index}
        >
          {(specialRender && specialRender({ label, flex, id })) || (
            <LabelText>{label}</LabelText>
          )}
        </ItemContainer>
      ))}
    </Row>
  );
};

const Row = styled.View(({ theme: { layout, colors } }) => ({
  ...StyleSheet.flatten(genericStyles.rowWithCenterAndSB),
  width: "100%",
  borderColor: colors.mineShaft,
  borderTopWidth: 1,
  paddingVertical: layout.padding / 2,
  paddingHorizontal: layout.padding * 0.625,
}));

const ItemContainer = styled.View<{ flex: number; isLast: boolean }>(
  ({ theme: { layout }, flex, isLast }) => ({
    flex,
    paddingRight: isLast ? 0 : layout.padding * 0.25,
  })
);

const LabelText = styled(BrandText)(({ theme: { colors, layout } }) => ({
  ...(fontSemibold13 as object),
  color: colors.secondary,
  textTransform: "uppercase",
}));
