import { PlatformType, Plugin } from '@botmate/server';
import { Bot } from 'grammy';

export class CommandManager extends Plugin {
  displayName = 'Command Manager';
  platformType = PlatformType.Telegram;

  async load() {
    const bot = this.bot.instance<Bot>();
    const config = this.config;
    
    bot.on("message", async (ctx) => {
      const messageText = ctx.message.text;
      const commandName = messageText.split(' ')[0];
      
      const commands = await config.get('commands', []);
      const command = commands.find(cmd => cmd.name === commandName);

      if (command) {
        const dynamicCommand = new Function('bot', command.code);
        try {
          dynamicCommand(ctx);
        } catch (error) {
          console.error('Failed to execute command:', error);
          ctx.reply('An error occurred while executing the command.');
        }
      } else {
        ctx.reply('Command not recognized.');
      }
    });
  }
}