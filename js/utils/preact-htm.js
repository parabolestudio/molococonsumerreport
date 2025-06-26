import { h, render } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { useState, useEffect } from "https://esm.sh/preact/hooks";

export const html = htm.bind(h);
export const renderComponent = render;
export { useState, useEffect };
