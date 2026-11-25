// packages/sdk/src/ui/sign-in-here.ts
var offers = /* @__PURE__ */ new WeakMap();
function offerSignIn(controls, offer) {
  offers.set(controls, offer);
}
function signInHere(controls, section) {
  const offer = () => offers.get(controls);
  return {
    id: `sign-in-${section}`,
    section,
    icon: "key",
    tone: "primary",
    label: () => offer()?.label() ?? "Sign in",
    short: "Sign in",
    hidden: () => !offer()?.wanted(),
    act: () => offer()?.press()
  };
}
function signInFirst(controls, line) {
  controls.say(line);
  const offer = offers.get(controls);
  if (offer?.wanted()) offer.press();
}

// packages/sdk/src/offer-icons.ts
var OFFER_ICONS = {
  headset: "vr",
  people: "people",
  voice: "mic",
  items: "bag",
  saves: "save",
  records: "trophy",
  "by-invitation": "invite",
  paid: "coin"
};
var OFFER_LINE_ICONS = {
  ...OFFER_ICONS,
  tips: "tip",
  doors: "door",
  looks: "look",
  "by-name": "key",
  home: "home"
};

// packages/sdk/src/door-controls.ts
function vouchedWords(door) {
  if (door.vouched === "verified") return "Verified for this site";
  if (door.vouched === "listed") return door.listedBy ? `Listed by ${door.listedBy}, not verified` : "Listed, not verified";
  return "";
}
function addDoorControls(controls, opts) {
  const section = opts.section ?? "travel";
  let shown = [];
  let chosenId = null;
  const find = () => chosenId ? opts.doors().find((d) => d.id === chosenId) ?? null : null;
  const card = (door) => ({
    title: door.title,
    tag: vouchedWords(door),
    proven: door.vouched === "verified",
    sub: door.url,
    copy: "",
    text: door.offers ? "" : "Its maker hasn't said anything about it themselves, so nothing is said here about what it offers.",
    picture: "",
    // No face: a door isn't a person. A renderer draws the first letter of its name in the colour of a door.
    color: "",
    now: []
  });
  const refresh = () => {
    for (const id of shown) controls.remove(id);
    shown = [];
    const door = find();
    if (chosenId && !door) chosenId = null;
    const add = (...actions) => {
      for (const a of actions) shown.push(a.id);
      controls.add(...actions.map((a) => ({ section, ...a })));
    };
    if (!door) {
      opts.doors().forEach(
        (d, i) => add({ id: `door-detail:${i}`, icon: "door", label: d.title, short: "Door", act: () => choose(d.id) })
      );
      return;
    }
    add(
      { id: "door-travel", icon: "door", label: "Travel here", tone: "primary", act: () => opts.travel(door) },
      ...opts.also?.(door) ?? [],
      { id: "door-back", icon: "list", label: "Back to every door", act: () => choose(null) },
      ...(door.offers ?? []).map(
        (o) => ({ id: `door-offer:${o.id}`, kind: "line", icon: OFFER_LINE_ICONS[o.id], label: o.words, on: () => o.on, act: () => {
        } })
      )
    );
  };
  const choose = (id) => {
    chosenId = id;
    refresh();
  };
  const given = {
    id: section,
    ...opts.label ? { label: opts.label } : {},
    card: () => {
      const door = find();
      return door ? card(door) : null;
    }
  };
  controls.addSection(given);
  refresh();
  return { refresh, choose, chosen: find };
}

export {
  offerSignIn,
  signInHere,
  signInFirst,
  OFFER_ICONS,
  vouchedWords,
  addDoorControls
};
