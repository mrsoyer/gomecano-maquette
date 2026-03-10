# Archive Types Legacy

Fichiers types obsolètes conservés pour historique.

## database-legacy.ts

**Date archivage :** 6 janvier 2026
**Raison :** Placeholder manuel obsolète, remplacé par `database.types.ts` auto-généré par Supabase CLI.
**Imports actifs :** 0 (fichier jamais importé dans le code)
**Lignes :** 172 lignes vs 5,376 lignes dans le fichier actuel

### Pourquoi archiver plutôt que supprimer ?

Ce fichier contenait un schéma database manuel écrit pendant la phase de développement initiale,
avant que la vraie database Supabase ne soit créée. Il est conservé pour historique et documentation
de l'évolution du projet.

### Comment le fichier actuel est généré ?

```bash
# Auto-généré par Supabase CLI
supabase gen types typescript --project-id ymkdslderliwjuipeisz > src/types/database.types.ts
```
