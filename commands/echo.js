module.exports = {
	name: 'echo',
	aliases: ['talkback', 'repeat'],
	description: 'repeats back any messages sent in the next 15 seconds',
	cooldown: 15,
	execute(message, args) {
		const filter = m => true;
		const collector = message.channel.createMessageCollector(filter, { time: 15000 });

		collector.on('collect', m => {
			console.log(`Collected ${m.content}`);
		});

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} items`);
			try {
				collected.map(m => { message.channel.send(m.content.toString()); });
			}
			catch(error) {
				console.log(error);
			}
		});
	},
};