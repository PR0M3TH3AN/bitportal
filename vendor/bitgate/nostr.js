// vendor/.bitgate-tree/packages/nostr/src/nip19.js
var CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
var CHARSET_MAP = /* @__PURE__ */ new Map();
for (let index = 0; index < CHARSET.length; index += 1) {
  CHARSET_MAP.set(CHARSET[index], index);
}
var GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
function polymod(values) {
  let checksum = 1;
  for (const value of values) {
    const top = checksum >>> 25;
    checksum = (checksum & 33554431) << 5 ^ value;
    for (let bit = 0; bit < GENERATORS.length; bit += 1) {
      if (top >>> bit & 1) {
        checksum ^= GENERATORS[bit];
      }
    }
  }
  return checksum;
}
function hrpExpand(hrp) {
  const expanded = [];
  for (let index = 0; index < hrp.length; index += 1) {
    expanded.push(hrp.charCodeAt(index) >>> 5);
  }
  expanded.push(0);
  for (let index = 0; index < hrp.length; index += 1) {
    expanded.push(hrp.charCodeAt(index) & 31);
  }
  return expanded;
}
function bech32Decode(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const lower = trimmed.toLowerCase();
  if (trimmed !== lower && trimmed !== trimmed.toUpperCase()) {
    return null;
  }
  const separator = lower.lastIndexOf("1");
  if (separator < 1 || separator + 7 > lower.length) {
    return null;
  }
  const hrp = lower.slice(0, separator);
  const words = [];
  for (let index = separator + 1; index < lower.length; index += 1) {
    const word = CHARSET_MAP.get(lower[index]);
    if (word === void 0) {
      return null;
    }
    words.push(word);
  }
  if (polymod(hrpExpand(hrp).concat(words)) !== 1) {
    return null;
  }
  return { hrp, words: words.slice(0, -6) };
}
function convertBits(data, fromBits, toBits, pad = true) {
  const result = [];
  let accumulator = 0;
  let bits = 0;
  const maxValue = (1 << toBits) - 1;
  const maxAccumulator = (1 << fromBits + toBits - 1) - 1;
  for (const value of data) {
    if (value < 0 || value >> fromBits) {
      return null;
    }
    accumulator = (accumulator << fromBits | value) & maxAccumulator;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push(accumulator >>> bits & maxValue);
    }
  }
  if (pad) {
    if (bits) {
      result.push(accumulator << toBits - bits & maxValue);
    }
  } else if (bits >= fromBits || accumulator << toBits - bits & maxValue) {
    return null;
  }
  return result;
}
function decodeNpub(npub) {
  const decoded = bech32Decode(npub);
  if (!decoded || decoded.hrp !== "npub") {
    return "";
  }
  const bytes = convertBits(decoded.words, 5, 8, false);
  if (!bytes || bytes.length !== 32) {
    return "";
  }
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function decodeNote(note) {
  const decoded = bech32Decode(note);
  if (!decoded || decoded.hrp !== "note") {
    return "";
  }
  const bytes = convertBits(decoded.words, 5, 8, false);
  if (!bytes || bytes.length !== 32) {
    return "";
  }
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function normalizePubkeyInput(value) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return decodeNpub(trimmed);
}
function normalizeEventIdInput(value) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return decodeNote(trimmed);
}

// vendor/.bitgate-tree/packages/nostr/src/replaceable.js
function getTagValue(event, name) {
  for (const tag of event.tags ?? []) {
    if (Array.isArray(tag) && tag[0] === name && typeof tag[1] === "string") {
      return tag[1];
    }
  }
  return "";
}
function getTags(event, name) {
  return (event.tags ?? []).filter((tag) => Array.isArray(tag) && tag[0] === name);
}
function coordinateOf(event) {
  return `${event.kind}:${event.pubkey}:${getTagValue(event, "d")}`;
}
function selectReplaceable(events) {
  const winners = /* @__PURE__ */ new Map();
  for (const event of events ?? []) {
    if (!event || typeof event.kind !== "number") {
      continue;
    }
    const coordinate = coordinateOf(event);
    const current = winners.get(coordinate);
    if (!current) {
      winners.set(coordinate, event);
      continue;
    }
    if (event.created_at > current.created_at) {
      winners.set(coordinate, event);
      continue;
    }
    if (event.created_at === current.created_at && event.id < current.id) {
      winners.set(coordinate, event);
    }
  }
  return winners;
}
function selectLatest(events) {
  let winner = null;
  for (const event of events ?? []) {
    if (!event) {
      continue;
    }
    if (!winner || event.created_at > winner.created_at || event.created_at === winner.created_at && event.id < winner.id) {
      winner = event;
    }
  }
  return winner;
}
async function verifyEvents(events, verify) {
  if (typeof verify !== "function") {
    return [...events ?? []];
  }
  const verified = [];
  for (const event of events ?? []) {
    try {
      if (await verify(event)) {
        verified.push(event);
      }
    } catch {
    }
  }
  return verified;
}

