import { CommandOptions } from 'discord-rose/dist/typings/lib';

export default {
  name: 'Ban',
  usage: 'ban <mention | user ID> [reason]',
  description: 'Ban a member.',
  category: 'moderation',
  command: 'ban',
  aliases: ['b'],
  permissions: ['ban'],
  botPermissions: ['ban'],
  exec: async (ctx) => {
    const userID = (ctx.args[0] || '').replace(/[<@!>]/g, '');
    const reason = (ctx.args.slice(1).join(' ') || undefined);

    if (!userID) {
      ctx.worker.responses.tiny(ctx, ctx.worker.colors.RED, 'No user given.');
      return;
    }

    ctx.worker.moderation.ban(ctx.guild.id, userID as any, reason)
      .then(async (member) => {
        const logChannel = await ctx.worker.moderation.getLogChannel(ctx.guild.id);

        const moderationNum = await ctx.worker.db.guildDB.getModerationNumber(ctx.guild.id);
        let messageID: string;

        if (logChannel) {
          const msg = await ctx.worker.api.messages.send(logChannel.id, {
            embed: {
              title: `Banned Member (case #${moderationNum})`,
              color: ctx.worker.colors.RED,
              fields: [
                {
                  name: 'Member',
                  value: `${member.user.username + '#' + member.user.discriminator} (<@${member.user.id}>)`,
                  inline: true
                },
                {
                  name: 'Moderator',
                  value: `${ctx.message.author.username + '#' + ctx.message.author.discriminator} (<@${ctx.message.author.id}>)`,
                  inline: true
                },
                {
                  name: 'Reason',
                  value: reason || 'none',
                  inline: false
                }
              ],
              timestamp: new Date().toISOString(),
            },
          }).catch(() => null);

          messageID = msg?.id;
          if (!messageID) ctx.worker.responses.tiny(ctx, ctx.worker.colors.RED, 'Error occured while sending log message.');
        }

        await ctx.worker.db.guildDB.setModeration({
          guildID: ctx.guild.id,
          number: moderationNum,
          info: {
            action: 'BAN',
            member: member.user.id,
            moderator: ctx.message.author.id,
            reason: reason || 'none',
            timestamp: Date.now().toString()
          },
          log_message: messageID
        });

        ctx.worker.responses.tiny(ctx, ctx.worker.colors.RED, `Banned ${member.user.username}#${member.user.discriminator}`);
      })
      .catch(err => {
        ctx.worker.responses.tiny(ctx, ctx.worker.colors.RED, err.toString().replace('Error: ', ''));
      });
  }
} as CommandOptions;
