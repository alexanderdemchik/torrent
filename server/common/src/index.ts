export interface TorrentStatus {
  infoHash: string,
  progress: number,
  speed: number,
  peers?: number
}

export interface FileInfo {
  name: string,
  path: string,
  length: number
}

export interface SystemInfo {
  cpu: CPUInfo;
  drive: DriveInfo;
  memory: MemoryInfo
}

export interface CPUInfo {
  currentLoad: number
}

export interface DriveInfo {
  /**
   * All disk space
   */
  size: number

  /**
   * Free disk space
   */
  free: number
}

export interface MemoryInfo {
  total: number;
  used: number;
  free: number;
}

export interface DiscoveryRegisterInfo {
  port: string,
  hostname: string
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super();
    this.status = status;
    this.message = message ? message : this.getMessage(status);
  }

  
  getMessage(status: number) {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 404: return 'NOT_FOUND';
      default: return '';
    }
  }
}