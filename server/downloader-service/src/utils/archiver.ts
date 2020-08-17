import archiver from 'archiver';

export interface ArchivateFolder {
  (folder: string): Promise<any>
}

export enum Listeners {
  ERROR = 'error',
  PROGRESS = 'progress',
  END = 'end'
}

export const zipFolder: ArchivateFolder = async () => {
  const archive = archiver('zip');
};
