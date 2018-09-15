module.exports = {
	name: 'donate',
	description: 'give money plox',
	execute(message, args) {
		const txt = 'Do you really want to send $1000 to the Alfred T. Shrimp Foundation?';
		message.channel.send(txt).then(reply => {
			reply.react('👍').then(() => reply.react('👎'));

			const filter = (reaction, user) => {
				return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
			};

			reply.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(collected => {
					const reaction = collected.first();

					if (reaction.emoji.name === '👍') {
						message.reply('Thank you for your donation! The collectors will come by soon for the rest of your possessions.');
					}
					else {
						message.reply('We\'re sorry you couldn\'t make a donation. The collectors will come by soon for the rest of your possessions.');
					}
				})
				.catch(collected => {
					console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
					message.reply('why don\'t you love me');
				});
		});
	},
};