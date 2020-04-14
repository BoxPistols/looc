/** @jsx jsx */

import React from "react";
import Div from "./components/comp";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";

const Card = styled.div`
  color: blue;
`;

interface IDCardProps {
  firstName: number;
  secondName: number;
  age: number;
  picShape: "squared" | "round";
}

const IDCard: React.FC<IDCardProps & { __LOOC_DEBUG__: boolean }> = ({
  /*   firstName = "",
  secondName = "",
  age = 0,
  picShape = "round", */
  __LOOC_DEBUG__,
}) => {
  console.log(__LOOC_DEBUG__);

  return (
    <div>
      <Card />
      <Div
        css={css`
          color: red;
        `}
      />
      <div></div>
    </div>
  );
};

export default IDCard;
