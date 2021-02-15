import { CommandOptions } from 'discord-rose/dist/typings/lib';

import colors from '../../utils/colors';

export default {
  name: 'Color',
  usage: 'color <color>',
  description: 'Change the color of your rank card.',
  category: 'leveling',
  command: 'color',
  aliases: ['colour'],
  permissions: [],
  botPermissions: [],
  exec: async (ctx) => {
    // Get the name of the color
    let colorName = ctx.args.join('').toLowerCase();
    if (colorName) {

      // Get the color from the JSON
      const color = colors(colorName);
      if (color) {
        // Get the user settings
        let userSettingsDoc = await ctx.worker.db.userDB.getSettings(ctx.message.author.id);

        // Set the settings if it doesn't exist
        if (!userSettingsDoc) userSettingsDoc = await ctx.worker.db.userDB.setSettings(ctx.message.author.id, {
          id: ctx.message.author.id,
          level: { color: '', picture: '', tag: '' }
        });

        // Set the color in the DB to the hex string
        userSettingsDoc.level.color = color.hexString;
        await ctx.worker.db.userDB.updateSettings(userSettingsDoc);

        // Respond with success
        ctx.worker.responses.normal(ctx, Number('0x' + color.hexString.slice(1)), `Set card color to **${color.hexString}**`);
        return;
      } else ctx.worker.responses.normal(ctx, ctx.worker.colors.RED, `I don't know the color \`${ctx.args.join(' ')}\`.`);
    } else ctx.worker.responses.normal(ctx, ctx.worker.colors.RED, `No color was given.`);
    return;
  }
} as CommandOptions;
