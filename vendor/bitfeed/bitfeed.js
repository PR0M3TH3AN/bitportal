/* BitFeed 0.1.0 — headless, application-defined feed composition.
 * Single-file browser build of @bitfeed/core. MIT license.
 * https://github.com/PR0M3TH3AN/bitfeed */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/canonicalize/lib/canonicalize.js
var require_canonicalize = __commonJS({
  "../../node_modules/canonicalize/lib/canonicalize.js"(exports, module) {
    "use strict";
    module.exports = function serialize(object) {
      if (typeof object === "number" && isNaN(object)) {
        throw new Error("NaN is not allowed");
      }
      if (typeof object === "number" && !isFinite(object)) {
        throw new Error("Infinity is not allowed");
      }
      if (object === null || typeof object !== "object") {
        return JSON.stringify(object);
      }
      if (object.toJSON instanceof Function) {
        return serialize(object.toJSON());
      }
      if (Array.isArray(object)) {
        const values2 = object.reduce((t, cv, ci) => {
          const comma = ci === 0 ? "" : ",";
          const value = cv === void 0 || typeof cv === "symbol" ? null : cv;
          return `${t}${comma}${serialize(value)}`;
        }, "");
        return `[${values2}]`;
      }
      const values = Object.keys(object).sort().reduce((t, cv) => {
        if (object[cv] === void 0 || typeof object[cv] === "symbol") {
          return t;
        }
        const comma = t.length === 0 ? "" : ",";
        return `${t}${comma}${serialize(cv)}:${serialize(object[cv])}`;
      }, "");
      return `{${values}}`;
    };
  }
});

// ../core/src/version.ts
var ENGINE_VERSION = "0.3.0";
var RECIPE_SPEC = "bitfeed/1";

// ../core/src/types.ts
var BITFEED_STAGES = [
  "source",
  "normalize",
  "setops",
  "enrich",
  "signal",
  "filter",
  "policy",
  "score",
  "mix",
  "constrain",
  "insert",
  "postprocess",
  "output"
];
var SIGNAL_METADATA_KEY = "signals";

// ../core/src/errors.ts
var BitFeedError = class extends Error {
  code;
  detail;
  constructor(code, message, detail) {
    super(message);
    this.name = "BitFeedError";
    this.code = code;
    this.detail = detail;
  }
};
var RecipeValidationError = class extends BitFeedError {
  /** Every problem found, not just the first — validation does not short-circuit. */
  issues;
  constructor(issues) {
    super("recipe-invalid", `Recipe is not valid: ${issues.join("; ")}`, issues);
    this.name = "RecipeValidationError";
    this.issues = issues;
  }
};
var MissingCapabilityError = class extends BitFeedError {
  missing;
  constructor(missing) {
    super(
      "capability-missing",
      `Recipe requires providers that are not registered: ${missing.join(", ")}`,
      missing
    );
    this.name = "MissingCapabilityError";
    this.missing = missing;
  }
};
var ProviderError = class extends BitFeedError {
  provider;
  cause;
  constructor(provider, cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super("provider-failed", `Provider "${provider}" failed: ${reason}`, cause);
    this.name = "ProviderError";
    this.provider = provider;
    this.cause = cause;
  }
};

