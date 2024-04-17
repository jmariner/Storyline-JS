/* eslint-disable no-undef */
// Copy/paste this into a Storyline JavaScript trigger to load libraries.
// List of libraries should be set in "StorylineJS" var in Storyline as a comma-seperated list.
// Should wait for var "StorylineJS_Ready" to be true before using the libraries.

//  ====== COPY BELOW THIS LINE ======

const scriptEl = document.createElement("script");
scriptEl.src = `${GetPlayer().GetVar("StorylineJS_Local") ? "http://localhost:8000/" : "https://cdn.jsdelivr.net/gh/jmariner/Storyline-JS@main/"}loader.js`;
document.head.appendChild(scriptEl);
