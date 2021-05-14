import { Language } from '.'

export default {
  CUSTOM: (str: string) => str,
  NOT_OWNER: 'لا يمكنك فعل هذا أيها السخيف.',
  LOADING: 'جار التحميل...',
  CMD_DISABLED: 'هذا الأمر معطل حاليا.',
  SERVER_ERROR: 'خطأ في الخادم الداخلي',
  DEVELOPED_BY: 'Developed by MILLION#1321',
  ERROR: (err: string) => `**خطأ: ${err}**`,
  RANK_UP: (role: string) => `تهانينا على التسوية! لديك الآن الدور <@${role}>`,
  COOLDOWN: (time: string) => `هذا الأمر قيد التهدئة حاليًا.\n يرجى المحاولة مرة أخرى بعد ${time}.`,

  NO_PERMS_BOT: (perms: string[]) => `افتقد الأذونات التالية: ${perms.map(p => `\`${p}\``).join('، ')}`,
  NO_PERMS_USER: (perms: string[]) => `تفتقد الأذونات التالية: ${perms.map(p => `\`${p}\``).join(', ')}`,

  LANGUAGE: 'English (en-US)',
  CURRENT_LANGUAGE: 'Current language: `English (en-US)`',
  LANGUAGE_UPDATED: 'Language updated to: `English (en-US)`',
  NO_LANGUAGE: (lang: string, langs: string[]) => `\`${lang}\` is not a supported language.\nSupported languages: ${langs.map(x => '`' + x + '`').join(', ')}`,

  CMD_COLOR_NONE: 'No color was given.',
  CMD_COLOR_UNKNOWN: (color: string) => `I don't know the color \`${color}\``,
  CMD_COLOR_UPDATED: (color: string, name: string) => `Set card color to **${color}** (${name})`,
  CMD_COLOR_UPDATEDCUSTOM: (color: string) => `Set card color to **${color}**`,

  CMD_COOLDOWN_CURRENT: (cooldown: string) => `Current XP-cooldown is **${cooldown}s**.`,
  CMD_COOLDOWN_LOW: 'The XP-cooldown must 0 seconds or greater.',
  CMD_COOLDOWN_UPDATED: (old: string, newer: string) => `Changed XP-cooldown from \`${old}\`s to \`${newer}\`s.`,

  CMD_LEVELMESSAGE_ENABLED: 'Level-Up messages enabled',
  CMD_LEVELMESSAGE_DISABLED: 'Level-Up messages disabled',

  CMD_LEVELROLE_NOLEVEL: 'No level was given',
  CMD_LEVELROLE_NOTNUM: 'The level must be a number',
  CMD_LEVELROLE_TOOLOW: 'The level must be greater than zero (0)',
  CMD_LEVELROLE_NOROLE: 'No role was given.',
  CMD_LEVELROLE_NOTFOUND: 'Role was not found',
  CMD_LEVELROLE_NOPERMS: 'I cannot give members this role',
  CMD_LEVELROLE_SET: (role: string, level: string) => `Members will now get the role <@&${role}> when they are level \`${level}\``,

  CMD_LEVELMESSAGE_SHORT: 'Level-Up message must be shorter than 100 characters',
  CMD_LEVELMESSAGE_CURRENT: (msg: string) => `Current Level-Up message: \`${msg}\``,
  CMD_LEVELMESSAGE_SET: (msg: string) => `Level-Up message set to \`${msg}\``,

  CMD_TAG_NONE: 'No tag was given',
  CMD_TAG_LONG: 'Tag must be no longer than thirty (30) characters',
  CMD_TAG_UPDATED: (tag: string) => `Tag updated to \`${tag}\``,

  CMD_RATE_NONE: 'No XP-Multiplier was given',
  CMD_RATE_HIGH: 'The XP-Multiplier must be greater than 0',
  CMD_RATE_LOW: 'The XP-Multiplier must be no greater than 100',
  CMD_RATE_UPDATED: (old: string, newer: string) => `Changed XP-Multiplier from \`${old}\` to \`${newer}\``,

  CMD_HELP_NOCMD: (cmd: string) => `Command \`${cmd}\` not found`,

  CMD_EMBEDS_ENABLED: 'Enabled embeded messages',
  CMD_EMBEDS_DISABLED: 'Disabled embeded messages',

  PREFIX_CURRENT: (prefix: string) => `Current prefix: \`${prefix}\``,
  CMD_PREFIX_LONG: 'Prefix length must be no greater than 20 characters',
  CMD_PREFIX_UPDATED: (old: string, newer: string) => `Changed prefix from \`${old}\` to \`${newer}\``,

  CMD_BLACKLIST_NOUSER: 'No user was given, please mention a user.',
  CMD_BLACKLIST_NOSELF: 'You canno tblacklist yourself',
  CMD_BLOACKLIST_ADDED: (user: string) => `<@${user}> is now blacklisted`,
  CMD_BLACKLIST_REMOVED: (user: string) => `<@${user}> is no longer blacklisted`,

  CMD_DEVMODE_ENABLED: 'Enabled developer-only mode',
  CMD_DEVMODE_DISABLED: 'Disabled developer-only mode',

  CMD_DISABLE_NONE: 'No command was given, please include a command',
  CMD_DISABLE_NOTFOUND: (cmd: string) => `\`${cmd}\` is not a valid command`,
  CMD_DISABLE_ENABLED: (cmd: string) => `Enabled \`${cmd}\``,
  CMD_DISABLE_DISABLED: (cmd: string) => `Disabled \`${cmd}\``,

  CMD_EVAL_SUCCESS: 'Eval Successful',
  CMD_EVAL_UNSUCCESS: 'Eval Unsuccessful',

  CMD_OWNER_NOUSER: 'No user was given, please mention a user',
  CMD_OWNER_NOSELF: 'You cannot remove yourself from owner',
  CMD_OWNER_REMOVED: (user: string) => `<@${user}> is no longer a bot owner`,
  CMD_OWNER_ADDED: (user: string) => `<@${user}> is now a bot owner`,

  CMD_RESTART_SHARD: (shard: string) => `Restarting Shard \`${shard}\``,
  CMD_RESTART_NOSHARD: (shard: string) => `Shard \`${shard}\` does not exist`,
  CMD_RESTART_CLUSTER: (cluster: string) => `Restarting Cluster \`${cluster}\``,
  CMD_RESTART_NOCLUSTER: (cluster: string) => `Cluster \`${cluster}\` does not exist`,
  CMD_RESTART_ALL: 'Restarting...',

  CMD_SWEEP: (ms: string) => `Swept Cache\nTook: \`${ms}\`ms`
} as Language