// ../core/src/recipe/validate.ts
var PROVIDER_ID = /^[a-z][a-z0-9]*(?:\.[A-Za-z0-9][A-Za-z0-9_-]*)+$/;
function isValidProviderId(id) {
  return PROVIDER_ID.test(id);
}
function providerNamespace(id) {
  if (!isValidProviderId(id)) return null;
  return id.slice(0, id.indexOf("."));
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function checkProviderEntry(entry, path, issues) {
  if (!isPlainObject(entry)) {
    issues.push(`${path} must be an object`);
    return false;
  }
  if (typeof entry.provider !== "string" || entry.provider.length === 0) {
    issues.push(`${path}.provider must be a non-empty string`);
    return false;
  }
  if (!isValidProviderId(entry.provider)) {
    issues.push(
      `${path}.provider "${entry.provider}" is not a namespaced provider id (expected e.g. "app.freshness")`
    );
  }
  if (entry.params !== void 0 && !isPlainObject(entry.params)) {
    issues.push(`${path}.params must be an object when present`);
  }
  if (entry.optional !== void 0 && typeof entry.optional !== "boolean") {
    issues.push(`${path}.optional must be a boolean when present`);
  }
  return true;
}
function checkStringArray(value, path, issues) {
  if (value === void 0) return;
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array of strings`);
    return;
  }
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.length === 0) {
      issues.push(`${path}[${index}] must be a non-empty string`);
    }
  });
}
function checkRatio(value, path, issues) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    issues.push(`${path} must be a finite number`);
    return;
  }
  if (value <= 0) {
    issues.push(`${path} must be greater than 0 (omit the entry to disable it)`);
  }
}
function sourceLane(entry) {
  return entry.lane ?? entry.provider;
}
var KNOWN_RECIPE_FIELDS = /* @__PURE__ */ new Set([
  "spec",
  "name",
  "id",
  "version",
  "description",
  "requires",
  "optional",
  "seed",
  "exploration",
  "limit",
  "expires",
  "sources",
  "setOps",
  "enrichers",
  "signals",
  "filters",
  "policy",
  "scorers",
  "mix",
  "constraints",
  "inserts",
  "postProcessors",
  "fork",
  "metadata"
]);
function recipeWarnings(input) {
  if (!isPlainObject(input)) return [];
  const warnings = [];
  for (const key of Object.keys(input)) {
    if (!KNOWN_RECIPE_FIELDS.has(key)) {
      warnings.push(`Recipe field "${key}" is not known to this engine version and was ignored.`);
    }
  }
  return warnings;
}
function validateRecipe(input) {
  const issues = [];
  if (!isPlainObject(input)) {
    return ["Recipe must be an object"];
  }
  const recipe = input;
  if (recipe.spec !== RECIPE_SPEC) {
    issues.push(
      typeof recipe.spec === "string" && /^bitfeed\/\d+$/.test(recipe.spec) ? `spec "${recipe.spec}" is not supported by this engine (it speaks "${RECIPE_SPEC}")` : `spec must be "${RECIPE_SPEC}" (got ${JSON.stringify(recipe.spec)})`
    );
  }
  if (recipe.expires !== void 0) {
    const value = recipe.expires;
    if (!Number.isInteger(value) || value <= 0) {
      issues.push("expires must be a positive integer (unix seconds) when present");
    }
  }
  if (typeof recipe.name !== "string" || recipe.name.length === 0) {
    issues.push("name must be a non-empty string");
  }
  for (const field of ["id", "version", "description"]) {
    const value = recipe[field];
    if (value !== void 0 && typeof value !== "string") {
      issues.push(`${field} must be a string when present`);
    }
  }
  checkStringArray(recipe.requires, "requires", issues);
  checkStringArray(recipe.optional, "optional", issues);
  if (recipe.seed !== void 0 && typeof recipe.seed !== "string") {
    issues.push("seed must be a string when present");
  }
  if (recipe.exploration !== void 0) {
    const value = recipe.exploration;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
      issues.push("exploration must be a number in [0, 1] when present");
    }
  }
  if (recipe.limit !== void 0) {
    const value = recipe.limit;
    if (!Number.isInteger(value) || value <= 0) {
      issues.push("limit must be a positive integer when present");
    }
  }
  const lanes = /* @__PURE__ */ new Set();
  if (!Array.isArray(recipe.sources) || recipe.sources.length === 0) {
    issues.push("sources must be a non-empty array");
  } else {
    recipe.sources.forEach((entry, index) => {
      const path = `sources[${index}]`;
      if (!checkProviderEntry(entry, path, issues)) return;
      const source = entry;
      if (source.lane !== void 0 && (typeof source.lane !== "string" || source.lane.length === 0)) {
        issues.push(`${path}.lane must be a non-empty string when present`);
      }
      if (source.input !== void 0 && !isPlainObject(source.input)) {
        issues.push(`${path}.input must be an object when present`);
      }
      if (source.limit !== void 0 && (!Number.isInteger(source.limit) || source.limit <= 0)) {
        issues.push(`${path}.limit must be a positive integer when present`);
      }
      if (source.normalizer !== void 0 && !isValidProviderId(source.normalizer)) {
        issues.push(`${path}.normalizer "${source.normalizer}" is not a namespaced provider id`);
      }
      lanes.add(sourceLane(source));
    });
  }
  if (recipe.setOps !== void 0) {
    if (!Array.isArray(recipe.setOps)) {
      issues.push("setOps must be an array when present");
    } else {
      recipe.setOps.forEach((raw, index) => {
        const path = `setOps[${index}]`;
        if (!isPlainObject(raw)) {
          issues.push(`${path} must be an object`);
          return;
        }
        const entry = raw;
        if (entry.op !== "union" && entry.op !== "intersection" && entry.op !== "difference") {
          issues.push(`${path}.op must be "union", "intersection", or "difference"`);
        }
        if (typeof entry.into !== "string" || entry.into.length === 0) {
          issues.push(`${path}.into must be a non-empty string`);
        }
        if (!Array.isArray(entry.lanes) || entry.lanes.length < 2) {
          issues.push(`${path}.lanes must be an array of at least two lane names`);
        } else {
          entry.lanes.forEach((lane, laneIndex) => {
            if (typeof lane !== "string" || lane.length === 0) {
              issues.push(`${path}.lanes[${laneIndex}] must be a non-empty string`);
              return;
            }
            if (!lanes.has(lane)) {
              issues.push(
                `${path}.lanes[${laneIndex}] references unknown lane "${lane}" (no source or earlier setOp produces it)`
              );
            }
          });
        }
        if (typeof entry.into === "string" && entry.into.length > 0) {
          lanes.add(entry.into);
        }
      });
    }
  }
  for (const field of ["enrichers", "signals", "filters", "constraints", "postProcessors"]) {
    const value = recipe[field];
    if (value === void 0) continue;
    if (!Array.isArray(value)) {
      issues.push(`${field} must be an array when present`);
      continue;
    }
    value.forEach((entry, index) => {
      checkProviderEntry(entry, `${field}[${index}]`, issues);
    });
  }
  if (recipe.policy !== void 0) {
    checkProviderEntry(recipe.policy, "policy", issues);
  }
  if (recipe.scorers !== void 0) {
    if (!Array.isArray(recipe.scorers)) {
      issues.push("scorers must be an array when present");
    } else {
      recipe.scorers.forEach((entry, index) => {
        const path = `scorers[${index}]`;
        if (!checkProviderEntry(entry, path, issues)) return;
        checkRatio(entry.weight, `${path}.weight`, issues);
      });
    }
  }
  if (recipe.mix !== void 0) {
    if (!Array.isArray(recipe.mix)) {
      issues.push("mix must be an array when present");
    } else {
      const seen = /* @__PURE__ */ new Set();
      recipe.mix.forEach((raw, index) => {
        const path = `mix[${index}]`;
        if (!isPlainObject(raw)) {
          issues.push(`${path} must be an object`);
          return;
        }
        const entry = raw;
        if (typeof entry.lane !== "string" || entry.lane.length === 0) {
          issues.push(`${path}.lane must be a non-empty string`);
        } else {
          if (seen.has(entry.lane)) {
            issues.push(`${path}.lane "${entry.lane}" appears more than once in mix`);
          }
          seen.add(entry.lane);
          if (!lanes.has(entry.lane)) {
            issues.push(
              `${path}.lane "${entry.lane}" is not produced by any source or setOp`
            );
          }
        }
        checkRatio(entry.ratio, `${path}.ratio`, issues);
      });
    }
  }
  if (recipe.inserts !== void 0) {
    if (!Array.isArray(recipe.inserts)) {
      issues.push("inserts must be an array when present");
    } else {
      recipe.inserts.forEach((raw, index) => {
        const path = `inserts[${index}]`;
        if (!checkProviderEntry(raw, path, issues)) return;
        const entry = raw;
        if (entry.every !== void 0 && (!Number.isInteger(entry.every) || entry.every <= 0)) {
          issues.push(`${path}.every must be a positive integer when present`);
        }
        if (entry.at !== void 0) {
          if (!Array.isArray(entry.at)) {
            issues.push(`${path}.at must be an array of slot indices when present`);
          } else {
            entry.at.forEach((slot, slotIndex) => {
              if (!Number.isInteger(slot) || slot < 0) {
                issues.push(`${path}.at[${slotIndex}] must be a non-negative integer`);
              }
            });
          }
        }
        if (entry.every === void 0 && entry.at === void 0) {
          issues.push(`${path} must set either "every" or "at"`);
        }
        if (entry.every !== void 0 && entry.at !== void 0) {
          issues.push(`${path} must set only one of "every" or "at"`);
        }
      });
    }
  }
  if (recipe.fork !== void 0) {
    if (!isPlainObject(recipe.fork)) {
      issues.push("fork must be an object when present");
    } else {
      if (typeof recipe.fork.source !== "string" || recipe.fork.source.length === 0) {
        issues.push("fork.source must be a non-empty string");
      }
      if (recipe.fork.version !== void 0 && typeof recipe.fork.version !== "string") {
        issues.push("fork.version must be a string when present");
      }
    }
  }
  if (recipe.metadata !== void 0 && !isPlainObject(recipe.metadata)) {
    issues.push("metadata must be an object when present");
  }
  return issues;
}

// ../core/src/registry/index.ts
var PROVIDER_KINDS = [
  "source",
  "normalizer",
  "signal",
  "enricher",
  "filter",
  "policy",
  "scorer",
  "constraint",
  "insert",
  "postProcessor",
  "preferenceResolver"
];
var ProviderRegistry = class {
  maps = {
    source: /* @__PURE__ */ new Map(),
    normalizer: /* @__PURE__ */ new Map(),
    signal: /* @__PURE__ */ new Map(),
    enricher: /* @__PURE__ */ new Map(),
    filter: /* @__PURE__ */ new Map(),
    policy: /* @__PURE__ */ new Map(),
    scorer: /* @__PURE__ */ new Map(),
    constraint: /* @__PURE__ */ new Map(),
    insert: /* @__PURE__ */ new Map(),
    postProcessor: /* @__PURE__ */ new Map(),
    preferenceResolver: /* @__PURE__ */ new Map()
  };
  set(kind, id, provider, options) {
    if (!isValidProviderId(id)) {
      throw new BitFeedError(
        "recipe-invalid",
        `"${id}" is not a namespaced provider id (expected e.g. "app.freshness"; see \xA727)`
      );
    }
    const map = this.maps[kind];
    if (map.has(id) && options?.overwrite !== true) {
      throw new BitFeedError(
        "provider-duplicate",
        `A ${kind} provider is already registered as "${id}". Pass { overwrite: true } if that is intended.`
      );
    }
    map.set(id, provider);
  }
  registerSource(id, provider, options) {
    this.set("source", id, provider, options);
    return this;
  }
  registerNormalizer(id, provider, options) {
    this.set("normalizer", id, provider, options);
    return this;
  }
  registerSignal(id, provider, options) {
    this.set("signal", id, provider, options);
    return this;
  }
  registerEnricher(id, provider, options) {
    this.set("enricher", id, provider, options);
    return this;
  }
  registerFilter(id, provider, options) {
    this.set("filter", id, provider, options);
    return this;
  }
  registerPolicy(id, provider, options) {
    this.set("policy", id, provider, options);
    return this;
  }
  registerScorer(id, provider, options) {
    this.set("scorer", id, provider, options);
    return this;
  }
  registerConstraint(id, provider, options) {
    this.set("constraint", id, provider, options);
    return this;
  }
  registerInsert(id, provider, options) {
    this.set("insert", id, provider, options);
    return this;
  }
  registerPostProcessor(id, provider, options) {
    this.set("postProcessor", id, provider, options);
    return this;
  }
  registerPreferenceResolver(id, provider, options) {
    this.set("preferenceResolver", id, provider, options);
    return this;
  }
  getSource(id) {
    return this.maps.source.get(id);
  }
  getNormalizer(id) {
    return this.maps.normalizer.get(id);
  }
  getSignal(id) {
    return this.maps.signal.get(id);
  }
  getEnricher(id) {
    return this.maps.enricher.get(id);
  }
  getFilter(id) {
    return this.maps.filter.get(id);
  }
  getPolicy(id) {
    return this.maps.policy.get(id);
  }
  getScorer(id) {
    return this.maps.scorer.get(id);
  }
  getConstraint(id) {
    return this.maps.constraint.get(id);
  }
  getInsert(id) {
    return this.maps.insert.get(id);
  }
  getPostProcessor(id) {
    return this.maps.postProcessor.get(id);
  }
  getPreferenceResolver(id) {
    return this.maps.preferenceResolver.get(id);
  }
  /** True if any kind of provider is registered under `id`. */
  has(id) {
    for (const kind of PROVIDER_KINDS) {
      if (this.maps[kind].has(id)) return true;
    }
    return false;
  }
  /** Removes `id` from every kind. Returns true if anything was removed. */
  unregister(id) {
    let removed = false;
    for (const kind of PROVIDER_KINDS) {
      if (this.maps[kind].delete(id)) removed = true;
    }
    return removed;
  }
  /** Every registered id, deduplicated and sorted. */
  capabilities() {
    const ids = /* @__PURE__ */ new Set();
    for (const kind of PROVIDER_KINDS) {
      for (const id of this.maps[kind].keys()) ids.add(id);
    }
    return [...ids].sort();
  }
  /** Registered ids grouped by kind — the input a recipe builder needs (§67). */
  snapshot() {
    const out = {};
    for (const kind of PROVIDER_KINDS) {
      out[kind] = [...this.maps[kind].keys()].sort();
    }
    return out;
  }
  /**
   * Checks a recipe against this registry (§25).
   *
   * Resolution is kind-aware: a recipe's policy entry is only satisfied by a
   * registered *policy* provider — an id registered as, say, a filter does not
   * count, because the executor's per-stage lookup would come back empty and
   * the stage would silently not run.
   *
   * Optionality is per reference, not per id. A provider referenced by a
   * pipeline stage counts as required unless that entry sets `optional: true`
   * or the id appears in the recipe's `optional` list; the same id may be
   * optional in one stage and required in another. A source's normalizer
   * inherits the source's optionality — a lane the recipe can live without must
   * not make its normalizer load-bearing.
   *
   * The recipe's `requires` list is additive and kind-blind — it can demand a
   * capability the pipeline does not reference directly (a signal a scorer
   * reads, say), and it outranks a per-entry optional flag.
   */
  resolve(parsed) {
    const { recipe } = parsed;
    const declaredOptional = new Set(recipe.optional ?? []);
    const requires = new Set(recipe.requires ?? []);
    const refs = [];
    const add = (kind, id, entryOptional) => {
      const optional = !requires.has(id) && (entryOptional || declaredOptional.has(id));
      refs.push({ kind, id, optional });
    };
    for (const entry of recipe.sources) {
      add("source", entry.provider, entry.optional === true);
      if (entry.normalizer !== void 0) add("normalizer", entry.normalizer, entry.optional === true);
    }
    for (const entry of recipe.enrichers ?? []) add("enricher", entry.provider, entry.optional === true);
    for (const entry of recipe.signals ?? []) add("signal", entry.provider, entry.optional === true);
    for (const entry of recipe.filters ?? []) add("filter", entry.provider, entry.optional === true);
    if (recipe.policy) add("policy", recipe.policy.provider, recipe.policy.optional === true);
    for (const entry of recipe.scorers ?? []) add("scorer", entry.provider, entry.optional === true);
    for (const entry of recipe.constraints ?? []) add("constraint", entry.provider, entry.optional === true);
    for (const entry of recipe.inserts ?? []) add("insert", entry.provider, entry.optional === true);
    for (const entry of recipe.postProcessors ?? []) add("postProcessor", entry.provider, entry.optional === true);
    const satisfied = /* @__PURE__ */ new Set();
    const missingRequired = /* @__PURE__ */ new Set();
    const missingOptional = /* @__PURE__ */ new Set();
    const missingOptionalRefs = [];
    const seenMissingRefs = /* @__PURE__ */ new Set();
    for (const ref of refs) {
      if (this.maps[ref.kind].has(ref.id)) {
        satisfied.add(ref.id);
        continue;
      }
      if (!ref.optional) {
        missingRequired.add(ref.id);
        continue;
      }
      missingOptional.add(ref.id);
      const key = `${ref.kind}:${ref.id}`;
      if (!seenMissingRefs.has(key)) {
        seenMissingRefs.add(key);
        missingOptionalRefs.push({ kind: ref.kind, id: ref.id });
      }
    }
    for (const id of requires) {
      if (this.has(id)) satisfied.add(id);
      else missingRequired.add(id);
    }
    for (const id of missingRequired) missingOptional.delete(id);
    return {
      missingRequired: [...missingRequired].sort(),
      missingOptional: [...missingOptional].sort(),
      missingOptionalRefs: missingOptionalRefs.sort(
        (a, b) => a.id === b.id ? a.kind.localeCompare(b.kind) : a.id.localeCompare(b.id)
      ),
      satisfied: [...satisfied].sort()
    };
  }
  /** `resolve`, but throws when a required capability is missing. */
  assertSatisfies(parsed) {
    const resolution = this.resolve(parsed);
    if (resolution.missingRequired.length > 0) {
      throw new MissingCapabilityError(resolution.missingRequired);
    }
    return resolution;
  }
};
function createRegistry() {
  return new ProviderRegistry();
}

// ../../node_modules/@noble/hashes/esm/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
var Hash = class {
};
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}

// ../../node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE);
  view.setUint32(byteOffset + l, wl, isLE);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes(data);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// ../../node_modules/@noble/hashes/esm/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA256 = class extends HashMD {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var sha256 = /* @__PURE__ */ createHasher(() => new SHA256());

// ../core/src/util/hash.ts
var import_canonicalize = __toESM(require_canonicalize(), 1);

// ../core/src/util/encoding.ts
var B64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var B64URL_LOOKUP = (() => {
  const table = {};
  for (let i = 0; i < B64URL_ALPHABET.length; i += 1) {
    table[B64URL_ALPHABET[i]] = i;
  }
  return table;
})();
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder();
function utf8ToBytes2(value) {
  return textEncoder.encode(value);
}
function bytesToUtf8(bytes) {
  return textDecoder.decode(bytes);
}
function bytesToHex(bytes) {
  let out = "";
  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}
function bytesToBase64Url(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64URL_ALPHABET[b0 >> 2];
    out += B64URL_ALPHABET[(b0 & 3) << 4 | (b1 ?? 0) >> 4];
    if (b1 === void 0) break;
    out += B64URL_ALPHABET[(b1 & 15) << 2 | (b2 ?? 0) >> 6];
    if (b2 === void 0) break;
    out += B64URL_ALPHABET[b2 & 63];
  }
  return out;
}
function base64UrlToBytes(value) {
  const clean2 = value.trim();
  if (clean2.length === 0) return new Uint8Array(0);
  for (const char of clean2) {
    if (!(char in B64URL_LOOKUP)) {
      throw new Error(`Not valid base64url: unexpected character ${JSON.stringify(char)}`);
    }
  }
  if (clean2.length % 4 === 1) {
    throw new Error("Not valid base64url: truncated final quantum");
  }
  const outLength = Math.floor(clean2.length * 3 / 4);
  const out = new Uint8Array(outLength);
  let outIndex = 0;
  for (let i = 0; i < clean2.length; i += 4) {
    const c0 = B64URL_LOOKUP[clean2[i]];
    const c1 = B64URL_LOOKUP[clean2[i + 1]];
    const c2 = B64URL_LOOKUP[clean2[i + 2]];
    const c3 = B64URL_LOOKUP[clean2[i + 3]];
    out[outIndex++] = c0 << 2 | (c1 ?? 0) >> 4;
    if (c2 === void 0) break;
    out[outIndex++] = ((c1 ?? 0) & 15) << 4 | c2 >> 2;
    if (c3 === void 0) break;
    out[outIndex++] = (c2 & 3) << 6 | c3;
  }
  return out.subarray(0, outIndex);
}
function base64UrlToUtf8(value) {
  return bytesToUtf8(base64UrlToBytes(value));
}
function utf8ToBase64Url(value) {
  return bytesToBase64Url(utf8ToBytes2(value));
}

// ../core/src/util/hash.ts
function sha256Hex(input) {
  const bytes = typeof input === "string" ? utf8ToBytes2(input) : input;
  return bytesToHex(sha256(bytes));
}
function canonicalJson(value) {
  const canonical = (0, import_canonicalize.default)(value);
  if (canonical === void 0) {
    throw new Error("Value cannot be canonicalized to JSON (undefined or unsupported type)");
  }
  return canonical;
}
function hashObject(value) {
  return `sha256:${sha256Hex(canonicalJson(value))}`;
}

// ../core/src/recipe/parse.ts
function recipeProviders(recipe) {
  const providers = /* @__PURE__ */ new Set();
  for (const source of recipe.sources) {
    providers.add(source.provider);
    if (source.normalizer) providers.add(source.normalizer);
  }
  for (const entry of recipe.enrichers ?? []) providers.add(entry.provider);
  for (const entry of recipe.signals ?? []) providers.add(entry.provider);
  for (const entry of recipe.filters ?? []) providers.add(entry.provider);
  if (recipe.policy) providers.add(recipe.policy.provider);
  for (const entry of recipe.scorers ?? []) providers.add(entry.provider);
  for (const entry of recipe.constraints ?? []) providers.add(entry.provider);
  for (const entry of recipe.inserts ?? []) providers.add(entry.provider);
  for (const entry of recipe.postProcessors ?? []) providers.add(entry.provider);
  return [...providers].sort();
}
function recipeLanes(recipe) {
  const lanes = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (lane) => {
    if (seen.has(lane)) return;
    seen.add(lane);
    lanes.push(lane);
  };
  for (const source of recipe.sources) add(sourceLane(source));
  for (const op of recipe.setOps ?? []) add(op.into);
  return lanes;
}
function hashRecipe(recipe) {
  return hashObject(recipe);
}
function parseRecipe(input) {
  const issues = validateRecipe(input);
  if (issues.length > 0) {
    const spec = input?.spec;
    if (typeof spec === "string" && /^bitfeed\/\d+$/.test(spec) && spec !== RECIPE_SPEC) {
      throw new BitFeedError(
        "recipe-unsupported-spec",
        `Recipe spec "${spec}" is not supported by this engine (it speaks "${RECIPE_SPEC}").`,
        issues
      );
    }
    throw new RecipeValidationError(issues);
  }
  const recipe = input;
  const warnings = recipeWarnings(input);
  return {
    recipe,
    hash: hashRecipe(recipe),
    providers: recipeProviders(recipe),
    lanes: recipeLanes(recipe),
    ...warnings.length > 0 ? { warnings } : {}
  };
}
function parseRecipeJson(json) {
  let value;
  try {
    value = JSON.parse(json);
  } catch (error) {
    throw new RecipeValidationError([
      `Recipe is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
    ]);
  }
  return parseRecipe(value);
}
function forkRecipe(recipe, changes, source) {
  return {
    ...recipe,
    ...changes,
    fork: {
      source: source ?? recipe.id ?? recipe.name,
      version: hashRecipe(recipe)
    }
  };
}

