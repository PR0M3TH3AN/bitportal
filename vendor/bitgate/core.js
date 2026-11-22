// vendor/.bitgate-tree/packages/core/src/identifiers.js
function normalizePubkey(pubkey) {
  if (typeof pubkey !== "string") return "";
  const trimmed = pubkey.trim();
  if (!trimmed) return "";
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  try {
    return "";
  } catch (error) {
    return "";
  }
}
function normalizeEventId(id) {
  if (typeof id !== "string") return "";
  const trimmed = id.trim();
  if (!trimmed) return "";
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  try {
    return "";
  } catch (error) {
    return "";
  }
}
function normalizeAddress(kind, pubkey, identifier) {
  const kindStr = String(kind).trim();
  if (!kindStr) return null;
  const normalizedPubkey = normalizePubkey(pubkey);
  if (!normalizedPubkey) return null;
  const identifierStr = String(identifier).trim();
  if (!identifierStr) return null;
  return {
    type: "address",
    kind: kindStr,
    pubkey: normalizedPubkey,
    identifier: identifierStr
  };
}
function createUserTarget(pubkey) {
  const normalizedPubkey = normalizePubkey(pubkey);
  if (!normalizedPubkey) return null;
  return {
    type: "user",
    pubkey: normalizedPubkey
  };
}
function createEventTarget(id, options = {}) {
  const normalizedId = normalizeEventId(id);
  if (!normalizedId) return null;
  const target = {
    type: "event",
    id: normalizedId
  };
  const author = normalizePubkey(options.author ?? "");
  if (author) {
    target.author = author;
  }
  if (Number.isFinite(options.kind)) {
    target.kind = /** @type {number} */
    options.kind;
  }
  return target;
}
function getTargetKey(target) {
  function isUserTarget(t) {
    return t && typeof t === "object" && t.type === "user";
  }
  function isEventTarget(t) {
    return t && typeof t === "object" && t.type === "event";
  }
  function isAddressTarget(t) {
    return t && typeof t === "object" && t.type === "address";
  }
  if (isUserTarget(target)) {
    return `user:${target.pubkey}`;
  } else if (isEventTarget(target)) {
    return `event:${target.id}`;
  } else if (isAddressTarget(target)) {
    return `address:${target.kind}:${target.pubkey}:${target.identifier}`;
  } else {
    throw new Error(`Unknown target type: ${JSON.stringify(target)}`);
  }
}

// vendor/.bitgate-tree/packages/core/src/targets.js
function areTargetsEqual(a, b) {
  return getTargetKey(a) === getTargetKey(b);
}
function isValidTarget(target) {
  if (!target || typeof target !== "object") return false;
  switch (target.type) {
    case "user":
      return typeof target.pubkey === "string" && /^[0-9a-f]{64}$/i.test(target.pubkey);
    case "event":
      return typeof target.id === "string" && /^[0-9a-f]{64}$/i.test(target.id);
    case "address":
      return typeof target.kind === "string" && typeof target.pubkey === "string" && /^[0-9a-f]{64}$/i.test(target.pubkey) && typeof target.identifier === "string";
    default:
      return false;
  }
}
function createTarget(input) {
  if (input === null || input === void 0) {
    return null;
  }
  if (isValidTarget(input)) {
    return input;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (/^[0-9a-f]{64}$/i.test(trimmed)) {
      const userTarget = createUserTarget(trimmed);
      if (userTarget) return userTarget;
      const eventTarget = createEventTarget(trimmed);
      if (eventTarget) return eventTarget;
      return null;
    }
    try {
      return null;
    } catch (error) {
      return null;
    }
  }
  if (typeof input === "object") {
    if (!input.type) {
      return null;
    }
    switch (input.type) {
      case "user":
        return createUserTarget(
          /** @type {string} */
          input.pubkey
        );
      case "event":
        return createEventTarget(
          /** @type {string} */
          input.id,
          {
            author: (
              /** @type {string|undefined} */
              input.author
            ),
            kind: typeof input.kind === "number" ? input.kind : void 0
          }
        );
      case "address":
        return normalizeAddress(
          /** @type {string|number} */
          input.kind,
          /** @type {string} */
          input.pubkey,
          /** @type {string} */
          input.identifier
        );
      default:
        return null;
    }
  }
  return null;
}
function getParentTarget(target, authorPubkey) {
  switch (target.type) {
    case "user":
      return null;
    case "event": {
      const author = authorPubkey ?? target.author;
      if (!author) {
        throw new Error("authorPubkey is required for event targets");
      }
      return createUserTarget(author);
    }
    case "address":
      return createUserTarget(target.pubkey);
    default:
      return null;
  }
}
function isDescendantOf(target, ancestor, eventAuthorPubkey) {
  if (areTargetsEqual(target, ancestor)) {
    return false;
  }
  const parent = getParentTarget(target, eventAuthorPubkey);
  if (!parent) {
    return false;
  }
  if (areTargetsEqual(parent, ancestor)) {
    return true;
  }
  return isDescendantOf(parent, ancestor, eventAuthorPubkey);
}

// vendor/.bitgate-tree/packages/core/src/authority.js
var GOVERNANCE_CAPABILITIES = Object.freeze([
  "manage-roles",
  "manage-policy",
  "manage-community-sources",
  "contribute-user-allow",
  "contribute-event-allow",
  "contribute-address-allow",
  "contribute-user-deny",
  "contribute-event-deny",
  "contribute-address-deny",
  "contribute-trust-seed",
  "review-evidence"
]);
var CAPABILITY_SET = new Set(GOVERNANCE_CAPABILITIES);
var bundle = (capabilities) => Object.freeze(capabilities);
var DEFAULT_ROLE_CAPABILITIES = Object.freeze({
  super_admin: bundle([
    "manage-roles",
    "manage-policy",
    "manage-community-sources",
    "contribute-user-allow",
    "contribute-event-allow",
    "contribute-address-allow",
    "contribute-user-deny",
    "contribute-event-deny",
    "contribute-address-deny",
    "contribute-trust-seed",
    "review-evidence"
  ]),
  moderator: bundle([
    "contribute-user-deny",
    "contribute-event-deny",
    "contribute-address-deny",
    "contribute-trust-seed",
    "review-evidence"
  ]),
  curator: bundle(["contribute-user-deny"]),
  reviewer: bundle(["review-evidence"])
});
function isGovernanceCapability(value) {
  return typeof value === "string" && CAPABILITY_SET.has(
    /** @type {GovernanceCapability} */
    value
  );
}
function createAuthorityState(options = {}) {
  const roles = /* @__PURE__ */ Object.create(null);
  for (const [name, capabilities] of Object.entries(options.roles ?? DEFAULT_ROLE_CAPABILITIES)) {
    const trimmed = name.trim();
    if (!trimmed) {
      continue;
    }
    roles[trimmed] = Object.freeze(
      (Array.isArray(capabilities) ? capabilities : []).filter(isGovernanceCapability)
    );
  }
  const actors = /* @__PURE__ */ Object.create(null);
  for (const [pubkey, roleNames] of Object.entries(options.actors ?? {})) {
    const normalized = normalizePubkey(pubkey);
    if (!normalized) {
      continue;
    }
    const names = (Array.isArray(roleNames) ? roleNames : []).filter((name) => typeof name === "string" && name.trim()).map((name) => name.trim());
    if (names.length) {
      actors[normalized] = Array.from(new Set(names));
    }
  }
  const root = options.root ? normalizePubkey(options.root) : "";
  const protectedActors = new Set(
    (options.protectedActors ?? []).map((pubkey) => normalizePubkey(pubkey)).filter(Boolean)
  );
  if (root) {
    protectedActors.add(root);
  }
  const state = {
    roles,
    actors,
    protectedActors: Array.from(protectedActors).sort()
  };
  if (root) {
    state.root = root;
  }
  return state;
}
function getActorRoles(pubkey, authority) {
  const normalized = normalizePubkey(pubkey);
  if (!normalized) {
    return [];
  }
  return [...authority.actors[normalized] ?? []];
}
function getActorCapabilities(pubkey, authority) {
  const normalized = normalizePubkey(pubkey);
  if (!normalized) {
    return [];
  }
  if (authority.root && normalized === authority.root) {
    return [...GOVERNANCE_CAPABILITIES];
  }
  const capabilities = /* @__PURE__ */ new Set();
  for (const roleName of authority.actors[normalized] ?? []) {
    const granted = Object.hasOwn(authority.roles, roleName) ? authority.roles[roleName] : [];
    for (const capability of granted) {
      capabilities.add(capability);
    }
  }
  return Array.from(capabilities);
}
function hasCapability(pubkey, capability, authority) {
  if (!isGovernanceCapability(capability)) {
    return false;
  }
  return getActorCapabilities(pubkey, authority).includes(capability);
}
function hasRole(pubkey, roleName, authority) {
  return getActorRoles(pubkey, authority).includes(roleName);
}
function isProtectedActor(pubkey, authority) {
  const normalized = normalizePubkey(pubkey);
  if (!normalized) {
    return false;
  }
  return authority.protectedActors.includes(normalized);
}
function createRoleDefinition(name, capabilities) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Role name must be a non-empty string");
  }
  if (!Array.isArray(capabilities)) {
    throw new Error("Role capabilities must be an array");
  }
  for (const capability of capabilities) {
    if (!isGovernanceCapability(capability)) {
      throw new Error(`Unknown governance capability: ${String(capability)}`);
    }
  }
  return { name: name.trim(), capabilities: [...new Set(capabilities)] };
}

