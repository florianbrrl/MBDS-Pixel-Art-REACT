import React, { useState, useRef } from 'react';
import '../../styles/ImageImporter.css';

interface ImageImporterProps {
  onImageProcessed: (pixelData: Record<string, string>) => void;
  onDimensionsDetected: (width: number, height: number) => void;
  width: number;
  height: number;
}

const ImageImporter: React.FC<ImageImporterProps> = ({
  onImageProcessed,
  onDimensionsDetected,
  width,
  height
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixelizedPreview, setPixelizedPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image est trop grande. Taille maximale: 5MB");
      return;
    }

    setError(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);

      // Détecter les dimensions de l'image
      const img = new Image();
      img.onload = () => {
        // Limiter les dimensions max à 100x100 pour éviter les problèmes de performance
        const maxDimension = 100;
        let imgWidth = img.width;
        let imgHeight = img.height;

        // Garder le ratio mais réduire si nécessaire
        if (imgWidth > maxDimension || imgHeight > maxDimension) {
          const ratio = Math.min(maxDimension / imgWidth, maxDimension / imgHeight);
          imgWidth = Math.floor(imgWidth * ratio);
          imgHeight = Math.floor(imgHeight * ratio);
        }

        setOriginalDimensions({ width: imgWidth, height: imgHeight });
        onDimensionsDetected(imgWidth, imgHeight);
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const processImage = () => {
    if (!previewUrl || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError("Impossible d'accéder au contexte canvas");
      setIsProcessing(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Utiliser les dimensions actuelles du formulaire
      canvas.width = width;
      canvas.height = height;

      // Effacer le canvas
      ctx.clearRect(0, 0, width, height);

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);

      // Extraire les données de pixels (optimisé pour réduire la taille)
      const pixelData: Record<string, string> = {};

      // Récupérer toutes les données de pixels en une seule fois
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3] / 255; // Normaliser l'alpha entre 0 et 1

          // Si le pixel n'est pas transparent (a > 0.5), l'ajouter
          if (a > 0.5) {
            // Optimisation: convertir directement en hex sans padStart
            const hexColor = '#' +
              ((r < 16 ? '0' : '') + r.toString(16)) +
              ((g < 16 ? '0' : '') + g.toString(16)) +
              ((b < 16 ? '0' : '') + b.toString(16));

            pixelData[`${x},${y}`] = hexColor;
          }
        }
      }

      // Générer une prévisualisation pixelisée
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = width;
      previewCanvas.height = height;
      const previewCtx = previewCanvas.getContext('2d');

      if (previewCtx) {
        // Dessiner une grille blanche de fond
        previewCtx.fillStyle = '#FFFFFF';
        previewCtx.fillRect(0, 0, width, height);

        // Dessiner les pixels un par un
        for (const [pos, color] of Object.entries(pixelData)) {
          const [x, y] = pos.split(',').map(Number);
          previewCtx.fillStyle = color;
          previewCtx.fillRect(x, y, 1, 1);
        }

        setPixelizedPreview(previewCanvas.toDataURL());
      }

      onImageProcessed(pixelData);
      setIsProcessing(false);
    };

    img.onerror = () => {
      setError("Erreur lors du chargement de l'image");
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  return (
    <div className="image-importer">
      <h3>Importer une image</h3>

      <div className="file-input-container">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="file-input-label">
          Choisir une image
        </label>
      </div>

      {error && <div className="import-error">{error}</div>}

      {previewUrl && originalDimensions && (
        <div className="preview-container">
          <img src={previewUrl} alt="Aperçu" className="image-preview" />

          <div className="image-info">
            <p>Dimensions d'origine: {originalDimensions.width}×{originalDimensions.height}</p>
            <p>Dimensions adaptées: {width}×{height}</p>
          </div>

          <button
            onClick={processImage}
            className="process-button"
            disabled={isProcessing}
          >
            {isProcessing ? 'Traitement...' : 'Utiliser cette image'}
          </button>
        </div>
      )}

      {pixelizedPreview && (
        <div className="pixelized-preview-container">
          <h4>Aperçu après conversion</h4>
          <img src={pixelizedPreview} alt="Aperçu pixelisé" className="pixelized-preview" />
        </div>
      )}

      {/* Canvas invisible pour le traitement */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageImporter;
