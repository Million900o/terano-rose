import { Cache } from 'discord-rose/dist/utils/Cache'

import LevelModel from './models/users/levels'
import SettingsModel from './models/users/settings'
import UserModel from './models/users/users'

interface LevelDoc {
  guildID: string,
  userID: string,
  xp: string,
  level: number
}

interface SettingsDoc {
  id: string, // User ID
  level: {
    tag: string,
    color: string,
    picture: string
  }
}

interface UserDoc {
  id: string,
  owner: boolean,
  blacklisted: boolean
}

export default class UserDB {
  settings: Cache<string, SettingsDoc>;
  levels: Cache<string, LevelDoc>;
  users: Cache<string, UserDoc>
  constructor() {
    this.settings = new Cache(15 * 60 * 1000)
    this.levels = new Cache(15 * 60 * 1000)
    this.users = new Cache(15 * 60 * 1000)
  }

  async setSettings(id: string, doc: SettingsDoc): Promise<SettingsDoc> {
    await SettingsModel.create(doc);
    return await this.getSettings(id);
  }

  async getSettings(id: string): Promise<SettingsDoc | null> {
    const fromCache = this.settings.get(id);
    if (fromCache) return fromCache
    const doc: SettingsDoc = await SettingsModel.findOne({ id }).lean();
    if (doc) {
      this.settings.set(id, doc);
      return doc;
    } else return null;
  }

  async updateSettings(id: string, doc: SettingsDoc): Promise<SettingsDoc> {
    await SettingsModel.findOneAndUpdate({ id }, doc);
    return await this.getSettings(id)
  }

  async setUser(id: string, doc: UserDoc): Promise<UserDoc> {
    this.users.set(id, doc);
    await UserModel.create(doc);
    return await this.getUser(id);
  }

  async getUser(id: string): Promise<UserDoc | null> {
    const fromCache = this.users.get(id);
    if (fromCache) return fromCache
    const doc: UserDoc = await UserModel.findOne({ id }).lean();
    if (doc) {
      this.users.set(id, doc);
      return doc;
    } else return null;
  }

  async updateUser(id: string, doc: UserDoc): Promise<UserDoc> {
    this.users.set(id, doc);
    await UserModel.findOneAndUpdate({ id }, doc);
    return await UserModel.findOneAndUpdate({ id }, doc).lean() as UserDoc
  }

  async setLevel(userID: string, guildID: string, doc: LevelDoc): Promise<LevelDoc> {
    await LevelModel.create(doc);
    return await this.getLevel(userID, guildID);
  }

  async getLevel(userID: string | null, guildID: string): Promise<LevelDoc> {
    const fromCache = this.levels.get(`${guildID}${userID}`);
    if (fromCache) return fromCache
    const doc: LevelDoc = await LevelModel.findOne({ guildID, userID }).lean();
    if (doc) {
      this.levels.set(`${guildID}${userID}`, doc);
      return doc;
    } else {
      const data: LevelDoc = {
        guildID,
        userID,
        xp: '0',
        level: 0,
      };
      return await this.setLevel(userID, guildID, data)
    };
  }

  async getAllLevel(guildID: string): Promise<LevelDoc[]> {
    return await LevelModel.find({ guildID }).lean();
  }

  async updateLevel(userID: string, guildID: string, doc: LevelDoc): Promise<LevelDoc> {
    this.levels.set(`${guildID}${userID}`, doc);
    await LevelModel.findOneAndUpdate({ userID, guildID }, doc);
    return await LevelModel.findOneAndUpdate({ guildID, userID }, doc).lean() as LevelDoc
  }

  // Other functions
  // These functions will be used 
  // for getting/changing 1 or 2 things

  async getOwner(userID: string) {
    const userData = await this.getUser(userID);
    return userData?.owner;
  }

  async setOwner(userID: string, value: boolean) {
    const userData = await this.getUser(userID);
    if (userData) {
      userData.owner = value;
      await this.updateUser(userID, userData);
      return;
    } else {
      const data: UserDoc = { id: userID, owner: value, blacklisted: false };
      await this.setUser(userID, data)
      return;
    }
  }

  async getBlacklist(userID: string) {
    const userData = await this.getUser(userID);
    return userData?.blacklisted
  }
}