// ../core/src/cache/index.ts
var MemoryCache = class {
  entries = /* @__PURE__ */ new Map();
  maxEntries;
  now;
  constructor(options = {}) {
    this.maxEntries = options.maxEntries ?? 1e3;
    this.now = options.now ?? (() => Date.now());
  }
  async get(key) {
    const entry = this.entries.get(key);
    if (entry === void 0) return void 0;
    if (entry.expiresAt !== null && entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return void 0;
    }
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }
  /** `ttl` is in seconds, matching the adapter interface in §72. */
  async set(key, value, ttl) {
    this.entries.delete(key);
    this.entries.set(key, {
      value,
      expiresAt: ttl === void 0 ? null : this.now() + ttl * 1e3
    });
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next();
      if (oldest.done === true) break;
      this.entries.delete(oldest.value);
    }
  }
  clear() {
    this.entries.clear();
  }
  get size() {
    return this.entries.size;
  }
};
var NullCache = class {
  async get() {
    return void 0;
  }
  async set() {
  }
};

// ../core/src/cursor/index.ts
var CURSOR_VERSION = 1;
var CURSOR_SEEN_LIMIT = 500;
function encodeCursor(state) {
  return utf8ToBase64Url(JSON.stringify(state));
}
function decodeCursor(cursor, recipeHash) {
  let parsed;
  try {
    parsed = JSON.parse(base64UrlToUtf8(cursor));
  } catch (error) {
    throw new BitFeedError(
      "cursor-invalid",
      `Cursor could not be decoded: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new BitFeedError("cursor-invalid", "Cursor did not decode to an object");
  }
  const state = parsed;
  if (state.v !== CURSOR_VERSION) {
    throw new BitFeedError(
      "cursor-invalid",
      `Unsupported cursor version ${String(state.v)} (this engine writes v${CURSOR_VERSION})`
    );
  }
  if (typeof state.recipeHash !== "string" || typeof state.seed !== "string") {
    throw new BitFeedError("cursor-invalid", "Cursor is missing recipeHash or seed");
  }
  if (!Number.isInteger(state.offset) || state.offset < 0) {
    throw new BitFeedError("cursor-invalid", "Cursor offset must be a non-negative integer");
  }
  if (state.recipeHash !== recipeHash) {
    throw new BitFeedError(
      "cursor-mismatch",
      "Cursor was issued for a different recipe. Start a new page-one request after changing the recipe."
    );
  }
  return {
    v: CURSOR_VERSION,
    recipeHash: state.recipeHash,
    seed: state.seed,
    offset: state.offset,
    ...typeof state.session === "string" ? { session: state.session } : {},
    ...state.sources && typeof state.sources === "object" && !Array.isArray(state.sources) ? { sources: state.sources } : {},
    ...Array.isArray(state.seen) ? { seen: state.seen.filter((id) => typeof id === "string") } : {}
  };
}
function advanceCursor(previous, deliveredIds, sources) {
  const seen = [...previous.seen ?? [], ...deliveredIds];
  const trimmed = seen.length > CURSOR_SEEN_LIMIT ? seen.slice(seen.length - CURSOR_SEEN_LIMIT) : seen;
  const next = {
    ...previous,
    offset: previous.offset + deliveredIds.length,
    seen: trimmed
  };
  if (sources !== void 0) {
    if (Object.keys(sources).length > 0) next.sources = sources;
    else delete next.sources;
  }
  return next;
}

// ../core/src/random/index.ts
function sfc32(a, b, c, d) {
  let s0 = a >>> 0;
  let s1 = b >>> 0;
  let s2 = c >>> 0;
  let s3 = d >>> 0;
  return function next() {
    s0 >>>= 0;
    s1 >>>= 0;
    s2 >>>= 0;
    s3 >>>= 0;
    let t = s0 + s1 | 0;
    s0 = s1 ^ s1 >>> 9;
    s1 = s2 + (s2 << 3) | 0;
    s2 = s2 << 21 | s2 >>> 11;
    s3 = s3 + 1 | 0;
    t = t + s3 | 0;
    s2 = s2 + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
function stateFromSeed(seed) {
  const digest = sha256(utf8ToBytes2(seed));
  const view = new DataView(digest.buffer, digest.byteOffset, digest.byteLength);
  return [view.getUint32(0), view.getUint32(4), view.getUint32(8), view.getUint32(12)];
}
function createSeededRandom(seed) {
  const [a, b, c, d] = stateFromSeed(seed);
  const next = sfc32(a, b, c, d);
  for (let i = 0; i < 12; i += 1) next();
  return {
    seed,
    next,
    nextInt(bound) {
      if (!Number.isFinite(bound) || bound <= 0) return 0;
      return Math.floor(next() * bound);
    },
    derive(label) {
      return createSeededRandom(`${seed}\0${label}`);
    }
  };
}
function buildSeed(parts) {
  if (parts.explicit !== void 0 && parts.explicit !== "") return parts.explicit;
  return [
    `recipe=${parts.recipeHash ?? ""}`,
    `viewer=${parts.viewer ?? ""}`,
    `surface=${parts.surface ?? ""}`,
    `session=${parts.session ?? ""}`,
    `epoch=${parts.epoch ?? ""}`
  ].join("\0");
}
function seededShuffle(items, random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = random.nextInt(i + 1);
    const a = out[i];
    const b = out[j];
    out[i] = b;
    out[j] = a;
  }
  return out;
}

// ../core/src/pipeline/insert.ts
function insertionSlots(entry, limit) {
  if (entry.at !== void 0) {
    return [...new Set(entry.at)].filter((slot) => slot < limit).sort((a, b) => a - b);
  }
  const every = entry.every;
  if (every === void 0 || every <= 0) return [];
  const slots = [];
  for (let slot = every; slot < limit; slot += every + 1) slots.push(slot);
  return slots;
}
function weaveInserts(organic, inserts, limit) {
  if (inserts.length === 0) return organic.slice(0, limit);
  const bySlot = /* @__PURE__ */ new Map();
  for (const insert of inserts) {
    if (!bySlot.has(insert.slot)) bySlot.set(insert.slot, insert);
  }
  const out = [];
  let organicIndex = 0;
  for (let position = 0; position < limit; position += 1) {
    const insert = bySlot.get(position);
    if (insert !== void 0) {
      out.push({
        candidate: insert.candidate,
        placement: {
          type: insert.sponsored ? "sponsored" : "inserted",
          provider: insert.provider
        }
      });
      continue;
    }
    const next = organic[organicIndex];
    if (next === void 0) break;
    organicIndex += 1;
    out.push(next);
  }
  return out;
}

// ../core/src/pipeline/mix.ts
function normalizeRatios(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.ratio, 0);
  const out = /* @__PURE__ */ new Map();
  if (total <= 0) return out;
  for (const entry of entries) out.set(entry.lane, entry.ratio / total);
  return out;
}
function mixLanes(lanes, limit) {
  if (limit <= 0 || lanes.length === 0) return [];
  const total = lanes.reduce((sum, lane) => sum + lane.ratio, 0);
  if (total <= 0) return [];
  const shares = lanes.map((lane) => lane.ratio / total);
  const pointers = new Array(lanes.length).fill(0);
  const taken = new Array(lanes.length).fill(0);
  const used = /* @__PURE__ */ new Set();
  const out = [];
  const peek = (index) => {
    const items = lanes[index]?.items ?? [];
    let pointer = pointers[index];
    while (pointer < items.length && used.has(items[pointer].candidate.id)) {
      pointer += 1;
    }
    pointers[index] = pointer;
    return items[pointer];
  };
  for (let position = 0; position < limit; position += 1) {
    let chosen = -1;
    let bestDeficit = Number.NEGATIVE_INFINITY;
    for (let index = 0; index < lanes.length; index += 1) {
      if (peek(index) === void 0) continue;
      const deficit = shares[index] * (position + 1) - taken[index];
      if (deficit > bestDeficit) {
        bestDeficit = deficit;
        chosen = index;
      }
    }
    if (chosen === -1) break;
    const item = peek(chosen);
    used.add(item.candidate.id);
    pointers[chosen] = pointers[chosen] + 1;
    taken[chosen] = taken[chosen] + 1;
    out.push({ ...item, lanes: [lanes[chosen]?.lane ?? item.lanes[0] ?? ""] });
  }
  return out;
}

// ../core/src/pipeline/ordering.ts
function tiebreak(seed, id, cache) {
  const existing = cache.get(id);
  if (existing !== void 0) return existing;
  const value = sha256Hex(`${seed}\0${id}`);
  cache.set(id, value);
  return value;
}
function rankDeterministically(candidates, seed) {
  const cache = /* @__PURE__ */ new Map();
  return candidates.slice().sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ta = tiebreak(seed, a.candidate.id, cache);
    const tb = tiebreak(seed, b.candidate.id, cache);
    if (ta !== tb) return ta < tb ? -1 : 1;
    return a.candidate.id < b.candidate.id ? -1 : a.candidate.id > b.candidate.id ? 1 : 0;
  });
}

// ../core/src/pipeline/setops.ts
function dedupe(ids) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
function union(operands) {
  return dedupe(operands.flat());
}
function intersection(operands) {
  const [first, ...rest] = operands;
  if (first === void 0) return [];
  const others = rest.map((ids) => new Set(ids));
  return dedupe(first).filter((id) => others.every((set) => set.has(id)));
}
function difference(operands) {
  const [first, ...rest] = operands;
  if (first === void 0) return [];
  const removed = new Set(rest.flat());
  return dedupe(first).filter((id) => !removed.has(id));
}
function applySetOps(lanes, ops) {
  const next = new Map(lanes);
  for (const op of ops) {
    const operands = op.lanes.map((lane) => next.get(lane) ?? []);
    const result = op.op === "union" ? union(operands) : op.op === "intersection" ? intersection(operands) : difference(operands);
    next.set(op.into, result);
  }
  return next;
}
function liveLanes(sourceLanes, ops) {
  const live = new Set(sourceLanes);
  for (const op of ops) {
    for (const lane of op.lanes) live.delete(lane);
    live.add(op.into);
  }
  return live;
}

// ../core/src/pipeline/runtime.ts
var RUNTIME_KEYS = {
  /** Candidates handed straight to `compose()`, read by the `bitfeed.input` source. */
  candidates: "bitfeed:candidates",
  /** The resolved exploration seed for this run (§45). */
  seed: "bitfeed:seed",
  /** Exploration level in [0, 1] (§48). */
  exploration: "bitfeed:exploration",
  /** Hash of the recipe being executed. */
  recipeHash: "bitfeed:recipeHash"
};
function withRuntime(context, runtime) {
  return {
    ...context,
    metadata: {
      ...context.metadata,
      [RUNTIME_KEYS.seed]: runtime.seed,
      [RUNTIME_KEYS.exploration]: runtime.exploration,
      [RUNTIME_KEYS.recipeHash]: runtime.recipeHash,
      [RUNTIME_KEYS.candidates]: runtime.candidates
    }
  };
}
function runtimeSeed(context) {
  const value = context.metadata?.[RUNTIME_KEYS.seed];
  return typeof value === "string" ? value : "";
}
function runtimeExploration(context) {
  const value = context.metadata?.[RUNTIME_KEYS.exploration];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function resolveNow(context, fallback) {
  if (typeof context.now === "number") return context.now;
  return fallback === void 0 ? Math.floor(Date.now() / 1e3) : fallback();
}

// ../core/src/pipeline/compose.ts
function isParsed(value) {
  return "recipe" in value && "hash" in value;
}
function viewerSeedPart(viewer) {
  if (viewer === void 0 || viewer === null) return "";
  if (typeof viewer === "string") return viewer;
  try {
    return hashObject(viewer);
  } catch {
    return "";
  }
}
var BitFeed = class {
  registry;
  cache;
  logger;
  defaultLimit;
  overfetch;
  clock;
  constructor(options) {
    this.registry = options.registry;
    this.cache = options.cache ?? new NullCache();
    this.logger = options.logger;
    this.defaultLimit = options.defaultLimit ?? 50;
    this.overfetch = Math.max(1, options.overfetch ?? 3);
    this.clock = options.now ?? (() => Math.floor(Date.now() / 1e3));
  }
  /** The cache adapter this engine was built with (§72). Providers may share it. */
  get cacheAdapter() {
    return this.cache;
  }
  /**
   * §43 — "Why am I seeing this?" as one call.
   *
   * Instance method for discoverability; identical to the exported
   * `explainItem`. The breakdown is derived from the item itself (see
   * `explainItem` for the guarantees), so it needs no registry access and is
   * safe on items that crossed a serialization boundary.
   */
  explain(item) {
    return explainItem(item);
  }
  async compose(request) {
    const parsed = isParsed(request.recipe) ? request.recipe : parseRecipe(request.recipe);
    const { recipe } = parsed;
    const resolution = this.registry.assertSatisfies(parsed);
    const warnings = [];
    const stages = [];
    const collectDiagnostics = request.diagnostics === true;
    const baseContext = request.viewer !== void 0 && request.context?.viewer === void 0 ? { ...request.context, viewer: request.viewer } : request.context ?? {};
    const now = resolveNow(baseContext, this.clock);
    if (recipe.expires !== void 0 && recipe.expires <= now) {
      throw new BitFeedError(
        "recipe-expired",
        `Recipe "${recipe.name}" expired at ${recipe.expires} (now ${now}). Compose with a current recipe, or fork this one without \`expires\`.`
      );
    }
    warnings.push(...parsed.warnings ?? []);
    const cursorState = request.cursor === void 0 ? void 0 : decodeCursor(request.cursor, parsed.hash);
    const seed = cursorState?.seed ?? buildSeed({
      explicit: recipe.seed,
      recipeHash: parsed.hash,
      viewer: viewerSeedPart(baseContext.viewer),
      surface: baseContext.surface ?? "",
      session: baseContext.session ?? ""
    });
    const context = withRuntime({ ...baseContext, now }, {
      seed,
      exploration: recipe.exploration ?? 0,
      recipeHash: parsed.hash,
      candidates: request.candidates ?? []
    });
    const limit = request.limit ?? recipe.limit ?? this.defaultLimit;
    const missing = new Set(resolution.missingOptionalRefs.map((ref) => `${ref.kind}:${ref.id}`));
    const track = async (stage, inCount, run, describe) => {
      if (!collectDiagnostics) return run();
      const started = Date.now();
      const result = await run();
      const described = describe(result);
      stages.push({
        stage,
        in: inCount,
        out: described.out,
        durationMs: Date.now() - started,
        ...described.provider !== void 0 ? { provider: described.provider } : {},
        ...described.notes !== void 0 ? { notes: described.notes } : {}
      });
      return result;
    };
    const pool = /* @__PURE__ */ new Map();
    const lanes = /* @__PURE__ */ new Map();
    const laneStats = {};
    const sourceCursorKey = (index, entry) => `${index}:${entry.provider}`;
    const sourced = await track(
      "source",
      0,
      async () => {
        const loads = recipe.sources.map(async (entry, index) => {
          const lane = sourceLane(entry);
          const key = sourceCursorKey(index, entry);
          if (missing.has(`source:${entry.provider}`)) {
            return { entry, key, lane, candidates: [], ran: false };
          }
          const provider = this.registry.getSource(entry.provider);
          if (provider === void 0) {
            warnings.push(`Source "${entry.provider}" is not registered; lane "${lane}" is empty.`);
            return { entry, key, lane, candidates: [], ran: false };
          }
          try {
            const loaded = await provider.load(
              {
                params: entry.input ?? {},
                ...cursorState?.sources?.[key] !== void 0 ? { cursor: cursorState.sources[key] } : {},
                ...entry.limit !== void 0 ? { limit: entry.limit } : {}
              },
              context
            );
            const list = Array.isArray(loaded) ? loaded : loaded.candidates;
            const cursor = !Array.isArray(loaded) ? loaded.cursor : void 0;
            const capped = entry.limit === void 0 ? list : list.slice(0, entry.limit);
            return {
              entry,
              key,
              lane,
              candidates: capped,
              ran: true,
              ...cursor !== void 0 ? { cursor } : {}
            };
          } catch (error) {
            if (entry.optional === true) {
              warnings.push(`Optional source "${entry.provider}" failed: ${describeError(error)}`);
              return { entry, key, lane, candidates: [], ran: false };
            }
            throw new ProviderError(entry.provider, error);
          }
        });
        return Promise.all(loads);
      },
      (results) => ({ out: results.reduce((sum, r) => sum + r.candidates.length, 0) })
    );
    const sourceCursors = { ...cursorState?.sources ?? {} };
    for (const result of sourced) {
      if (!result.ran) continue;
      if (result.cursor !== void 0) sourceCursors[result.key] = result.cursor;
      else delete sourceCursors[result.key];
    }
    for (const { entry, lane, candidates } of sourced) {
      const normalizer = entry.normalizer === void 0 ? void 0 : this.registry.getNormalizer(entry.normalizer);
      if (entry.normalizer !== void 0 && normalizer === void 0) {
        warnings.push(`Normalizer "${entry.normalizer}" is not registered; source "${entry.provider}" passed through unnormalized.`);
      }
      const laneIds = lanes.get(lane) ?? [];
      let sourcedCount = 0;
      for (const raw of candidates) {
        let candidate = raw;
        if (normalizer !== void 0) {
          try {
            candidate = await normalizer.normalize(raw.value, context);
          } catch (error) {
            if (entry.optional !== true) throw new ProviderError(entry.normalizer, error);
            warnings.push(`Optional normalizer "${entry.normalizer}" failed: ${describeError(error)}`);
            candidate = null;
          }
        }
        if (candidate === null || candidate === void 0) continue;
        sourcedCount += 1;
        const existing = pool.get(candidate.id);
        if (existing === void 0) {
          pool.set(candidate.id, {
            candidate,
            lanes: [lane],
            sources: [entry.provider],
            signals: {},
            reasons: [],
            score: 0,
            metadata: {}
          });
        } else {
          if (!existing.lanes.includes(lane)) existing.lanes.push(lane);
          if (!existing.sources.includes(entry.provider)) existing.sources.push(entry.provider);
        }
        if (!laneIds.includes(candidate.id)) laneIds.push(candidate.id);
      }
      lanes.set(lane, laneIds);
      const stat = laneStats[lane] ?? { sourced: 0, eligible: 0, returned: 0 };
      stat.sourced += sourcedCount;
      laneStats[lane] = stat;
    }
    const candidateCount = pool.size;
    let workingLanes = lanes;
    if (recipe.setOps !== void 0 && recipe.setOps.length > 0) {
      workingLanes = await track(
        "setops",
        pool.size,
        async () => applySetOps(lanes, recipe.setOps ?? []),
        (result) => ({ out: new Set([...result.values()].flat()).size })
      );
      const live = liveLanes(lanes.keys(), recipe.setOps);
      for (const lane of [...workingLanes.keys()]) {
        if (!live.has(lane)) workingLanes.delete(lane);
      }
      const surviving = new Set([...workingLanes.values()].flat());
      for (const id of [...pool.keys()]) {
        if (!surviving.has(id)) pool.delete(id);
      }
      for (const [id, working] of pool) {
        working.lanes = [...workingLanes.entries()].filter(([, ids]) => ids.includes(id)).map(([lane]) => lane);
      }
    }
    if (cursorState?.seen !== void 0 && cursorState.seen.length > 0) {
      const seen = new Set(cursorState.seen);
      for (const id of [...pool.keys()]) {
        if (seen.has(id)) pool.delete(id);
      }
    }
    for (const entry of recipe.enrichers ?? []) {
      if (missing.has(`enricher:${entry.provider}`)) continue;
      const enricher = this.registry.getEnricher(entry.provider);
      if (enricher === void 0) {
        warnings.push(`Enricher "${entry.provider}" is not registered; skipped.`);
        continue;
      }
      const candidates = [...pool.values()].map((working) => working.candidate);
      if (candidates.length === 0) break;
      await track(
        "enrich",
        candidates.length,
        async () => {
          try {
            const enriched = await enricher.enrich(candidates, context, entry.params ?? {});
            for (const [id, metadata] of enriched) {
              const working = pool.get(id);
              if (working === void 0) continue;
              working.metadata = { ...working.metadata, ...metadata };
              working.candidate = {
                ...working.candidate,
                metadata: { ...working.candidate.metadata, ...metadata }
              };
            }
            return enriched.size;
          } catch (error) {
            if (entry.optional === true) {
              warnings.push(`Optional enricher "${entry.provider}" failed: ${describeError(error)}`);
              return 0;
            }
            throw new ProviderError(entry.provider, error);
          }
        },
        (count) => ({ out: pool.size, provider: entry.provider, notes: `enriched ${count}` })
      );
    }
    for (const entry of recipe.signals ?? []) {
      if (missing.has(`signal:${entry.provider}`)) continue;
      const signal = this.registry.getSignal(entry.provider);
      if (signal === void 0) {
        warnings.push(`Signal "${entry.provider}" is not registered; skipped.`);
        continue;
      }
      await track(
        "signal",
        pool.size,
        async () => {
          const results = await Promise.all(
            [...pool.values()].map(async (working) => {
              try {
                return { working, result: await signal.evaluate(working.candidate, context) };
              } catch (error) {
                if (entry.optional === true) {
                  warnings.push(
                    `Optional signal "${entry.provider}" failed for ${working.candidate.id}: ${describeError(error)}`
                  );
                  return { working, result: void 0 };
                }
                throw new ProviderError(entry.provider, error);
              }
            })
          );
          let evaluated = 0;
          for (const { working, result } of results) {
            if (result === void 0) continue;
            evaluated += 1;
            working.signals[entry.provider] = result;
            const existing = working.candidate.metadata?.[SIGNAL_METADATA_KEY];
            const signals = typeof existing === "object" && existing !== null ? { ...existing } : {};
            signals[entry.provider] = result.value;
            working.candidate = {
              ...working.candidate,
              metadata: { ...working.candidate.metadata, [SIGNAL_METADATA_KEY]: signals }
            };
          }
          return evaluated;
        },
        (evaluated) => ({ out: pool.size, provider: entry.provider, notes: `evaluated ${evaluated}` })
      );
    }
    for (const entry of recipe.filters ?? []) {
      if (missing.has(`filter:${entry.provider}`)) continue;
      const filter = this.registry.getFilter(entry.provider);
      if (filter === void 0) {
        warnings.push(`Filter "${entry.provider}" is not registered; skipped.`);
        continue;
      }
      const before = pool.size;
      await track(
        "filter",
        before,
        async () => {
          const verdicts = await Promise.all(
            [...pool.values()].map(async (working) => {
              try {
                const keep = await filter.evaluate(working.candidate, context, entry.params ?? {});
                return { id: working.candidate.id, keep };
              } catch (error) {
                if (entry.optional === true) {
                  warnings.push(
                    `Optional filter "${entry.provider}" failed for ${working.candidate.id}: ${describeError(error)}`
                  );
                  return { id: working.candidate.id, keep: true };
                }
                throw new ProviderError(entry.provider, error);
              }
            })
          );
          for (const verdict of verdicts) {
            if (!verdict.keep) pool.delete(verdict.id);
          }
          return pool.size;
        },
        (out) => ({ out, provider: entry.provider })
      );
    }
    if (recipe.policy !== void 0 && !missing.has(`policy:${recipe.policy.provider}`)) {
      const entry = recipe.policy;
      const policy = this.registry.getPolicy(entry.provider);
      if (policy === void 0) {
        warnings.push(`Policy "${entry.provider}" is not registered; skipped.`);
      } else {
        await track(
          "policy",
          pool.size,
          async () => {
            const decisions = await Promise.all(
              [...pool.values()].map(async (working) => {
                try {
                  const decision = await policy.decide(working.candidate, context, entry.params ?? {});
                  return { working, decision };
                } catch (error) {
                  if (entry.optional === true) {
                    warnings.push(`Optional policy "${entry.provider}" failed: ${describeError(error)}`);
                    return { working, decision: void 0 };
                  }
                  throw new ProviderError(entry.provider, error);
                }
              })
            );
            for (const { working, decision } of decisions) {
              if (decision === void 0) continue;
              working.policy = decision;
              if (decision.effect === "deny") {
                pool.delete(working.candidate.id);
              }
            }
            return pool.size;
          },
          (out) => ({ out, provider: entry.provider })
        );
      }
    }
    const eligibleCount = pool.size;
    const scorers = (recipe.scorers ?? []).filter((entry) => !missing.has(`scorer:${entry.provider}`)).flatMap((entry) => {
      const scorer = this.registry.getScorer(entry.provider);
      if (scorer === void 0) {
        warnings.push(`Scorer "${entry.provider}" is not registered; skipped.`);
        return [];
      }
      return [{ entry, scorer }];
    });
    const weightTotal = scorers.reduce((sum, { entry }) => sum + entry.weight, 0);
    await track(
      "score",
      pool.size,
      async () => {
        await Promise.all(
          [...pool.values()].map(async (working) => {
            const reasons = [];
            let total = 0;
            for (const { entry, scorer } of scorers) {
              let result;
              try {
                result = await scorer.score(working.candidate, context, entry.params ?? {});
              } catch (error) {
                if (entry.optional !== true) throw new ProviderError(entry.provider, error);
                warnings.push(`Optional scorer "${entry.provider}" failed: ${describeError(error)}`);
                continue;
              }
              const weight = weightTotal > 0 ? entry.weight / weightTotal : 0;
              const contribution = weight * result.score;
              total += contribution;
              reasons.push({
                provider: entry.provider,
                contribution,
                ...result.reason !== void 0 ? { label: result.reason } : {},
                ...result.metadata !== void 0 ? { metadata: result.metadata } : {}
              });
            }
            if (working.policy?.effect === "downrank") {
              const modifier = clamp01(working.policy.modifier ?? 1);
              const penalty = total * modifier - total;
              total *= modifier;
              reasons.push({
                provider: recipe.policy?.provider ?? "policy",
                contribution: penalty,
                label: working.policy.label ?? "policy downrank"
              });
            }
            working.score = total;
            working.reasons = reasons;
          })
        );
        return pool.size;
      },
      (out) => ({ out, notes: `${scorers.length} scorer(s)` })
    );
    const overfetchLimit = limit * this.overfetch;
    const all = [...pool.values()];
    let composed;
    if (recipe.mix !== void 0 && recipe.mix.length > 0) {
      const mixInputs = recipe.mix.map((entry) => {
        const ids = new Set(workingLanes.get(entry.lane) ?? []);
        const members = all.filter((working) => ids.has(working.candidate.id));
        const stat = laneStats[entry.lane] ?? { sourced: 0, eligible: 0, returned: 0 };
        stat.eligible = members.length;
        laneStats[entry.lane] = stat;
        return { lane: entry.lane, ratio: entry.ratio, items: rankDeterministically(members, seed) };
      });
      composed = await track(
        "mix",
        all.length,
        async () => mixLanes(mixInputs, overfetchLimit),
        (result) => ({ out: result.length })
      );
      if (composed.length === 0 && all.length > 0) {
        warnings.push("Mix produced no items even though eligible candidates exist \u2014 check that mix lanes match the lanes your sources and setOps produce.");
      }
    } else {
      composed = rankDeterministically(all, seed).slice(0, overfetchLimit);
      for (const lane of workingLanes.keys()) {
        const stat = laneStats[lane] ?? { sourced: 0, eligible: 0, returned: 0 };
        stat.eligible = (workingLanes.get(lane) ?? []).length;
        laneStats[lane] = stat;
      }
    }
    for (const entry of recipe.constraints ?? []) {
      if (missing.has(`constraint:${entry.provider}`)) continue;
      const constraint = this.registry.getConstraint(entry.provider);
      if (constraint === void 0) {
        warnings.push(`Constraint "${entry.provider}" is not registered; skipped.`);
        continue;
      }
      composed = await track(
        "constrain",
        composed.length,
        async () => {
          try {
            return await constraint.apply(composed, context, entry.params ?? {});
          } catch (error) {
            if (entry.optional === true) {
              warnings.push(`Optional constraint "${entry.provider}" failed: ${describeError(error)}`);
              return composed;
            }
            throw new ProviderError(entry.provider, error);
          }
        },
        (result) => ({ out: result.length, provider: entry.provider })
      );
    }
    const organic = composed.slice(0, limit).map((working) => toItem(working));
    const placements = [];
    for (const entry of recipe.inserts ?? []) {
      if (missing.has(`insert:${entry.provider}`)) continue;
      const provider = this.registry.getInsert(entry.provider);
      if (provider === void 0) {
        warnings.push(`Insert "${entry.provider}" is not registered; skipped.`);
        continue;
      }
      const slots = insertionSlots(entry, limit);
      if (slots.length === 0) continue;
      try {
        const filled = await provider.insert(
          { organicCount: organic.length, slots, params: entry.params ?? {} },
          context
        );
        for (const [slot, candidate] of filled) {
          if (!slots.includes(slot)) continue;
          placements.push({
            slot,
            provider: entry.provider,
            candidate,
            sponsored: entry.params?.sponsored !== false
          });
        }
      } catch (error) {
        if (entry.optional !== true) throw new ProviderError(entry.provider, error);
        warnings.push(`Optional insert "${entry.provider}" failed: ${describeError(error)}`);
      }
    }
    let items = weaveInserts(organic, placements, limit);
    for (const entry of recipe.postProcessors ?? []) {
      if (missing.has(`postProcessor:${entry.provider}`)) continue;
      const processor = this.registry.getPostProcessor(entry.provider);
      if (processor === void 0) {
        warnings.push(`Post-processor "${entry.provider}" is not registered; skipped.`);
        continue;
      }
      items = await track(
        "postprocess",
        items.length,
        async () => {
          try {
            return await processor.process(items, context, entry.params ?? {});
          } catch (error) {
            if (entry.optional === true) {
              warnings.push(`Optional post-processor "${entry.provider}" failed: ${describeError(error)}`);
              return items;
            }
            throw new ProviderError(entry.provider, error);
          }
        },
        (result) => ({ out: result.length, provider: entry.provider })
      );
    }
    for (const item of items) {
      if (item.placement !== void 0 && item.placement.type !== "organic") continue;
      const lane = item.lane;
      if (lane === void 0) continue;
      const stat = laneStats[lane] ?? { sourced: 0, eligible: 0, returned: 0 };
      stat.returned += 1;
      laneStats[lane] = stat;
    }
    const deliveredOrganic = items.filter((item) => item.placement === void 0 || item.placement.type === "organic").map((item) => item.candidate.id);
    const previousCursor = cursorState ?? {
      v: 1,
      recipeHash: parsed.hash,
      seed,
      offset: 0,
      ...baseContext.session !== void 0 ? { session: baseContext.session } : {}
    };
    const nextCursor = advanceCursor(previousCursor, deliveredOrganic, sourceCursors);
    const diagnostics = collectDiagnostics ? { stages, missingOptional: resolution.missingOptional, warnings, lanes: laneStats } : warnings.length > 0 ? { stages: [], missingOptional: resolution.missingOptional, warnings, lanes: laneStats } : void 0;
    if (warnings.length > 0) {
      this.logger?.warn?.(`BitFeed composed "${recipe.name}" with ${warnings.length} warning(s)`, warnings);
    }
    const moreUpstream = Object.keys(sourceCursors).length > 0;
    const moreEligible = eligibleCount > deliveredOrganic.length;
    const scores = {};
    const explanations = {};
    for (const item of items) {
      if (item.placement !== void 0 && item.placement.type !== "organic") continue;
      scores[item.candidate.id] = item.score ?? 0;
      explanations[item.candidate.id] = explainItem(item);
    }
    return {
      items,
      scores,
      explanations,
      recipe: { name: recipe.name, spec: recipe.spec, hash: parsed.hash },
      recipeHash: parsed.hash,
      engineVersion: ENGINE_VERSION,
      ...moreUpstream || moreEligible ? { cursor: encodeCursor(nextCursor) } : {},
      receipt: {
        recipeHash: parsed.hash,
        engineVersion: ENGINE_VERSION,
        generatedAt: now,
        candidateCount,
        eligibleCount,
        returned: items.length,
        providers: resolution.satisfied
      },
      ...diagnostics !== void 0 ? { diagnostics } : {}
    };
  }
};
function toItem(working) {
  return {
    candidate: working.candidate,
    score: working.score,
    reasons: working.reasons,
    placement: { type: "organic" },
    ...working.lanes[0] !== void 0 ? { lane: working.lanes[0] } : {},
    ...working.sources.length > 0 ? { sources: [...working.sources] } : {},
    ...Object.keys(working.metadata).length > 0 ? { metadata: working.metadata } : {}
  };
}
function explainItem(item) {
  const signals = {};
  for (const reason of item.reasons ?? []) {
    signals[reason.provider] = (signals[reason.provider] ?? 0) + (typeof reason.contribution === "number" && Number.isFinite(reason.contribution) ? reason.contribution : 0);
  }
  return {
    total: item.score ?? 0,
    signals,
    ...item.lane !== void 0 ? { lane: item.lane } : {},
    ...item.sources !== void 0 ? { sources: [...item.sources] } : {},
    placement: item.placement?.type ?? "organic"
  };
}
function clamp01(value) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}
function createBitFeed(options) {
  return new BitFeed(options);
}

