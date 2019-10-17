const csv = require('csv-parser');
const fs = require('fs');
const TwinBcrypt = require('twin-bcrypt');

function getTriangleArea(x,y,z) {
	let p = (x+y+z)/2;
	let area = Math.sqrt(p*(p-x)*(p-y)*(p-z));
	return area;
}

// CSV Parser
function parseCSV(file) {
	var results = [];
	var uniqueResults = [];
	fs.createReadStream(file)
	.pipe(csv())
	.on('data', function(data) {
		if(!isNaN(data.X) && !isNaN(data.Y) && !isNaN(data.Z)) {
			for(let k in data) {
				if(data.hasOwnProperty(k)) {
					// if(data[k] < 0) console.log("Below Zero:", data[k]);
					if(data[k] < 0) data[k] = 0;
				}
			}
			results.push(data);
		} else {
			console.error(new Error("Invalid Format: "+JSON.stringify(data)));
		}
	})
	.on('end', function() {
		let lookup = {};
		for(let i=0; i < results.length;i++) {
			if(i%10000 == 0) console.log(i);
			let result = results[i];
			let duplicates = lookup[result.X];
			let isUnique = true;
			if(duplicates) {
				isUnique = -1 == duplicates.findIndex(function(el) {
					if(uniqueResults[el].X == result.X && uniqueResults[el].Y == result.Y && uniqueResults[el].Z == result.Z) return true;
				});
			}

			if(isUnique) uniqueResults.push(results[i]);

			let lastIndex = uniqueResults[uniqueResults.length-1];
			if(!lastIndex.area) lastIndex.area = getTriangleArea(lastIndex.X, lastIndex.Y, lastIndex.Z);

			lookup[results[i].X] = lookup[results[i].X] || [];
			lookup[results[i].X].push(uniqueResults.length-1);
		}
		console.log(uniqueResults);
		console.log(results.length, uniqueResults.length);
		
		// Pause
		console.log('Press any key to exit...');
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.on('data', process.exit.bind(process, 0));
	}).on('error', function(err) {
		console.error(new Error(err));
	});
}

// Various Functions
var commands = {};

commands.reverse = function(str) {
	let newStr = "";

	for(let i=str.length; i >= 0; i--) {
		newStr += str.slice(i, i+1);
	}
	return newStr;
};

commands.reverseJS = function(str) {
	return str.split("").reverse().join("");
};

commands.reverseWords = function(str) {
	let words = str.split(" ");
	let sentence = "";
	for(let i=words.length-1; i >= 0; i--) {
		sentence += words[i];
		if(i != 0) sentence +=" ";
	}
	return sentence;
};

commands.reverseWordsJS = function(str) {
	return str.split(" ").reverse().join(" ");
};

commands.fizzBuzz = function() {
	let string = "";
	for(let i=1; i <= 100;i++) {
		string = "";
		if(i % 3 == 0) string += "Fizz";
		if(i % 5 == 0) string += "Buzz";
		if(string == "") string = i;
		console.log(string);
	}
};

commands.clockAngle = function(hour, minute) {
	let clockDegree = {
		hour: 30,
		minute: 6
	};

	if(typeof hour == "string") {
		let split = hour.split(":");
		if(split) {
			hour = parseInt(split[0]);
			minute = parseInt(split[1]);
		} else {
			hour = 0;
		}
	}
	minute = minute || 0;
	if(hour && hour > 12) hour = Math.min(hour, 24)-12; // 24H Timestamps

	let degrees = Math.abs(hour*clockDegree.hour - minute*clockDegree.minute);
	let short = Math.min(degrees, 360 - degrees);
	let long = 360 - short;

	return [short, long]; //Shortest Angle, Longest Angle
};

commands.hash = function(password) {
	let hashed = TwinBcrypt.hashSync(password, 11);
	return hashed;
};

commands.help = function() {
	console.log(commands);
};

var command = process.argv[2];
if(command && commands[command]) {
	console.log(commands[command](...process.argv.slice(3)) || "");
} else if(command) {
	parseCSV(command);
}