// vendor/.bitgate-tree/packages/nostr/src/canonical.js
import { normalizeAddress } from "@bitgate/core";
var CANONICAL_KIND = 30078;
var CANONICAL_VERSION = "1";
var SCOPE_TO_KIND = {
  "user-allow": "user-allow",
  "user-deny": "user-deny",
  "event-allow": "event-allow",
  "event-deny": "event-deny",
  "address-allow": "address-allow",
  "address-deny": "address-deny",
  "trust-seed": "trust-seed"
};
function canonicalIdentifier(namespace, scope) {
  return `${namespace}:governance:${scope}:v${CANONICAL_VERSION}`;
}
function parseIdentifier(identifier) {
  if (typeof identifier !== "string") {
    return null;
  }
  const match = /^([^:]+):governance:([^:]+):v(\d+)$/.exec(identifier.trim());
  if (!match) {
    return null;
  }
  return { namespace: match[1], scope: match[2], version: match[3] };
}
function isCanonicalGovernanceEvent(event, namespace) {
  if (!event || event.kind !== CANONICAL_KIND) {
    return false;
  }
  const parsed = parseIdentifier(getTagValue(event, "d"));
  if (!parsed) {
    return false;
  }
  return namespace ? parsed.namespace === namespace : true;
}
function decodeContribution(event) {
  if (!isCanonicalGovernanceEvent(event)) {
    return null;
  }
  const parsed = parseIdentifier(getTagValue(event, "d"));
  const scopeTag = getTagValue(event, "scope");
  if (scopeTag && scopeTag !== parsed?.scope) {
    return null;
  }
  const scope = parsed?.scope ?? "";
  const kind = SCOPE_TO_KIND[scope];
  if (!kind) {
    return null;
  }
  const actor = normalizePubkeyInput(event.pubkey);
  if (!actor) {
    return null;
  }
  const targets = [];
  if (kind === "event-deny" || kind === "event-allow") {
    for (const tag of getTags(event, "e")) {
      if (isWireHex64(tag[1])) {
        targets.push({ type: "event", id: tag[1] });
      }
    }
  } else if (kind === "address-deny" || kind === "address-allow") {
    for (const tag of getTags(event, "a")) {
      const target = decodeAddressCoordinate(tag[1], { strict: true });
      if (target) {
        targets.push(target);
      }
    }
  } else {
    for (const tag of getTags(event, "p")) {
      if (isWireHex64(tag[1])) {
        targets.push({ type: "user", pubkey: tag[1] });
      }
    }
  }
  const contribution = { actor, kind, targets, createdAt: event.created_at };
  const source = getTagValue(event, "source");
  if (source) {
    contribution.source = source;
  }
  return contribution;
}
function isWireHex64(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}
function decodeAddressCoordinate(coordinate, { strict = false } = {}) {
  if (typeof coordinate !== "string") {
    return null;
  }
  const first = coordinate.indexOf(":");
  const second = coordinate.indexOf(":", first + 1);
  if (first < 1 || second < 0) {
    return null;
  }
  const kind = coordinate.slice(0, first);
  const pubkey = coordinate.slice(first + 1, second);
  const identifier = coordinate.slice(second + 1);
  if (!/^\d+$/.test(kind) || !identifier) {
    return null;
  }
  if (strict && !isWireHex64(pubkey)) {
    return null;
  }
  return normalizeAddress(kind, normalizePubkeyInput(pubkey), identifier);
}
function encodeAddressCoordinate(target) {
  return `${target.kind}:${target.pubkey}:${target.identifier}`;
}
function decodeRoles(event) {
  if (!isCanonicalGovernanceEvent(event)) {
    return null;
  }
  const parsed = parseIdentifier(getTagValue(event, "d"));
  if (parsed?.scope !== "roles") {
    return null;
  }
  const root = normalizePubkeyInput(event.pubkey);
  if (!root) {
    return null;
  }
  const actors = {};
  for (const tag of getTags(event, "p")) {
    const pubkey = normalizePubkeyInput(tag[1]);
    const role = typeof tag[2] === "string" ? tag[2].trim() : "";
    if (!pubkey || !role) {
      continue;
    }
    actors[pubkey] = actors[pubkey] ?? [];
    if (!actors[pubkey].includes(role)) {
      actors[pubkey].push(role);
    }
  }
  const capabilities = {};
  for (const tag of getTags(event, "cap")) {
    const pubkey = normalizePubkeyInput(tag[1]);
    const capability = typeof tag[2] === "string" ? tag[2].trim() : "";
    if (!pubkey || !capability) {
      continue;
    }
    capabilities[pubkey] = capabilities[pubkey] ?? [];
    if (!capabilities[pubkey].includes(capability)) {
      capabilities[pubkey].push(capability);
    }
  }
  const protectedActors = [root];
  for (const tag of getTags(event, "protected")) {
    const pubkey = normalizePubkeyInput(tag[1]);
    if (pubkey && !protectedActors.includes(pubkey)) {
      protectedActors.push(pubkey);
    }
  }
  return { root, actors, capabilities, protectedActors };
}
var MAX_POLICY_BYTES = 64 * 1024;
function decodePolicy(event) {
  if (!isCanonicalGovernanceEvent(event)) {
    return null;
  }
  const parsed = parseIdentifier(getTagValue(event, "d"));
  if (parsed?.scope !== "policy") {
    return null;
  }
  const content = typeof event.content === "string" ? event.content : "";
  if (!content || content.length > MAX_POLICY_BYTES) {
    return null;
  }
  try {
    const policy = JSON.parse(content);
    if (!policy || typeof policy !== "object" || Array.isArray(policy)) {
      return null;
    }
    return policy;
  } catch {
    return null;
  }
}
function encodeContribution(contribution, namespace) {
  const tags = [
    ["d", canonicalIdentifier(namespace, contribution.kind)],
    ["v", CANONICAL_VERSION],
    ["client", "bitgate"],
    ["scope", contribution.kind]
  ];
  if (contribution.source) {
    tags.push(["source", contribution.source]);
  }
  for (const target of contribution.targets ?? []) {
    if (target.type === "user") {
      tags.push(["p", target.pubkey]);
    } else if (target.type === "event") {
      tags.push(["e", target.id]);
    } else if (target.type === "address") {
      tags.push(["a", encodeAddressCoordinate(target)]);
    }
  }
  return { kind: CANONICAL_KIND, content: "", tags };
}
function encodeRoles(roster, namespace) {
  const tags = [
    ["d", canonicalIdentifier(namespace, "roles")],
    ["v", CANONICAL_VERSION],
    ["client", "bitgate"],
    ["scope", "roles"]
  ];
  for (const [pubkey, roles] of Object.entries(roster.actors ?? {})) {
    for (const role of roles) {
      tags.push(["p", pubkey, role]);
    }
  }
  for (const [pubkey, capabilities] of Object.entries(roster.capabilities ?? {})) {
    for (const capability of capabilities) {
      tags.push(["cap", pubkey, capability]);
    }
  }
  for (const pubkey of roster.protectedActors ?? []) {
    tags.push(["protected", pubkey]);
  }
  return { kind: CANONICAL_KIND, content: "", tags };
}

// vendor/.bitgate-tree/packages/nostr/src/reports.js
var REPORT_KIND = 1984;
function isRelayHint(value) {
  if (typeof value !== "string") {
    return false;
  }
  const lower = value.trim().toLowerCase();
  return lower.startsWith("wss://") || lower.startsWith("ws://") || lower.startsWith("https://") || lower.startsWith("http://");
}
function normalizeCategory(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}
function extractReportType(event, targetValue = "") {
  for (const tag of event.tags ?? []) {
    if (!Array.isArray(tag)) {
      continue;
    }
    if (tag[0] === "report" || tag[0] === "type") {
      const category = normalizeCategory(tag[1]);
      if (category) {
        return category;
      }
    }
  }
  if (targetValue) {
    for (const tag of event.tags ?? []) {
      if (!Array.isArray(tag) || tag[0] !== "e" && tag[0] !== "p") {
        continue;
      }
      if (tag[1] !== targetValue || isRelayHint(tag[2])) {
        continue;
      }
      const category = normalizeCategory(tag[2]);
      if (category) {
        return category;
      }
    }
  }
  for (const tag of getTags(event, "t")) {
    const category = normalizeCategory(tag[1]);
    if (category) {
      return category;
    }
  }
  return "";
}
function decodeReport(event) {
  if (!event || event.kind !== REPORT_KIND) {
    return [];
  }
  const reporter = normalizePubkeyInput(event.pubkey);
  if (!reporter) {
    return [];
  }
  const createdAt = Number.isFinite(event.created_at) ? event.created_at : 0;
  const reports = [];
  for (const tag of getTags(event, "e")) {
    const id = normalizeEventIdInput(tag[1]);
    if (!id) {
      continue;
    }
    const category = extractReportType(event, tag[1]);
    if (!category) {
      continue;
    }
    reports.push({ reporter, target: { type: "event", id }, category, createdAt });
  }
  if (reports.length > 0) {
    return reports;
  }
  for (const tag of getTags(event, "p")) {
    const pubkey = normalizePubkeyInput(tag[1]);
    if (!pubkey) {
      continue;
    }
    const category = extractReportType(event, tag[1]);
    if (!category) {
      continue;
    }
    reports.push({ reporter, target: { type: "user", pubkey }, category, createdAt });
  }
  return reports;
}
function encodeReport(target, category, content = "") {
  const normalized = normalizeCategory(category);
  if (!normalized) {
    throw new Error("Report category must be a non-empty string");
  }
  const tags = [["report", normalized]];
  if (target.type === "event") {
    tags.push(["e", target.id, normalized]);
    if (target.author) {
      tags.push(["p", target.author]);
    }
  } else if (target.type === "user") {
    tags.push(["p", target.pubkey, normalized]);
  } else {
    tags.push(["a", `${target.kind}:${target.pubkey}:${target.identifier}`, normalized]);
  }
  return { kind: REPORT_KIND, content, tags };
}

