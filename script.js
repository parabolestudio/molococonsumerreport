import { html, renderComponent } from "./js/utils/preact-htm.js";

import { Vis1 } from "./js/vis1.js";
import { swapSvgForViz2 } from "./js/vis2.js";
import { Vis4Combined } from "./js/vis4.js";
import { Vis6, Vis6LegendGrowth } from "./js/vis6.js";
import { Vis7 } from "./js/vis7.js";
import { Vis8 } from "./js/vis8.js";
import { Vis9 } from "./js/vis9.js";
import { Vis10, swapLegendSvgForViz10 } from "./js/vis10.js";
import { Vis11, Vis11Categories } from "./js/vis11.js";
import { Vis12 } from "./js/vis12.js";
import { Vis13, Vis13Categories } from "./js/vis13.js";
import { getLocale } from "./js/utils/helper.js";

const Vis = async (props) => {
  console.log("Rendering Vis component with props:", props);
  return html`<div class="vis-container">
    <${props.component} ...${{ locale: getLocale() }} />
  </div>`;
};

// loop over all visualizations and render them in general Vis component
const visList = [
  {
    id: "vis1",
    component: Vis1,
  },
  {
    id: "vis4",
    component: Vis4Combined,
  },
  {
    id: "vis6",
    component: Vis6,
  },
  {
    id: "vis6-legend-growth",
    component: Vis6LegendGrowth,
  },
  {
    id: "vis7",
    component: Vis7,
  },
  {
    id: "vis8",
    component: Vis8,
  },
  {
    id: "vis9",
    component: Vis9,
  },
  {
    id: "vis10",
    component: Vis10,
  },
  {
    id: "vis11",
    component: Vis11,
  },
  {
    id: "vis11_categories",
    component: Vis11Categories,
  },
  {
    id: "vis12",
    component: Vis12,
  },
  {
    id: "vis13_categories",
    component: Vis13Categories,
  },
  {
    id: "vis13",
    component: Vis13,
  },
];

visList.forEach((vis) => {
  const containerElement = document.getElementById(vis.id);
  if (containerElement) {
    // clear existing content before rendering
    containerElement.innerHTML = "";

    // wait for async Vis to resolve before rendering
    (async () => {
      const rendered = await Vis(vis);
      renderComponent(rendered, containerElement);
    })();
  } else {
    console.error(`Could not find container element for vis with id ${vis.id}`);
  }
});

// switch images for viz 2 based on locale
const locale = getLocale();
swapSvgForViz2(locale);

// switch legend svg for viz 10 based on locale
swapLegendSvgForViz10(locale);