// vendor/.bitgate-tree/packages/core/src/adminState.js
var KIND_CAPABILITY = {
  "user-allow": "contribute-user-allow",
  "user-deny": "contribute-user-deny",
  "event-allow": "contribute-event-allow",
  "event-deny": "contribute-event-deny",
  "address-allow": "contribute-address-allow",
  "address-deny": "contribute-address-deny",
  "trust-seed": "contribute-trust-seed"
};
var KIND_TARGET_TYPE = {
  "user-allow": "user",
  "user-deny": "user",
  "event-allow": "event",
  "event-deny": "event",
  "address-allow": "address",
  "address-deny": "address",
  "trust-seed": "user"
};
function createEmptyAdminState() {
  return {
    userAllow: /* @__PURE__ */ new Set(),
    userDeny: /* @__PURE__ */ new Set(),
    eventDeny: /* @__PURE__ */ new Set(),
    addressDeny: /* @__PURE__ */ new Set(),
    eventAllow: /* @__PURE__ */ new Set(),
    addressAllow: /* @__PURE__ */ new Set(),
    trustSeeds: /* @__PURE__ */ new Set(),
    contributors: /* @__PURE__ */ new Map(),
    communitySources: /* @__PURE__ */ new Map()
  };
}
function reduceAdminState(contributions, authority) {
  const state = createEmptyAdminState();
  if (!Array.isArray(contributions)) {
    return state;
  }
  for (const contribution of contributions) {
    if (!contribution || typeof contribution !== "object") {
      continue;
    }
    const capability = Object.hasOwn(KIND_CAPABILITY, contribution.kind) ? KIND_CAPABILITY[contribution.kind] : void 0;
    if (!capability) {
      continue;
    }
    if (!hasCapability(contribution.actor, capability, authority)) {
      continue;
    }
    const expectedType = KIND_TARGET_TYPE[contribution.kind];
    const targets = Array.isArray(contribution.targets) ? contribution.targets : [];
    for (const target of targets) {
      if (!target || target.type !== expectedType || !isValidTarget(target)) {
        continue;
      }
      let key;
      try {
        key = getTargetKey(target);
      } catch {
        continue;
      }
      switch (contribution.kind) {
        case "user-allow":
          state.userAllow.add(key);
          break;
        case "user-deny":
          state.userDeny.add(key);
          break;
        case "event-allow":
          state.eventAllow.add(key);
          break;
        case "event-deny":
          state.eventDeny.add(key);
          break;
        case "address-allow":
          state.addressAllow.add(key);
          break;
        case "address-deny":
          state.addressDeny.add(key);
          break;
        case "trust-seed":
          state.trustSeeds.add(
            /** @type {{ pubkey: string }} */
            target.pubkey
          );
          break;
      }
      if (contribution.kind !== "trust-seed") {
        const existing = state.contributors.get(key) ?? [];
        if (!existing.includes(contribution.actor)) {
          existing.push(contribution.actor);
        }
        state.contributors.set(key, existing);
        if (typeof contribution.source === "string" && contribution.source.trim()) {
          const sources = state.communitySources.get(key) ?? [];
          if (!sources.includes(contribution.source)) {
            sources.push(contribution.source);
          }
          state.communitySources.set(key, sources);
        }
      }
    }
  }
  protectActors(state, authority);
  return state;
}
function protectActors(state, authority) {
  for (const pubkey of authority.protectedActors) {
    const key = `user:${pubkey}`;
    state.userDeny.delete(key);
    state.contributors.delete(key);
    state.communitySources.delete(key);
  }
  return state;
}
function mergeCommunitySource(state, contribution, authority) {
  const merged = reduceAdminState([contribution], authority);
  for (const key of merged.userDeny) {
    state.userDeny.add(key);
    const contributors = state.contributors.get(key) ?? [];
    for (const actor of merged.contributors.get(key) ?? []) {
      if (!contributors.includes(actor)) {
        contributors.push(actor);
      }
    }
    state.contributors.set(key, contributors);
    const sources = state.communitySources.get(key) ?? [];
    for (const source of merged.communitySources.get(key) ?? []) {
      if (!sources.includes(source)) {
        sources.push(source);
      }
    }
    if (sources.length) {
      state.communitySources.set(key, sources);
    }
  }
  return protectActors(state, authority);
}
function isDenied(target, state) {
  const key = getTargetKey(target);
  switch (target.type) {
    case "user":
      return state.userDeny.has(key);
    case "event":
      return state.eventDeny.has(key);
    case "address":
      return state.addressDeny.has(key);
    default:
      return false;
  }
}
function isAllowed(target, state) {
  const key = getTargetKey(target);
  switch (target.type) {
    case "user":
      return state.userAllow.has(key);
    case "event":
      return state.eventAllow?.has(key) ?? false;
    case "address":
      return state.addressAllow?.has(key) ?? false;
    default:
      return false;
  }
}
function serializeAdminState(state) {
  return {
    userAllow: Array.from(state.userAllow).sort(),
    userDeny: Array.from(state.userDeny).sort(),
    eventAllow: Array.from(state.eventAllow ?? []).sort(),
    eventDeny: Array.from(state.eventDeny).sort(),
    addressAllow: Array.from(state.addressAllow ?? []).sort(),
    addressDeny: Array.from(state.addressDeny).sort(),
    trustSeeds: Array.from(state.trustSeeds).sort()
  };
}

