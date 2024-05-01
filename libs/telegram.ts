import { Telegraf } from "telegraf";

export const telegramBot = new Telegraf(process.env.BOT_TOKEN!);
