const discord = require('discord.js');

const DeleteMessage = async (message, text, reminders, db) => {
    const m = await message.channel.send(`${text}\nPlease respond with the number for the reminder you want deleted.`);
    const filter = mes => mes.author.id == message.author.id;
    const collectorSelection = new discord.MessageCollector(message.channel, filter, {time: 1*60*1000});
    collectorSelection.on('collect', async (mesNum) => {
        selection = parseInt(mesNum.content.charAt(0));
        if (Number.isInteger(selection)) {
            collectorSelection.stop("message collected");
            const mConfirm = await mesNum.channel.send("Are you sure you want to delete the reminder : " + reminders[(selection-1)].text + " Reply with y/n");
            const collectorConfirm = new discord.MessageCollector(mesNum.channel, filter, {time: 1*60*1000});
            collectorConfirm.on('collect', (mesCon) => {
                if (mesCon.content.toLowerCase().charAt(0) == "y") {
                    db.collection(mesCon.guild.id).deleteOne({'_id' : reminders[(selection-1)]._id});
                    mConfirm.edit("Reminder has been deleted");
                    collectorConfirm.stop("Confirmation received");
                } else if (mesCon.content.toLowerCase().charAt(0) == "n") {
                    mConfirm.edit("Reminder was not deleted please redo command to select a different reminder");
                    collectorConfirm.stop("Negative response received");
                } else {
                    mesCon.channel.send('A "y" or "n" was not the first character in your message please try again.');
                    collectorConfirm.resetTimer({time: 1*60*1000});
                }
            });
        } else {
            mesNum.channel.send("The first character of your message was not a number please try again.");
            collectorSelection.resetTimer({time: 1*60*1000});
        }
    });
    collectorSelection.on('end', () => {
        m.edit("Time's up for selecting a reminder");
    });
}

module.exports = {
    name: 'reminderdelete',
    description: 'Command that will show a list of your reminders and allow you to select the one you want deleted',
    parameters: 'none',
    explanation: 'Gives the list of reminders and allows for selection of one to delete',
    async execute(message, text, db, twitchDb) {
        let replyString = "";
        const reminders = await db.collection(message.guild.id).find({"userID" : message.author.id}).toArray();
        const member = await message.guild.members.fetch(message.author.id);
        for (let i = 0; i < reminders.length; i++) {
            replyString += i+1 + ": " + member.displayName + " " + reminders[i].text + "\n";
        }
        if (replyString != "")
            DeleteMessage(message, replyString, reminders, db);
        else
            message.channel.send("No reminders found");
    },
};