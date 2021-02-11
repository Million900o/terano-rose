import CommandOptions from '../../structures/CommandOptions';

export default {
  name: 'Prefix',
  command: 'prefix',
  aliases: [],
  permissions: ['manageMessages'],
  botPermissions: [''],
  exec: async (ctx) => {
    const prefix = ctx.args[0];
    if (prefix) {
      if (prefix.length < 21) {
        const oldPrefx = await ctx.worker.db.guildDB.getPrefix(ctx.guild.id);
        await ctx.worker.db.guildDB.updatePrefix(ctx.guild.id, prefix);
        ctx.worker.responses.normal(ctx, ctx.worker.colors.GREEN, `Changed prefix from ${oldPrefx} to \`${prefix}\``)
        return;
      } else ctx.worker.responses.normal(ctx, ctx.worker.colors.RED, 'Prefix length must be no greater than 20.')
    } else ctx.worker.responses.normal(ctx, ctx.worker.colors.RED, 'No prefix was given.')
    return;
  }
} as CommandOptions