// vendor/.bitgate-tree/packages/core/src/reasons.js
var REASON_IDS = Object.freeze([
  "viewer-block",
  "viewer-mute",
  "viewer-override",
  "admin-user-deny",
  "admin-event-deny",
  "admin-address-deny",
  "community-user-deny",
  "trusted-report",
  "trusted-report-threshold",
  "trusted-mute",
  "trusted-mute-threshold",
  "allowlist-miss",
  "protected-target",
  "surface-policy-bypass",
  "policy-disabled"
]);
var REASON_ID_SET = new Set(REASON_IDS);
function isReasonId(value) {
  return typeof value === "string" && REASON_ID_SET.has(
    /** @type {ReasonId} */
    value
  );
}
function createReason(id, detail = {}) {
  if (!isReasonId(id)) {
    throw new Error(`Unknown reason identifier: ${String(id)}`);
  }
  const reason = { id };
  if (typeof detail.category === "string" && detail.category.trim()) {
    reason.category = detail.category.trim();
  }
  if (Number.isFinite(detail.count)) {
    reason.count = /** @type {number} */
    detail.count;
  }
  if (Number.isFinite(detail.threshold)) {
    reason.threshold = /** @type {number} */
    detail.threshold;
  }
  if (typeof detail.source === "string" && detail.source.trim()) {
    reason.source = detail.source.trim();
  }
  return reason;
}
function dedupeReasons(reasons) {
  const byKey = /* @__PURE__ */ new Map();
  for (const reason of reasons) {
    if (!reason || !isReasonId(reason.id)) {
      continue;
    }
    const key = `${reason.id}|${reason.category ?? ""}|${reason.threshold ?? ""}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...reason });
      continue;
    }
    if (Number.isFinite(reason.count)) {
      const nextCount = (
        /** @type {number} */
        reason.count
      );
      if (!Number.isFinite(existing.count) || nextCount > /** @type {number} */
      existing.count) {
        existing.count = nextCount;
      }
    }
  }
  return Array.from(byKey.values());
}

// vendor/.bitgate-tree/packages/core/src/evidence.js
function createEmptyEvidence() {
  return {
    trustedReportTotal: 0,
    // Null prototype throughout: categories originate in report and mute
    // events, so a "__proto__" key on a normal object literal would be
    // silently discarded while still counting toward the total.
    trustedReportsByCategory: /* @__PURE__ */ Object.create(null),
    trustedReporterPubkeys: [],
    trustedMuteTotal: 0,
    trustedMutesByCategory: /* @__PURE__ */ Object.create(null),
    trustedMuterPubkeys: [],
    personalBlock: false,
    personalMute: false,
    userDenied: false,
    eventDenied: false,
    addressDenied: false,
    userAllowed: false,
    protectedTarget: false,
    thresholds: {}
  };
}
function freezeEvidence(evidence) {
  const reportsByCategory = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(evidence.trustedReportsByCategory).sort()) {
    reportsByCategory[key] = evidence.trustedReportsByCategory[key];
  }
  const mutesByCategory = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(evidence.trustedMutesByCategory).sort()) {
    mutesByCategory[key] = evidence.trustedMutesByCategory[key];
  }
  return {
    ...evidence,
    trustedReportsByCategory: reportsByCategory,
    trustedMutesByCategory: mutesByCategory,
    trustedReporterPubkeys: [...evidence.trustedReporterPubkeys].sort(),
    trustedMuterPubkeys: [...evidence.trustedMuterPubkeys].sort(),
    thresholds: { ...evidence.thresholds }
  };
}
function mergeEvidence(records) {
  const merged = createEmptyEvidence();
  const reporters = /* @__PURE__ */ new Set();
  const muters = /* @__PURE__ */ new Set();
  for (const record of records ?? []) {
    if (!record) {
      continue;
    }
    for (const [category, count] of Object.entries(record.trustedReportsByCategory ?? {})) {
      const previous = Object.hasOwn(merged.trustedReportsByCategory, category) ? merged.trustedReportsByCategory[category] : 0;
      merged.trustedReportsByCategory[category] = previous + count;
    }
    for (const [category, count] of Object.entries(record.trustedMutesByCategory ?? {})) {
      const previous = Object.hasOwn(merged.trustedMutesByCategory, category) ? merged.trustedMutesByCategory[category] : 0;
      merged.trustedMutesByCategory[category] = previous + count;
    }
    merged.trustedReportTotal += record.trustedReportTotal ?? 0;
    merged.trustedMuteTotal += record.trustedMuteTotal ?? 0;
    for (const pubkey of record.trustedReporterPubkeys ?? []) {
      reporters.add(pubkey);
    }
    for (const pubkey of record.trustedMuterPubkeys ?? []) {
      muters.add(pubkey);
    }
    merged.personalBlock ||= record.personalBlock === true;
    merged.personalMute ||= record.personalMute === true;
    merged.userDenied ||= record.userDenied === true;
    merged.eventDenied ||= record.eventDenied === true;
    merged.addressDenied ||= record.addressDenied === true;
    merged.userAllowed ||= record.userAllowed === true;
    merged.protectedTarget ||= record.protectedTarget === true;
    merged.thresholds = { ...merged.thresholds, ...record.thresholds };
  }
  merged.trustedReporterPubkeys = Array.from(reporters);
  merged.trustedMuterPubkeys = Array.from(muters);
  return freezeEvidence(merged);
}
function redactEvidence(evidence) {
  return {
    ...freezeEvidence(evidence),
    trustedReporterPubkeys: [],
    trustedMuterPubkeys: []
  };
}

// vendor/.bitgate-tree/packages/core/src/policy.js
var RANKING_LADDER = Object.freeze(["normal", "downrank"]);
var VISIBILITY_LADDER = Object.freeze(["allow", "warn", "restrict", "hide", "deny"]);
var INTERACTION_LADDER = Object.freeze(["allow", "require-explicit-action", "deny"]);
var TRANSACTION_LADDER = Object.freeze(["allow", "require-review", "deny"]);
var LADDERS = {
  ranking: RANKING_LADDER,
  visibility: VISIBILITY_LADDER,
  interaction: INTERACTION_LADDER,
  transaction: TRANSACTION_LADDER
};
function effectSeverity(dimension, effect) {
  const ladder = LADDERS[dimension];
  if (!ladder) {
    throw new Error(`Unknown decision dimension: ${dimension}`);
  }
  return ladder.indexOf(effect);
}
function maxEffect(dimension, a, b) {
  const severityA = effectSeverity(dimension, a);
  const severityB = effectSeverity(dimension, b);
  if (severityA < 0) return b;
  if (severityB < 0) return a;
  return severityA >= severityB ? a : b;
}
function createNeutralDecision(options = {}) {
  const decision = {
    key: options.key ?? "",
    ranking: { effect: "normal", weight: 0 },
    visibility: { effect: "allow", overridable: true },
    interaction: { effect: "allow" },
    reasons: [],
    policyProfile: "",
    policyVersion: "",
    snapshotFingerprint: "",
    evaluatedAt: 0
  };
  if (options.target) {
    decision.target = options.target;
  }
  if (options.includeTransaction) {
    decision.transaction = { effect: "allow" };
  }
  return decision;
}
function normalizeDimensionEffects(effects, location = "profile") {
  if (!effects || typeof effects !== "object") {
    return {};
  }
  const normalized = {};
  for (
    const dimension of
    /** @type {const} */
    [
      "ranking",
      "visibility",
      "interaction",
      "transaction"
    ]
  ) {
    const value = effects[dimension];
    if (value === void 0) {
      continue;
    }
    if (effectSeverity(dimension, value) < 0) {
      throw new Error(`${location}: invalid ${dimension} effect "${String(value)}"`);
    }
    normalized[dimension] = value;
  }
  return normalized;
}
function normalizeCategoryThresholds(thresholds, location = "profile") {
  if (!thresholds || typeof thresholds !== "object") {
    return {};
  }
  const normalized = /* @__PURE__ */ Object.create(null);
  for (const [category, config] of Object.entries(thresholds)) {
    if (!config || typeof config !== "object") {
      continue;
    }
    const trimmed = category.trim().toLowerCase();
    if (!trimmed) {
      continue;
    }
    const entry = /* @__PURE__ */ Object.create(null);
    for (const [gate, value] of Object.entries(config)) {
      if (!Number.isFinite(value)) {
        continue;
      }
      if (
        /** @type {number} */
        value < 0
      ) {
        throw new Error(`${location}: threshold "${gate}" for "${category}" must be >= 0`);
      }
      entry[gate] = Math.floor(
        /** @type {number} */
        value
      );
    }
    normalized[trimmed] = entry;
  }
  return normalized;
}
function normalizePolicyProfile(profile) {
  if (!profile || typeof profile !== "object") {
    throw new Error("Policy profile must be an object");
  }
  if (typeof profile.name !== "string" || !profile.name.trim()) {
    throw new Error("Policy profile requires a non-empty name");
  }
  const name = profile.name.trim();
  const location = `profile "${name}"`;
  const normalized = {
    name,
    administrativeDeny: normalizeDimensionEffects(profile.administrativeDeny, location),
    viewerBlock: normalizeDimensionEffects(profile.viewerBlock, location),
    allowlistMiss: normalizeDimensionEffects(profile.allowlistMiss, location),
    requireAllowlist: profile.requireAllowlist === true,
    allowViewerOverride: profile.allowViewerOverride !== false,
    exposeEvidence: profile.exposeEvidence === true,
    bypassHide: profile.bypassHide === true,
    disabled: profile.disabled === true,
    reports: normalizeCategoryThresholds(profile.reports, location),
    mutes: normalizeCategoryThresholds(profile.mutes, location)
  };
  if (Number.isFinite(profile.muteWindowSeconds)) {
    const window = (
      /** @type {number} */
      profile.muteWindowSeconds
    );
    if (window < 0) {
      throw new Error(`${location}: muteWindowSeconds must be >= 0`);
    }
    normalized.muteWindowSeconds = Math.floor(window);
  }
  if (profile.bypassHideCeiling !== void 0) {
    if (effectSeverity("visibility", profile.bypassHideCeiling) < 0) {
      throw new Error(`${location}: invalid bypassHideCeiling "${String(profile.bypassHideCeiling)}"`);
    }
    normalized.bypassHideCeiling = profile.bypassHideCeiling;
  } else if (normalized.bypassHide) {
    normalized.bypassHideCeiling = "restrict";
  }
  return normalized;
}
function normalizePolicyDefinition(policy) {
  if (!policy || typeof policy !== "object") {
    throw new Error("Policy definition must be an object");
  }
  if (typeof policy.id !== "string" || !policy.id.trim()) {
    throw new Error("Policy definition requires a non-empty id");
  }
  if (typeof policy.version !== "string" || !policy.version.trim()) {
    throw new Error("Policy definition requires a version string");
  }
  if (!policy.profiles || typeof policy.profiles !== "object") {
    throw new Error("Policy definition requires a profiles map");
  }
  const profiles = /* @__PURE__ */ Object.create(null);
  for (const [key, profile] of Object.entries(policy.profiles)) {
    const normalizedProfile = normalizePolicyProfile({ ...profile, name: profile?.name ?? key });
    profiles[key.trim()] = normalizedProfile;
  }
  const profileNames = Object.keys(profiles);
  if (profileNames.length === 0) {
    throw new Error("Policy definition requires at least one profile");
  }
  const defaultProfile = policy.defaultProfile?.trim() || profileNames[0];
  if (!profiles[defaultProfile]) {
    throw new Error(`Policy default profile "${defaultProfile}" is not defined`);
  }
  return {
    id: policy.id.trim(),
    name: typeof policy.name === "string" && policy.name.trim() ? policy.name.trim() : policy.id.trim(),
    description: typeof policy.description === "string" ? policy.description : "",
    version: policy.version.trim(),
    profiles,
    defaultProfile
  };
}
function resolveProfile(policy, context) {
  const requested = context?.policyProfile?.trim();
  if (requested) {
    if (!Object.hasOwn(policy.profiles, requested)) {
      throw new Error(`Unknown policy profile: ${requested}`);
    }
    return policy.profiles[requested];
  }
  const fallback = policy.defaultProfile ?? Object.keys(policy.profiles)[0];
  if (!Object.hasOwn(policy.profiles, fallback)) {
    throw new Error(`Unknown policy profile: ${fallback}`);
  }
  return policy.profiles[fallback];
}
function resolveThresholds(table, category) {
  if (!table) {
    return {};
  }
  const normalizedCategory = typeof category === "string" ? category.trim().toLowerCase() : "";
  if (normalizedCategory && Object.hasOwn(table, normalizedCategory)) {
    return table[normalizedCategory];
  }
  return Object.hasOwn(table, "default") ? table.default : {};
}
function applyThresholds(count, thresholds) {
  const effects = {};
  const firedGates = [];
  if (!Number.isFinite(count) || count <= 0) {
    return { effects, firedGates };
  }
  const gates = [
    ["downrank", "ranking", "downrank"],
    ["warn", "visibility", "warn"],
    ["restrict", "visibility", "restrict"],
    ["hide", "visibility", "hide"],
    ["deny", "visibility", "deny"],
    ["requireExplicitAction", "interaction", "require-explicit-action"],
    ["interactionDeny", "interaction", "deny"],
    ["transactionReview", "transaction", "require-review"],
    ["transactionDeny", "transaction", "deny"]
  ];
  for (const [gate, dimension, effect] of gates) {
    const threshold = thresholds[gate];
    if (!Number.isFinite(threshold) || /** @type {number} */
    threshold <= 0) {
      continue;
    }
    if (count < /** @type {number} */
    threshold) {
      continue;
    }
    const current = effects[dimension];
    effects[dimension] = current ? maxEffect(dimension, current, effect) : effect;
    firedGates.push(String(gate));
  }
  return { effects, firedGates };
}
function applyEffects(decision, effects, reasons = []) {
  if (effects.ranking) {
    const next = maxEffect("ranking", decision.ranking.effect, effects.ranking);
    if (next !== decision.ranking.effect) {
      decision.ranking.effect = /** @type {RankingEffect} */
      next;
    }
    if (effects.ranking === "downrank") {
      decision.ranking.weight += 1;
    }
  }
  if (effects.visibility) {
    decision.visibility.effect = /** @type {VisibilityEffect} */
    maxEffect("visibility", decision.visibility.effect, effects.visibility);
  }
  if (effects.interaction) {
    decision.interaction.effect = /** @type {InteractionEffect} */
    maxEffect("interaction", decision.interaction.effect, effects.interaction);
  }
  if (effects.transaction) {
    if (!decision.transaction) {
      decision.transaction = { effect: "allow" };
    }
    decision.transaction.effect = /** @type {TransactionEffect} */
    maxEffect("transaction", decision.transaction.effect, effects.transaction);
  }
  if (reasons.length) {
    decision.reasons = dedupeReasons([...decision.reasons, ...reasons]);
  }
  return decision;
}
function composeDecisions(decisions) {
  if (!Array.isArray(decisions) || decisions.length === 0) {
    return createNeutralDecision();
  }
  const [first, ...rest] = decisions;
  const composed = {
    ...first,
    ranking: { ...first.ranking },
    visibility: { ...first.visibility },
    interaction: { ...first.interaction },
    reasons: [...first.reasons]
  };
  if (first.transaction) {
    composed.transaction = { ...first.transaction };
  }
  for (const decision of rest) {
    composed.ranking.effect = /** @type {RankingEffect} */
    maxEffect("ranking", composed.ranking.effect, decision.ranking.effect);
    composed.ranking.weight += decision.ranking.weight;
    composed.visibility.effect = /** @type {VisibilityEffect} */
    maxEffect("visibility", composed.visibility.effect, decision.visibility.effect);
    composed.visibility.overridable = composed.visibility.overridable && decision.visibility.overridable;
    composed.interaction.effect = /** @type {InteractionEffect} */
    maxEffect("interaction", composed.interaction.effect, decision.interaction.effect);
    if (decision.transaction) {
      if (!composed.transaction) {
        composed.transaction = { ...decision.transaction };
      } else {
        composed.transaction.effect = /** @type {TransactionEffect} */
        maxEffect("transaction", composed.transaction.effect, decision.transaction.effect);
      }
    }
    composed.reasons = [...composed.reasons, ...decision.reasons];
  }
  composed.reasons = dedupeReasons(composed.reasons);
  const evidence = decisions.map((decision) => decision.evidence).filter(Boolean);
  if (evidence.length) {
    composed.evidence = mergeEvidence(
      /** @type {any} */
      evidence
    );
  }
  return composed;
}
function createPolicyDefinition(policy) {
  return normalizePolicyDefinition(policy);
}
var NEUTRAL_POLICY = normalizePolicyDefinition({
  id: "neutral",
  name: "Neutral",
  description: "Enforces administrative denials only. Applications should supply their own policy.",
  version: "1.0.0",
  defaultProfile: "default",
  profiles: {
    default: {
      name: "default",
      administrativeDeny: { visibility: "hide", interaction: "deny", transaction: "deny" },
      viewerBlock: { visibility: "hide", interaction: "deny" },
      allowlistMiss: { visibility: "hide", interaction: "deny" },
      allowViewerOverride: true,
      reports: {},
      mutes: {}
    }
  }
});

// vendor/.bitgate-tree/packages/core/src/adapter.js
function createApplicationAdapter(adapter) {
  if (!adapter || typeof adapter !== "object") {
    throw new Error("Adapter must be an object");
  }
  if (typeof adapter.applicationId !== "string" || !adapter.applicationId.trim()) {
    throw new Error("Adapter requires an applicationId");
  }
  if (typeof adapter.toTargets !== "function") {
    throw new Error("Adapter requires toTargets()");
  }
  if (typeof adapter.getPrimaryTargetKey !== "function") {
    throw new Error("Adapter requires getPrimaryTargetKey()");
  }
  return adapter;
}
function evaluateObject(object, adapter, evaluate) {
  const targets = adapter.toTargets(object).filter((target) => isValidTarget(target));
  if (targets.length === 0) {
    throw new Error(`Adapter produced no valid targets for ${adapter.applicationId}`);
  }
  const decisions = targets.map((target) => evaluate(target));
  const composed = composeDecisions(decisions);
  composed.key = adapter.getPrimaryTargetKey(object);
  return composed;
}
function evaluateObjects(objects, adapter, evaluate) {
  const results = /* @__PURE__ */ new Map();
  for (const object of objects ?? []) {
    results.set(adapter.getPrimaryTargetKey(object), evaluateObject(object, adapter, evaluate));
  }
  return results;
}
function collectTargets(objects, adapter) {
  const targets = /* @__PURE__ */ new Map();
  for (const object of objects ?? []) {
    for (const target of adapter.toTargets(object)) {
      if (isValidTarget(target)) {
        targets.set(getTargetKey(target), target);
      }
    }
  }
  return Array.from(targets.values());
}

// vendor/.bitgate-tree/packages/core/src/presets.js
var DAY = 24 * 60 * 60;
var SOCIAL_REPORTS = {
  malware: { warn: 1, restrict: 1, hide: 2, interactionDeny: 1 },
  impersonation: { warn: 1, restrict: 2, hide: 4 },
  illegal: { warn: 1, restrict: 2, hide: 3 },
  nudity: { restrict: 2, requireExplicitAction: 2 },
  profanity: { downrank: 1, warn: 2, restrict: 3, hide: 6 },
  spam: { downrank: 2, restrict: 4, hide: 8 },
  default: { downrank: 2, warn: 4, restrict: 6 }
};
var SOCIAL_MUTES = {
  default: { downrank: 1, hide: 12 }
};
var SOCIAL_POLICY = createPolicyDefinition({
  id: "bitgate-social",
  name: "Social (starter)",
  description: "Starting thresholds for feeds, profiles, and playback. Tune before relying on them.",
  version: "1.0.0",
  defaultProfile: "feed",
  profiles: {
    feed: {
      name: "feed",
      administrativeDeny: { visibility: "hide", interaction: "deny" },
      viewerBlock: { visibility: "hide", interaction: "deny" },
      allowViewerOverride: true,
      bypassHide: true,
      bypassHideCeiling: "restrict",
      muteWindowSeconds: 60 * DAY,
      reports: SOCIAL_REPORTS,
      mutes: SOCIAL_MUTES
    },
    profile: {
      name: "profile",
      administrativeDeny: { visibility: "warn", interaction: "require-explicit-action" },
      viewerBlock: { visibility: "hide", interaction: "deny" },
      allowViewerOverride: true,
      muteWindowSeconds: 60 * DAY,
      reports: SOCIAL_REPORTS,
      mutes: SOCIAL_MUTES
    },
    playback: {
      name: "playback",
      administrativeDeny: { visibility: "deny", interaction: "deny" },
      viewerBlock: { visibility: "hide", interaction: "deny" },
      allowViewerOverride: true,
      exposeEvidence: true,
      muteWindowSeconds: 60 * DAY,
      reports: SOCIAL_REPORTS,
      mutes: SOCIAL_MUTES
    }
  }
});
var COMMERCE_REPORTS = {
  malware: { warn: 1, restrict: 1, hide: 2, transactionDeny: 1 },
  scam: { downrank: 1, warn: 2, restrict: 3, hide: 5, transactionReview: 2, transactionDeny: 3 },
  counterfeit: { downrank: 1, warn: 2, restrict: 4, transactionReview: 3 },
  "not-as-described": { downrank: 2, warn: 4, transactionReview: 5 },
  misleading: { downrank: 2, warn: 3, restrict: 5, hide: 8 },
  illegal: { warn: 1, restrict: 2, hide: 3, transactionDeny: 2 },
  spam: { downrank: 2, restrict: 5 },
  default: { downrank: 2, warn: 4 }
};
var COMMERCE_MUTES = {
  default: { downrank: 1 }
};
var CHECKOUT_REPORTS = {
  malware: { transactionDeny: 1 },
  illegal: { transactionDeny: 2 },
  scam: { transactionReview: 2, transactionDeny: 3 },
  counterfeit: { transactionReview: 3 },
  "not-as-described": { transactionReview: 5 },
  // Reports whose category we cannot interpret — `other`, or a vocabulary from
  // some client we have never seen — should not silently do nothing at the one
  // place money changes hands. They do not auto-deny either: an unclassified
  // complaint is not evidence of fraud. Enough of them earns a human look.
  default: { transactionReview: 4 }
};
var COMMERCE_POLICY = createPolicyDefinition({
  id: "bitgate-commerce",
  name: "Commerce (starter)",
  description: "Starting thresholds for marketplaces. Tune before relying on them.",
  version: "1.0.0",
  defaultProfile: "browse",
  profiles: {
    browse: {
      name: "browse",
      administrativeDeny: { visibility: "hide", interaction: "deny", transaction: "deny" },
      viewerBlock: { visibility: "hide", interaction: "deny" },
      allowViewerOverride: false,
      muteWindowSeconds: 60 * DAY,
      reports: COMMERCE_REPORTS,
      mutes: COMMERCE_MUTES
    },
    detail: {
      name: "detail",
      administrativeDeny: {
        visibility: "restrict",
        interaction: "require-explicit-action",
        transaction: "deny"
      },
      viewerBlock: { visibility: "hide", interaction: "deny" },
      allowViewerOverride: true,
      muteWindowSeconds: 60 * DAY,
      reports: COMMERCE_REPORTS,
      mutes: COMMERCE_MUTES
    },
    checkout: {
      name: "checkout",
      administrativeDeny: { visibility: "allow", transaction: "deny" },
      allowViewerOverride: false,
      reports: CHECKOUT_REPORTS,
      mutes: {}
    },
    // A seller must always be able to see their own listing and read why it is
    // restricted. Hiding it from them would leave no route to appeal, so this
    // surface caps visibility at a warning no matter how strong the evidence.
    "seller-dashboard": {
      name: "seller-dashboard",
      administrativeDeny: { visibility: "warn", interaction: "allow", transaction: "deny" },
      allowViewerOverride: false,
      exposeEvidence: true,
      bypassHide: true,
      bypassHideCeiling: "warn",
      muteWindowSeconds: 60 * DAY,
      reports: COMMERCE_REPORTS,
      mutes: COMMERCE_MUTES
    }
  }
});
var ADMIN_ONLY_POLICY = createPolicyDefinition({
  id: "bitgate-admin-only",
  name: "Administrative only",
  description: "Operator deny lists, with no trust-graph signals.",
  version: "1.0.0",
  defaultProfile: "default",
  profiles: {
    default: {
      name: "default",
      administrativeDeny: { visibility: "hide", interaction: "deny", transaction: "deny" },
      viewerBlock: { visibility: "hide", interaction: "deny" },
      allowViewerOverride: true,
      reports: {},
      mutes: {}
    }
  }
});
var ALLOWLIST_POLICY = createPolicyDefinition({
  id: "bitgate-allowlist",
  name: "Allowlist only",
  description: "Only allowlisted publishers are shown; every unlisted one is hidden.",
  version: "1.0.0",
  defaultProfile: "default",
  profiles: {
    default: {
      name: "default",
      requireAllowlist: true,
      allowlistMiss: { visibility: "hide", interaction: "deny", transaction: "deny" },
      administrativeDeny: { visibility: "hide", interaction: "deny", transaction: "deny" },
      viewerBlock: { visibility: "hide", interaction: "deny" },
      allowViewerOverride: true,
      reports: {},
      mutes: {}
    }
  }
});
var POLICY_PRESETS = {
  social: SOCIAL_POLICY,
  commerce: COMMERCE_POLICY,
  "admin-only": ADMIN_ONLY_POLICY,
  allowlist: ALLOWLIST_POLICY
};
function getPolicyPreset(name) {
  if (typeof name !== "string") {
    return null;
  }
  const key = name.trim().toLowerCase();
  return Object.hasOwn(POLICY_PRESETS, key) ? POLICY_PRESETS[key] : null;
}

// vendor/.bitgate-tree/packages/core/src/fingerprint.js
function canonicalStringify(value, seen) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  const visited = seen ?? /* @__PURE__ */ new WeakSet();
  if (visited.has(value)) {
    return '"[cycle]"';
  }
  visited.add(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalStringify(entry, visited)).join(",")}]`;
  }
  if (value instanceof Set) {
    return `[${Array.from(value).map(String).sort().map((entry) => JSON.stringify(entry)).join(",")}]`;
  }
  if (value instanceof Map) {
    const entries = Array.from(value.entries()).map(([key, entry]) => [String(key), entry]).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
    return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalStringify(entry, visited)}`).join(",")}}`;
  }
  const keys = Object.keys(
    /** @type {Record<string, unknown>} */
    value
  ).sort();
  const parts = [];
  for (const key of keys) {
    const entry = (
      /** @type {Record<string, unknown>} */
      value[key]
    );
    if (entry === void 0) {
      continue;
    }
    parts.push(`${JSON.stringify(key)}:${canonicalStringify(entry, visited)}`);
  }
  return `{${parts.join(",")}}`;
}
function hashString(input) {
  let high = 2166136261;
  let low = 16777619;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    high ^= code;
    high = Math.imul(high, 16777619) >>> 0;
    low ^= code + index;
    low = Math.imul(low, 2246822507) >>> 0;
  }
  return high.toString(16).padStart(8, "0") + low.toString(16).padStart(8, "0");
}
function fingerprint(value) {
  return hashString(canonicalStringify(value));
}
function snapshotFingerprint(snapshot) {
  return fingerprint({
    authority: snapshot.authority ?? null,
    admin: snapshot.admin ?? null,
    reports: snapshot.reports ?? null,
    trustedMutes: snapshot.trustedMutes ?? null,
    overrides: snapshot.overrides ?? null,
    policy: snapshot.policy ?? null
  });
}