// vendor/.bitgate-tree/packages/nostr/src/mutes.js
var MUTE_LIST_KIND = 1e4;
var MAX_MUTE_CONTENT_BYTES = 128 * 1024;
function extractMuteCategory(tag) {
  if (!Array.isArray(tag)) {
    return "";
  }
  const direct = typeof tag[3] === "string" ? tag[3].trim().toLowerCase() : "";
  if (direct) {
    return direct;
  }
  const candidate = typeof tag[2] === "string" ? tag[2].trim() : "";
  if (!candidate) {
    return "";
  }
  const lower = candidate.toLowerCase();
  const looksLikeRelay = lower.startsWith("wss://") || lower.startsWith("ws://") || lower.startsWith("https://") || lower.startsWith("http://");
  return looksLikeRelay ? "" : lower;
}
async function decodePrivateMuteEntries(event, { viewerPubkey, decrypt }) {
  if (!event || event.kind !== MUTE_LIST_KIND) {
    return [];
  }
  const owner = normalizePubkeyInput(event.pubkey);
  const viewer = normalizePubkeyInput(viewerPubkey);
  if (!owner || !viewer || owner !== viewer) {
    return [];
  }
  const content = typeof event.content === "string" ? event.content.trim() : "";
  if (!content || typeof decrypt !== "function") {
    return [];
  }
  if (content.length > MAX_MUTE_CONTENT_BYTES) {
    return [];
  }
  let tags;
  try {
    const plaintext = await decrypt(owner, content);
    tags = JSON.parse(plaintext);
  } catch {
    return [];
  }
  if (!Array.isArray(tags)) {
    return [];
  }
  const entries = [];
  const seen = /* @__PURE__ */ new Set();
  for (const tag of tags) {
    if (!Array.isArray(tag) || tag[0] !== "p") {
      continue;
    }
    const pubkey = normalizePubkeyInput(tag[1]);
    if (!pubkey || seen.has(pubkey)) {
      continue;
    }
    seen.add(pubkey);
    const category = extractMuteCategory(tag);
    entries.push(category ? { pubkey, category } : { pubkey });
  }
  return entries;
}
function decodeMuteList(event) {
  if (!event || event.kind !== MUTE_LIST_KIND) {
    return null;
  }
  const owner = normalizePubkeyInput(event.pubkey);
  if (!owner) {
    return null;
  }
  const entries = [];
  const seen = /* @__PURE__ */ new Set();
  for (const tag of getTags(event, "p")) {
    const pubkey = normalizePubkeyInput(tag[1]);
    if (!pubkey || seen.has(pubkey)) {
      continue;
    }
    seen.add(pubkey);
    const category = extractMuteCategory(tag);
    entries.push(category ? { pubkey, category } : { pubkey });
  }
  return {
    owner,
    updatedAt: Number.isFinite(event.created_at) ? event.created_at : 0,
    entries,
    hasEncryptedEntries: typeof event.content === "string" && event.content.length > 0
  };
}
function toMuteRecords(lists) {
  const records = /* @__PURE__ */ new Map();
  for (const list of lists ?? []) {
    if (!list) {
      continue;
    }
    for (const entry of list.entries) {
      const key = `user:${entry.pubkey}`;
      const bucket = records.get(key) ?? [];
      bucket.push({
        muter: list.owner,
        ...entry.category ? { category: entry.category } : {},
        updatedAt: list.updatedAt
      });
      records.set(key, bucket);
    }
  }
  return records;
}
function encodeMuteList(entries) {
  const tags = (entries ?? []).map(
    (entry) => entry.category ? ["p", entry.pubkey, "", entry.category] : ["p", entry.pubkey]
  );
  return { kind: MUTE_LIST_KIND, content: "", tags };
}

// vendor/.bitgate-tree/packages/nostr/src/relayList.js
var RELAY_LIST_KIND = 10002;
function normalizeRelayUrl(value) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (!/^wss?:\/\//i.test(trimmed) || /[\s\u0000-\u001f]/.test(trimmed)) {
    return "";
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "";
  }
  if (parsed.protocol !== "wss:" && parsed.protocol !== "ws:" || !parsed.hostname) {
    return "";
  }
  return trimmed.replace(/\/+$/, "").toLowerCase();
}
function decodeRelayList(event) {
  if (!event || event.kind !== RELAY_LIST_KIND) {
    return null;
  }
  const pubkey = normalizePubkeyInput(event.pubkey);
  if (!pubkey) {
    return null;
  }
  const read = /* @__PURE__ */ new Set();
  const write = /* @__PURE__ */ new Set();
  for (const tag of getTags(event, "r")) {
    const url = normalizeRelayUrl(tag[1]);
    if (!url) {
      continue;
    }
    const marker = typeof tag[2] === "string" ? tag[2].trim().toLowerCase() : "";
    if (marker === "read") {
      read.add(url);
    } else if (marker === "write") {
      write.add(url);
    } else {
      read.add(url);
      write.add(url);
    }
  }
  return {
    pubkey,
    updatedAt: Number.isFinite(event.created_at) ? event.created_at : 0,
    read: Array.from(read),
    write: Array.from(write)
  };
}
function groupAuthorsByWriteRelay(authors, relayLists, options = {}) {
  const fallback = (options.fallback ?? []).map(normalizeRelayUrl).filter(Boolean);
  const maxPerAuthor = options.maxRelaysPerAuthor ?? 3;
  const byRelay = /* @__PURE__ */ new Map();
  for (const author of authors ?? []) {
    const pubkey = normalizePubkeyInput(author);
    if (!pubkey) {
      continue;
    }
    const list = relayLists.get(pubkey);
    const relays = list?.write?.length ? list.write.slice(0, maxPerAuthor) : fallback;
    for (const relay of relays) {
      const url = normalizeRelayUrl(relay);
      if (!url) {
        continue;
      }
      if (!byRelay.has(url)) {
        byRelay.set(url, /* @__PURE__ */ new Set());
      }
      byRelay.get(url).add(pubkey);
    }
  }
  const grouped = /* @__PURE__ */ new Map();
  for (const [relay, pubkeys] of byRelay) {
    grouped.set(relay, Array.from(pubkeys));
  }
  return grouped;
}
function encodeRelayList(relays) {
  const tags = [];
  for (const url of relays.both ?? []) {
    const normalized = normalizeRelayUrl(url);
    if (normalized) tags.push(["r", normalized]);
  }
  for (const url of relays.read ?? []) {
    const normalized = normalizeRelayUrl(url);
    if (normalized) tags.push(["r", normalized, "read"]);
  }
  for (const url of relays.write ?? []) {
    const normalized = normalizeRelayUrl(url);
    if (normalized) tags.push(["r", normalized, "write"]);
  }
  return { kind: RELAY_LIST_KIND, content: "", tags };
}

// vendor/.bitgate-tree/packages/nostr/src/contacts.js
var CONTACT_LIST_KIND = 3;
function decodeContactList(event) {
  if (!event || event.kind !== CONTACT_LIST_KIND) {
    return null;
  }
  const owner = normalizePubkeyInput(event.pubkey);
  if (!owner) {
    return null;
  }
  const contacts = [];
  const seen = /* @__PURE__ */ new Set();
  const relayHints = /* @__PURE__ */ new Map();
  for (const tag of getTags(event, "p")) {
    const pubkey = normalizePubkeyInput(tag[1]);
    if (!pubkey || seen.has(pubkey)) {
      continue;
    }
    seen.add(pubkey);
    contacts.push(pubkey);
    const hint = typeof tag[2] === "string" ? tag[2].trim() : "";
    if (hint) {
      relayHints.set(pubkey, hint);
    }
  }
  return {
    owner,
    updatedAt: Number.isFinite(event.created_at) ? event.created_at : 0,
    contacts,
    relayHints
  };
}
function encodeContactList(contacts) {
  const tags = [];
  for (const entry of contacts ?? []) {
    const pubkey = normalizePubkeyInput(typeof entry === "string" ? entry : entry?.pubkey);
    if (!pubkey) {
      continue;
    }
    if (typeof entry === "string") {
      tags.push(["p", pubkey]);
      continue;
    }
    tags.push(["p", pubkey, entry.relay ?? "", entry.petname ?? ""]);
  }
  return { kind: CONTACT_LIST_KIND, content: "", tags };
}

