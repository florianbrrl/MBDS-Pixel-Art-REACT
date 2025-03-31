import React, { useState, useEffect } from 'react';
import { PixelBoard } from '@/types';
import ImageImporter from '@/components/import/ImageImporter';
import '@/styles/PixelBoardForm.css';

interface PixelBoardFormProps {
  board: PixelBoard | null;
  onSubmit: (boardData: any) => void;
  onCancel: () => void;
}

interface PixelBoardFormData {
  title: string;
  width: number;
  height: number;
  cooldown: number;
  allow_overwrite: boolean;
  start_time: string;
  end_time: string;
  initialGrid?: Record<string, string>; // Propriété optionnelle pour les données importées
}

const PixelBoardForm: React.FC<PixelBoardFormProps> = ({ board, onSubmit, onCancel }) => {
  // Obtenir la date courante au format YYYY-MM-DD
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Obtenir la date dans 7 jours au format YYYY-MM-DD
  const getNextWeekDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  // Convertir une date ISO en format YYYY-MM-DD pour input[type="date"]
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // État du formulaire
  const [formData, setFormData] = useState<PixelBoardFormData>({
    title: '',
    width: 32,
    height: 32,
    cooldown: 60,
    allow_overwrite: false,
    start_time: getCurrentDate(),
    end_time: getNextWeekDate(),
  });

  // Nouvel état pour stocker les données d'image importée
  const [importedPixelData, setImportedPixelData] = useState<Record<string, string> | null>(null);

  // Initialiser le formulaire avec les données du board si en mode édition
  useEffect(() => {
    if (board) {
      setFormData({
        title: board.title,
        width: board.width,
        height: board.height,
        cooldown: board.cooldown,
        allow_overwrite: board.allow_overwrite,
        start_time: formatDateForInput(board.start_time),
        end_time: formatDateForInput(board.end_time),
      });
    }
  }, [board]);

  // Gérer le changement des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });

    // Si on change la largeur ou la hauteur, réinitialiser les données d'image importée
    if (name === 'width' || name === 'height') {
      setImportedPixelData(null);
    }
  };

  // Fonction pour définir les dimensions à partir de l'image
  const handleDimensionsDetected = (detectedWidth: number, detectedHeight: number) => {
    setFormData(prevData => ({
      ...prevData,
      width: detectedWidth,
      height: detectedHeight
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Créer une copie des données du formulaire
    const formattedData = { ...formData };

    // Convertir les chaînes de date en objets Date avec l'heure à minuit UTC
    if (formattedData.start_time) {
      formattedData.start_time = new Date(`${formattedData.start_time}T00:00:00Z`).toISOString();
    }

    if (formattedData.end_time) {
      formattedData.end_time = new Date(`${formattedData.end_time}T23:59:59Z`).toISOString();
    }

    // Ajouter les données de pixels importées si disponibles
    if (importedPixelData) {
      formattedData.initialGrid = importedPixelData;
    }

    onSubmit(formattedData);
  };

  // Gérer l'image traitée
  const handleImageProcessed = (pixelData: Record<string, string>) => {
    setImportedPixelData(pixelData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{board ? 'Modifier le PixelBoard' : 'Créer un nouveau PixelBoard'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="width">Largeur</label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleChange}
                min="10"
                max="300"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="height">Hauteur</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="10"
                max="300"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cooldown">Délai entre placements (secondes)</label>
            <input
              type="number"
              id="cooldown"
              name="cooldown"
              value={formData.cooldown}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="allow_overwrite"
              name="allow_overwrite"
              checked={formData.allow_overwrite}
              onChange={handleChange}
            />
            <label htmlFor="allow_overwrite">Autoriser l'écrasement des pixels</label>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="start_time">Date de début</label>
              <input
                type="date"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="end_time">Date de fin</label>
              <input
                type="date"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Ajout du composant d'importation d'image */}
          <ImageImporter
            onImageProcessed={handleImageProcessed}
            onDimensionsDetected={handleDimensionsDetected}
            width={formData.width}
            height={formData.height}
          />

          {importedPixelData && (
            <div className="import-success">
              Image traitée avec succès ! {Object.keys(importedPixelData).length} pixels seront ajoutés au tableau.
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-button"
            >
              {board ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PixelBoardForm;
