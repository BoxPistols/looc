/** @jsx jsx */

import React from "react";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";
import "./global.css";

interface PicProps {
  shape: IDCardProps["picShape"];
}

const CardFrame = styled.div`
  width: 300px;
  border: 1px solid gainsboro;
  border-radius: 7px;
  padding: 8px;
  font-size: 20px;
  font-family: Helvetica, sans-serif;
  box-shadow: 0 0 8px 0px gainsboro;
`;

const Pic = styled.div<PicProps>`
  width: 50px;
  height: 50px;
  background-color: darkgray;
  border-radius: ${(props) => (props.shape === "round" ? "50%" : "7px")};
`;

const UpperHalf = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  padding-right: 20px;
  padding-left: 20px;
`;

const Tel = styled.div`
  display: flex;
  align-items: center;
  padding: 18px;
  font-size: 14px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  background-color: steelBlue;
  justify-content: center;
  padding: 10px;
  border-radius: 0 0 7px 7px;
  margin: 0 -8px -8px -8px;
`;

const NameWithTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

interface IDCardProps {
  firstName: string;
  lastName: string;
  title: string;
  id: number;
  picShape: "squared" | "round";
  telephone: string;
}

const IDCard: React.FC<IDCardProps & { __LOOC_DEBUG__: boolean }> = ({
  firstName = "",
  lastName = "",
  title = "",
  id = 0,
  telephone = "",
  picShape = "round",
  __LOOC_DEBUG__,
}) => {
  console.log(__LOOC_DEBUG__);

  return (
    <CardFrame>
      <UpperHalf>
        <Pic shape={picShape} />
        <NameWithTitle>
          <span
            css={css`
              font-weight: bold;
            `}
          >
            {firstName} {lastName}
          </span>
          <span
            css={css`
              font-size: 16px;
            `}
          >
            {title}
          </span>
        </NameWithTitle>
      </UpperHalf>
      <Tel>TEL: {telephone}</Tel>
      <Footer>
        <span
          css={css`
            font-family: monospace;
            font-size: 13px;
            color: white;
          `}
        >
          ID: {id}
        </span>
      </Footer>
    </CardFrame>
  );
};

export default IDCard;