// vendor/.bitgate-tree/packages/nostr/src/labels.js
var LABEL_KIND = 1985;
function labelTargets(event) {
  const targets = [];
  for (const tag of getTags(event, "p")) {
    const pubkey = normalizePubkeyInput(tag[1]);
    if (pubkey) {
      targets.push({ type: "user", pubkey });
    }
  }
  for (const tag of getTags(event, "e")) {
    const id = normalizeEventIdInput(tag[1]);
    if (id) {
      targets.push({ type: "event", id });
    }
  }
  for (const tag of getTags(event, "a")) {
    const target = decodeAddressCoordinate(tag[1]);
    if (target) {
      targets.push(target);
    }
  }
  return targets;
}
function decodeLabels(event) {
  if (!event || event.kind !== LABEL_KIND) {
    return [];
  }
  const labeller = normalizePubkeyInput(event.pubkey);
  if (!labeller) {
    return [];
  }
  const namespaces = new Set(getTags(event, "L").map((tag) => typeof tag[1] === "string" ? tag[1] : ""));
  const targets = labelTargets(event);
  const createdAt = Number.isFinite(event.created_at) ? event.created_at : 0;
  const content = typeof event.content === "string" ? event.content : "";
  const labels = [];
  for (const tag of getTags(event, "l")) {
    const value = typeof tag[1] === "string" ? tag[1].trim() : "";
    if (!value) {
      continue;
    }
    const mark = typeof tag[2] === "string" ? tag[2].trim() : "";
    const namespace = mark && namespaces.has(mark) ? mark : "";
    labels.push({ namespace, value, targets, labeller, content, createdAt });
  }
  return labels;
}
function labelsToContributions(labels, mapping = {}) {
  const namespace = mapping.namespace ?? "";
  const denyValues = new Set((mapping.denyValues ?? ["deny"]).map((value) => value.toLowerCase()));
  const allowValues = new Set((mapping.allowValues ?? []).map((value) => value.toLowerCase()));
  const contributions = [];
  for (const label of labels ?? []) {
    if (label.namespace !== namespace) {
      continue;
    }
    const value = label.value.toLowerCase();
    const isDeny = denyValues.has(value);
    const isAllow = allowValues.has(value);
    if (!isDeny && !isAllow) {
      continue;
    }
    for (const target of label.targets) {
      let kind = null;
      if (isAllow) {
        kind = target.type === "user" ? "user-allow" : target.type === "event" ? "event-allow" : target.type === "address" ? "address-allow" : null;
      } else if (target.type === "user") {
        kind = "user-deny";
      } else if (target.type === "event") {
        kind = "event-deny";
      } else if (target.type === "address") {
        kind = "address-deny";
      }
      if (!kind) {
        continue;
      }
      contributions.push({
        actor: label.labeller,
        kind,
        targets: [target],
        createdAt: label.createdAt,
        source: `label:${namespace || "-"}:${label.labeller}`
      });
    }
  }
  return contributions;
}
function encodeLabel({ value, namespace, targets, content = "", relayHints = {} }) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("A label requires a non-empty value");
  }
  const tags = [];
  if (namespace && namespace.trim()) {
    tags.push(["L", namespace.trim()]);
    tags.push(["l", value.trim(), namespace.trim()]);
  } else {
    tags.push(["l", value.trim()]);
  }
  for (const target of targets ?? []) {
    if (target.type === "user") {
      const hint = relayHints[`user:${target.pubkey}`];
      tags.push(hint ? ["p", target.pubkey, hint] : ["p", target.pubkey]);
    } else if (target.type === "event") {
      const hint = relayHints[`event:${target.id}`];
      tags.push(hint ? ["e", target.id, hint] : ["e", target.id]);
    } else if (target.type === "address") {
      tags.push(["a", `${target.kind}:${target.pubkey}:${target.identifier}`]);
    }
  }
  return { kind: LABEL_KIND, content, tags };
}
function contributionToLabel(contribution, { namespace, denyValue = "deny", allowValue = "allow", content = "" }) {
  const value = contribution.kind.endsWith("-allow") ? allowValue : denyValue;
  return encodeLabel({
    value,
    namespace,
    targets: contribution.targets ?? [],
    content
  });
}

// vendor/.bitgate-tree/packages/nostr/src/legacy.js
var LEGACY_KIND = 3e4;
var LEGACY_IDENTIFIERS = {
  "bitvid:admin:whitelist": "user-allow",
  "bitvid:admin:blacklist": "user-deny",
  "bitvid:admin:event-blacklist": "event-deny"
};
var LEGACY_EDITORS_IDENTIFIER = "bitvid:admin:editors";
var LEGACY_COMMUNITY_SOURCES_IDENTIFIER = "bitvid:admin:community-sources";
function isLegacyAdminEvent(event) {
  if (!event || event.kind !== LEGACY_KIND) {
    return false;
  }
  const identifier = getTagValue(event, "d");
  return identifier in LEGACY_IDENTIFIERS || identifier === LEGACY_EDITORS_IDENTIFIER || identifier === LEGACY_COMMUNITY_SOURCES_IDENTIFIER;
}
function decodeLegacyList(event) {
  if (!event || event.kind !== LEGACY_KIND) {
    return null;
  }
  const identifier = getTagValue(event, "d");
  const kind = LEGACY_IDENTIFIERS[identifier];
  if (!kind) {
    return null;
  }
  const actor = normalizePubkeyInput(event.pubkey);
  if (!actor) {
    return null;
  }
  const targets = [];
  if (kind === "event-deny") {
    for (const tag of getTags(event, "e")) {
      const id = normalizeEventIdInput(tag[1]);
      if (id) {
        targets.push({ type: "event", id });
      }
    }
  } else {
    for (const tag of getTags(event, "p")) {
      const pubkey = normalizePubkeyInput(tag[1]);
      if (pubkey) {
        targets.push({ type: "user", pubkey });
      }
    }
  }
  return { actor, kind, targets, createdAt: event.created_at };
}
function decodeLegacyEditors(event) {
  if (!event || event.kind !== LEGACY_KIND) {
    return [];
  }
  if (getTagValue(event, "d") !== LEGACY_EDITORS_IDENTIFIER) {
    return [];
  }
  const editors = [];
  for (const tag of getTags(event, "p")) {
    const pubkey = normalizePubkeyInput(tag[1]);
    if (pubkey && !editors.includes(pubkey)) {
      editors.push(pubkey);
    }
  }
  return editors;
}
function decodeLegacyCommunitySources(event) {
  if (!event || event.kind !== LEGACY_KIND) {
    return [];
  }
  if (getTagValue(event, "d") !== LEGACY_COMMUNITY_SOURCES_IDENTIFIER) {
    return [];
  }
  const sources = [];
  for (const tag of getTags(event, "a")) {
    const coordinate = typeof tag[1] === "string" ? tag[1] : "";
    const first = coordinate.indexOf(":");
    const second = coordinate.indexOf(":", first + 1);
    if (first < 1 || second < 0) {
      continue;
    }
    const kind = Number.parseInt(coordinate.slice(0, first), 10);
    const curator = normalizePubkeyInput(coordinate.slice(first + 1, second));
    const identifier = coordinate.slice(second + 1);
    if (!Number.isFinite(kind) || !curator || !identifier) {
      continue;
    }
    sources.push({ curator, identifier, kind });
  }
  return sources;
}
function decodeMixedContributions(events, canonicalDecoder) {
  const contributions = [];
  for (const event of events ?? []) {
    const canonical = canonicalDecoder(event);
    if (canonical) {
      contributions.push(canonical);
      continue;
    }
    const legacy = decodeLegacyList(event);
    if (legacy) {
      contributions.push(legacy);
    }
  }
  return contributions;
}

