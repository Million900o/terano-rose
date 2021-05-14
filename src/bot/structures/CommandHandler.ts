import { APIMessage, MessageType } from 'discord-api-types'
import { EventEmitter } from 'events'

import { CommandOptions, CommandType, CommandContext as ctx, Worker } from 'discord-rose/dist/typings/lib'
import Collection from '@discordjs/collection'

import fs from 'fs'
import path from 'path'

import { CommandContext } from './CommandContext'

type MiddlewareFunction = (ctx: ctx) => boolean | Promise<boolean>

/**
 * Error in command
 */
export class CommandError extends Error {
  nonFatal?: boolean
}

/**
 * Command Events
 */
export interface HandlerEvents {
  COMMAND_RAN: [ctx, any]
  MIDDLEWARE_ERROR: [ctx, CommandError]
  COMMAND_ERROR: [ctx, CommandError]
  NO_COMMAND: [APIMessage]
}

/**
 * Utility in charge of holding and running commands
 */
export class CommandHandler extends EventEmitter {
  private _options: CommandHandlerOptions = {
    default: {},
    bots: false,
    mentionPrefix: true,
    caseInsensitivePrefix: true,
    caseInsensitiveCommand: true
  }

  once!: <K extends keyof HandlerEvents>(event: K, listener: (...data: HandlerEvents[K]) => any | Promise<any>) => this
  on!: <K extends keyof HandlerEvents>(event: K, listener: (...data: HandlerEvents[K]) => any | Promise<any>) => this
  emit!: <K extends keyof HandlerEvents>(event: K | symbol, ...data: HandlerEvents[K]) => boolean

  public middlewares: MiddlewareFunction[] = []
  public commands = new Collection<CommandType, CommandOptions<any>>()

  public CommandContext = CommandContext

  /**
   * Create's new Command Handler
   * @param worker Worker
   */
  constructor (private readonly worker: Worker) {
    super()

    this.worker.on('MESSAGE_CREATE', (data) => {
      this._exec(data).catch(() => { })
    })
  }

  public prefixFunction?: ((message: APIMessage) => Promise<string | string[]> | string | string[])
  public errorFunction = (ctx: ctx, err: CommandError): void => {
    if (ctx.myPerms('sendMessages')) {
      if (ctx.myPerms('embed')) {
        ctx.embed
          .color(0xFF0000)
          .title('An Error Occured')
          .description(`\`\`\`xl\n${err.message}\`\`\``)
          .send().catch(() => { })
      } else {
        ctx
          .send(`An Error Occured\n\`\`\`xl\n${err.message}\`\`\``)
          .catch(() => { })
      }
    }

    if (err.nonFatal) return

    err.message += ` (While Running Command: ${String(ctx.command.command)})`
    console.error(err)
  }

  /**
   * Load a directory of CommandOptions commands (will also load sub-folders)
   * @param directory Absolute directory full of command files
   */
  load (directory: string): this {
    if (!path.isAbsolute(directory)) directory = path.resolve(process.cwd(), directory)

    const files = fs.readdirSync(directory, { withFileTypes: true })

    files.forEach(file => {
      if (file.isDirectory()) return this.load(path.resolve(directory, file.name))

      if (!file.name.endsWith('.js')) return

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete require.cache[require.resolve(path.resolve(directory, file.name))]

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      let command = require(path.resolve(directory, file.name))

      if (!command) return

      if (command.default) command = command.default

      this.add(command)
    })

    return this
  }

  /**
   * Sets Command Handler options
   * @param opts Options
   * @returns this
   */
  options (opts: CommandHandlerOptions): this {
    this._options = {
      ...this._options,
      ...opts
    }

    return this
  }

  /**
   * Sets a prefix fetcher
   * @param fn String of prefix or Function to choose prefix with
   * @example
   * worker.commands
   *   .prefix('!')
   * // or
   *   .prefix(['!', '+'])
   * // or
   *   .prefix((message) => {
   *     return db.getPrefix(message.guild_id)
   *   })
   * @returns this
   */
  prefix (fn: string | string[] | ((message: APIMessage) => Promise<string | string[]> | string | string[])): this {
    if (Array.isArray(fn) || typeof fn === 'string') {
      this.prefixFunction = () => fn
    } else {
      this.prefixFunction = fn
    }

    return this
  }

