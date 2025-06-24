import { html } from "./utils/preact-htm.js";

export function Vis4() {
  const width = 633;
  const height = 195;

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; background-color:lightgray"
    >
      <rect
        x="0"
        y="0"
        width="${100}"
        height="${100}"
        fill="#0280FB"
        rx="10"
        ry="10"
      />
    </svg>
  </div>`;
}
