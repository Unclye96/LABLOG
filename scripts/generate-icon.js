const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

const source = path.join(__dirname, '..', 'LABLOG icono blanco.png');
const outputDir = path.join(__dirname, '..', 'build');
const output = path.join(outputDir, 'icon.ico');

async function generateIcon() {
  if (!fs.existsSync(source)) {
    throw new Error(`No se encontró el icono fuente: ${source}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const ico = await pngToIco(source);
  fs.writeFileSync(output, ico);
  console.log(`Icono generado: ${output}`);
}

generateIcon().catch((error) => {
  console.error(error);
  process.exit(1);
});