// vendor/.bitgate-tree/packages/nostr/src/roster.js
var ROLE_SET_KIND = 3e4;
function resolveAuthorityRoster(events, { root, rootRole = "super_admin", rosters = [] } = {}) {
  const rootPk = normalizePubkeyInput(root ?? "") ?? "";
  const actors = /* @__PURE__ */ Object.create(null);
  const grant = (pubkey, role) => {
    const pk = normalizePubkeyInput(pubkey);
    if (!pk || !role) return;
    (actors[pk] ??= /* @__PURE__ */ new Set()).add(role);
  };
  if (rootPk) grant(rootPk, rootRole);
  const roleSets = (Array.isArray(events) ? events : []).filter(
    (event) => event && event.kind === ROLE_SET_KIND
  );
  for (const roster of Array.isArray(rosters) ? rosters : []) {
    if (!roster || typeof roster.identifier !== "string" || typeof roster.role !== "string") {
      continue;
    }
    const signerRole = roster.signer && roster.signer !== "root" ? roster.signer : null;
    const authorized = (pubkey) => {
      const pk = normalizePubkeyInput(pubkey);
      if (!pk) return false;
      if (pk === rootPk) return true;
      return signerRole ? actors[pk]?.has(signerRole) ?? false : false;
    };
    const latestByPublisher = /* @__PURE__ */ new Map();
    for (const event of roleSets) {
      if (getTagValue(event, "d") !== roster.identifier || !authorized(event.pubkey)) continue;
      const prev = latestByPublisher.get(event.pubkey);
      if (!prev || event.created_at > prev.created_at || event.created_at === prev.created_at && event.id < prev.id) {
        latestByPublisher.set(event.pubkey, event);
      }
    }
    for (const event of latestByPublisher.values()) {
      for (const tag of getTags(event, "p")) {
        grant(tag[1], roster.role);
      }
    }
  }
  const out = /* @__PURE__ */ Object.create(null);
  for (const [pk, roles] of Object.entries(actors)) out[pk] = [...roles];
  return { root: rootPk, actors: out };
}

// vendor/.bitgate-tree/packages/nostr/src/scopedLists.js
import { createAuthorityState } from "@bitgate/core";
var SCOPED_LIST_VERSION = "1";
var SCOPED_LIST_SCOPES = Object.freeze(["user-allow", "user-deny"]);
var MAX_SCOPED_LIST_ENTRIES = 2e3;
var MAX_SUBJECT_IDENTIFIER_BYTES = 512;
var SCOPED_LIST_REFUSALS = Object.freeze([
  "no_verifier",
  "not_an_event",
  "wrong_kind",
  "bad_d",
  "unsupported_version",
  "unsupported_scope",
  "bad_subject",
  "tag_mismatch",
  "wrong_signer",
  "content_not_empty",
  "too_many_entries",
  "from_the_future",
  "bad_signature"
]);
var MAX_FUTURE_SECONDS = 600;
var NAMESPACE = /^[a-z0-9][a-z0-9._-]{0,63}$/;
var KIND = /^(0|[1-9][0-9]{0,4})$/;
function utf8Length(value) {
  let bytes = 0;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 128) {
      bytes += 1;
    } else if (code < 2048) {
      bytes += 2;
    } else if (code >= 55296 && code <= 56319 && i + 1 < value.length) {
      const next = value.charCodeAt(i + 1);
      if (next >= 56320 && next <= 57343) {
        bytes += 4;
        i += 1;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
  }
  return bytes;
}
function isSubjectIdentifier(identifier) {
  if (typeof identifier !== "string" || identifier.length === 0) {
    return false;
  }
  if (/[\u0000-\u001f\u007f]/.test(identifier)) {
    return false;
  }
  return utf8Length(identifier) <= MAX_SUBJECT_IDENTIFIER_BYTES;
}
function parseSubjectCoordinate(coordinate) {
  if (typeof coordinate !== "string") {
    return null;
  }
  const first = coordinate.indexOf(":");
  const second = first < 0 ? -1 : coordinate.indexOf(":", first + 1);
  if (first < 1 || second < 0) {
    return null;
  }
  const kind = coordinate.slice(0, first);
  const pubkey = coordinate.slice(first + 1, second);
  const identifier = coordinate.slice(second + 1);
  if (!KIND.test(kind) || Number(kind) > 65535) {
    return null;
  }
  if (!isWireHex64(pubkey) || !isSubjectIdentifier(identifier)) {
    return null;
  }
  return { type: "address", kind, pubkey, identifier };
}
function formatSubjectCoordinate(subject) {
  return `${subject.kind}:${subject.pubkey}:${subject.identifier}`;
}
function scopedListIdentifier(namespace, scope, subject) {
  if (!NAMESPACE.test(namespace)) {
    throw new TypeError(`Invalid scoped-list namespace: ${JSON.stringify(namespace)}`);
  }
  if (!SCOPED_LIST_SCOPES.includes(scope)) {
    throw new TypeError(`Invalid scoped-list scope: ${JSON.stringify(scope)}`);
  }
  const coordinate = typeof subject === "string" ? subject : formatSubjectCoordinate(subject);
  if (!parseSubjectCoordinate(coordinate)) {
    throw new TypeError(`Invalid scoped-list subject: ${JSON.stringify(coordinate)}`);
  }
  return `${namespace}:governance:${scope}:v${SCOPED_LIST_VERSION}:${coordinate}`;
}
function parseScopedListIdentifier(identifier) {
  if (typeof identifier !== "string") {
    return { ok: false, reason: "bad_d" };
  }
  const match = /^([^:]*):governance:([^:]*):v([^:]*):([\s\S]*)$/.exec(identifier);
  if (!match || !NAMESPACE.test(match[1])) {
    return { ok: false, reason: "bad_d" };
  }
  const [, namespace, scope, version, coordinate] = match;
  if (version !== SCOPED_LIST_VERSION) {
    return { ok: false, reason: "unsupported_version" };
  }
  if (!SCOPED_LIST_SCOPES.includes(scope)) {
    return { ok: false, reason: "unsupported_scope" };
  }
  const subject = parseSubjectCoordinate(coordinate);
  if (!subject) {
    return { ok: false, reason: "bad_subject" };
  }
  return { ok: true, namespace, scope, version, coordinate, subject };
}
function encodeScopedList({ namespace, scope, subject, entries }) {
  const d = scopedListIdentifier(namespace, scope, subject);
  const coordinate = typeof subject === "string" ? subject : formatSubjectCoordinate(subject);
  const unique = Array.from(new Set(entries ?? []));
  for (const entry of unique) {
    if (!isWireHex64(entry)) {
      throw new TypeError(`Scoped-list entries must be 64 lowercase hex characters: ${JSON.stringify(entry)}`);
    }
  }
  if (unique.length > MAX_SCOPED_LIST_ENTRIES) {
    throw new RangeError(`A scoped list carries at most ${MAX_SCOPED_LIST_ENTRIES} entries, got ${unique.length}`);
  }
  unique.sort();
  return {
    kind: CANONICAL_KIND,
    content: "",
    tags: [
      ["d", d],
      ["v", SCOPED_LIST_VERSION],
      ["scope", scope],
      ["subject", coordinate],
      ["client", "bitgate"],
      ...unique.map((pubkey) => ["p", pubkey])
    ]
  };
}
function tagValues(event, name) {
  return getTags(event, name).map((tag) => tag[1]);
}
function isEventShape(event) {
  return !!event && typeof event === "object" && isWireHex64(event.id) && isWireHex64(event.pubkey) && typeof event.sig === "string" && /^[0-9a-f]{128}$/.test(event.sig) && Number.isInteger(event.kind) && Number.isInteger(event.created_at) && typeof event.content === "string" && Array.isArray(event.tags) && event.tags.every((tag) => Array.isArray(tag) && tag.length > 0 && tag.every((part) => typeof part === "string"));
}
var MAX_ROOT_KEYS = 4;
function rootKeys(subject, root) {
  if (root === void 0) {
    return [subject.pubkey];
  }
  const keys = typeof root === "string" ? [root] : root;
  if (!Array.isArray(keys) || keys.length === 0 || keys.length > MAX_ROOT_KEYS || !keys.every(isWireHex64)) {
    throw new TypeError(
      `root must be one 64-character lowercase hex pubkey, or a list of 1 to ${MAX_ROOT_KEYS} of them`
    );
  }
  return Array.from(new Set(keys));
}
function clock(now) {
  if (now === void 0) {
    return Math.floor(Date.now() / 1e3);
  }
  if (!Number.isInteger(now)) {
    throw new TypeError("now must be an integer number of unix seconds");
  }
  return now;
}
function decodeScopedList(event, { verify, root, now } = (
  /** @type {any} */
  {}
)) {
  if (typeof verify !== "function") {
    return { ok: false, reason: "no_verifier" };
  }
  const at = clock(now);
  if (!isEventShape(event)) {
    return { ok: false, reason: "not_an_event" };
  }
  const e = (
    /** @type {NostrEvent} */
    event
  );
  if (e.kind !== CANONICAL_KIND) {
    return { ok: false, reason: "wrong_kind" };
  }
  const ds = tagValues(e, "d");
  if (ds.length !== 1) {
    return { ok: false, reason: "bad_d" };
  }
  const parsed = parseScopedListIdentifier(ds[0]);
  if (!parsed.ok) {
    return parsed;
  }
  const versions = tagValues(e, "v");
  const scopes = tagValues(e, "scope");
  const subjects = tagValues(e, "subject");
  if (versions.length !== 1 || versions[0] !== parsed.version || scopes.length !== 1 || scopes[0] !== parsed.scope || subjects.length !== 1 || subjects[0] !== parsed.coordinate) {
    return { ok: false, reason: "tag_mismatch" };
  }
  if (!rootKeys(parsed.subject, root).includes(e.pubkey)) {
    return { ok: false, reason: "wrong_signer" };
  }
  if (e.content !== "") {
    return { ok: false, reason: "content_not_empty" };
  }
  const values = tagValues(e, "p");
  if (values.length > MAX_SCOPED_LIST_ENTRIES) {
    return { ok: false, reason: "too_many_entries" };
  }
  if (e.created_at > at + MAX_FUTURE_SECONDS) {
    return { ok: false, reason: "from_the_future" };
  }
  let verified = false;
  try {
    verified = verify(e) === true;
  } catch {
    verified = false;
  }
  if (!verified) {
    return { ok: false, reason: "bad_signature" };
  }
  const entries = /* @__PURE__ */ new Set();
  let skipped = 0;
  for (const value of values) {
    if (isWireHex64(value)) {
      entries.add(value);
    } else {
      skipped += 1;
    }
  }
  return {
    ok: true,
    namespace: parsed.namespace,
    scope: (
      /** @type {"user-allow"|"user-deny"} */
      parsed.scope
    ),
    subject: parsed.subject,
    signer: e.pubkey,
    eventId: e.id,
    createdAt: e.created_at,
    entries: Array.from(entries).sort(),
    skipped
  };
}
function resolveScopedList(events, { namespace, scope, subject, verify, root, now }) {
  if (typeof verify !== "function") {
    return { ok: false, reason: "no_verifier", futureDated: [] };
  }
  const at = clock(now);
  const d = scopedListIdentifier(namespace, scope, subject);
  const parsed = parseScopedListIdentifier(d);
  if (!parsed.ok) {
    return { ...parsed, futureDated: [] };
  }
  const keys = rootKeys(parsed.subject, root);
  const candidates = [];
  const futureDated = /* @__PURE__ */ new Set();
  for (const event of Array.isArray(events) ? events : []) {
    if (!isEventShape(event)) {
      continue;
    }
    const e = (
      /** @type {NostrEvent} */
      event
    );
    if (e.kind !== CANONICAL_KIND || !keys.includes(e.pubkey)) {
      continue;
    }
    const ds = tagValues(e, "d");
    if (ds.length !== 1 || ds[0] !== d) {
      continue;
    }
    let verified = false;
    try {
      verified = verify(e) === true;
    } catch {
      verified = false;
    }
    if (!verified) {
      continue;
    }
    if (e.created_at > at + MAX_FUTURE_SECONDS) {
      futureDated.add(e.id);
      continue;
    }
    candidates.push(e);
  }
  const note = { futureDated: Array.from(futureDated).sort() };
  const latest = selectLatest(candidates);
  if (!latest) {
    return { ok: false, reason: "not_found", ...note };
  }
  return { ...decodeScopedList(latest, { verify, root: keys, now: at }), ...note };
}
function scopedListAuthority(subject, root) {
  const target = typeof subject === "string" ? parseSubjectCoordinate(subject) : subject;
  if (!target || !parseSubjectCoordinate(formatSubjectCoordinate(target))) {
    throw new TypeError(`Invalid scoped-list subject: ${JSON.stringify(subject)}`);
  }
  const keys = rootKeys(target, root);
  return createAuthorityState({
    root: keys[0],
    actors: Object.fromEntries(keys.map((key) => [key, ["super_admin"]])),
    protectedActors: keys
  });
}
function scopedListToContribution(list) {
  return {
    actor: list.signer,
    kind: list.scope,
    targets: list.entries.map((pubkey) => ({ type: "user", pubkey })),
    createdAt: list.createdAt
  };
}

