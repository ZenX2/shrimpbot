const fs = require('fs');
const config = require('./config.json');
const emojiCharacters = require('./emojiCharacters');
const reactWords = [['henlo'], ['plz'], ['marf'], ['benis', 'horsey'], ['no pants', 'this'], ['drug', 'pepewat'], ['skyshale', 'lenny'], ['boner'], ['maow'], ['hugs'], ['gay', 'gay']];

const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
const cooldowns = new Discord.Collection();

function messageFilter(message) {
	if (message.author.id === client.user.id) return false;
	// if (message.channel.name !== 'bot-commands') return false;
	if (message.author.bot) return false;
	return true;
}

function parseCommand(message) {
	const args = message.content.slice(config.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	// message.channel.send(`command: ${command}, args: ${args}`);
	processCommand(message, commandName, args);
}

function processCommand(message, commandName, args) {
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) {
		message.channel.send(`dude i don't know what '${commandName}' means`);
		return;
	}

	// Missing arguments where they should be!!
	if (command.args && !args.length) {
		const username = message.author.nickname || message.author.username || message.author.toString();
		let reply = `Where are the fucking arguments I was promised, ${username}? WHERE ARE THEY ${username.toUpperCase()}?`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	// Initialize command's user-timestamps collection
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || config.defaultCooldown) * 1000;

	if (!timestamps.has(message.author.id)) {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}
	else {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	try {
		command.execute(message, args);
	}
	catch(error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
}

async function reactText(message, word) {
	try {
		if (!word[1]) {
			const text = word[0].toLowerCase();
			for (const char of text) {
				if (emojiCharacters[char]) {
					await message.react(emojiCharacters[char]);
				}
			}
		}
		else {
			const emoji = message.guild.emojis.find('name', word[1]);
			if (emoji) {
				await message.react(emoji);
			}
		}
	}
	catch(error) {
		console.log('An emoji failed to react.');
		console.log(error);
	}
}

async function reactResponse(message) {
	try {
		reactWords.map(async (word) => {
			if (message.content.toLowerCase().includes(word[0])) {
				await reactText(message, word);
			}
		});
	}
	catch(error) {
		console.log('Failed while checking reaction words!');
		console.log(error);
	}
}

function shrimpResponse(message) {
	if (message.content.includes('🦐')) {
		message.channel.send(':shinto_shrine: THE SHRIMPGATE WILL BE REOPENED :shinto_shrine:');
	}
	if (message.content.includes('🍤')) {
		message.channel.send(':(');
	}
	if (message.content.toLowerCase().includes('shkremp')) {
		message.channel.send('Who you callin\' a shkremp, bih? 😤');
	}
}

// /////////////
// GO GO GO GO//
// /////////////

client.on('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	// console.log(message.content);
	if (!messageFilter(message)) return;

	if (message.content.startsWith(config.prefix)) {
		parseCommand(message);
	}
	else {
		// Log the message with the previous message
		// to build training set for chatbot?
		// logMessage();
		shrimpResponse(message);
		await reactResponse(message);
	}

	// message.channel.send('--sponge ' + message.content);
});

client.login(config.token);