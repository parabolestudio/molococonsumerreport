import { html, renderComponent } from "./js/utils/preact-htm.js";

import { Vis3 } from "./js/vis3.js";
import { Vis4 } from "./js/vis4.js";
import { Vis6 } from "./js/vis6.js";

const Vis = async (props) => {
  console.log("Rendering Vis component with props:", props);
  const component = await props.draw(props);
  return html`<div class="vis-container">${component}</div> `;
};

// loop over all visualizations and render them in general Vis component
const visList = [
  {
    id: "vis3",
    draw: Vis3,
  },
  {
    id: "vis4a",
    draw: Vis4,
    variation: "a",
  },
  {
    id: "vis4b",
    draw: Vis4,
    variation: "b",
  },
  {
    id: "vis6",
    draw: Vis6,
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
    console.error(`Could not find container element for viz with id ${vis.id}`);
  }
});
