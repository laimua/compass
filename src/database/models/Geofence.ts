import SQLite from 'react-native-sqlite-storage';
import { Geofence } from '../../types';

export class GeofenceModel {
  private db: SQLite.SQLiteDatabase;

  constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  // 验证地理围栏数据
  private validateGeofenceData(geofence: Partial<Geofence>): void {
    if (geofence.name !== undefined && (typeof geofence.name !== 'string' || geofence.name.trim().length === 0)) {
      throw new Error('围栏名称不能为空');
    }
    if (geofence.latitude !== undefined && (geofence.latitude < -90 || geofence.latitude > 90)) {
      throw new Error('纬度必须在 -90 到 90 之间');
    }
    if (geofence.longitude !== undefined && (geofence.longitude < -180 || geofence.longitude > 180)) {
      throw new Error('经度必须在 -180 到 180 之间');
    }
    if (geofence.radius !== undefined) {
      if (typeof geofence.radius !== 'number' || geofence.radius < 100) {
        throw new Error('围栏半径不能小于100米（省电设计要求）');
      }
      if (geofence.radius > 5000) {
        throw new Error('围栏半径不能大于5000米');
      }
    }
  }

  // 创建围栏（自动校验半径）
  async create(geofence: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Geofence> {
    this.validateGeofenceData(geofence);

    const now = Date.now();
    const result = await this.db.executeSql(
      `INSERT INTO geofences (name, latitude, longitude, radius, trigger_type,
       sound_enabled, vibration_enabled, notification_enabled, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        geofence.name,
        geofence.latitude,
        geofence.longitude,
        geofence.radius,
        geofence.triggerType,
        geofence.alertMethods.sound ? 1 : 0,
        geofence.alertMethods.vibration ? 1 : 0,
        geofence.alertMethods.notification ? 1 : 0,
        geofence.enabled ? 1 : 0,
        now,
        now,
      ]
    );

    const insertId = result[0].insertId;
    if (!insertId) {
      throw new Error('创建围栏失败：未获取到插入 ID');
    }

    return this.findById(insertId);
  }

  // 将数据库行转换为 Geofence 类型
  private rowToGeofence(row: any): Geofence {
    return {
      id: row.id,
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
      radius: row.radius,
      triggerType: row.trigger_type,
      alertMethods: {
        sound: row.sound_enabled === 1,
        vibration: row.vibration_enabled === 1,
        notification: row.notification_enabled === 1,
      },
      enabled: row.enabled === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getAll(): Promise<Geofence[]> {
    const results = await this.db.executeSql('SELECT * FROM geofences ORDER BY created_at DESC');
    const rows = results[0].rows;
    const geofences: Geofence[] = [];
    for (let i = 0; i < rows.length; i++) {
      geofences.push(this.rowToGeofence(rows.item(i)));
    }
    return geofences;
  }

  async findById(id: number): Promise<Geofence> {
    const results = await this.db.executeSql('SELECT * FROM geofences WHERE id = ?', [id]);
    const row = results[0].rows.item(0);
    if (!row) {
      throw new Error(`未找到 ID 为 ${id} 的地理围栏`);
    }
    return this.rowToGeofence(row);
  }

  async update(id: number, updates: Partial<Geofence>): Promise<void> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.latitude !== undefined) {
      fields.push('latitude = ?');
      values.push(updates.latitude);
    }
    if (updates.longitude !== undefined) {
      fields.push('longitude = ?');
      values.push(updates.longitude);
    }
    if (updates.radius !== undefined) {
      if (updates.radius < 100) {
        throw new Error('围栏半径不能小于100米（省电设计要求）');
      }
      fields.push('radius = ?');
      values.push(updates.radius);
    }
    if (updates.triggerType !== undefined) {
      fields.push('trigger_type = ?');
      values.push(updates.triggerType);
    }
    if (updates.alertMethods !== undefined) {
      fields.push('sound_enabled = ?');
      values.push(updates.alertMethods.sound ? 1 : 0);
      fields.push('vibration_enabled = ?');
      values.push(updates.alertMethods.vibration ? 1 : 0);
      fields.push('notification_enabled = ?');
      values.push(updates.alertMethods.notification ? 1 : 0);
    }
    if (updates.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(updates.enabled ? 1 : 0);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await this.db.executeSql(
      `UPDATE geofences SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.executeSql('DELETE FROM geofences WHERE id = ?', [id]);
  }
}
