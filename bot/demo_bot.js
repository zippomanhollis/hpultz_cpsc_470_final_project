/* *****************************************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
********************************************************************************

This is a sample Slack bot built with Botkit.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    echo my-slack-token > slack-token
    slack_token_path=./slack-token node demo_bot.js

  See README.md for how to run the bot on Kubernetes.

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit
*/

var Botkit = require('botkit');
//var fortune = require('node-fortune');
var fs = require('fs');
var translate = require('@google-cloud/translate')({
    projectId: 'lucid-splicer-149022',
    key : 'AIzaSyD0gWhXPzF_pvGljpDbxI1oJmOvAupnt_8'
//    keyFilename: '/home/megruen/slack-samples/bot/google_translate_key.json'
});
// http://nodejs.org/api.html#_child_processes
var sys = require('sys');
var exec = require('child_process').exec;
var child;


var controller = Botkit.slackbot({
    debug: false,
    stats_optout: true
});

if (!process.env.slack_token_path) {
  console.log('Error: Specify slack_token_path in environment');
  process.exit(1);
}

fs.readFile(process.env.slack_token_path, (err, data) => {
  if (err) {
    console.log('Error: Specify token in slack_token_path file');
    process.exit(1);
  }
  data = String(data);
  data = data.replace(/\s/g, "");
  controller.spawn({token: data}).startRTM(function(err) {
    if (err) {
      throw new Error(err);
    }
  });
});

controller.hears(
    ['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) { 
        bot.reply(message, "Hello, my name is Mr. Kitty."); 
    });

controller.hears(
    ['help'], ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) { 
        var text = "~~~~~~~~HELP~~~~~~~~\n" + 
                   "Available commands requiring mentions:\n" +
                   " -> help\n      display this help screen\n" +
                   " -> hi (or) hello\n      display friendly greeting\n" +
                   " -> I dont feel good (or) I feel sick\n      display warm desire for better health\n" +
                   " -> inspire me\n      display inspirational messages from Mr. Kitty's favorite program\n" +
                   " -> languages\n      display a list of the languages Mr.Kitty is fluent in\n" +
                   "Available commands NOT requiring mentions:\n" +
                   " -> span me <message>\n      translate message from english to spanish\n" +
                   " -> translate -inlang <in-language code> -outlang <out-language code> -message <message>\n" +
                   "    translate message from in-language to out-language\n";
        bot.reply(message, text); 
    });

controller.hears(
    ['I dont feel good', 'I feel sick', 'kill me, kill me now'], ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) { 
        bot.reply(message, "Ahhh, I hope you feel better soon."); 
    });

controller.hears(
    ['inspire me'], ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) { 
        // executes `pwd`
        child = exec("/usr/games/fortune", function (error, stdout, stderr) {
            sys.print('stdout: ' + stdout);
            bot.reply(message, stdout); 
            bot.reply(message, stderr); 
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    });

controller.hears(
    ['languages'], ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) { 
        translate.getLanguages('en', function(err, languages) {
            var list = '';
            languages.forEach((language) => list += language.name + ": " + language.code + "\n");
            if (!err) {
                bot.reply(message, list);
            }
        });
    });

controller.hears(
    ['^span me.*$'], ['ambient', 'direct_message', 'direct_mention', 'mention'],
    function(bot, message) { 
        var text = message.text.replace("span me ", "");
//        var text = 'hello'
        var options = {
            from: 'en',
            to: 'es'
        };
        translate.translate(text, options, function(err, translation) {
            if (!err) {
                // translation = 'Hola'
                bot.reply(message, "\"" +
                        message.text.replace("span me ", "") +
                        "\" in spanish is \"" + translation + "\"");  
            }
            if (err) {
                bot.reply(message, "there was a problem" + err);  
            }
        });
    });

controller.hears(
    ['^translate -inlang (.*) -outlang (.*) -message (.*)$'], ['ambient', 'direct_message', 'direct_mention', 'mention'],
    function(bot, message) { 
        var text = message.text.match(/.*message (.*)$/)[1];
//        bot.reply(message, "your message was " + text);  
        var inLang = message.text.match(/.*inlang (\S*)\b/)[1];
//        bot.reply(message, "your inLang was " + inLang);  
        var outLang = message.text.match(/.*outlang (\S*)\b/)[1];
//        bot.reply(message, "your outLang was " + outLang);  
        var options = {
            from: inLang,
            to: outLang
        };
        translate.translate(text, options, function(err, translation) {
            if (!err) {
                // translation = 'Hola'
                bot.reply(message, "\"" + text +
                        "\" in " + outLang + " is \"" + translation + "\"");  
            }
            if (err) {
                bot.reply(message, "there was a problem" + err);  
            }
        });
    });








