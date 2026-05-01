#!/bin/sh
# Roda prisma migrate deploy com retry automático.
# Necessário para Neon free tier: o banco hiberna por inatividade e pode
# causar P1002 (advisory lock timeout) na primeira conexão do build.

MAX_ATTEMPTS=5
ATTEMPT=1

echo "▶ Executando prisma migrate deploy..."

until prisma migrate deploy; do
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "✖ Falhou após $MAX_ATTEMPTS tentativas. Abortando build."
    exit 1
  fi
  echo "⚠ Tentativa $ATTEMPT falhou (banco possivelmente hibernando). Aguardando 5s..."
  ATTEMPT=$((ATTEMPT + 1))
  sleep 5
done

echo "✔ Migrations aplicadas com sucesso."
