export interface StorageProvider {
  /**
   * Sauvegarde un fichier
   * @returns path/key du fichier stocké
   */
  saveFile(buffer: Buffer, fileName: string): Promise<string>;

  /**
   * Récupère un fichier
   * @returns Buffer du fichier
   */
  getFile(filePath: string): Promise<Buffer>;

  /**
   * Supprime un fichier
   */
  deleteFile(filePath: string): Promise<void>;

  /**
   * Génère une URL publique pour le fichier
   */
  getPublicUrl(filePath: string): string;
}
