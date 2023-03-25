const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits} = require('discord.js');
const { Collection } = require('discord.js')
const { token } = require('./config.json');
const wait = require('node:timers/promises').setTimeout;


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();


const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`${filePath} 處的指令缺少 'data'或'execute'`);
	}
}

client.once(Events.ClientReady, c => {
	console.log(`${c.user.tag} 登入了!`);
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`找不到 ${interaction.commandName} 的指令`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		await interaction.reply({content: `${interaction.commandName} 無法執行!`,ephemeral: true });
	}
});

client.login(token);