module.exports = {
	name: 'analysis',
	description: 'autoformats an analysis comment',
	cooldown: 15,
	execute(message, args) {
		const filter = m => true;
		const collector = message.channel.createMessageCollector(filter, { time: 3 * 60000 });
		const effects = [];

		let strength = 'moderate';
		let drug = 'psychedelic';
		if (args.length == 1) {
			strength = args[0];
		}
		else if (args.length == 2) {
			strength = args[0];
			drug = args[1];
		}

		if (drug == 'disso' || drug == 'dissociative') {
			drug = '[dissociative effects](https://effectindex.com/summaries/dissociatives/)';
		}
		else if (drug == 'del' || drug == 'deliriant') {
			drug = '[deliriant effects](https://effectindex.com/summaries/deliriants/)';
		}
		else {
			drug = '[psychedelic effects](https://effectindex.com/summaries/psychedelics/visual)';
		}

		const templateStart = `This is a replication of ${strength} ${drug}. The specific effects which are occurring within this replication seem to include:`;
		const templateEnd = 'Please reply to this comment if you disagree with this replication analysis or would like to provide general feedback.';
		let additionalNotes = '';

		// What do i need to make this work?
		// Need to have the collector go until a finish message is sent
		// All collected messages need to be split if there's a |
		// First half needs to be formatted lowercase with hyphens for links

		collector.on('collect', m => {
			// Stop condition
			if (m.content.includes('done')) {
				collector.stop();
				return;
			}
			effects.push(m.content);
		});

		collector.on('end', collected => {


			console.log(`Collected ${collected.size} items`);
			try {
				let templateMiddle = '';
				effects.map(m => {
					// Split message
					const spl = m.split('|');
					const effect = spl[0].trim();
					const notes = (spl[1] || '').trim();
					const link = effect.toLowerCase().replace(' ', '-');

					// **Additional notes:**

					if (effect == 'notes') {
						additionalNotes = `**Additional notes:**\n> ${notes}`;
					}
					else {
						const line = `* [**${effect}**](https://effectindex.com/effects/${link}) ${notes}`;
						templateMiddle += line + '\n';
					}
				});
				message.channel.send(templateStart + '\n' + templateMiddle + '\n' + templateEnd + '\n' + additionalNotes);
			}
			catch(error) {
				console.log(error);
			}
		});
	},
};