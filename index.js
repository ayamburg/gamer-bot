// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.secret.json');

// Create a new client instance
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });


function detectURLs(message) {
  var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  return message.match(urlRegex);
}

function findInBatch(messages, id) {
    return messages.find(message => {
        for(const url of urls) {
            if(message.content.includes(url) && message.id !== id)
                return true;
        };
    });
}

// When the client is ready, run this code (only once)
bot.once('ready', () => {
	console.log(`Logged in as ${bot.user.tag}`);
});

bot.on('messageCreate', async eventMessage => {
    console.log("message received...");
    if(eventMessage.author.id === bot.user.id)
        return;
    if(eventMessage.content.includes(";;play") || eventMessage.content.includes("!play"))  
        return;
    urls = eventMessage.content.split(" ").filter(part => detectURLs(part));
    console.log(urls);
    if (urls.length > 0) {
        const channels = await eventMessage.guild.channels.fetch();
        const filteredChannels = channels.filter(channel => {
            if(channel.id === eventMessage.channelId) return true;
            if(channel.type === 'GUILD_TEXT' && channel.deleted === false){
               return channel.permissionsFor(eventMessage.guild.roles.everyone).has('VIEW_CHANNEL');
            }
        }).sort((channel1, channel2) => {
            if(channel1.id === eventMessage.channelId)
                return -1;
            else if(channel2.id === eventMessage.channelId)
                return 1
            else
                return channel1.position - channel2.position; 
        });
        for(const [id, channel] of filteredChannels) {
            let messages = await channel.messages.fetch({ limit: 100 });
            while(messages.size > 0){
                console.log(`loaded batch with ${messages.size} messages`)
                const found = findInBatch(messages, eventMessage.id);
                if(found){
                    console.log("repost found!");
                    eventMessage.reply(`br0? https://discord.com/channels/${found.guildId}/${found.channelId}/${found.id}`);
                    return;
                }
                messages = await channel.messages.fetch({ limit: 100, before: Array.from(messages)[messages.size -1][0] });
            }
        };

    }
});

// Login to Discord with your client's token
bot.login(token);