// vendor/.bitgate-tree/packages/core/src/evaluator.js
function resolveTrustSet(trust) {
  const contacts = trust?.contacts;
  if (contacts && contacts.size > 0) {
    return contacts;
  }
  return trust?.seeds ?? /* @__PURE__ */ new Set();
}
function isCountableSignal(pubkey, trustSet, snapshot, viewer) {
  if (typeof pubkey !== "string" || !pubkey) {
    return false;
  }
  if (!trustSet.has(pubkey)) {
    return false;
  }
  if (viewer.blocks?.has(pubkey)) {
    return false;
  }
  if (snapshot.admin.userDeny.has(`user:${pubkey}`)) {
    return false;
  }
  return true;
}
function aggregateReports(key, snapshot, viewer, trustSet) {
  const records = snapshot.reports?.get(key) ?? [];
  const byCategory = /* @__PURE__ */ new Map();
  const reporters = /* @__PURE__ */ new Set();
  for (const record of records) {
    if (!record || !isCountableSignal(record.reporter, trustSet, snapshot, viewer)) {
      continue;
    }
    const category = typeof record.category === "string" ? record.category.trim().toLowerCase() : "";
    if (!category) {
      continue;
    }
    if (!byCategory.has(category)) {
      byCategory.set(category, /* @__PURE__ */ new Set());
    }
    byCategory.get(category).add(record.reporter);
    reporters.add(record.reporter);
  }
  const counts = /* @__PURE__ */ Object.create(null);
  let total = 0;
  for (const [category, set] of byCategory.entries()) {
    counts[category] = set.size;
    total += set.size;
  }
  return { total, byCategory: counts, reporters: Array.from(reporters) };
}
function aggregateMutes(key, snapshot, viewer, trustSet, now, windowSeconds) {
  const records = snapshot.trustedMutes?.get(key) ?? [];
  const cutoff = Number.isFinite(windowSeconds) && /** @type {number} */
  windowSeconds > 0 ? now - /** @type {number} */
  windowSeconds : Number.NEGATIVE_INFINITY;
  const muters = /* @__PURE__ */ new Set();
  const byCategory = /* @__PURE__ */ new Map();
  for (const record of records) {
    if (!record || !isCountableSignal(record.muter, trustSet, snapshot, viewer)) {
      continue;
    }
    const updatedAt = Number.isFinite(record.updatedAt) ? (
      /** @type {number} */
      record.updatedAt
    ) : 0;
    if (updatedAt < cutoff) {
      continue;
    }
    muters.add(record.muter);
    const category = typeof record.category === "string" ? record.category.trim().toLowerCase() : "";
    if (category) {
      if (!byCategory.has(category)) {
        byCategory.set(category, /* @__PURE__ */ new Set());
      }
      byCategory.get(category).add(record.muter);
    }
  }
  const counts = /* @__PURE__ */ Object.create(null);
  for (const [category, set] of byCategory.entries()) {
    counts[category] = set.size;
  }
  return { total: muters.size, byCategory: counts, muters: Array.from(muters) };
}
function authorChain(target) {
  if (target.type === "user") {
    return [target.pubkey];
  }
  if (target.type === "address") {
    return [target.pubkey];
  }
  const author = (
    /** @type {{ author?: string }} */
    target.author
  );
  return typeof author === "string" && author ? [author] : [];
}
function evaluateTarget(target, snapshot, context = { surface: "default" }, viewerState = {}) {
  if (!isValidTarget(target)) {
    throw new Error(`Invalid governance target: ${JSON.stringify(target)}`);
  }
  const key = getTargetKey(target);
  const policy = context.policy ?? NEUTRAL_POLICY;
  const profile = resolveProfile(policy, context);
  const now = Number.isFinite(context.now) ? (
    /** @type {number} */
    context.now
  ) : 0;
  const viewer = viewerState ?? {};
  const includeTransaction = profile.administrativeDeny?.transaction !== void 0 || hasTransactionGate(profile);
  const decision = createNeutralDecision({ key, target, includeTransaction });
  decision.policyProfile = profile.name;
  decision.policyVersion = policy.version;
  decision.evaluatedAt = now;
  decision.snapshotFingerprint = context.snapshotFingerprint ?? snapshotFingerprint({
    authority: snapshot.authority,
    admin: snapshot.admin,
    reports: snapshot.reports,
    trustedMutes: snapshot.trustedMutes,
    policy: { id: policy.id, version: policy.version, profile: profile.name }
  });
  const evidence = createEmptyEvidence();
  if (profile.disabled) {
    decision.reasons = [createReason("policy-disabled")];
    decision.evidence = evidence;
    return decision;
  }
  const authors = authorChain(target);
  const isProtected = authors.some((pubkey) => isProtectedActor(pubkey, snapshot.authority));
  evidence.protectedTarget = isProtected;
  const blockedAuthor = authors.find((pubkey) => viewer.blocks?.has(pubkey));
  if (blockedAuthor) {
    evidence.personalBlock = true;
    applyEffects(
      decision,
      profile.viewerBlock ?? { visibility: "hide", interaction: "deny" },
      [createReason("viewer-block")]
    );
  }
  if (authors.some((pubkey) => viewer.mutes?.has(pubkey))) {
    evidence.personalMute = true;
    decision.reasons = dedupeReasons([...decision.reasons, createReason("viewer-mute")]);
  }
  if (!isProtected) {
    const targetDenied = isDenied(target, snapshot.admin);
    const authorDenied = target.type !== "user" && authors.some((pubkey) => snapshot.admin.userDeny.has(`user:${pubkey}`));
    if (target.type === "user" && targetDenied) {
      evidence.userDenied = true;
    }
    if (target.type === "event" && targetDenied) {
      evidence.eventDenied = true;
    }
    if (target.type === "address" && targetDenied) {
      evidence.addressDenied = true;
    }
    if (authorDenied) {
      evidence.userDenied = true;
    }
    if (targetDenied || authorDenied) {
      const reasonId = target.type === "event" && targetDenied ? "admin-event-deny" : target.type === "address" && targetDenied ? "admin-address-deny" : "admin-user-deny";
      const communitySources = snapshot.admin.communitySources.get(key) ?? [];
      const reasons = [createReason(reasonId)];
      if (communitySources.length) {
        reasons.push(createReason("community-user-deny", { source: communitySources[0] }));
      }
      applyEffects(
        decision,
        profile.administrativeDeny ?? { visibility: "hide", interaction: "deny" },
        reasons
      );
    }
  } else if (isDenied(target, snapshot.admin)) {
    decision.reasons = dedupeReasons([...decision.reasons, createReason("protected-target")]);
  }
  const authorAllowed = authors.some((pubkey) => snapshot.admin.userAllow.has(`user:${pubkey}`));
  const allowed = authorAllowed || target.type !== "user" && isAllowed(target, snapshot.admin);
  if (profile.requireAllowlist && !isProtected) {
    evidence.userAllowed = authorAllowed;
    if (!allowed) {
      applyEffects(
        decision,
        profile.allowlistMiss ?? { visibility: "hide", interaction: "deny" },
        [createReason("allowlist-miss")]
      );
    }
  } else {
    evidence.userAllowed = authorAllowed;
  }
  const trustSet = resolveTrustSet(snapshot.trust);
  const mutes = aggregateMutes(key, snapshot, viewer, trustSet, now, profile.muteWindowSeconds);
  evidence.trustedMuteTotal = mutes.total;
  evidence.trustedMutesByCategory = mutes.byCategory;
  evidence.trustedMuterPubkeys = mutes.muters;
  if (mutes.total > 0) {
    const thresholds = resolveThresholds(profile.mutes, void 0);
    const { effects, firedGates } = applyThresholds(mutes.total, thresholds);
    const reasons = [createReason("trusted-mute", { count: mutes.total })];
    if (firedGates.length) {
      reasons.push(
        createReason("trusted-mute-threshold", {
          count: mutes.total,
          threshold: lowestFiredThreshold(thresholds, firedGates)
        })
      );
    }
    applyEffects(decision, effects, reasons);
    for (const [category, count] of Object.entries(mutes.byCategory)) {
      const categoryThresholds = profile.mutes && Object.hasOwn(profile.mutes, category) ? profile.mutes[category] : void 0;
      if (!categoryThresholds) {
        continue;
      }
      const categoryResult = applyThresholds(count, categoryThresholds);
      if (categoryResult.firedGates.length) {
        applyEffects(decision, categoryResult.effects, [
          createReason("trusted-mute-threshold", {
            category,
            count,
            threshold: lowestFiredThreshold(categoryThresholds, categoryResult.firedGates)
          })
        ]);
      }
    }
  }
  const reports = aggregateReports(key, snapshot, viewer, trustSet);
  evidence.trustedReportTotal = reports.total;
  evidence.trustedReportsByCategory = reports.byCategory;
  evidence.trustedReporterPubkeys = reports.reporters;
  if (reports.total > 0) {
    decision.reasons = dedupeReasons([
      ...decision.reasons,
      createReason("trusted-report", { count: reports.total })
    ]);
    for (const [category, count] of Object.entries(reports.byCategory)) {
      const thresholds = resolveThresholds(profile.reports, category);
      const { effects, firedGates } = applyThresholds(count, thresholds);
      if (!firedGates.length) {
        continue;
      }
      applyEffects(decision, effects, [
        createReason("trusted-report-threshold", {
          category,
          count,
          threshold: lowestFiredThreshold(thresholds, firedGates)
        })
      ]);
    }
  }
  evidence.thresholds = summarizeThresholds(profile);
  const override = viewer.overrides?.get(key);
  const overridesAllowed = context.enforcement?.allowOverrides !== false && profile.allowViewerOverride !== false;
  if (override && overridesAllowed && decision.visibility.overridable) {
    const requested = override.visibility;
    if (effectSeverity("visibility", requested) >= 0) {
      const isSoftening = effectSeverity("visibility", requested) < effectSeverity("visibility", decision.visibility.effect);
      if (isSoftening) {
        decision.visibility.effect = /** @type {import('./policy.js').VisibilityEffect} */
        requested;
        decision.interaction.effect = "require-explicit-action";
        decision.reasons = dedupeReasons([...decision.reasons, createReason("viewer-override")]);
      }
    }
  }
  if (profile.bypassHide && effectSeverity("visibility", decision.visibility.effect) >= effectSeverity("visibility", "hide")) {
    const ceiling = profile.bypassHideCeiling ?? "restrict";
    decision.visibility.effect = /** @type {import('./policy.js').VisibilityEffect} */
    ceiling;
    decision.reasons = dedupeReasons([...decision.reasons, createReason("surface-policy-bypass")]);
  }
  decision.evidence = profile.exposeEvidence ? freezeEvidence(evidence) : redactEvidence(evidence);
  decision.reasons = dedupeReasons(decision.reasons);
  return decision;
}
function hasTransactionGate(profile) {
  for (const table of [profile.reports, profile.mutes]) {
    for (const thresholds of Object.values(table ?? {})) {
      if (Number.isFinite(thresholds.transactionDeny) || Number.isFinite(thresholds.transactionReview)) {
        return true;
      }
    }
  }
  return false;
}
function lowestFiredThreshold(thresholds, firedGates) {
  let lowest;
  for (const gate of firedGates) {
    const value = (
      /** @type {Record<string, number|undefined>} */
      thresholds[gate]
    );
    if (Number.isFinite(value) && (lowest === void 0 || /** @type {number} */
    value < lowest)) {
      lowest = /** @type {number} */
      value;
    }
  }
  return lowest;
}
function summarizeThresholds(profile) {
  const defaults = profile.reports?.default ?? {};
  const summary = {};
  for (
    const gate of
    /** @type {const} */
    ["warn", "restrict", "hide", "deny"]
  ) {
    if (Number.isFinite(defaults[gate])) {
      summary[gate] = /** @type {number} */
      defaults[gate];
    }
  }
  return summary;
}
function evaluateMany(targets, snapshot, context, viewerState) {
  const results = /* @__PURE__ */ new Map();
  const policy = context?.policy ?? NEUTRAL_POLICY;
  const profile = resolveProfile(policy, context);
  const sharedContext = {
    ...context ?? { surface: "default" },
    snapshotFingerprint: context?.snapshotFingerprint ?? snapshotFingerprint({
      authority: snapshot.authority,
      admin: snapshot.admin,
      reports: snapshot.reports,
      trustedMutes: snapshot.trustedMutes,
      policy: { id: policy.id, version: policy.version, profile: profile.name }
    })
  };
  for (const target of targets) {
    if (!isValidTarget(target)) {
      continue;
    }
    const key = getTargetKey(target);
    if (results.has(key)) {
      continue;
    }
    results.set(key, evaluateTarget(target, snapshot, sharedContext, viewerState));
  }
  return results;
}
function createSnapshot(parts = {}) {
  return {
    authority: parts.authority ?? { roles: {}, actors: {}, protectedActors: [] },
    admin: parts.admin ?? {
      userAllow: /* @__PURE__ */ new Set(),
      userDeny: /* @__PURE__ */ new Set(),
      eventDeny: /* @__PURE__ */ new Set(),
      addressDeny: /* @__PURE__ */ new Set(),
      eventAllow: /* @__PURE__ */ new Set(),
      addressAllow: /* @__PURE__ */ new Set(),
      trustSeeds: /* @__PURE__ */ new Set(),
      contributors: /* @__PURE__ */ new Map(),
      communitySources: /* @__PURE__ */ new Map()
    },
    trust: parts.trust ?? { contacts: /* @__PURE__ */ new Set(), seeds: /* @__PURE__ */ new Set() },
    reports: parts.reports ?? /* @__PURE__ */ new Map(),
    trustedMutes: parts.trustedMutes ?? /* @__PURE__ */ new Map()
  };
}
function createViewerState(parts = {}) {
  return {
    blocks: parts.blocks ?? /* @__PURE__ */ new Set(),
    mutes: parts.mutes ?? /* @__PURE__ */ new Set(),
    overrides: parts.overrides ?? /* @__PURE__ */ new Map()
  };
}
export {
  ADMIN_ONLY_POLICY,
  ALLOWLIST_POLICY,
  COMMERCE_POLICY,
  DEFAULT_ROLE_CAPABILITIES,
  GOVERNANCE_CAPABILITIES,
  INTERACTION_LADDER,
  NEUTRAL_POLICY,
  POLICY_PRESETS,
  RANKING_LADDER,
  REASON_IDS,
  SOCIAL_POLICY,
  TRANSACTION_LADDER,
  VISIBILITY_LADDER,
  aggregateMutes,
  aggregateReports,
  applyEffects,
  applyThresholds,
  areTargetsEqual,
  canonicalStringify,
  collectTargets,
  composeDecisions,
  createApplicationAdapter,
  createAuthorityState,
  createEmptyAdminState,
  createEmptyEvidence,
  createEventTarget,
  createNeutralDecision,
  createPolicyDefinition,
  createReason,
  createRoleDefinition,
  createSnapshot,
  createTarget,
  createUserTarget,
  createViewerState,
  dedupeReasons,
  effectSeverity,
  evaluateMany,
  evaluateObject,
  evaluateObjects,
  evaluateTarget,
  fingerprint,
  freezeEvidence,
  getActorCapabilities,
  getActorRoles,
  getParentTarget,
  getPolicyPreset,
  getTargetKey,
  hasCapability,
  hasRole,
  hashString,
  isAllowed,
  isDenied,
  isDescendantOf,
  isGovernanceCapability,
  isProtectedActor,
  isReasonId,
  isValidTarget,
  maxEffect,
  mergeCommunitySource,
  mergeEvidence,
  normalizeAddress,
  normalizeCategoryThresholds,
  normalizeDimensionEffects,
  normalizeEventId,
  normalizePolicyDefinition,
  normalizePolicyProfile,
  normalizePubkey,
  protectActors,
  redactEvidence,
  reduceAdminState,
  resolveProfile,
  resolveThresholds,
  resolveTrustSet,
  serializeAdminState,
  snapshotFingerprint
};
