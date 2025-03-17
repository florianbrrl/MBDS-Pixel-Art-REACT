import { PrismaClient } from '@prisma/client';
import { PixelBoardModel } from '../models/pixelboard.model';

async function updateBoardStatus() {
  try {
    const updatedCount = await PixelBoardModel.updateActiveStatus();
    console.log(`Statut mis à jour pour ${updatedCount} PixelBoards`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts:', error);
  } finally {
    // Assurez-vous de déconnecter Prisma si nécessaire
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  }
}

// Pour exécution directe du script
if (require.main === module) {
  updateBoardStatus()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

// Pour import dans d'autres fichiers
export { updateBoardStatus };