// vendor/.bitgate-tree/packages/nostr/src/curationSets.js
var CURATION_SET_KIND = 30004;
var NSWP_WORLD_KIND = 37300;
var CURATION_SET_LIMITS = Object.freeze({
  entries: 200,
  titleChars: 200,
  descriptionChars: 1e3,
  dChars: 128,
  ahead: 600
});
var HEX64 = /^[0-9a-f]{64}$/;
var COORDINATE = /^(\d+):([0-9a-f]{64}):(.*)$/s;
function firstValue(tags, name) {
  return tags.find((tag) => tag[0] === name)?.[1];
}
function isSignedShape(event) {
  return !!event && typeof event === "object" && Number.isInteger(event.kind) && event.kind >= 0 && Number.isInteger(event.created_at) && typeof event.content === "string" && Array.isArray(event.tags) && event.tags.every((tag) => Array.isArray(tag) && tag.every((part) => typeof part === "string")) && HEX64.test(event.id ?? "") && HEX64.test(event.pubkey ?? "") && /^[0-9a-f]{128}$/.test(event.sig ?? "");
}
function parseCurationSet(input, { requireSigned = false, addressKind = NSWP_WORLD_KIND } = {}) {
  const errors = /* @__PURE__ */ new Set();
  const warnings = /* @__PURE__ */ new Set();
  const done = (list2) => ({
    valid: errors.size === 0,
    errors: Array.from(errors).sort(),
    warnings: Array.from(warnings).sort(),
    list: errors.size === 0 ? list2 : null
  });
  if (typeof input !== "object" || input === null) {
    errors.add("not_an_event");
    return done(null);
  }
  const e = (
    /** @type {any} */
    input
  );
  if (e.kind !== CURATION_SET_KIND) {
    errors.add("wrong_kind");
  }
  if (!Array.isArray(e.tags) || !e.tags.every((tag) => Array.isArray(tag) && tag.every((part) => typeof part === "string"))) {
    errors.add("invalid_tags");
    return done(null);
  }
  if (!Number.isInteger(e.created_at)) {
    errors.add("invalid_created_at");
  }
  if (requireSigned && !isSignedShape(e)) {
    errors.add("not_signed");
  }
  const pubkey = typeof e.pubkey === "string" && HEX64.test(e.pubkey) ? e.pubkey : void 0;
  if (e.pubkey !== void 0 && !pubkey) {
    errors.add("invalid_pubkey");
  }
  const tags = e.tags;
  const d = firstValue(tags, "d");
  if (d === void 0) {
    errors.add("missing_tag");
  } else if (d.length > CURATION_SET_LIMITS.dChars) {
    errors.add("value_too_long");
  }
  let title = firstValue(tags, "title") ?? "";
  if (title.length > CURATION_SET_LIMITS.titleChars) {
    warnings.add("value_too_long");
    title = title.slice(0, CURATION_SET_LIMITS.titleChars);
  }
  let description = firstValue(tags, "description") ?? "";
  if (description.length > CURATION_SET_LIMITS.descriptionChars) {
    warnings.add("value_too_long");
    description = description.slice(0, CURATION_SET_LIMITS.descriptionChars);
  }
  const coordinates = [];
  const targets = [];
  for (const tag of tags) {
    if (tag[0] !== "a") {
      continue;
    }
    const match = tag[1] ? COORDINATE.exec(tag[1]) : null;
    if (!match || Number(match[1]) !== addressKind || match[3] === "") {
      continue;
    }
    const kind = String(Number(match[1]));
    const coordinate = `${kind}:${match[2]}:${match[3]}`;
    if (coordinates.includes(coordinate)) {
      continue;
    }
    if (coordinates.length === CURATION_SET_LIMITS.entries) {
      warnings.add("too_many_worlds");
      break;
    }
    coordinates.push(coordinate);
    targets.push({ type: "address", kind, pubkey: match[2], identifier: match[3] });
  }
  const list = {
    d: d ?? "",
    title: title || (d ?? ""),
    description,
    coordinates,
    targets,
    createdAt: Number.isInteger(e.created_at) ? e.created_at : 0
  };
  if (pubkey) {
    list.pubkey = pubkey;
    if (d !== void 0) {
      list.coordinate = `${CURATION_SET_KIND}:${pubkey}:${d}`;
    }
  }
  return done(list);
}
function readCurationSet(event, { verify, addressKind } = (
  /** @type {any} */
  {}
)) {
  if (typeof verify !== "function") {
    return { ok: false, reason: "no_verifier" };
  }
  const parsed = parseCurationSet(event, { requireSigned: true, addressKind });
  if (!parsed.valid || !parsed.list) {
    return { ok: false, reason: "invalid", errors: parsed.errors };
  }
  let verified = false;
  try {
    verified = verify(
      /** @type {NostrEvent} */
      event
    ) === true;
  } catch {
    verified = false;
  }
  if (!verified) {
    return { ok: false, reason: "bad_signature" };
  }
  return {
    ok: true,
    id: (
      /** @type {NostrEvent} */
      event.id
    ),
    list: (
      /** @type {CurationSet & { pubkey: string, coordinate: string }} */
      parsed.list
    ),
    warnings: parsed.warnings
  };
}
function resolveCurationSet(events, { coordinate, pubkey, d, verify, now, addressKind }) {
  if (typeof verify !== "function") {
    return { ok: false, reason: "no_verifier", futureDated: [] };
  }
  if (coordinate !== void 0) {
    const match = typeof coordinate === "string" ? /^(\d+):([0-9a-f]{64}):(.*)$/s.exec(coordinate) : null;
    if (!match || Number(match[1]) !== CURATION_SET_KIND) {
      throw new TypeError(`Not a list coordinate (30004:<pubkey>:<d>): ${JSON.stringify(coordinate)}`);
    }
    pubkey = match[2];
    d = match[3];
  }
  if (typeof pubkey !== "string" || !HEX64.test(pubkey) || typeof d !== "string") {
    throw new TypeError("resolveCurationSet needs the list's coordinate, or the curator's pubkey (64 lowercase hex) and d");
  }
  if (now !== void 0 && !Number.isInteger(now)) {
    throw new TypeError("now must be an integer number of unix seconds");
  }
  const at = now ?? Math.floor(Date.now() / 1e3);
  const candidates = [];
  const futureDated = [];
  const seen = /* @__PURE__ */ new Set();
  for (const event of Array.isArray(events) ? events : []) {
    if (!isSignedShape(event)) {
      continue;
    }
    const e = (
      /** @type {NostrEvent} */
      event
    );
    if (e.kind !== CURATION_SET_KIND || e.pubkey !== pubkey || seen.has(e.id)) {
      continue;
    }
    const ds = e.tags.filter((tag) => tag[0] === "d");
    if (ds.length !== 1 || ds[0][1] !== d) {
      continue;
    }
    let signed = false;
    try {
      signed = verify(e) === true;
    } catch {
      signed = false;
    }
    if (!signed) {
      continue;
    }
    seen.add(e.id);
    if (e.created_at > at + CURATION_SET_LIMITS.ahead) {
      futureDated.push(e.id);
    } else {
      candidates.push(e);
    }
  }
  const latest = selectLatest(candidates);
  if (!latest) {
    return { ok: false, reason: "not_found", futureDated };
  }
  return { ...readCurationSet(latest, { verify, addressKind }), futureDated };
}
function curationSetToContribution(list, { kind = "address-allow" } = {}) {
  if (kind !== "address-allow" && kind !== "address-deny") {
    throw new TypeError(`A curation set contributes address-allow or address-deny, not ${JSON.stringify(kind)}`);
  }
  return {
    actor: list.pubkey,
    kind,
    targets: list.targets.map((target) => ({ ...target })),
    createdAt: list.createdAt
  };
}

