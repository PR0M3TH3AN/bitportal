#!/bin/sh
# One heavy run at a time on this machine: a gate, a browser trial, a full check, a big build, from any project.
#
#   sh scripts/heavy.sh <command...>
#
# Several sessions share one laptop. Runs made at the same time slowed each other until browser tests timed out and
# everything was run again (2026-11-24). Each heavy run now takes this one lock first and waits its turn. The lock is
# the machine's, not this repository's: BitPortal, BitLogin and BitBrowser take the same file, so the contract is
# only the file's path and the variable below.
#
# A run started inside one that holds it (the release script running each gate) goes straight on: the variable says
# the lock is held already, so nothing waits for itself.
if [ -n "$BITBLOCKS_HEAVY_HELD" ]; then exec "$@"; fi
LOCK="${BITBLOCKS_HEAVY_LOCK:-$HOME/.cache/bitblocks-heavy.lock}"
WAIT="${BITBLOCKS_HEAVY_WAIT:-3600}"
mkdir -p "$(dirname "$LOCK")"
export BITBLOCKS_HEAVY_HELD=1
if ! flock -n "$LOCK" true 2>/dev/null; then
  echo "heavy run: waiting for another heavy run on this machine to finish (lock $LOCK, at most ${WAIT}s)" >&2
fi
exec flock -w "$WAIT" -E 75 "$LOCK" "$@"
