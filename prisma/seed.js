const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Ajout des styles...');

  const styles = [
    {
      name: 'Portrait Royal',
      description: 'Transformez votre animal en noble d\'un autre temps.',
      thumbnailUrl: 'https://placehold.co/600x400', // Remplacez par une vraie URL
      promptTemplate: 'A royal portrait of a {animalType} in a renaissance painting style, highly detailed, ornate frame',
      negativePrompt: 'modern, blurry, cartoon, low quality',
      parameters: { strength: 0.8, guidance_scale: 8.0 }
    },
    {
      name: 'Pop Art Coloré',
      description: 'Donnez à votre compagnon un look pop art inspiré de Warhol.',
      thumbnailUrl: 'https://placehold.co/600x400.jpg', // Remplacez par une vraie URL
      promptTemplate: 'A vibrant pop art portrait of a {animalType} in the style of Andy Warhol, bold colors, graphic lines',
      negativePrompt: 'realistic, dull, blurry, 3d',
      parameters: { strength: 0.9, guidance_scale: 7.0 }
    }
    // Vous pourrez ajouter d'autres styles plus tard
  ];

  for (const style of styles) {
    await prisma.style.upsert({
      where: { name: style.name },
      update: {},
      create: style,
    });
  }

  console.log('Styles ajoutés avec succès.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
