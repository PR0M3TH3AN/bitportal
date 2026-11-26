const d = /* @__PURE__ */ new Set(["ecashLoad", "driveLoad", "receiptsLoad", "paySettingsLoad", "blossomServers", "ecashMints"]), p = /* @__PURE__ */ new Set(["ecashPeek", "drivePeek", "receiptsPeek", "lockStatus"]);
class y {
  worker;
  pending = /* @__PURE__ */ new Map();
  counter = 0;
  dead = !1;
  /** Why the worker is gone, surfaced on every post-teardown rejection so a
   *  developer sees the CAUSE (usually an unmounted element), not just a bare
   *  failure. Overridable via terminate(reason). */
  deadReason = "This BitLogin session was torn down; reload the page to sign in again.";
  /** Set by the element to receive unsolicited worker frames (auth_url). */
  onNotification = null;
  constructor() {
    const e = ["cryptoWorker", ".js"].join(""), n = new URL(e, import.meta.url);
    this.worker = new Worker(n, { type: "module" }), this.worker.addEventListener("message", (t) => {
      const r = t.data;
      if (!r || typeof r != "object") return;
      const s = r;
      if (s.notify === "nip46-auth-url" && typeof s.url == "string") {
        this.onNotification?.(s);
        return;
      }
      if (s.notify === "ecash-sealed") {
        const l = s.id;
        typeof l == "string" && this.sealed.get(l)?.();
        return;
      }
      if (typeof r.id != "string") return;
      const i = this.pending.get(r.id);
      if (i)
        if (this.pending.delete(r.id), clearTimeout(i.timer), r.ok)
          i.resolve(r.result);
        else {
          const l = new Error(r.error);
          l.name = r.errorName ?? "Error", typeof r.errorCode == "string" && (l.code = r.errorCode), i.reject(l);
        }
    });
    const a = (t) => () => this.failAll(t);
    this.worker.addEventListener("error", a("The BitLogin crypto worker stopped unexpectedly.")), this.worker.addEventListener(
      "messageerror",
      a("The BitLogin crypto worker sent an unreadable message.")
    );
  }
  /** Settles every outstanding call with an error. Idempotent. */
  failAll(e) {
    const n = [...this.pending.values()];
    this.pending.clear();
    for (const a of n)
      clearTimeout(a.timer), a.reject(new Error(e));
  }
  /** Loads asked again while the same one is still on its way: the panel shown twice shares one answer, not two in line. */
  inFlight = /* @__PURE__ */ new Map();
  /** Calls to be told when their ecash is sealed in this browser, by call id. */
  sealed = /* @__PURE__ */ new Map();
  call(e, n, a = 6e4) {
    if (!d.has(e))
      return p.has(e) ? this.send(e, n, a) : (this.inFlight.clear(), this.send(e, n, a));
    const t = `${e}:${JSON.stringify(n ?? null)}`, r = this.inFlight.get(t);
    if (r) return r;
    const s = this.send(e, n, a);
    this.inFlight.set(t, s);
    const i = () => this.inFlight.delete(t);
    return s.then(i, i), s;
  }
  send(e, n, a, t) {
    if (this.dead)
      return Promise.reject(new Error(this.deadReason));
    const r = `${Date.now().toString(36)}-${(this.counter++).toString(36)}`;
    t && this.sealed.set(r, t);
    const s = new Promise((l, c) => {
      const u = setTimeout(() => {
        this.pending.delete(r), c(new Error(`BitLogin's ${e} call timed out.`));
      }, a);
      this.pending.set(r, { resolve: l, reject: c, timer: u });
      const h = { id: r, action: e, payload: n };
      this.worker.postMessage(h);
    });
    if (!t) return s;
    const i = () => this.sealed.delete(r);
    return s.then(i, i), s;
  }
  configure(e) {
    return this.call("configure", e);
  }
  register(e) {
    return this.call("register", e);
  }
  previewImportKey(e) {
    return this.call("previewImportKey", e);
  }
  login(e) {
    return this.call("login", e);
  }
  recover(e) {
    return this.call("recover", e);
  }
  completeRecovery(e) {
    return this.call("completeRecovery", e);
  }
  changePassword(e) {
    return this.call("changePassword", e);
  }
  publishProfileAndRelayLists(e) {
    return this.call("publishProfileAndRelayLists", e);
  }
  getPublicKey() {
    return this.call("getPublicKey", {});
  }
  signEvent(e) {
    return this.call("signEvent", e);
  }
  nip44Encrypt(e) {
    return this.call("nip44Encrypt", e);
  }
  nip44Decrypt(e) {
    return this.call("nip44Decrypt", e);
  }
  nip04Encrypt(e) {
    return this.call("nip04Encrypt", e);
  }
  nip04Decrypt(e) {
    return this.call("nip04Decrypt", e);
  }
  exportIdentity() {
    return this.call("exportIdentity", {});
  }
  buildRecoveryExport() {
    return this.call("buildRecoveryExport", {});
  }
  repairReplicas() {
    return this.call("repairReplicas", {});
  }
  previewPhraseRebuild(e) {
    return this.call("previewPhraseRebuild", e);
  }
  rebuildFromPhrase(e) {
    return this.call("rebuildFromPhrase", e);
  }
  checkReplicaHealth() {
    return this.call("checkReplicaHealth", {});
  }
  getSessionStatus() {
    return this.call("getSessionStatus", {});
  }
  restoreSession() {
    return this.call("restoreSession", {});
  }
  handoffBegin() {
    return this.call("handoffBegin", {});
  }
  handoffExport(e) {
    return this.call("handoffExport", e);
  }
  handoffAccept(e) {
    return this.call("handoffAccept", e);
  }
  loadProfile(e = {}) {
    return this.call("loadProfile", e);
  }
  accountsList() {
    return this.call("accountsList", {});
  }
  accountsSwitch(e) {
    return this.call("accountsSwitch", { pubkey: e });
  }
  accountsAdd() {
    return this.call("accountsAdd", {});
  }
  accountsRemove(e) {
    return this.call("accountsRemove", { pubkey: e });
  }
  takeBack(e) {
    return this.call("takeBack", e);
  }
  signerCheck(e) {
    return this.call("signerCheck", e);
  }
  lockStatus() {
    return this.call("lockStatus", {});
  }
  lockEnable(e) {
    return this.call("lockEnable", e);
  }
  lockSetDevice(e) {
    return this.call("lockSetDevice", e);
  }
  lockRemoveDevice() {
    return this.call("lockRemoveDevice", {});
  }
  lockDisable() {
    return this.call("lockDisable", {});
  }
  lockNow() {
    return this.call("lockNow", {});
  }
  lockOpen(e) {
    return this.call("lockOpen", e);
  }
  roomPass(e) {
    return this.call("roomPass", e);
  }
  worldSave(e) {
    return this.call("worldSave", e);
  }
  worldFind(e) {
    return this.call("worldFind", e);
  }
  worldOpen(e) {
    return this.call("worldOpen", e);
  }
  worldFollow(e) {
    return this.call("worldFollow", e);
  }
  worldSeal(e) {
    return this.call("worldSeal", e);
  }
  worldUnwrap(e) {
    return this.call("worldUnwrap", e);
  }
  worldReach(e) {
    return this.call("worldReach", e);
  }
  worldScore(e) {
    return this.call("worldScore", e);
  }
  worldAchieve(e) {
    return this.call("worldAchieve", e);
  }
  signerKeep(e) {
    return this.call("signerKeep", e);
  }
  signerRestore(e) {
    return this.call("signerRestore", e);
  }
  guestStatus(e) {
    return this.call("guestStatus", { family: e });
  }
  pairBegin(e, n) {
    return this.call("pairBegin", { site: e, device: n });
  }
  pairPoll() {
    return this.call("pairPoll", {});
  }
  pairCancel() {
    return this.call("pairCancel", {});
  }
  headsetBegin(e, n, a) {
    return this.call("headsetBegin", { site: e, device: n, to: a });
  }
  headsetPoll() {
    return this.call("headsetPoll", {});
  }
  headsetCancel() {
    return this.call("headsetCancel", {});
  }
  pairFind(e) {
    return this.call("pairFind", { code: e });
  }
  pairFound(e) {
    return this.call("pairFound", { offer: e });
  }
  pairEnd(e) {
    return this.call("pairEnd", { offer: e });
  }
  pairAnswer(e, n, a) {
    return this.call("pairAnswer", { offer: e, number: n, ...a ? { family: a } : {} });
  }
  signerTouch(e) {
    return this.call("signerTouch", e);
  }
  signerForget(e) {
    return this.call("signerForget", e);
  }
  signerHold(e) {
    return this.call("signerHold", e);
  }
  signerHeld(e) {
    return this.call("signerHeld", { site: e });
  }
  appEncrypt(e) {
    return this.call("appEncrypt", e);
  }
  appDecrypt(e) {
    return this.call("appDecrypt", e);
  }
  appDecryptEvent(e) {
    return this.call("appDecryptEvent", e);
  }
  vaultStatus() {
    return this.call("vaultStatus", {});
  }
  vaultList() {
    return this.call("vaultList", {});
  }
  vaultSaveNwc(e) {
    return this.call("vaultSaveNwc", e);
  }
  driveLoad() {
    return this.call("driveLoad", {});
  }
  driveSave(e) {
    return this.call("driveSave", e);
  }
  blossomAuth(e) {
    return this.call("blossomAuth", e);
  }
  blossomServers(e = !1) {
    return this.call("blossomServers", e ? { ranked: !0 } : {});
  }
  ecashPeek() {
    return this.call("ecashPeek", {});
  }
  drivePeek() {
    return this.call("drivePeek", {});
  }
  receiptsPeek() {
    return this.call("receiptsPeek", {});
  }
  blossomSetServers(e) {
    return this.call("blossomSetServers", { servers: e });
  }
  profileContent() {
    return this.call("profileContent", {});
  }
  payProfile(e) {
    return this.call("payProfile", { pubkey: e });
  }
  payListing(e) {
    return this.call("payListing", e);
  }
  unlockAuth(e) {
    return this.call("unlockAuth", e);
  }
  paySettingsLoad() {
    return this.call("paySettingsLoad", {});
  }
  paySettingsSave(e) {
    return this.call("paySettingsSave", e);
  }
  guestListFind(e) {
    return this.call("guestListFind", e);
  }
  guestListSign(e) {
    return this.call("guestListSign", e);
  }
  receiptsLoad() {
    return this.call("receiptsLoad", {});
  }
  receiptsKeep(e) {
    return this.call("receiptsKeep", { receipts: e });
  }
  ecashMints() {
    return this.call("ecashMints", {});
  }
  ecashLoad() {
    return this.call("ecashLoad", {});
  }
  ecashKeepTrial(e) {
    return this.call("ecashKeepTrial", { trial: e });
  }
  ecashLaneGet(e) {
    return this.call("ecashLaneGet", { keysetId: e });
  }
  ecashDraw(e, n) {
    return this.call("ecashDraw", { keysetId: e, lane: n });
  }
  ecashReserve(e, n, a) {
    return this.call("ecashReserve", { keysetId: e, amounts: n, keyset: a });
  }
  ecashForward(e, n) {
    return this.call("ecashForward", { keysetId: e, next: n });
  }
  ecashBlinded(e, n, a) {
    return this.call("ecashBlinded", { keysetId: e, from: n, count: a });
  }
  ecashUnblind(e, n, a) {
    return this.call("ecashUnblind", { keysetId: e, keyset: n, found: a });
  }
  ecashTrialOutput(e, n) {
    return this.call("ecashTrialOutput", { keysetId: e, keyset: n });
  }
  ecashRepin(e, n) {
    return this.call("ecashRepin", { keysetId: e, keyset: n });
  }
  ecashSetMints(e) {
    return this.call("ecashSetMints", { mints: e });
  }
  /** `sealed` is called when the new proofs are sealed in this browser, before relays are asked. */
  ecashRoll(e, n) {
    return this.inFlight.clear(), this.send("ecashRoll", e, 6e4, n);
  }
  vaultFindForOrigin(e = {}) {
    return this.call("vaultFindForOrigin", e);
  }
  vaultRevealNwc(e) {
    return this.call("vaultRevealNwc", e);
  }
  vaultSetBinding(e) {
    return this.call("vaultSetBinding", e);
  }
  vaultDelete(e) {
    return this.call("vaultDelete", e);
  }
  vaultOfferCheck(e) {
    return this.call("vaultOfferCheck", e);
  }
  // ---- NIP-46 remote-signer session (§LM5) ----
  nip46Connect(e) {
    return this.call("nip46Connect", e, 26e4);
  }
  nip46NostrconnectStart(e) {
    return this.call("nip46NostrconnectStart", e);
  }
  nip46NostrconnectAwait() {
    return this.call("nip46NostrconnectAwait", {}, 32e4);
  }
  nip46SignEvent(e) {
    return this.call("nip46SignEvent", e, 26e4);
  }
  nip46Nip44Encrypt(e) {
    return this.call("nip46Nip44Encrypt", e, 26e4);
  }
  nip46Nip44Decrypt(e) {
    return this.call("nip46Nip44Decrypt", e, 26e4);
  }
  nip46Nip04Encrypt(e) {
    return this.call("nip46Nip04Encrypt", e, 26e4);
  }
  nip46Nip04Decrypt(e) {
    return this.call("nip46Nip04Decrypt", e, 26e4);
  }
  nip46Disconnect() {
    return this.call("nip46Disconnect", {});
  }
  logout() {
    return this.call("logout", {});
  }
  terminate(e) {
    this.dead = !0, e && (this.deadReason = e), this.worker.terminate(), this.failAll(this.deadReason);
  }
}
const w = "BitLogin: no session is unlocked. Call restore() first, or have the user sign in once via <bitlogin-auth>.";
async function g(o = {}) {
  const e = new y();
  await e.configure({
    vaultRelayUrls: o.vaultRelays ?? [],
    discoveryRelayUrls: o.discoveryRelays ?? []
  });
  let n = null;
  const a = async () => {
    if (n) return n;
    const t = await e.getSessionStatus();
    if (!t.unlocked || !t.everydayPublicKey) throw new Error(w);
    return n = t.everydayPublicKey, n;
  };
  return {
    async restore() {
      const t = await e.restoreSession();
      return n = t.restored && t.everydayPublicKey ? t.everydayPublicKey : null, n ? { pubkey: n } : null;
    },
    async accounts() {
      return (await e.accountsList()).accounts;
    },
    async switchAccount(t) {
      const r = await e.accountsSwitch(t);
      return r.locked ? { locked: !0 } : (n = r.restored && r.everydayPublicKey ? r.everydayPublicKey : null, n ? { pubkey: n } : null);
    },
    async addAccount() {
      await e.accountsAdd(), n = null;
    },
    async isUnlocked() {
      if (n) return !0;
      const t = await e.getSessionStatus();
      return t.unlocked && t.everydayPublicKey && (n = t.everydayPublicKey), !!t.unlocked;
    },
    getPublicKey() {
      return a();
    },
    async signEvent(t) {
      return await a(), e.signEvent(t);
    },
    async nip44Encrypt(t, r) {
      return await a(), (await e.nip44Encrypt({ peerPublicKey: t, plaintext: r })).ciphertext;
    },
    async nip44Decrypt(t, r) {
      return await a(), (await e.nip44Decrypt({ peerPublicKey: t, payload: r })).plaintext;
    },
    async beginHandoff() {
      return (await e.handoffBegin()).recipientPublicKey;
    },
    async exportHandoff(t, r, s, i, l, c) {
      return await a(), e.handoffExport({ recipientPublicKey: t, ...r ? { app: r } : {}, ...s ? { site: s } : {}, ...i ? { remember: !0 } : {}, ...l ? { family: l } : {}, ...c?.length ? { more: [...c] } : {} });
    },
    async lockStatus() {
      return e.lockStatus();
    },
    async lockOpen(t) {
      const r = await e.lockOpen(t);
      return n = r.ok && r.everydayPublicKey ? r.everydayPublicKey : null, { ok: r.ok, left: r.left, removed: r.removed };
    },
    async loadProfile(t = {}) {
      return await a(), (await e.loadProfile(t)).profile ?? null;
    },
    async profileContent() {
      return await a(), e.profileContent();
    },
    guests: {
      async find(t, r) {
        return await a(), e.guestListFind({ subject: t, scope: r });
      },
      async sign(t, r, s, i) {
        return await a(), (await e.guestListSign({ subject: t, scope: r, people: s, ...i !== void 0 ? { replaces: i } : {} })).event;
      }
    },
    pay: {
      async profile(t) {
        return await a(), e.payProfile(t);
      },
      async listing(t, r) {
        return await a(), e.payListing({ coordinate: t, relays: r });
      },
      async auth(t) {
        return await a(), (await e.unlockAuth(t)).token;
      },
      async receipts() {
        return await a(), e.receiptsLoad();
      },
      async receiptsPeek() {
        return await a(), e.receiptsPeek();
      },
      async keep(t) {
        return await a(), e.receiptsKeep(t);
      },
      async settings() {
        return await a(), e.paySettingsLoad();
      },
      async setLimit(t) {
        return await a(), e.paySettingsSave({ limitSats: t });
      },
      async keepOrder(t) {
        return await a(), e.paySettingsSave({ addOrder: t });
      },
      async dropOrder(t) {
        return await a(), e.paySettingsSave({ removeOrder: t });
      }
    },
    drive: {
      async load() {
        return await a(), e.driveLoad();
      },
      async save(t) {
        return await a(), e.driveSave(t);
      },
      async auth(t, r, s) {
        return await a(), (await e.blossomAuth({ verb: t, server: r, sha256: s })).token;
      },
      async servers(t) {
        return await a(), e.blossomServers(t === !0);
      },
      async peek() {
        return await a(), e.drivePeek();
      },
      async setServers(t) {
        return await a(), (await e.blossomSetServers(t)).mine;
      }
    },
    ecash: {
      async load() {
        return await a(), e.ecashLoad();
      },
      async setMints(t) {
        return await a(), e.ecashSetMints(t);
      },
      async roll(t, r) {
        return await a(), e.ecashRoll(t, r);
      },
      async recommended() {
        return await a(), (await e.ecashMints()).mints;
      },
      async peek() {
        return await a(), e.ecashPeek();
      },
      seed: {
        async lane(t) {
          return await a(), (await e.ecashLaneGet(t)).state;
        },
        async draw(t, r) {
          return await a(), (await e.ecashDraw(t, r)).state;
        },
        async reserve(t, r, s) {
          return await a(), e.ecashReserve(t, r, s);
        },
        async forward(t, r) {
          return await a(), (await e.ecashForward(t, r)).state;
        },
        async blinded(t, r, s) {
          return await a(), (await e.ecashBlinded(t, r, s)).blinded;
        },
        async unblind(t, r, s) {
          return await a(), (await e.ecashUnblind(t, r, s)).proofs;
        },
        async trialOutput(t, r) {
          return await a(), (await e.ecashTrialOutput(t, r)).output;
        },
        async repin(t, r) {
          await a(), await e.ecashRepin(t, r);
        }
      },
      async keepTrial(t) {
        return await a(), e.ecashKeepTrial(t);
      }
    },
    async takeBack(t) {
      return await a(), e.takeBack(t);
    },
    async checkTakenBack(t) {
      return (await e.signerCheck({ site: t })).state;
    },
    async roomPass(t) {
      return e.roomPass({ session: t });
    },
    async worldSave(t, r) {
      return e.worldSave({ slot: t, data: r });
    },
    async worldFind(t) {
      return (await e.worldFind({ slot: t })).d;
    },
    async worldOpen(t) {
      return e.worldOpen({ event: t });
    },
    async worldFollow(t, r) {
      return e.worldFollow({ list: t, ...r });
    },
    async worldSeal(t, r) {
      return e.worldSeal({ to: t, text: r });
    },
    async worldUnwrap(t) {
      return (await e.worldUnwrap({ event: t })).message;
    },
    async worldReach(t) {
      return e.worldReach({ relays: t });
    },
    async worldScore(t, r, s, i = {}) {
      return e.worldScore({ world: t, board: r, score: s, ...i.title ? { title: i.title } : {}, ...i.format === "time" ? { format: "time" } : {} });
    },
    async worldAchieve(t, r, s) {
      return e.worldAchieve({ world: t, achievement: r, title: s });
    },
    async acceptHandoff(t) {
      const r = await e.handoffAccept(t);
      return n = r.everydayPublicKey, { pubkey: n, ...r.app ? { app: r.app } : {}, ...r.site ? { site: r.site } : {}, ...r.profile ? { profile: r.profile } : {}, ...r.remember ? { remember: !0 } : {}, ...r.family ? { family: r.family } : {}, ...r.more?.length ? { more: r.more } : {} };
    },
    async appEncrypt(t, r, s = "nip44") {
      return (await e.appEncrypt({ peerPublicKey: t, text: r, scheme: s })).text;
    },
    async appDecrypt(t, r, s = "nip44") {
      return (await e.appDecrypt({ peerPublicKey: t, text: r, scheme: s })).text;
    },
    async appDecryptEvent(t) {
      return (await e.appDecryptEvent({ event: t })).text;
    },
    async isSignerOnly() {
      return !!(await e.getSessionStatus()).signerOnly;
    },
    async keepSignerGrant(t) {
      return (await e.signerKeep(t)).kept;
    },
    async restoreSignerGrant(t, r, s) {
      const i = await e.signerRestore({ site: t, ...r ? { family: r } : {}, ...s ? { guest: !0 } : {} });
      return !i.restored || !i.everydayPublicKey || typeof i.until != "number" ? null : (n = i.everydayPublicKey, {
        pubkey: n,
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed ?? [],
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        ...i.check ? { check: i.check } : {},
        ...i.family ? { family: i.family } : {},
        ...i.more?.length ? { more: i.more } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {},
        ...i.guest ? { guest: !0 } : {}
      });
    },
    async touchSignerGrant(t, r, s, i) {
      await e.signerTouch({ site: t, signed: r, ...s ? { signedSensitive: s } : {}, ...i ? { signedPass: i } : {} });
    },
    async holdReceipts(t, r) {
      await e.signerHold({ site: t, receipts: r });
    },
    async heldReceipts(t) {
      return (await e.signerHeld(t)).receipts;
    },
    async forgetSignerGrant(t) {
      await e.signerForget({ site: t });
    },
    async guestStatus(t) {
      return (await e.guestStatus(t)).pubkey ?? null;
    },
    async pairBegin(t, r) {
      return e.pairBegin(t, r);
    },
    async pairPoll() {
      const t = await e.pairPoll();
      return t.status !== "paired" || !t.everydayPublicKey ? { status: t.status, ...t.number !== void 0 ? { number: t.number } : {} } : (n = t.everydayPublicKey, { status: "paired", got: { pubkey: n, ...t.site ? { site: t.site } : {}, ...t.profile ? { profile: t.profile } : {}, ...t.remember ? { remember: !0 } : {}, ...t.family ? { family: t.family } : {} } });
    },
    async pairCancel() {
      await e.pairCancel();
    },
    async headsetBegin(t, r, s) {
      return e.headsetBegin(t, r, s);
    },
    async headsetPoll() {
      return e.headsetPoll();
    },
    async headsetCancel() {
      await e.headsetCancel();
    },
    async pairFind(t) {
      return await a(), (await e.pairFind(t)).offers;
    },
    async pairFound(t) {
      return await a(), (await e.pairFound(t)).number;
    },
    async pairEnd(t) {
      await a(), await e.pairEnd(t);
    },
    async pairAnswer(t, r, s) {
      return await a(), e.pairAnswer(t, r, s);
    },
    async logout() {
      await e.logout(), n = null;
    },
    destroy() {
      e.terminate("BitLogin headless signer was destroyed."), n = null;
    }
  };
}
export {
  y as W,
  g as c
};
