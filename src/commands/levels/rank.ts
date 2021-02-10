import CommandContext from '../../structures/CommandContext';
import CommandOptions from '../../structures/CommandOptions';

import Canvas from 'canvas'

export default {
  name: 'Rank',
  command: 'rank',
  aliases: ['card', 'level'],
  permissions: [],
  botPermissions: ['administrator', 'administrator'],
  exec: async (cmdCTX: CommandContext) => {
    const data = await cmdCTX.worker.db.userDB.getLevel(cmdCTX.message.author.id, cmdCTX.message.guild_id);
    const settings = await cmdCTX.worker.db.userDB.getSettings(cmdCTX.message.author.id)
    const user = cmdCTX.message.author;

    const currLevel = data.level;
    const currXp = data.xp;
    const nextXp = Math.floor(100 + 5 / 6 * currLevel * (2 * currLevel * currLevel + 27 * currLevel + 91));

    const tag = settings?.level.tag || '─────────────────';
    const pfp = settings?.level.picture || `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    const color = settings?.level.color || '#07bb5b';

    const canvas = Canvas.createCanvas(1000, 250);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, 1000, 250);

    ctx.lineWidth = 45;
    ctx.strokeStyle = '#2C2F33';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Level: ${currLevel}   XP: ${currXp} / ${nextXp}`, 275, canvas.height / 2);

    ctx.font = 'normal 32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${user.username}#${user.discriminator}`, 275, canvas.height / 3.5);

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(tag, 275, canvas.height / 1.35);

    const percentage = Math.floor(Number(currXp) / nextXp * 100) / 100;
    const twoPI = 2 * Math.PI;
    const pointFivePI = 0.5 * Math.PI;

    const arcLength = percentage * twoPI;
    const totalLength = arcLength - pointFivePI;

    ctx.strokeStyle = '#2C2F33';
    ctx.lineWidth = 35;
    ctx.beginPath();
    ctx.arc(125, 125, 85, 1.5 * Math.PI, 1.51 * Math.PI, true);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(125, 125, 86, 1.5 * Math.PI, totalLength, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(125, 125, 85, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(pfp);
    ctx.drawImage(avatar, 33, 32, 185, 185);

    cmdCTX.sendFile({ buffer: canvas.toBuffer('image/png'), name: 'rank.png' });
  }
} as CommandOptions
