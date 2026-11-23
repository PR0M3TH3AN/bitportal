const p = /* @__PURE__ */ new Set(["ecashLoad", "driveLoad", "receiptsLoad", "paySettingsLoad", "blossomServers", "ecashMints"]), d = /* @__PURE__ */ new Set(["ecashPeek", "drivePeek", "receiptsPeek", "lockStatus"]);
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
    const e = ["cryptoWorker", ".js"].join(""), a = new URL(e, import.meta.url);
    this.worker = new Worker(a, { type: "module" }), this.worker.addEventListener("message", (t) => {
      const r = t.data;
      if (!r || typeof r != "object") return;
      const n = r;
      if (n.notify === "nip46-auth-url" && typeof n.url == "string") {
        this.onNotification?.(n);
        return;
      }
      if (n.notify === "ecash-sealed") {
        const l = n.id;
        typeof l == "string" && this.sealed.get(l)?.();
        return;
      }
      if (typeof r.id != "string") return;
      const s = this.pending.get(r.id);
      if (s)
        if (this.pending.delete(r.id), clearTimeout(s.timer), r.ok)
          s.resolve(r.result);
        else {
          const l = new Error(r.error);
          l.name = r.errorName ?? "Error", s.reject(l);
        }
    });
    const i = (t) => () => this.failAll(t);
    this.worker.addEventListener("error", i("The BitLogin crypto worker stopped unexpectedly.")), this.worker.addEventListener(
      "messageerror",
      i("The BitLogin crypto worker sent an unreadable message.")
    );
  }
  /** Settles every outstanding call with an error. Idempotent. */
  failAll(e) {
    const a = [...this.pending.values()];
    this.pending.clear();
    for (const i of a)
      clearTimeout(i.timer), i.reject(new Error(e));
  }
  /** Loads asked again while the same one is still on its way: the panel shown twice shares one answer, not two in line. */
  inFlight = /* @__PURE__ */ new Map();
  /** Calls to be told when their ecash is sealed in this browser, by call id. */
  sealed = /* @__PURE__ */ new Map();
  call(e, a, i = 6e4) {
    if (!p.has(e))
      return d.has(e) ? this.send(e, a, i) : (this.inFlight.clear(), this.send(e, a, i));
    const t = `${e}:${JSON.stringify(a ?? null)}`, r = this.inFlight.get(t);
    if (r) return r;
    const n = this.send(e, a, i);
    this.inFlight.set(t, n);
    const s = () => this.inFlight.delete(t);
    return n.then(s, s), n;
  }
  send(e, a, i, t) {
    if (this.dead)
      return Promise.reject(new Error(this.deadReason));
    const r = `${Date.now().toString(36)}-${(this.counter++).toString(36)}`;
    t && this.sealed.set(r, t);
    const n = new Promise((l, c) => {
      const u = setTimeout(() => {
        this.pending.delete(r), c(new Error(`BitLogin's ${e} call timed out.`));
      }, i);
      this.pending.set(r, { resolve: l, reject: c, timer: u });
      const h = { id: r, action: e, payload: a };
      this.worker.postMessage(h);
    });
    if (!t) return n;
    const s = () => this.sealed.delete(r);
    return n.then(s, s), n;
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
  ecashSetMints(e) {
    return this.call("ecashSetMints", { mints: e });
  }
  /** `sealed` is called when the new proofs are sealed in this browser, before relays are asked. */
  ecashRoll(e, a) {
    return this.inFlight.clear(), this.send("ecashRoll", e, 6e4, a);
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
  let a = null;
  const i = async () => {
    if (a) return a;
    const t = await e.getSessionStatus();
    if (!t.unlocked || !t.everydayPublicKey) throw new Error(w);
    return a = t.everydayPublicKey, a;
  };
  return {
    async restore() {
      const t = await e.restoreSession();
      return a = t.restored && t.everydayPublicKey ? t.everydayPublicKey : null, a ? { pubkey: a } : null;
    },
    async accounts() {
      return (await e.accountsList()).accounts;
    },
    async switchAccount(t) {
      const r = await e.accountsSwitch(t);
      return r.locked ? { locked: !0 } : (a = r.restored && r.everydayPublicKey ? r.everydayPublicKey : null, a ? { pubkey: a } : null);
    },
    async addAccount() {
      await e.accountsAdd(), a = null;
    },
    async isUnlocked() {
      if (a) return !0;
      const t = await e.getSessionStatus();
      return t.unlocked && t.everydayPublicKey && (a = t.everydayPublicKey), !!t.unlocked;
    },
    getPublicKey() {
      return i();
    },
    async signEvent(t) {
      return await i(), e.signEvent(t);
    },
    async nip44Encrypt(t, r) {
      return await i(), (await e.nip44Encrypt({ peerPublicKey: t, plaintext: r })).ciphertext;
    },
    async nip44Decrypt(t, r) {
      return await i(), (await e.nip44Decrypt({ peerPublicKey: t, payload: r })).plaintext;
    },
    async beginHandoff() {
      return (await e.handoffBegin()).recipientPublicKey;
    },
    async exportHandoff(t, r, n, s, l, c) {
      return await i(), e.handoffExport({ recipientPublicKey: t, ...r ? { app: r } : {}, ...n ? { site: n } : {}, ...s ? { remember: !0 } : {}, ...l ? { family: l } : {}, ...c?.length ? { more: [...c] } : {} });
    },
    async lockStatus() {
      return e.lockStatus();
    },
    async lockOpen(t) {
      const r = await e.lockOpen(t);
      return a = r.ok && r.everydayPublicKey ? r.everydayPublicKey : null, { ok: r.ok, left: r.left, removed: r.removed };
    },
    async loadProfile(t = {}) {
      return await i(), (await e.loadProfile(t)).profile ?? null;
    },
    async profileContent() {
      return await i(), e.profileContent();
    },
    guests: {
      async find(t, r) {
        return await i(), e.guestListFind({ subject: t, scope: r });
      },
      async sign(t, r, n, s) {
        return await i(), (await e.guestListSign({ subject: t, scope: r, people: n, ...s !== void 0 ? { replaces: s } : {} })).event;
      }
    },
    pay: {
      async profile(t) {
        return await i(), e.payProfile(t);
      },
      async listing(t, r) {
        return await i(), e.payListing({ coordinate: t, relays: r });
      },
      async auth(t) {
        return await i(), (await e.unlockAuth(t)).token;
      },
      async receipts() {
        return await i(), e.receiptsLoad();
      },
      async receiptsPeek() {
        return await i(), e.receiptsPeek();
      },
      async keep(t) {
        return await i(), e.receiptsKeep(t);
      },
      async settings() {
        return await i(), e.paySettingsLoad();
      },
      async setLimit(t) {
        return await i(), e.paySettingsSave({ limitSats: t });
      },
      async keepOrder(t) {
        return await i(), e.paySettingsSave({ addOrder: t });
      },
      async dropOrder(t) {
        return await i(), e.paySettingsSave({ removeOrder: t });
      }
    },
    drive: {
      async load() {
        return await i(), e.driveLoad();
      },
      async save(t) {
        return await i(), e.driveSave(t);
      },
      async auth(t, r, n) {
        return await i(), (await e.blossomAuth({ verb: t, server: r, sha256: n })).token;
      },
      async servers(t) {
        return await i(), e.blossomServers(t === !0);
      },
      async peek() {
        return await i(), e.drivePeek();
      },
      async setServers(t) {
        return await i(), (await e.blossomSetServers(t)).mine;
      }
    },
    ecash: {
      async load() {
        return await i(), e.ecashLoad();
      },
      async setMints(t) {
        return await i(), e.ecashSetMints(t);
      },
      async roll(t, r) {
        return await i(), e.ecashRoll(t, r);
      },
      async recommended() {
        return await i(), (await e.ecashMints()).mints;
      },
      async peek() {
        return await i(), e.ecashPeek();
      }
    },
    async takeBack(t) {
      return await i(), e.takeBack(t);
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
    async worldScore(t, r, n, s = {}) {
      return e.worldScore({ world: t, board: r, score: n, ...s.title ? { title: s.title } : {}, ...s.format === "time" ? { format: "time" } : {} });
    },
    async worldAchieve(t, r, n) {
      return e.worldAchieve({ world: t, achievement: r, title: n });
    },
    async acceptHandoff(t) {
      const r = await e.handoffAccept(t);
      return a = r.everydayPublicKey, { pubkey: a, ...r.app ? { app: r.app } : {}, ...r.site ? { site: r.site } : {}, ...r.profile ? { profile: r.profile } : {}, ...r.remember ? { remember: !0 } : {}, ...r.family ? { family: r.family } : {}, ...r.more?.length ? { more: r.more } : {} };
    },
    async appEncrypt(t, r, n = "nip44") {
      return (await e.appEncrypt({ peerPublicKey: t, text: r, scheme: n })).text;
    },
    async appDecrypt(t, r, n = "nip44") {
      return (await e.appDecrypt({ peerPublicKey: t, text: r, scheme: n })).text;
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
    async restoreSignerGrant(t, r) {
      const n = await e.signerRestore({ site: t, ...r ? { family: r } : {} });
      return !n.restored || !n.everydayPublicKey || typeof n.until != "number" ? null : (a = n.everydayPublicKey, {
        pubkey: a,
        until: n.until,
        ...n.name ? { name: n.name } : {},
        ...n.profile ? { profile: n.profile } : {},
        signed: n.signed ?? [],
        ...n.signedPass ? { signedPass: n.signedPass } : {},
        ...n.check ? { check: n.check } : {},
        ...n.family ? { family: n.family } : {},
        ...n.more?.length ? { more: n.more } : {},
        ...n.permissions ? { permissions: n.permissions, signedSensitive: n.signedSensitive ?? [] } : {}
      });
    },
    async touchSignerGrant(t, r, n, s) {
      await e.signerTouch({ site: t, signed: r, ...n ? { signedSensitive: n } : {}, ...s ? { signedPass: s } : {} });
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
    async logout() {
      await e.logout(), a = null;
    },
    destroy() {
      e.terminate("BitLogin headless signer was destroyed."), a = null;
    }
  };
}
export {
  y as W,
  g as c
};
