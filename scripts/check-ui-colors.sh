#!/usr/bin/env sh
# Advierte sobre clases legacy que rompen modo oscuro (no falla el build).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PATTERN='bg-white|text-gray-|bg-red-50|bg-blue-50|bg-amber-50|bg-green-50|bg-yellow-50'
FOUND=0

for DIR in components pages; do
  if [ -d "$ROOT/$DIR" ]; then
    MATCHES=$(rg -n "$PATTERN" "$ROOT/$DIR" --glob '*.jsx' --glob '*.js' 2>/dev/null || true)
    if [ -n "$MATCHES" ]; then
      echo "=== $DIR (revisar modo oscuro) ==="
      echo "$MATCHES" | head -40
      COUNT=$(echo "$MATCHES" | wc -l | tr -d ' ')
      FOUND=$((FOUND + COUNT))
      echo ""
    fi
  fi
done

if [ "$FOUND" -gt 0 ]; then
  echo "check:ui-colors: $FOUND coincidencias (advertencia). Migrar a @/lib/ui-tokens."
  exit 0
fi
echo "check:ui-colors: sin coincidencias legacy."
exit 0
