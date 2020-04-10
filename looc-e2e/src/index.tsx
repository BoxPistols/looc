import React, { useState } from "react";

interface CounterProps {
  firstNumber: number;
  secondNumber: number;
  someText: string;
}

const Counter: React.FC<CounterProps> = ({
  firstNumber = 0,
  secondNumber = 0,
  someText = "",
}) => {
  const [st, setSt] = useState(null);
  const sum = Number(firstNumber) + Number(secondNumber);
  return (
    <div>
      Here's some text: {someText}
      <div>
        {firstNumber} + {secondNumber} = {sum}
      </div>
    </div>
  );
};

export default Counter;
