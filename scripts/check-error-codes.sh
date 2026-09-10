#!/usr/bin/env bash
# CI tripwire: every backend error identifier must have a French frontend mapping.
#   - ErrorCode enum constants  -> keys of CODE_TO_FRENCH (ui/src/services/api.ts)
#   - DTO `message = "..."` validation strings -> keys of FIELD_ERROR_TRANSLATIONS
# Fails loudly so new backend errors cannot leak English to users.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXIT=0

fail() {
  echo "error-codes: $1" >&2
  EXIT=1
}

# 1. ErrorCode enum constants.
ENUM_CODES=$(grep -oE '^[[:space:]]*[A-Z][A-Z0-9_]+,?[[:space:]]*$' "$ROOT/api/src/main/java/com/digisec/exception/ErrorCode.java" \
  | grep -oE '[A-Z][A-Z0-9_]+' | sort -u)

# 2. Keys of CODE_TO_FRENCH (top-level Record entries only, before FIELD_ERROR_TRANSLATIONS).
FRONT_KEYS=$(awk '/CODE_TO_FRENCH.*=.*\{/,/^\}/' "$ROOT/ui/src/services/api.ts" \
  | grep -oE "^[[:space:]]*[A-Z][A-Z0-9_]+" | grep -oE '[A-Z][A-Z0-9_]+' | sort -u)

for code in $ENUM_CODES; do
  echo "$FRONT_KEYS" | grep -qx "$code" || fail "ErrorCode.$code has no CODE_TO_FRENCH entry"
done

# 3. DTO validation message attributes.
DTO_MESSAGES=$(grep -rhoE 'message = "[^"]+"' "$ROOT/api/src/main/java/com/digisec/dto/" \
  | grep -oE '"[^"]+"' | tr -d '"' | sort -u)

# 4. Keys of FIELD_ERROR_TRANSLATIONS.
FIELD_KEYS=$(awk '/FIELD_ERROR_TRANSLATIONS.*=.*\{/,/^\}/' "$ROOT/ui/src/services/api.ts" \
  | grep -oE "^[[:space:]]*'[^']+'" | sed -E "s/^ *'([^']+)'/\1/" | sort -u)

while IFS= read -r message; do
  [ -z "$message" ] && continue
  echo "$FIELD_KEYS" | grep -qxF "$message" || fail "DTO validation message \"$message\" has no FIELD_ERROR_TRANSLATIONS entry"
done <<< "$DTO_MESSAGES"

if [ "$EXIT" -eq 0 ]; then
  echo "error-codes: OK ($(echo "$ENUM_CODES" | wc -l) codes, $(echo "$DTO_MESSAGES" | wc -l) validation strings mapped)"
fi
exit "$EXIT"
