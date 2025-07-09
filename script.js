import { html, renderComponent } from "./js/utils/preact-htm.js";

import { Vis1 } from "./js/vis1.js";
import { Vis2, Vis2Toggle } from "./js/vis2.js";
import { Vis3 } from "./js/vis3.js";
import { Vis4Combined } from "./js/vis4.js";
import { Vis6, Vis6LegendGrowth } from "./js/vis6.js";
import { Vis7 } from "./js/vis7.js";
import { Vis8 } from "./js/vis8.js";
import { Vis9 } from "./js/vis9.js";
import { Vis10 } from "./js/vis10.js";
import { Vis11, Vis11Categories } from "./js/vis11.js";
import { Vis12 } from "./js/vis12.js";
// import { Vis13 } from "./js/vis13_todo.js";

const Vis = async (props) => {
  console.log("Rendering Vis component with props:", props);
  return html`<div class="vis-container">
    <${props.component} ...${props} />
  </div>`;
};

// loop over all visualizations and render them in general Vis component
const visList = [
  {
    id: "vis1",
    component: Vis1,
  },
  {
    id: "vis2",
    component: Vis2,
  },
  {
    id: "vis2_toggle",
    component: Vis2Toggle,
  },
  {
    id: "vis3",
    component: Vis3,
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
    id: "vis11-categories",
    component: Vis11Categories,
  },
  {
    id: "vis12",
    component: Vis12,
  },
  // {
  //   id: "vis13_test",
  //   component: Vis13,
  // },
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