  /**
   * Defines an error handler replacing the default one
   * @param fn Function to handle error
   * @example
   * worker.commands
   *  .error((ctx, error) => {
   *    ctx.send(`Error: ${error.message}`)
   *  })
   * @returns this
   */
  error (fn: (ctx: ctx, error: CommandError) => void): this {
    this.errorFunction = fn

    return this
  }

  /**
   * Adds a global middleware function
   * @param fn Middleware function
   * @returns this
   */
  middleware (fn: MiddlewareFunction): this {
    this.middlewares.push(fn)

    return this
  }

  /**
   * Adds a command to the command handler
   * @param command Command data, be sure to add exec() and command:
   * @example
   * worker.commands
   *   .add({
   *     command: 'hello',
   *     exec: (ctx) => {
   *       ctx.reply('World!')
   *     }
   *   })
   * @returns this
   */
  add (command: CommandOptions<any>): this {
    this.commands.set(command.command, {
      ...this._options.default,
      ...command
    })

    return this
  }

  private _test (command: string, cmd: CommandType): boolean {
    if (this._options.caseInsensitiveCommand) command = command.toLowerCase()
    if (typeof cmd === 'string') return command === cmd
    if (cmd instanceof RegExp) return !!command.match(cmd)

    return false
  }

  /**
   * Gets a command from registry
   * @param command Command name to fetch
   * @returns Command
   */
  public find (command: string): CommandOptions<any> | undefined {
    return this.commands?.find(x => (this._test(command, x.command) || x.aliases?.some(alias => this._test(command, alias)) as boolean))
  }

  private async _exec (data: APIMessage): Promise<void> {
    if (!data.content || (!this._options.bots && data.author.bot)) return
    if (![MessageType.DEFAULT, MessageType.REPLY].includes(data.type)) return

    let prefix: string | string[] | undefined = ''
    if (this.prefixFunction) {
      prefix = await this.prefixFunction(data)
      if (!Array.isArray(prefix)) prefix = [prefix]

      if (this._options.mentionPrefix) prefix.push(`<@${this.worker.user.id}>`, `<@!${this.worker.user.id}>`)

      const content = this._options.caseInsensitivePrefix ? data.content.toLowerCase() : data.content

      prefix = prefix.find(x => content.startsWith(x))
      if (!prefix) return
    }

    const args = data.content.slice(prefix ? prefix.length : 0).split(/\s/)
    if (args[0] === '') {
      args.shift()

      prefix += ' '
    }

    const command = args.shift() ?? ''

    const cmd = this.find(command)
    if (!cmd) {
      this.emit('NO_COMMAND', data)
      return
    }

    const ctx = new this.CommandContext({
      worker: this.worker,
      message: data,
      command: cmd,
      prefix,
      ran: command,
      args: args
    })

    try {
      for (const midFn of this.middlewares) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
          if (await midFn(ctx) !== true) return
        } catch (err) {
          err.nonFatal = true

          throw err
        }
      }

      try {
        const response = await cmd.exec(ctx)

        try {
          void cmd.onRun?.(ctx, response)
        } catch (e) { }

        this.emit('COMMAND_RAN', ctx, response)
      } catch (err_) {
        this.emit('COMMAND_ERROR', ctx, err_)

        try {
          void cmd.onError?.(ctx, err_)
        } catch (e) { }

        this.errorFunction(ctx, err_)
      }
    } catch (err) {
      this.emit('MIDDLEWARE_ERROR', ctx, err)

      this.errorFunction(ctx, err)
    }
  }
}

export interface CommandHandlerOptions {
  /**
   * Default CommandOptions ('command', 'exec', and 'aliases' cannot be defaulted)
   */
  default?: Partial<Pick<CommandOptions<any>, Exclude<keyof CommandOptions<any>, 'command' | 'exec' | 'aliases'>>>
  /**
   * Allow commands from bots
   * @default false
   */
  bots?: boolean
  /**
   * Whether or not to respond to your bot's @Mention
   * @default true
   */
  mentionPrefix?: boolean
  /**
   * Whether or not the prefix is case insensitive
   * @default true
   */
  caseInsensitivePrefix?: boolean
  /**
   * Whether or not the command is case insensitive
   * @default true
   */
  caseInsensitiveCommand?: boolean
}
