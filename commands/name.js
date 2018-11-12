module.exports = {
	name: 'name',
	aliases: ['nick'],
	description: 'change\'s someone nickname',
	cooldown: 15,
	execute(message, args) {
		const taggedUser = message.guild.members.get(message.mentions.users.first().id);

		args.shift(); // remove mention

		if (args < 1) return;

		const newName = args.join(' ');
		console.log(newName);

		if (newName == null) return;
		if (newName.length > 32) {
			message.channel.send('Nicknames must be 32 characters or fewer.');
			return;
		}

		// Update the member's nickname
		taggedUser.setNickname(newName)
			.catch(console.error);
	},
};