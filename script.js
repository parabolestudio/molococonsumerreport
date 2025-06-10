import { html } from "./preact-htm.js";

import { Vis1 } from "./js/vis1.js";
import { Vis2 } from "./js/vis2.js";

const Vis = (props) => {
  console.log("Rendering Vis component with props:", props);

  return html`<div class="vis-container">${props.draw()}</div> `;
};

// loop over all visualizations and render them in general Vis component
const visList = [
  {
    id: "vis1",
    dataSource: "",
    draw: Vis1,
    labels: {
      title: "Title Placeholder for Visualization 1",
      subtitle: "Subtitle Placeholder for Visualization 1",
    },
  },
  {
    id: "vis2",
    dataSource: "",
    draw: Vis2,
    labels: {
      title: "Title Placeholder for Visualization 2",
      subtitle: "Subtitle Placeholder for Visualization 2",
    },
  },
];

visList.forEach((vis) => {
  const containerElement = document.getElementById(vis.id);
  if (containerElement) {
    render(html`<${Vis} ...${vis} />`, containerElement);
  } else {
    console.error(`Could not find container element for viz with id ${vis.id}`);
  }
});
