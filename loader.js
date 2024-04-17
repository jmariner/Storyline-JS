// eslint-disable-next-line no-undef
const player = GetPlayer();
const vars = { libs: "StorylineJS", ready: "StorylineJS_Ready", local: "StorylineJS_Local" };
const isLocal = player.GetVar(vars.local);
const basePath = isLocal ? "http://localhost:8000/" : "https://cdn.jsdelivr.net/gh/jmariner/Storyline-JS@main/";
const suffix = ".js";
const libsRaw = player.GetVar(vars.libs);

if (libsRaw === null)
	throw new Error("StorylineJS var not set");

const libs = libsRaw.split(",").map(lib => lib.trim());
const existing = [...document.querySelectorAll("script[type=module]")];
const libsWaiting = {};

for (const src of libs) {
	const fullSrc = basePath + src + suffix;
	if (existing.some(el => el.src === fullSrc))
		continue;
	libsWaiting[src] = fullSrc;
}

if (typeof window === "object") {
	window.StorylineJS_LibLoaded = function (libName) {
		delete libsWaiting[libName];
		if (Object.keys(libsWaiting).length === 0)
			player.SetVar(vars.ready, true);
	};
}

for (const fullSrc of Object.values(libsWaiting)) {
	const scriptEl = document.createElement("script");
	scriptEl.type = "module";
	scriptEl.src = fullSrc;
	document.head.appendChild(scriptEl);
}
