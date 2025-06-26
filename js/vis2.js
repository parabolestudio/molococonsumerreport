import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis2() {
  const [data, setData] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Consumer");

  const activeBarColor = "#03004C";
  const inactiveBarColor = "#B5B3CA";
  const activePathColor = "#686694";
  const inactivePathColor = "#DDDCE7";
  const getColor = (bar, type) => {
    if (type === "bar") {
      if (bar.category === activeCategory || bar.category === null)
        return activeBarColor;
      return inactiveBarColor;
    }
    if (type === "path") {
      if (bar.category === activeCategory) return activePathColor;
      return inactivePathColor;
    }
    return "red";
  };

  // layout dimensions
  const width = 600;
  const height = 800;
  const outerMargin = { top: 50, right: 20, bottom: 20, left: 20 };
  const innerWidth = width - outerMargin.left - outerMargin.right;
  const innerHeight = height - outerMargin.top - outerMargin.bottom;

  const innerMargin = { horizontal: 80 };

  // horizontal bar layout
  const totalBarWidth = innerWidth - innerMargin.horizontal * 2; // corresponds to total value of $85B
  const totalBarLeftX = (innerWidth - totalBarWidth) / 2;
  const level1ConsumerWidth = totalBarWidth * (45 / 85);
  const level1GamingWidth = totalBarWidth * (40 / 85);
  const level1Padding = 2;

  const level2ConsumerWalledGardenWidth = totalBarWidth * (40 / 85);
  const level2GamingWalledGardenWidth = totalBarWidth * (35 / 85);
  const level2ConsumerIAEWidth = totalBarWidth * (6 / 85);
  const level2GamingIAEWidth = totalBarWidth * (4 / 85);
  const level2Padding = 2;

  // vertical bar layout
  const barHeight = 25;
  const verticalDistanceLevel1 = 0.2;
  const verticalDistanceLevel2 = 0.6;
  const verticalDistanceLevel3 = 1;
  const level0BarY = 0;
  const level1BarY = innerHeight * verticalDistanceLevel1;
  const level2BarY = innerHeight * verticalDistanceLevel2;
  const level3BarY = innerHeight * verticalDistanceLevel3 - barHeight;

  const barValues = [
    {
      level: 0,
      label: "Total",
      value: 85,
      x: totalBarLeftX,
      y: 0,
      width: totalBarWidth,
      category: null,
    },
    {
      level: 1,
      label: "Consumer",
      value: 45,
      x: totalBarLeftX,
      y: level1BarY,
      width: level1ConsumerWidth - level1Padding,
      category: "Consumer",
    },
    {
      level: 1,
      label: "Gaming",
      value: 40,
      x: totalBarLeftX + level1ConsumerWidth + level1Padding,
      y: level1BarY,
      width: level1GamingWidth - level1Padding,
      category: "Gaming",
    },
    {
      level: 2,
      label: "Consumer Walled Garden",
      value: 40,
      x: totalBarLeftX,
      y: level2BarY,
      width: level2ConsumerWalledGardenWidth,
      category: "Consumer",
    },
    {
      level: 2,
      label: "Gaming Walled Garden",
      value: 35,
      x: totalBarLeftX + level2ConsumerWalledGardenWidth,
      y: level2BarY,
      width: level2GamingWalledGardenWidth - level2Padding,
      category: "Gaming",
    },
    {
      level: 2,
      label: "Consumer IAE",
      value: 6,
      x:
        totalBarLeftX +
        level2ConsumerWalledGardenWidth +
        level2GamingWalledGardenWidth +
        level2Padding,
      y: level2BarY,
      width: level2ConsumerIAEWidth - level2Padding,
      category: "Consumer",
    },
    {
      level: 2,
      label: "Gaming IAE",
      value: 4,
      x:
        totalBarLeftX +
        level2ConsumerWalledGardenWidth +
        level2GamingWalledGardenWidth +
        level2ConsumerIAEWidth,
      y: level2BarY,
      width: level2GamingIAEWidth,
      category: "Gaming",
    },
    {
      level: 3,
      label: "TBD",
      value: 4,
      x: 0,
      y: level3BarY,
      width: innerWidth,
      category: null,
    },
  ];

  // path connections between level 0 and level 1
  const level0ToLevel1Paths = [
    {
      topLeftX: barValues.find((bar) => bar.label === "Total").x,
      topLeftY: level0BarY + barHeight,
      topRightX:
        barValues.find((bar) => bar.label === "Consumer").x +
        barValues.find((bar) => bar.label === "Consumer").width,
      topRightY: level0BarY + barHeight,
      bottomRightX:
        barValues.find((bar) => bar.label === "Consumer").x +
        barValues.find((bar) => bar.label === "Consumer").width,
      bottomRightY: level1BarY,
      bottomLeftX: barValues.find((bar) => bar.label === "Total").x,
      bottomLeftY: level1BarY,
      category: "Consumer",
    },
    {
      topLeftX: barValues.find((bar) => bar.label === "Gaming").x,
      topLeftY: level0BarY + barHeight,
      topRightX:
        barValues.find((bar) => bar.label === "Gaming").x +
        barValues.find((bar) => bar.label === "Gaming").width,
      topRightY: level0BarY + barHeight,
      bottomRightX:
        barValues.find((bar) => bar.label === "Gaming").x +
        barValues.find((bar) => bar.label === "Gaming").width,
      bottomRightY: level1BarY,
      bottomLeftX: barValues.find((bar) => bar.label === "Gaming").x,

      bottomLeftY: level1BarY,
      category: "Gaming",
    },
  ];
  const pathsLevel0ToLevel1 = level0ToLevel1Paths.map((path) => {
    return html`<path
      d="M ${path.topLeftX} ${path.topLeftY} L ${path.topRightX} ${path.topRightY} ${path.bottomRightX} ${path.bottomRightY}  ${path.bottomLeftX} ${path.bottomLeftY} ${path.topLeftX} ${path.topLeftY}Z"
      fill="${getColor(path, "path")}"
    />`;
  });

  // path connections between level 1 and level 2
  const level1ToLevel2Paths = [
    {
      topLeftX: barValues.find((bar) => bar.label === "Consumer").x,
      topLeftY: level1BarY + barHeight,
      topRightX:
        barValues.find((bar) => bar.label === "Consumer").x +
        barValues.find((bar) => bar.label === "Consumer Walled Garden").width,
      topRightY: level1BarY + barHeight,
      bottomRightX:
        barValues.find((bar) => bar.label === "Consumer Walled Garden").x +
        barValues.find((bar) => bar.label === "Consumer Walled Garden").width,
      bottomRightY: level2BarY,
      bottomLeftX: barValues.find((bar) => bar.label === "Consumer").x,
      bottomLeftY: level2BarY,
      category: "Consumer",
    },
    {
      topLeftX: barValues.find((bar) => bar.label === "Gaming").x,
      topLeftY: level1BarY + barHeight,
      topRightX:
        barValues.find((bar) => bar.label === "Gaming").x +
        barValues.find((bar) => bar.label === "Gaming Walled Garden").width,
      topRightY: level1BarY + barHeight,
      bottomRightX:
        barValues.find((bar) => bar.label === "Gaming Walled Garden").x +
        barValues.find((bar) => bar.label === "Gaming Walled Garden").width,
      bottomRightY: level2BarY,
      bottomLeftX: barValues.find((bar) => bar.label === "Gaming Walled Garden")
        .x,
      bottomLeftY: level2BarY,
      category: "Gaming",
    },
    {
      topLeftX:
        barValues.find((bar) => bar.label === "Consumer Walled Garden").x +
        barValues.find((bar) => bar.label === "Consumer Walled Garden").width,
      topLeftY: level1BarY + barHeight,
      topRightX:
        barValues.find((bar) => bar.label === "Consumer Walled Garden").x +
        barValues.find((bar) => bar.label === "Consumer Walled Garden").width +
        barValues.find((bar) => bar.label === "Consumer IAE").width,
      topRightY: level1BarY + barHeight,
      bottomRightX:
        barValues.find((bar) => bar.label === "Consumer IAE").x +
        barValues.find((bar) => bar.label === "Consumer IAE").width,
      bottomRightY: level2BarY,
      bottomLeftX: barValues.find((bar) => bar.label === "Consumer IAE").x,
      bottomLeftY: level2BarY,
      category: "Consumer",
    },
    {
      topLeftX: barValues.find((bar) => bar.label === "Gaming IAE").x,
      topLeftY: level1BarY + barHeight,
      topRightX:
        barValues.find((bar) => bar.label === "Gaming IAE").x +
        barValues.find((bar) => bar.label === "Gaming IAE").width,
      topRightY: level1BarY + barHeight,
      bottomRightX:
        barValues.find((bar) => bar.label === "Gaming IAE").x +
        barValues.find((bar) => bar.label === "Gaming IAE").width,
      bottomRightY: level2BarY,
      bottomLeftX: barValues.find((bar) => bar.label === "Gaming IAE").x,
      bottomLeftY: level2BarY,
      category: "Gaming",
    },
  ];
  const pathsLevel1ToLevel2 = level1ToLevel2Paths.map((path) => {
    return html`<path
      d="M ${path.topLeftX} ${path.topLeftY} L ${path.topRightX} ${path.topRightY} ${path.bottomRightX} ${path.bottomRightY}  ${path.bottomLeftX} ${path.bottomLeftY} ${path.topLeftX} ${path.topLeftY}Z"
      fill="${getColor(path, "path")}"
      fill-opacity="0.95"
    />`;
  });

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;border: 1px solid #000;"
    >
      <g transform="translate(${outerMargin.left}, ${outerMargin.top})">
        <!-- Temporary Testing -->
        <rect
          x="0"
          y="0"
          width="${innerWidth}"
          height="${innerHeight}"
          fill="none"
          stroke="purple"
        />
        <rect
          x="${totalBarLeftX}"
          y="0"
          width="${totalBarWidth}"
          height="${innerHeight}"
          fill="none"
          stroke="mediumpurple"
        />

        ${barValues.map(
          (bar) => html`
            <rect
              x="${bar.x}"
              y="${bar.y}"
              width="${bar.width}"
              height="${barHeight}"
              fill="${getColor(bar, "bar")}"
              rx="2"
              ry="2"
            />
          `
        )}
        ${pathsLevel0ToLevel1} ${pathsLevel1ToLevel2}
      </g>
    </svg>
  </div>`;
}
