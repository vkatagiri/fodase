const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs")
const bot = new Discord.Client({disableEveryone: true});
const ms = require("ms");
const superagent = require("superagent")
const version = require("./package.json")

bot.on("ready", async () =>
{
    console.log(`${bot.user.username} está online!`);

    bot.user.setActivity("Versão BETA 0.0.1", {type: "PLAYING"})

});

bot.on("message", async message =>
{
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    let canal = bot.channels.get("609919214891040784")

    if(cmd === `${prefix}kick`)
    {
        let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!kUser) message.channel.send("Não foi possível encontrar o usuário!")
        let kReason = args.join(" ").slice(22);
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Você não tem permissão para isso!");
        if(!kUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Esse usuário não pode ser kickado!");

        let kickEmbed = new Discord.RichEmbed()
        .setDescription("Kickado!")
        .setColor(0xF7DC6F)
        .addField("Kickado por:", `${message.author}`)
        .addField("Usuário kickado:", `${kUser} (ID: ${kUser.id})`)
        .addField("Razão:", `${kReason}`)
        .addField("Data/Horário", message.createdAt)
        message.channel.sendEmbed(kickEmbed);

        //let kickChannel = message.guild.channels.find(`name`, "incidentes");

        message.guild.member(kUser).kick(kReason); 

        
        return;
    }

    if(cmd === `${prefix}ban`)
    {
        let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!bUser) message.channel.send("Não foi possível encontrar o usuário!")
        let bReason = args.join(" ").slice(22);
        if(!message.member.hasPermission("MANAGE_MEMBERS")) return message.channel.send("Você não tem permissão para isso!");
        if(!bUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Esse usuário não pode ser kickado!");

        let banEmbed = new Discord.RichEmbed()
        .setDescription("Banido!")
        .setColor(0xF7DC6F)
        .addField("Banido por:", `${message.author}`)
        .addField("Usuário banido:", `${bUser} (ID: ${bUser.id})`)
        .addField("Razão:", `${bReason}`)
        .addField("Data/Horário", message.createdAt)
        message.channel.sendEmbed(banEmbed);

        //let kickChannel = message.guild.channels.find(`name`, "incidentes");

        message.guild.member(bUser).ban(bReason);
        
        return;
    }

    if(cmd === `${prefix}report`)
    {
        let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!rUser) return message.channel.send("Não foi possível encontrar o usuário!");
        let reason = args.join(" ").slice(22);

        let reportEmbed = new Discord.RichEmbed()
        .setDescription("Denúncia")
        .setColor(0xF7DC6F)
        .addField("Denunciado por", `${message.author} (ID: ${message.author.id})`)
        .addField("Data/Horário:", message.createdAt)
        .addField("Usuário denunciado:", `${rUser}`)
        .addField("ID:", `${rUser.id}`)
        .addField("Razão:", `${reason}`);

        canal.send({embed: reportEmbed});

        let report = new Discord.RichEmbed()
        .setTitle("Denúncia enviada com sucesso!")
        .setDescription("Agora é só aguardar os moderadores analisarem sua denúncia e prosseguirem com uma ação.")
        .setColor(0xF7DC6F)
        message.channel.sendEmbed(report);


        

        return;
    }
    
    
    
    
    
    if (cmd === `${prefix}regras`)
    {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Você não tem permissão para isso!")
        const regras = new Discord.RichEmbed()
        .setTitle("**REGRAS DO SERVIDOR**")
        .setDescription("Para interagir no servidor, você precisa seguir algumas regras, ou poderá ser mutado, kickado e até mesmo banido! As regras são essas:")
        .addField("***Tenha bom senso***", "Qualquer discurso homofóbico, racista, misógino, xenofóbico, transfóbico é punido com permaban. Também tente não levantar discussões políticas ou militâncias desnecessárias.")
        .addField("***Não faça spam!***", "Spam é tudo que é chato: divulgação, flood/spam, pedir admin ou cargos, abusar de comandos, entre outros")
        .addField("***Respeite a Staff:***", "Sempre que alguém da staff te der um aviso, respeite. Vamos evitar confusão e punições desnecessárias!")
        .addField("***Não mencione à toa!***", "Não mencione ninguém sem motivo, principalmente cargos da Staff. As pessoas param o que estão fazendo para visualizar menções!")
        .setColor(0xF7DC6F)
        .setFooter("iFunny BR Oficial")
        .setThumbnail("https://abeon-hosting.com/images/ifunny-logo-png-3.png")
        message.channel.send({embed: regras})
    }

    if(cmd === `${prefix}info`)
    {
        const info = new Discord.RichEmbed()
        .setDescription("Informações do servidor")
        .addField("Total de membros:", message.guild.memberCount)
        .addField("Você entrou em:", message.member.joinedAt)
        .setColor(0xF7DC6F)
        .setFooter("iFunny BR Oficial")
        message.channel.send({embed: info});
    }

    if(cmd === `${prefix}mute`)
    {
        let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!tomute) return message.reply("Usuário não encontrado!")
        if(tomute.hasPermission("MANAGE_MESSAGES")) return message.reply("Não consigo mutá-lo!");
        let muterole = message.guild.roles.find(`name`, "muted");
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Você não tem permissão para isso!")
        //começo criar cargo
        if(!muterole)
        {
            try
            {
                muterole = await message.guild.createRole(
                {
                    name: "muted",
                    color: "#ABB2B9",
                    permissions: []
                });
                message.guild.channels.forEach(async(channel, id) =>
                {
                    await channel.overwritePermissions(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    });
                });
            }catch(e)
            {
                console.log(e.stack);
            }
        }
        //final criar cargo

        let mutetime = args[1];
        if(!mutetime) return message.reply("Você não especificou um tempo pro mute.");

        await(tomute.addRole(muterole.id));
        //message.reply(`<@${tomute.id}> foi mutado por ${ms(ms(mutetime))}!`);
        const muteEmbed = new Discord.RichEmbed()
            .setDescription("Mutado com sucesso!")
            .addField("Mutado por:", `${message.author}`)
            .addField("Usuário:", `<@${tomute.id}> (ID: ${tomute.id})`)
            .addField("Tempo:", `${ms(ms(mutetime))}`)
            .setFooter("iFunny BR Oficial")
            .setColor(0xF7DC6F)
            message.channel.sendEmbed(muteEmbed);

        setTimeout(function(){
            tomute.removeRole(muterole.id);
            
            const unmuteEmbed = new Discord.RichEmbed()
            .setDescription("Desmutado!")
            .addField("Usuário:", `${tomute}`)
            .addField("Tempo mutado:", `${ms(ms(mutetime))}`)
            .setFooter("iFunny BR Oficial")
            .setColor(0xF7DC6F)
            canal.sendEmbed(unmuteEmbed);
            
        }, ms(mutetime));
    }

    if(cmd === `${prefix}gato`)
    {
        let msg = await message.channel.send("Gerando imagem...")

        let {body} = await superagent
        .get(`http://aws.random.cat/meow`)
        //console.log(body.file)
        if(!{body}) return message.channel.send("Algo deu errado! Tente novamente.")

            let gEmbed = new Discord.RichEmbed()
            .setColor(0xF7DC6F)
            .setAuthor("iFunny BR Oficial Imagens", message.guild.iconURL)
            .setImage(body.file)
            .setFooter(`iFunny BR Oficial`)
            message.channel.sendEmbed(gEmbed)

            msg.delete();
    }

    if(cmd === `${prefix}cachorro`)
    {
        let msg = await message.channel.send("Gerando imagem...")

        let {body} = await superagent
        .get(`https://dog.ceo/api/breeds/image/random`)
        //console.log(body.file)
        if(!{body}) return message.channel.send("Algo deu errado! Tente novamente.")

            let cEmbed = new Discord.RichEmbed()
            .setColor(0xF7DC6F)
            .setAuthor("iFunny BR Oficial Imagens", message.guild.iconURL)
            .setImage(body.message)
            .setFooter(`iFunny BR Oficial`)
            message.channel.sendEmbed(cEmbed)

            msg.delete();
    }

    if(cmd === `${prefix}meme`)
    {
        let msg = await message.channel.send("Gerando imagem...")

        let {body} = await superagent
        .get(`https://us-central1-kivson.cloudfunctions.net/charada-aleatoria`)
        //console.log(body.file)
        if(!{body}) return message.channel.send("Algo deu errado! Tente novamente.")

            let mEmbed = new Discord.RichEmbed()
            .setColor(0xF7DC6F)
            .setAuthor("iFunny BR Oficial Imagens", message.guild.iconURL)
            .setImage(body.url)
            .setFooter(`iFunny BR Oficial`)
            message.channel.sendEmbed(mEmbed)

            msg.delete();
    }

    if(cmd === `${prefix}botinfo`)
    {
        const botinfo = new Discord.RichEmbed()
        .setColor(0xF7DC6F)
        .setDescription("Informações do BOT")
        .addField("Versão:", `${version}`)
        .addField("Programado por:", "Vkps (blank#3304)")
        .setFooter("iFunny BR Oficial")
        message.channel.sendEmbed(botinfo);
    }
});

bot.login(botconfig.token);