// vendor/.bitgate-tree/packages/nostr/src/namedLists.js
import { DEFAULT_ROLE_CAPABILITIES } from "@bitgate/core";
var NAMED_LISTS = Object.freeze({
  sellers: Object.freeze({
    namespace: "bitunlock.sellers",
    scope: "user-allow",
    answers: "May this key sell?"
  }),
  payees: Object.freeze({
    namespace: "bitunlock.payees",
    scope: "user-allow",
    answers: "May this key be paid a share of a sale?"
  }),
  "listings-allowed": Object.freeze({
    namespace: "bitunlock.listings",
    scope: "address-allow",
    answers: "Is this listing on the curated list? (Read only while listings are curated.)"
  }),
  "listings-blocked": Object.freeze({
    namespace: "bitunlock.listings",
    scope: "address-deny",
    answers: "Is this listing blocked from sale?"
  }),
  "people-blocked": Object.freeze({
    namespace: "bitunlock.people",
    scope: "user-deny",
    answers: "Is this person blocked from selling and from being paid?"
  })
});
var NAMED_DECISIONS = Object.freeze({
  "may-sell": Object.freeze(["sellers", "people-blocked"]),
  "may-be-paid": Object.freeze(["payees", "people-blocked"]),
  "may-sell-listing": Object.freeze(["listings-blocked", "people-blocked"]),
  "may-sell-listing-curated": Object.freeze(["listings-allowed", "listings-blocked", "people-blocked"])
});
var NAMED_LIST_ROLES = Object.freeze({
  ...DEFAULT_ROLE_CAPABILITIES,
  "list-curator": Object.freeze(
    /** @type {import('@bitgate/core').GovernanceCapability[]} */
    [
      "contribute-user-allow",
      "contribute-user-deny",
      "contribute-address-allow",
      "contribute-address-deny"
    ]
  )
});
function namedListIdentifier(name) {
  const definition = Object.hasOwn(NAMED_LISTS, name) ? NAMED_LISTS[name] : void 0;
  if (!definition) {
    throw new TypeError(`Not a named list: ${JSON.stringify(name)}`);
  }
  return canonicalIdentifier(definition.namespace, definition.scope);
}
var LISTING_COORDINATE = /^30078:([0-9a-f]{64}):([^:\r\n][^\r\n]{0,255})$/;
function parseListingCoordinate(value) {
  const match = typeof value === "string" ? LISTING_COORDINATE.exec(value) : null;
  return match ? { type: "address", kind: "30078", pubkey: match[1], identifier: match[2] } : null;
}
var NAME_BY_D = new Map(Object.keys(NAMED_LISTS).map((name) => [namedListIdentifier(name), name]));
function namedListOf(event) {
  if (!event || typeof event !== "object" || /** @type {any} */
  event.kind !== CANONICAL_KIND) {
    return null;
  }
  const ds = getTags(
    /** @type {NostrEvent} */
    event,
    "d"
  );
  if (ds.length !== 1) {
    return null;
  }
  return NAME_BY_D.get(ds[0][1]) ?? null;
}
function encodeNamedList(name, targets) {
  const definition = NAMED_LISTS[name];
  namedListIdentifier(name);
  return encodeContribution({ actor: "", kind: definition.scope, targets }, definition.namespace);
}
function readNamedList(event, { verify } = (
  /** @type {any} */
  {}
)) {
  if (typeof verify !== "function") {
    return { ok: false, reason: "no_verifier" };
  }
  const name = namedListOf(event);
  if (!name) {
    return { ok: false, reason: "not_a_named_list" };
  }
  const contribution = decodeContribution(
    /** @type {NostrEvent} */
    event
  );
  if (!contribution || contribution.kind !== NAMED_LISTS[name].scope) {
    return { ok: false, reason: "invalid" };
  }
  let verified = false;
  try {
    verified = verify(
      /** @type {NostrEvent} */
      event
    ) === true;
  } catch {
    verified = false;
  }
  if (!verified) {
    return { ok: false, reason: "bad_signature" };
  }
  const definition = NAMED_LISTS[name];
  const isListingList = definition.scope === "address-allow" || definition.scope === "address-deny";
  const tagName = isListingList ? "a" : "p";
  const values = getTags(
    /** @type {NostrEvent} */
    event,
    tagName
  ).map((tag) => tag[1]);
  const targets = /* @__PURE__ */ new Map();
  let skipped = 0;
  for (const value of values) {
    const target = isListingList ? parseListingCoordinate(value) : typeof value === "string" && /^[0-9a-f]{64}$/.test(value) ? (
      /** @type {GovernanceTarget} */
      { type: "user", pubkey: value }
    ) : null;
    if (target) {
      targets.set(String(value), target);
    } else {
      skipped += 1;
    }
  }
  return { ok: true, name, contribution: { ...contribution, targets: Array.from(targets.values()) }, skipped };
}
function contributionsForDecision(decision, lists) {
  const names = Object.hasOwn(NAMED_DECISIONS, decision) ? NAMED_DECISIONS[decision] : void 0;
  if (!names) {
    throw new TypeError(`Not a named decision: ${JSON.stringify(decision)}`);
  }
  return lists.filter((list) => names.includes(list.name)).map((list) => list.contribution);
}

