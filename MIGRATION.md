# Aplicando a migration das novas colunas

O schema foi atualizado com:
- `User.role` (ADMIN | BARBER)
- `User.isActive` (boolean)
- `Business.isActive` (boolean)

## Como aplicar

```bash
npm run db:migrate
# quando perguntar o nome: admin-role-and-isactive
```

Se preferir apenas sincronizar sem criar arquivo de migration:

```bash
npx prisma db push
```

## Usuários existentes

Usuários criados antes desta migration receberão automaticamente:
- `role = BARBER` (default)
- `isActive = true` (default)

## Recriar do zero (recomendado em dev)

```bash
npx prisma migrate reset
npm run db:seed
```

Isso apaga tudo, recria as tabelas e popula com:
- Admin: admin@agendafacil.com / admin123 → acessa /admin
- Barbeiro: joao@teste.com / senha123 → acessa /dashboard
