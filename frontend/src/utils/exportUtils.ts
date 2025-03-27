// Fonction pour générer le SVG à partir des données du PixelBoard
export const generateSVG = (board: {
    width: number;
    height: number;
    grid: Record<string, string>;
    title?: string;
  }): string => {
    const { width, height, grid, title } = board;
    const pixelSize = 10; // Taille fixe pour chaque pixel
    const svgWidth = width * pixelSize;
    const svgHeight = height * pixelSize;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">`;

    // Ajouter un titre si fourni
    if (title) {
      svgContent += `<title>${title}</title>`;
    }

    // Fond blanc
    svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="white"/>`;

    // Dessiner chaque pixel
    Object.entries(grid).forEach(([pos, color]) => {
      const [x, y] = pos.split(',').map(Number);
      svgContent += `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`;
    });

    svgContent += '</svg>';
    return svgContent;
  };

  // Fonction pour exporter en SVG
  export const exportToSVG = (board: {
    width: number;
    height: number;
    grid: Record<string, string>;
    title: string;
  }): void => {
    const svgContent = generateSVG(board);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${board.title.replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fonction pour exporter en PNG
  export const exportToPNG = async (board: {
    width: number;
    height: number;
    grid: Record<string, string>;
    title: string;
  }): Promise<void> => {
    const svgContent = generateSVG(board);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error("Impossible de créer le contexte de canvas");
    }

    // Définir la taille du canvas
    const pixelSize = 10;
    canvas.width = board.width * pixelSize;
    canvas.height = board.height * pixelSize;

    // Créer une image à partir du SVG
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Dessiner l'image sur le canvas
        ctx.drawImage(img, 0, 0);

        // Convertir le canvas en blob PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);

            // Télécharger le PNG
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `${board.title.replace(/\s+/g, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Nettoyer
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error("Échec de la création du blob PNG"));
          }
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Échec du chargement de l'image SVG"));
      };

      img.src = url;
    });
  };
