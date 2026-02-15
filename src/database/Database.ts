import SQLite from 'react-native-sqlite-storage';
import { GeofenceModel } from './models/Geofence';

// 启用调试模式
SQLite.enablePromise(true);

export class Database {
  private static instance: Database;
  private db: SQLite.SQLiteDatabase | null = null;
  public geofence: GeofenceModel | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.db = await SQLite.openDatabase({
        name: 'compass.db',
        location: 'default',
      });

      // 创建数据库表
      await this.createTables();

      this.geofence = new GeofenceModel(this.db);
      this.initialized = true;
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw new Error('数据库初始化失败，请重启应用');
    }
  }

  // 创建数据库表
  private async createTables(): Promise<void> {
    await this.db!.executeSql(`
      CREATE TABLE IF NOT EXISTS geofences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius INTEGER NOT NULL CHECK (radius >= 100),
        trigger_type TEXT NOT NULL,
        sound_enabled INTEGER NOT NULL DEFAULT 1,
        vibration_enabled INTEGER NOT NULL DEFAULT 1,
        notification_enabled INTEGER NOT NULL DEFAULT 1,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }

  // 检查数据库是否已初始化
  isReady(): boolean {
    return this.initialized && this.db !== null && this.geofence !== null;
  }
}
