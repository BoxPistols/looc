/** @jsx jsx */

import React from "react";
import Div from "./components/comp";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";

const H1 = styled.h1`
  color: blue;
`;

interface CounterProps {
  firstNumber: number;
  secondNumber: number;
  someText: string;
  someBool: boolean;
}

const Counter: React.FC<CounterProps & { __LOOC_DEBUG__: boolean }> = ({
  firstNumber = 0,
  secondNumber = 0,
  someText = "",
  someBool = false,
  __LOOC_DEBUG__,
}) => {
  console.log(__LOOC_DEBUG__);
  const sum = Number(firstNumber) + Number(secondNumber);

  return (
    <div style={{ backgroundColor: someBool ? "red" : "green" }}>
      <H1>Hello!</H1>
      <Div />
      Here's some text: {someText}
      <div
        css={css`
          color: red;
        `}
      >
        {firstNumber} + {secondNumber} = {sum}
      </div>
    </div>
  );
};

export default Counter;