// vendor/.bitgate-tree/packages/nostr/src/verified.js
function requireVerifier(verify, reader) {
  if (typeof verify !== "function") {
    throw new TypeError(
      `${reader} needs a signature check: pass { verify } (verifyEvent from @bitgate/verify, or your own NIP-01 check). There is no unverified mode.`
    );
  }
}
function keepVerified(events, verify) {
  requireVerifier(verify, "keepVerified");
  const kept = [];
  let unverified = 0;
  for (const event of Array.isArray(events) ? events : []) {
    let ok = false;
    try {
      ok = verify(
        /** @type {NostrEvent} */
        event
      ) === true;
    } catch {
      ok = false;
    }
    if (ok) {
      kept.push(
        /** @type {NostrEvent} */
        event
      );
    } else {
      unverified += 1;
    }
  }
  return { events: kept, dropped: { unverified } };
}
function readLabelContributions(events, { verify, ...mapping } = (
  /** @type {any} */
  {}
)) {
  requireVerifier(verify, "readLabelContributions");
  const { events: trusted, dropped } = keepVerified(events, verify);
  const labels = trusted.flatMap((event) => decodeLabels(event));
  return { contributions: labelsToContributions(labels, mapping), dropped };
}
function readContributionLists(events, { verify, namespace } = (
  /** @type {any} */
  {}
)) {
  requireVerifier(verify, "readContributionLists");
  const { events: trusted, dropped } = keepVerified(events, verify);
  const lists = trusted.filter((event) => isCanonicalGovernanceEvent(event, namespace));
  const contributions = [];
  for (const event of selectReplaceable(lists).values()) {
    const contribution = decodeContribution(event);
    if (contribution) {
      contributions.push(contribution);
    }
  }
  return { contributions, dropped };
}
function resolveVerifiedRoster(events, { verify, ...options } = (
  /** @type {any} */
  {}
)) {
  requireVerifier(verify, "resolveVerifiedRoster");
  const { events: trusted, dropped } = keepVerified(events, verify);
  return { ...resolveAuthorityRoster(trusted, options), dropped };
}
export {
  CANONICAL_KIND,
  CANONICAL_VERSION,
  CONTACT_LIST_KIND,
  CURATION_SET_KIND,
  CURATION_SET_LIMITS,
  LABEL_KIND,
  LEGACY_COMMUNITY_SOURCES_IDENTIFIER,
  LEGACY_EDITORS_IDENTIFIER,
  LEGACY_IDENTIFIERS,
  LEGACY_KIND,
  LISTING_COORDINATE,
  MAX_FUTURE_SECONDS,
  MAX_POLICY_BYTES,
  MAX_ROOT_KEYS,
  MAX_SCOPED_LIST_ENTRIES,
  MAX_SUBJECT_IDENTIFIER_BYTES,
  MUTE_LIST_KIND,
  NAMED_DECISIONS,
  NAMED_LISTS,
  NAMED_LIST_ROLES,
  NSWP_WORLD_KIND,
  RELAY_LIST_KIND,
  REPORT_KIND,
  ROLE_SET_KIND,
  SCOPED_LIST_REFUSALS,
  SCOPED_LIST_SCOPES,
  SCOPED_LIST_VERSION,
  bech32Decode,
  canonicalIdentifier,
  contributionToLabel,
  contributionsForDecision,
  convertBits,
  coordinateOf,
  curationSetToContribution,
  decodeAddressCoordinate,
  decodeContactList,
  decodeContribution,
  decodeLabels,
  decodeLegacyCommunitySources,
  decodeLegacyEditors,
  decodeLegacyList,
  decodeMixedContributions,
  decodeMuteList,
  decodeNote,
  decodeNpub,
  decodePolicy,
  decodePrivateMuteEntries,
  decodeRelayList,
  decodeReport,
  decodeRoles,
  decodeScopedList,
  encodeAddressCoordinate,
  encodeContactList,
  encodeContribution,
  encodeLabel,
  encodeMuteList,
  encodeNamedList,
  encodeRelayList,
  encodeReport,
  encodeRoles,
  encodeScopedList,
  extractMuteCategory,
  extractReportType,
  formatSubjectCoordinate,
  getTagValue,
  getTags,
  groupAuthorsByWriteRelay,
  isCanonicalGovernanceEvent,
  isLegacyAdminEvent,
  isRelayHint,
  isSubjectIdentifier,
  isWireHex64,
  keepVerified,
  labelTargets,
  labelsToContributions,
  namedListIdentifier,
  namedListOf,
  normalizeCategory,
  normalizeEventIdInput,
  normalizePubkeyInput,
  normalizeRelayUrl,
  parseCurationSet,
  parseIdentifier,
  parseListingCoordinate,
  parseScopedListIdentifier,
  parseSubjectCoordinate,
  readContributionLists,
  readCurationSet,
  readLabelContributions,
  readNamedList,
  resolveAuthorityRoster,
  resolveCurationSet,
  resolveScopedList,
  resolveVerifiedRoster,
  scopedListAuthority,
  scopedListIdentifier,
  scopedListToContribution,
  selectLatest,
  selectReplaceable,
  toMuteRecords,
  verifyEvents
};
