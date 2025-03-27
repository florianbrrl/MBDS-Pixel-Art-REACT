import React, { useState } from 'react';
import { PixelBoard } from '@/types';
import { exportToSVG, exportToPNG } from '@/utils/exportUtils';
import './../../styles/ExportModal.css';

interface ExportModalProps {
  board: PixelBoard;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ board, onClose }) => {
  const [exportType, setExportType] = useState<'svg' | 'png'>('svg');
  const [exportSize, setExportSize] = useState<'original' | 'custom'>('original');
  const [customWidth, setCustomWidth] = useState(board.width * 10);
  const [customHeight, setCustomHeight] = useState(board.height * 10);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Créer une copie modifiée du board si dimensions personnalisées
      const exportBoard = {
        ...board,
        // Si vous voulez gérer les dimensions personnalisées, vous pouvez le faire ici
      };

      if (exportType === 'svg') {
        exportToSVG(exportBoard);
      } else {
        await exportToPNG(exportBoard);
      }

      // Fermer le modal après l'export
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Une erreur est survenue lors de l\'export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="export-modal-header">
          <h2>Exporter "{board.title}"</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="export-modal-content">
          <div className="export-option">
            <label>Format:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="format"
                  value="svg"
                  checked={exportType === 'svg'}
                  onChange={() => setExportType('svg')}
                />
                SVG (vectoriel)
              </label>
              <label>
                <input
                  type="radio"
                  name="format"
                  value="png"
                  checked={exportType === 'png'}
                  onChange={() => setExportType('png')}
                />
                PNG (image)
              </label>
            </div>
          </div>

          <div className="export-option">
            <label>Taille:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="size"
                  value="original"
                  checked={exportSize === 'original'}
                  onChange={() => setExportSize('original')}
                />
                Taille originale ({board.width}×{board.height} pixels)
              </label>
              <label>
                <input
                  type="radio"
                  name="size"
                  value="custom"
                  checked={exportSize === 'custom'}
                  onChange={() => setExportSize('custom')}
                />
                Taille personnalisée
              </label>
            </div>
          </div>

          {exportSize === 'custom' && (
            <div className="export-dimensions">
              <div className="dimension-input">
                <label>Largeur (px):</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  min={board.width}
                  max={board.width * 50}
                />
              </div>
              <div className="dimension-input">
                <label>Hauteur (px):</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  min={board.height}
                  max={board.height * 50}
                />
              </div>
            </div>
          )}

          <div className="preview-info">
            <p>Le fichier sera téléchargé automatiquement après l'export.</p>
            <p>Taille de l'image: {exportSize === 'original' ? board.width * 10 : customWidth}×{exportSize === 'original' ? board.height * 10 : customHeight} pixels</p>
          </div>
        </div>

        <div className="export-modal-footer">
          <button className="cancel-button" onClick={onClose} disabled={isExporting}>
            Annuler
          </button>
          <button className="export-button" onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exportation en cours...' : `Exporter en ${exportType.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
