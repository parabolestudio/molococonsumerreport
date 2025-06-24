import { html, renderComponent } from "./js/utils/preact-htm.js";

import { Vis1 } from "./js/vis1.js";
import { Vis2 } from "./js/vis2.js";
import { Vis4 } from "./js/vis4.js";

const Vis = async (props) => {
  console.log("Rendering Vis component with props:", props);
  const component = await props.draw(props);
  return html`<div class="vis-container">${component}</div> `;
};

// loop over all visualizations and render them in general Vis component
const visList = [
  {
    id: "vis1",
    draw: Vis1,
    labels: {
      title: "Title Placeholder for Visualization 1",
      subtitle: "Subtitle Placeholder for Visualization 1",
    },
  },
  {
    id: "vis2",
    draw: Vis2,
    labels: {
      title: "Title Placeholder for Visualization 2",
      subtitle: "Subtitle Placeholder for Visualization 2",
    },
  },
  {
    id: "vis4a",
    draw: Vis4,
    variation: "a",
    labels: {
      title: "Title Placeholder for Visualization 4",
      subtitle: "Subtitle Placeholder for Visualization 4",
    },
  },
  {
    id: "vis4b",
    dataSource: "",
    draw: Vis4,
    variation: "b",
    labels: {
      title: "Title Placeholder for Visualization 4",
      subtitle: "Subtitle Placeholder for Visualization 4",
    },
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
