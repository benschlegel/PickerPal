import { SlashCommandBuilder, Collection, PermissionResolvable, Message, AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

export interface SlashCommand {
    command: SlashCommandBuilder | any,
    execute: (interaction : ChatInputCommandInteraction) => void,
    autocomplete?: (interaction: AutocompleteInteraction) => void,
    cooldown?: number // in seconds
}

export interface Command {
    name: string,
    execute: (message: Message, args: Array<string>) => void,
    permissions: Array<PermissionResolvable>,
    aliases: Array<string>,
    cooldown?: number,
}

interface GuildOptions {
    prefix: string,
}

export type GuildOption = keyof GuildOptions
export interface BotEvent {
    name: string,
    once?: boolean | false,
    execute: (...args: any) => void
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string,
            CLIENT_ID: string,
            PREFIX: string,
            MONGO_URI: string,
            MONGO_DATABASE_NAME: string
        }
    }
}

declare module 'discord.js' {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>
        commands: Collection<string, Command>,
        cooldowns: Collection<string, number>
    }
}

export type ButtonCustomID = 'add-text-choice' | 'start-choice' | 'yes-no-choice' | 'reroll-choice' | 'finalize-choice';

export type ModalCustomID = 'text-option-modal' | 'feedback-modal';

export type ModalOptionID = 'verification-input' | 'feedback-input';