// ../core/src/pipeline/explain-format.ts
function prettifyProvider(id) {
  const tail = id.includes(".") ? id.slice(id.lastIndexOf(".") + 1) : id;
  const spaced = tail.replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
  if (!spaced) return id;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}
function explanationRows(item) {
  const byProvider = /* @__PURE__ */ new Map();
  for (const reason of item.reasons ?? []) {
    const contribution = typeof reason.contribution === "number" && Number.isFinite(reason.contribution) ? reason.contribution : 0;
    const existing = byProvider.get(reason.provider);
    if (existing) {
      existing.contribution += contribution;
      if (!existing.label && reason.label) existing.label = reason.label;
    } else {
      byProvider.set(reason.provider, { contribution, ...reason.label ? { label: reason.label } : {} });
    }
  }
  const magnitude = [...byProvider.values()].reduce((sum, r) => sum + Math.abs(r.contribution), 0);
  return [...byProvider.entries()].map(([provider, r]) => ({
    provider,
    label: r.label ?? prettifyProvider(provider),
    contribution: r.contribution,
    share: magnitude > 0 ? Math.abs(r.contribution) / magnitude : 0
  })).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}
function placementNote(placement) {
  return placement === "sponsored" ? "sponsored" : placement === "inserted" ? "inserted" : "";
}
function formatExplanation(item, options = {}) {
  const precision = options.precision ?? 2;
  const rows = explanationRows(item);
  const placement = item.placement?.type ?? "organic";
  const note = placementNote(placement);
  if (rows.length === 0) {
    return note ? note.charAt(0).toUpperCase() + note.slice(1) : "No ranking signals";
  }
  const maxRows = options.maxRows ?? rows.length;
  const shown = rows.slice(0, Math.max(1, maxRows));
  const hidden = rows.length - shown.length;
  const parts = shown.map((r) => {
    const sign = r.contribution >= 0 ? "+" : "\u2212";
    return `${r.label} ${sign}${Math.abs(r.contribution).toFixed(precision)}`;
  });
  if (hidden > 0) parts.push(`+${hidden} more`);
  const total = (item.score ?? 0).toFixed(precision);
  const suffix = note ? ` (${note})` : "";
  return `${parts.join(" \xB7 ")} \u2192 ${total}${suffix}`;
}

