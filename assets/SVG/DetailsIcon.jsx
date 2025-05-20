import * as React from "react";
import Svg, { Circle } from "react-native-svg";
const DetailsIcon = (props) => (
  <Svg
    width={6}
    height={20}
    viewBox="0 0 6 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle
      cx={3}
      cy={23}
      r={3}
      transform="rotate(-90 3 23)"
      fill="#324892"
      fillOpacity={0.66}
    />
    <Circle
      cx={3}
      cy={13}
      r={3}
      transform="rotate(-90 3 13)"
      fill="#324892"
      fillOpacity={0.66}
    />
    <Circle
      cx={3}
      cy={3}
      r={3}
      transform="rotate(-90 3 3)"
      fill="#324892"
      fillOpacity={0.66}
    />
  </Svg>
);
export default DetailsIcon;
