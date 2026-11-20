class o {
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
    const e = ["cryptoWorker", ".js"].join(""), i = new URL(e, import.meta.url);
    this.worker = new Worker(i, { type: "module" }), this.worker.addEventListener("message", (t) => {
      const r = t.data;
      if (!r || typeof r != "object") return;
      const n = r;
      if (n.notify === "nip46-auth-url" && typeof n.url == "string") {
        this.onNotification?.(n);
        return;
      }
      if (typeof r.id != "string") return;
      const s = this.pending.get(r.id);
      if (s)
        if (this.pending.delete(r.id), clearTimeout(s.timer), r.ok)
          s.resolve(r.result);
        else {
          const c = new Error(r.error);
          c.name = r.errorName ?? "Error", s.reject(c);
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
    const i = [...this.pending.values()];
    this.pending.clear();
    for (const a of i)
      clearTimeout(a.timer), a.reject(new Error(e));
  }
  call(e, i, a = 6e4) {
    if (this.dead)
      return Promise.reject(new Error(this.deadReason));
    const t = `${Date.now().toString(36)}-${(this.counter++).toString(36)}`;
    return new Promise((r, n) => {
      const s = setTimeout(() => {
        this.pending.delete(t), n(new Error(`BitLogin's ${e} call timed out.`));
      }, a);
      this.pending.set(t, { resolve: r, reject: n, timer: s });
      const c = { id: t, action: e, payload: i };
      this.worker.postMessage(c);
    });
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
  vaultFindForOrigin() {
    return this.call("vaultFindForOrigin", {});
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
const u = "BitLogin: no session is unlocked. Call restore() first, or have the user sign in once via <bitlogin-auth>.";
async function p(l = {}) {
  const e = new o();
  await e.configure({
    vaultRelayUrls: l.vaultRelays ?? [],
    discoveryRelayUrls: l.discoveryRelays ?? []
  });
  let i = null;
  const a = async () => {
    if (i) return i;
    const t = await e.getSessionStatus();
    if (!t.unlocked || !t.everydayPublicKey) throw new Error(u);
    return i = t.everydayPublicKey, i;
  };
  return {
    async restore() {
      const t = await e.restoreSession();
      return i = t.restored && t.everydayPublicKey ? t.everydayPublicKey : null, i ? { pubkey: i } : null;
    },
    async accounts() {
      return (await e.accountsList()).accounts;
    },
    async switchAccount(t) {
      const r = await e.accountsSwitch(t);
      return r.locked ? { locked: !0 } : (i = r.restored && r.everydayPublicKey ? r.everydayPublicKey : null, i ? { pubkey: i } : null);
    },
    async addAccount() {
      await e.accountsAdd(), i = null;
    },
    async isUnlocked() {
      if (i) return !0;
      const t = await e.getSessionStatus();
      return t.unlocked && t.everydayPublicKey && (i = t.everydayPublicKey), !!t.unlocked;
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
    async exportHandoff(t, r, n, s, c) {
      return await a(), e.handoffExport({ recipientPublicKey: t, ...r ? { app: r } : {}, ...n ? { site: n } : {}, ...s ? { remember: !0 } : {}, ...c ? { family: c } : {} });
    },
    async lockStatus() {
      return e.lockStatus();
    },
    async lockOpen(t) {
      const r = await e.lockOpen(t);
      return i = r.ok && r.everydayPublicKey ? r.everydayPublicKey : null, { ok: r.ok, left: r.left, removed: r.removed };
    },
    async loadProfile(t = {}) {
      return await a(), (await e.loadProfile(t)).profile ?? null;
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
    async acceptHandoff(t) {
      const r = await e.handoffAccept(t);
      return i = r.everydayPublicKey, { pubkey: i, ...r.app ? { app: r.app } : {}, ...r.site ? { site: r.site } : {}, ...r.profile ? { profile: r.profile } : {}, ...r.remember ? { remember: !0 } : {}, ...r.family ? { family: r.family } : {} };
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
      return !n.restored || !n.everydayPublicKey || typeof n.until != "number" ? null : (i = n.everydayPublicKey, {
        pubkey: i,
        until: n.until,
        ...n.name ? { name: n.name } : {},
        ...n.profile ? { profile: n.profile } : {},
        signed: n.signed ?? [],
        ...n.signedPass ? { signedPass: n.signedPass } : {},
        ...n.check ? { check: n.check } : {},
        ...n.family ? { family: n.family } : {},
        ...n.permissions ? { permissions: n.permissions, signedSensitive: n.signedSensitive ?? [] } : {}
      });
    },
    async touchSignerGrant(t, r, n, s) {
      await e.signerTouch({ site: t, signed: r, ...n ? { signedSensitive: n } : {}, ...s ? { signedPass: s } : {} });
    },
    async forgetSignerGrant(t) {
      await e.signerForget({ site: t });
    },
    async logout() {
      await e.logout(), i = null;
    },
    destroy() {
      e.terminate("BitLogin headless signer was destroyed."), i = null;
    }
  };
}
export {
  o as W,
  p as c
};
