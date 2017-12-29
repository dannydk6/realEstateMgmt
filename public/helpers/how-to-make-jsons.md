ttkgrid
ShowLive

Share
Logs
+ New File
assets
attacks/default.json
public/client.js
public/style.css
views/index.html
.env
README.md
how-to-make-jsons.md
notes.md
package.json
server.js
Markdown
How to Make a JSON

What is a JSON?

A JSON (Javascript Object Notation) is a popular format for storing data, using key-value pairs. JSON files are basically just text files, but formatted in a way that makes them easily read by a program like Javascript.

Why are we using JSON?

We want an easy way to quickly change default values for attack templates, user stats, and anything that is prone to change depending on patches and balancing. Here is an example JSON for an attack:

{

"name": "Default",

"type": "strike",

"mpCost": "2",

"accuracy": { "min": "1", "max": "6" },

"counter": { "min": "1", "max": "5" },

"dodge": { "min": "1", "max": "6" },

"counterHit": { "min": "1", "max": "3" },

"criticalHit": { "min": "1", "max": "3" },

"criticalChance": { "min": "1", "max": "9" },

"defaultText": "punch"

}

These JSON files will be stored on the server and will be used for calculating stats for each attack for battles.

How do I make a JSON?

The line below is an example 'object' in JSON:

{ "key": "value" }

Objects store key-value pairs. Open your favorite text editor (Notepad, Word, Sublime, etc.) and copy/paste the line above into an empty file. Save the file with the name myexample.json, and voila, you have created your first JSON!

Notice the formatting of the JSON. There are brackets {} which surround a key-value pair, separated by a colon. Let's break it down.

when Javascript reads this file, it will create an Object out of the text surrounded by the brackets {}. In this case, the object will have a property called key with a value called value.

How do I add multiple key-value pairs?

Here is another example JSON:

{ "key1": "value1", "key2": "value2" }

When Javascript reads this file, it will create an Object out of the text surrounded by the brackets {}. In this case, the object will have two properties: the first property is called key1 with a value called value1 and a second property called key2 with a value called value2.

Notice that each key-value pair is separated by a comma.

How do I add an object into an object?

The creator of JSON was crafty. You can actually set a value in your key-value pair to be an object itself by wrapping it in brackets:

{ "key": { "name": "Joe", "age":"21" } }

when Javascript reads this file, it will create an overarching Object out of the text surrounded by the first bracket ("{") up to the last bracket ("}") in the file. In this case, the overarching object will have a property called key with another object as its value. This other object has a property called name with a value called Joe, as well as a property called age with a value equal to 21.