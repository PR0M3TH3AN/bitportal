/**
 * What this copy of BitPortal will and won't show: the operator's policy
 * (NSWP spec §15, "instance policy").
 *
 * BitPortal is a client anyone can host, and each copy answers to whoever
 * hosts it. This file is that person's settings. It decides what the pages
 * on this site list and link to. It decides nothing about where a visitor
 * may go: they can type any address into their browser.
 *
 * Everything here is disclosed to visitors, on the page, in plain words.
 */
export interface InstancePolicy {
  /**
   * The keys of whoever runs this copy, as hex. A list of worlds one of
   * them signs, named `allowList`, is this site's allow list. The key that
   * signed the list BitPortal ships with counts as one of them.
   */
  operators: readonly string[];
  /** The name (`d`) of the operators' list of allowed worlds. */
  allowList: string;
  /**
   * Show only worlds on the operators' lists. Lists a visitor follows, and
   * the shelf of worlds nobody listed, are then not shown here at all.
   */
  allowListOnly: boolean;
  /**
   * Whether worlds that are for adults may be shown or gone to from here.
   * False: they are left out everywhere, and the Airlock won't send anyone
   * to one. A world is taken as adult when it says so, and when it carries
   * a content warning without saying who it is for.
   */
  allowAdult: boolean;
  /**
   * Whether visitors in this copy's own room may share the music they are playing with people near them. It is
   * each visitor's choice to offer and each visitor's choice to hear; this is the host's choice to have it in
   * their room at all. `false` leaves it out. Left out, it is allowed.
   */
  sharedMusic?: boolean;
  /**
   * Where this copy's visitors sign from inside a world (NSWP-10, "Signing from a world"): the https address the
   * signer and its sign-in window are under. BitPortal tells each world so in the arrival. It is BitLogin's own
   * site: the one address a BitLogin password is typed at (owner's decision, 2026-11-19). A world that is told
   * nothing has no signer to ask, and offers none. Changing this changes where every visitor's "Sign in to sign
   * notes" leads, so it is the owner's to change.
   */
  signer?: string;
}

/**
 * Whether this host's Airlock sends a visitor's pass with them to a world. It doesn't where it names a sign-in
 * address: they sign in at the world, that address's signer makes the pass, and a world learns nothing about
 * them until they say yes there (NSWP-10, "A pass from the signer"; the owner's decision of 2026-11-19).
 */
export const sendsPass = (instance: Pick<InstancePolicy, "signer"> = INSTANCE): boolean => !instance.signer;

export const INSTANCE: InstancePolicy = {
  // npub15jnttpymeytm80hatjqcvhhqhzrhx6gxp8pq0wn93rhnu8s9h9dsha32lx
  operators: ["a4a6b5849bc917b3befd5c81865ee0b88773690609c207ba6588ef3e1e05b95b"],
  allowList: "bitportal",
  allowListOnly: true,
  allowAdult: false,
  sharedMusic: true,
  signer: "https://bitlogin.network/",
};

/** A policy with nothing switched on: every world, every list. What BitPortal did before it had one, and what tests of other things use. */
export const OPEN_POLICY: InstancePolicy = { operators: [], allowList: "bitportal", allowListOnly: false, allowAdult: true };
