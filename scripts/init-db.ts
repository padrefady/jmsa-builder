/**
 * Script d'initialisation de la base de donnees.
 * Execute `prisma db push` de maniere programmatique pour creer
 * les tables si elles n'existent pas encore.
 *
 * Usage :
 *   bun run scripts/init-db.ts
 */

import { execSync } from 'child_process';

function main() {
  console.log('=== JMSA Builder - Initialisation de la base de donnees ===\n');

  try {
    console.log('Execution de prisma db push ...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: import.meta.dir.replace('/scripts', ''),
    });

    console.log('\n✓ Base de donnees initialisee avec succes !');
    console.log('  Vous pouvez maintenant demarrer l\'application avec : bun run dev\n');
  } catch (error) {
    console.error('\n✗ Erreur lors de l\'initialisation de la base de donnees :');
    console.error(error instanceof Error ? error.message : error);
    console.error('\nConseils :');
    console.error('  - Verifiez que Prisma est installe (bun install)');
    console.error('  - Verifiez le fichier prisma/schema.prisma');
    console.error('  - Essayez manuellement : npx prisma db push\n');
    process.exit(1);
  }
}

main();