// ../core/src/providers/index.ts
var providers_exports = {};
__export(providers_exports, {
  PREFERENCE_CONTEXT_KEY: () => PREFERENCE_CONTEXT_KEY,
  STANDARD_PROVIDERS: () => STANDARD_PROVIDERS,
  dedupePostProcessor: () => dedupePostProcessor,
  excludeFilter: () => excludeFilter,
  inputSource: () => inputSource,
  maxPerKeyConstraint: () => maxPerKeyConstraint,
  numberParam: () => numberParam,
  preferenceScorer: () => preferenceScorer,
  randomScorer: () => randomScorer,
  readField: () => readField,
  readKey: () => readKey,
  readKeys: () => readKeys,
  readPreferenceProfile: () => readPreferenceProfile,
  readSignal: () => readSignal,
  readTimestamp: () => readTimestamp,
  recencyScorer: () => recencyScorer,
  registerStandardProviders: () => registerStandardProviders,
  sessionFatigueConstraint: () => sessionFatigueConstraint,
  signalScorer: () => signalScorer,
  signalThresholdFilter: () => signalThresholdFilter,
  stringParam: () => stringParam
});

// ../core/src/providers/fields.ts
function readPath(source, path) {
  let current = source;
  for (const segment of path) {
    if (current === null || current === void 0) return void 0;
    if (typeof current !== "object") return void 0;
    current = current[segment];
  }
  return current;
}
function readField(candidate, field) {
  if (field.length === 0) return void 0;
  const segments = field.split(".");
  const [head, ...rest] = segments;
  if (head === "id") return rest.length === 0 ? candidate.id : void 0;
  if (head === "type") return rest.length === 0 ? candidate.type : void 0;
  if (head === "metadata") return readPath(candidate.metadata, rest);
  if (head === "value") return readPath(candidate.value, rest);
  const fromMetadata = readPath(candidate.metadata, segments);
  if (fromMetadata !== void 0) return fromMetadata;
  return readPath(candidate.value, segments);
}
function readKey(candidate, field) {
  const value = readField(candidate, field);
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return String(value);
  return null;
}
function readKeys(candidate, field) {
  const value = readField(candidate, field);
  if (value === void 0 || value === null) return [];
  const raw = Array.isArray(value) ? value : [value];
  const out = [];
  for (const item of raw) {
    if (typeof item === "string" && item.length > 0) out.push(item);
    else if (typeof item === "number" && Number.isFinite(item)) out.push(String(item));
  }
  return out;
}
function readTimestamp(candidate, field) {
  const value = readField(candidate, field);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1e11 ? Math.floor(value / 1e3) : value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return Math.floor(parsed / 1e3);
  }
  return null;
}
function numberParam(params, key, fallback) {
  const value = params[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function stringParam(params, key, fallback) {
  const value = params[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
function readSignal(candidate, signalId) {
  const signals = candidate.metadata?.["signals"];
  if (typeof signals !== "object" || signals === null) return null;
  const value = signals[signalId];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

// ../core/src/providers/standard.ts
var PREFERENCE_CONTEXT_KEY = "bitfeed:preferences";
function readPreferenceProfile(context) {
  const candidate = context.metadata?.[PREFERENCE_CONTEXT_KEY];
  if (typeof candidate !== "object" || candidate === null) return { weights: {} };
  const profile = candidate;
  return {
    weights: typeof profile.weights === "object" && profile.weights !== null ? profile.weights : {},
    ...Array.isArray(profile.exclusions) ? { exclusions: profile.exclusions } : {},
    ...typeof profile.snoozed === "object" && profile.snoozed !== null ? { snoozed: profile.snoozed } : {}
  };
}
var inputSource = {
  id: "bitfeed.input",
  async load(_input, context) {
    const value = context.metadata?.["bitfeed:candidates"];
    return Array.isArray(value) ? value : [];
  }
};
var recencyScorer = {
  id: "bitfeed.recency",
  async score(candidate, context, params) {
    const field = stringParam(params, "field", "createdAt");
    const halfLife = Math.max(1, numberParam(params, "halfLife", 86400));
    const timestamp = readTimestamp(candidate, field);
    if (timestamp === null) return { score: 0, reason: "no timestamp" };
    const now = resolveNow(context);
    const age = Math.max(0, now - timestamp);
    return {
      score: Math.pow(0.5, age / halfLife),
      reason: "recency",
      metadata: { ageSeconds: age }
    };
  }
};
var randomScorer = {
  id: "bitfeed.random",
  async score(candidate, context) {
    const seed = runtimeSeed(context);
    return {
      score: createSeededRandom(`${seed} random ${candidate.id}`).next(),
      reason: "exploration"
    };
  }
};
var preferenceScorer = {
  id: "bitfeed.preference",
  async score(candidate, context, params) {
    const field = stringParam(params, "field", "topics");
    const profile = readPreferenceProfile(context);
    const keys = readKeys(candidate, field);
    if (keys.length === 0) return { score: 0, reason: "no topics" };
    let sum = 0;
    const matched = [];
    for (const key of keys) {
      const weight = profile.weights[key];
      if (typeof weight !== "number" || !Number.isFinite(weight)) continue;
      sum += weight;
      matched.push(key);
    }
    if (matched.length === 0) return { score: 0, reason: "no preference match" };
    return {
      score: Math.min(1, Math.max(-1, sum)),
      reason: "interest match",
      metadata: { matched }
    };
  }
};
var excludeFilter = {
  id: "bitfeed.exclude",
  async evaluate(candidate, context, params) {
    const field = stringParam(params, "field", "topics");
    const profile = readPreferenceProfile(context);
    const keys = readKeys(candidate, field);
    if (keys.length === 0) return true;
    const excluded = new Set(profile.exclusions ?? []);
    if (keys.some((key) => excluded.has(key))) return false;
    const snoozed = profile.snoozed;
    if (snoozed !== void 0) {
      const now = resolveNow(context);
      if (keys.some((key) => typeof snoozed[key] === "number" && snoozed[key] > now)) {
        return false;
      }
    }
    return true;
  }
};
var signalScorer = {
  id: "bitfeed.signal",
  async score(candidate, _context, params) {
    const id = stringParam(params, "signal", "");
    if (id === "") return { score: 0, reason: "no signal named" };
    const value = readSignal(candidate, id);
    if (value === null) {
      return { score: numberParam(params, "missing", 0), reason: `${id}: not measured` };
    }
    const cap = Math.max(Number.EPSILON, numberParam(params, "cap", 1));
    const scaled = params.log === true ? Math.log1p(Math.max(0, value)) / Math.log1p(cap) : value / cap;
    return {
      score: Math.min(1, Math.max(-1, scaled)),
      reason: id,
      metadata: { signal: id, value }
    };
  }
};
var signalThresholdFilter = {
  id: "bitfeed.signalThreshold",
  async evaluate(candidate, _context, params) {
    const id = stringParam(params, "signal", "");
    if (id === "") return true;
    const value = readSignal(candidate, id);
    if (value === null) return params.requireMeasured !== true;
    if (typeof params.min === "number" && value < params.min) return false;
    if (typeof params.max === "number" && value > params.max) return false;
    return true;
  }
};
var maxPerKeyConstraint = {
  id: "bitfeed.maxPerKey",
  async apply(candidates, _context, params) {
    const field = stringParam(params, "field", "creator");
    const max = Math.max(1, Math.floor(numberParam(params, "max", 2)));
    const window = Math.max(1, Math.floor(numberParam(params, "window", 10)));
    const drop = params.drop === true;
    const out = [];
    const deferred = [];
    const pending = candidates.slice();
    const fits = (candidate) => {
      const key = readKey(candidate.candidate, field);
      if (key === null) return true;
      let count = 0;
      for (let i = Math.max(0, out.length - window + 1); i < out.length; i += 1) {
        if (readKey(out[i].candidate, field) === key) count += 1;
      }
      return count < max;
    };
    while (pending.length > 0) {
      let placed = false;
      for (let i = 0; i < pending.length; i += 1) {
        const candidate = pending[i];
        if (!fits(candidate)) continue;
        out.push(candidate);
        pending.splice(i, 1);
        placed = true;
        break;
      }
      if (!placed) {
        if (!drop) deferred.push(...pending);
        break;
      }
    }
    return [...out, ...deferred];
  }
};
var sessionFatigueConstraint = {
  id: "bitfeed.sessionFatigue",
  async apply(candidates, context, params) {
    const field = stringParam(params, "field", "topic");
    const decay = Math.min(1, Math.max(0, numberParam(params, "decay", 0.6)));
    const seen = /* @__PURE__ */ new Map();
    const penalized = candidates.map((working) => {
      const keys = readKeys(working.candidate, field);
      if (keys.length === 0) return working;
      let repeats = 0;
      for (const key of keys) {
        const count = seen.get(key) ?? 0;
        if (count > repeats) repeats = count;
        seen.set(key, count + 1);
      }
      if (repeats === 0) return working;
      const factor = Math.pow(decay, repeats);
      return {
        ...working,
        score: working.score * factor,
        reasons: [
          ...working.reasons,
          {
            provider: "bitfeed.sessionFatigue",
            contribution: working.score * factor - working.score,
            label: "repeated topic penalty"
          }
        ]
      };
    });
    return rankDeterministically(penalized, runtimeSeed(context));
  }
};
var dedupePostProcessor = {
  id: "bitfeed.dedupe",
  async process(items, _context, params) {
    const field = stringParam(params, "field", "");
    if (field === "") return items;
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const item of items) {
      if (item.placement !== void 0 && item.placement.type !== "organic") {
        out.push(item);
        continue;
      }
      const key = readKey(item.candidate, field);
      if (key !== null) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      out.push(item);
    }
    return out;
  }
};
var STANDARD_PROVIDERS = {
  sources: { "bitfeed.input": inputSource },
  scorers: {
    "bitfeed.recency": recencyScorer,
    "bitfeed.random": randomScorer,
    "bitfeed.preference": preferenceScorer,
    "bitfeed.signal": signalScorer
  },
  filters: {
    "bitfeed.exclude": excludeFilter,
    "bitfeed.signalThreshold": signalThresholdFilter
  },
  constraints: {
    "bitfeed.maxPerKey": maxPerKeyConstraint,
    "bitfeed.sessionFatigue": sessionFatigueConstraint
  },
  postProcessors: { "bitfeed.dedupe": dedupePostProcessor }
};
function registerStandardProviders(registry, options) {
  for (const [id, provider] of Object.entries(STANDARD_PROVIDERS.sources)) {
    registry.registerSource(id, provider, options);
  }
  for (const [id, provider] of Object.entries(STANDARD_PROVIDERS.scorers)) {
    registry.registerScorer(id, provider, options);
  }
  for (const [id, provider] of Object.entries(STANDARD_PROVIDERS.filters)) {
    registry.registerFilter(id, provider, options);
  }
  for (const [id, provider] of Object.entries(STANDARD_PROVIDERS.constraints)) {
    registry.registerConstraint(id, provider, options);
  }
  for (const [id, provider] of Object.entries(STANDARD_PROVIDERS.postProcessors)) {
    registry.registerPostProcessor(id, provider, options);
  }
  return registry;
}

// ../core/src/presets/index.ts
var presets_exports = {};
__export(presets_exports, {
  PRESETS: () => PRESETS,
  balancedRecipe: () => balancedRecipe,
  chronologicalRecipe: () => chronologicalRecipe,
  discoveryRecipe: () => discoveryRecipe,
  trendingRecipe: () => trendingRecipe
});
function baseSource(options) {
  return [{ provider: options.source ?? "bitfeed.input", lane: "all" }];
}
function chronologicalRecipe(options = {}) {
  return {
    spec: RECIPE_SPEC,
    name: "Chronological",
    description: "Newest first. No personalization, no exploration.",
    sources: baseSource(options),
    scorers: [
      {
        provider: "bitfeed.recency",
        weight: 1,
        params: { field: options.timestampField ?? "createdAt", halfLife: 86400 }
      }
    ],
    ...options.limit !== void 0 ? { limit: options.limit } : {}
  };
}
function balancedRecipe(options = {}) {
  const topicField = options.topicField ?? "topics";
  return {
    spec: RECIPE_SPEC,
    name: "Balanced",
    description: "Interests, freshness, and a little exploration, capped for diversity.",
    sources: baseSource(options),
    filters: [{ provider: "bitfeed.exclude", params: { field: topicField } }],
    scorers: [
      { provider: "bitfeed.preference", weight: 0.5, params: { field: topicField } },
      {
        provider: "bitfeed.recency",
        weight: 0.35,
        params: { field: options.timestampField ?? "createdAt", halfLife: 86400 }
      },
      { provider: "bitfeed.random", weight: 0.15 }
    ],
    constraints: [
      {
        provider: "bitfeed.maxPerKey",
        params: { field: options.diversityField ?? "creator", max: 2, window: 10 }
      }
    ],
    exploration: 0.15,
    ...options.limit !== void 0 ? { limit: options.limit } : {}
  };
}
function discoveryRecipe(options = {}) {
  const topicField = options.topicField ?? "topics";
  return {
    spec: RECIPE_SPEC,
    name: "Discovery",
    description: "Seeded exploration first, with strong creator and topic diversity.",
    sources: baseSource(options),
    filters: [{ provider: "bitfeed.exclude", params: { field: topicField } }],
    scorers: [
      { provider: "bitfeed.random", weight: 0.55 },
      {
        provider: "bitfeed.recency",
        weight: 0.3,
        params: { field: options.timestampField ?? "createdAt", halfLife: 604800 }
      },
      { provider: "bitfeed.preference", weight: 0.15, params: { field: topicField } }
    ],
    constraints: [
      {
        provider: "bitfeed.maxPerKey",
        params: { field: options.diversityField ?? "creator", max: 1, window: 8 }
      },
      { provider: "bitfeed.sessionFatigue", params: { field: topicField, decay: 0.5 } }
    ],
    exploration: 0.5,
    ...options.limit !== void 0 ? { limit: options.limit } : {}
  };
}
function trendingRecipe(options = {}) {
  return {
    spec: RECIPE_SPEC,
    name: "Trending",
    description: "Recent items, lifted by a quality/engagement signal the app supplies.",
    sources: baseSource(options),
    scorers: [
      {
        provider: "bitfeed.recency",
        weight: 0.6,
        params: { field: options.timestampField ?? "createdAt", halfLife: 43200 }
      },
      {
        provider: "bitfeed.signal",
        weight: 0.4,
        params: { signal: options.qualitySignal ?? "quality", cap: 1 }
      }
    ],
    ...options.limit !== void 0 ? { limit: options.limit } : {}
  };
}
var PRESETS = {
  chronological: chronologicalRecipe,
  trending: trendingRecipe,
  balanced: balancedRecipe,
  discovery: discoveryRecipe
};
export {
  BITFEED_STAGES,
  BitFeed,
  BitFeedError,
  CURSOR_SEEN_LIMIT,
  CURSOR_VERSION,
  ENGINE_VERSION,
  MemoryCache,
  MissingCapabilityError,
  NullCache,
  PROVIDER_KINDS,
  ProviderError,
  ProviderRegistry,
  RECIPE_SPEC,
  RUNTIME_KEYS,
  RecipeValidationError,
  SIGNAL_METADATA_KEY,
  advanceCursor,
  applySetOps,
  buildSeed,
  canonicalJson,
  createBitFeed,
  createRegistry,
  createSeededRandom,
  decodeCursor,
  encodeCursor,
  explainItem,
  explanationRows,
  forkRecipe,
  formatExplanation,
  hashObject,
  hashRecipe,
  insertionSlots,
  isValidProviderId,
  liveLanes,
  mixLanes,
  normalizeRatios,
  parseRecipe,
  parseRecipeJson,
  presets_exports as presets,
  providerNamespace,
  providers_exports as providers,
  rankDeterministically,
  recipeLanes,
  recipeProviders,
  recipeWarnings,
  runtimeExploration,
  runtimeSeed,
  seededShuffle,
  sha256Hex,
  sourceLane,
  validateRecipe,
  weaveInserts,
  withRuntime
};
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=bitfeed.js.map
