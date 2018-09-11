class Clock {
	//gets current time from Date and sets the clock
	constructor() {
		this.time = {
			hour: 0,
			minutes: 0,
			seconds: 0
		}
	}

	setTime() {
		let date = new Date();	
		this.time.hour = date.getHours();
		this.time.minutes = date.getMinutes();
		this.time.seconds = date.getSeconds();
	}

	getTime() {
		return this.time;
	}

	displayTime() {
		let clock = this;
		let time = clock.time;
		$("#hour").text(clock.addZero(time.hour));
		$("#minutes").text(clock.addZero(time.minutes));
		$("#seconds").text(clock.addZero(time.seconds));
	}

	//for aesthetic purposes	
	addZero(number) {
		if (number < 10) {
			return "" + 0 + number;
		}
		return number;
	}

	//every second
	tick() {
		let clock = this;
		clock.setTime();
		clock.displayTime();
		clock.color.displayColor();
	}

	start() {
		let clock = this;
		clock.setTime();
		clock.color = new color(clock);
		clock.tick();
		window.setInterval(clock.tick.bind(clock), 1000)
	}
}

class color {
	constructor(clock) {
		this.encodingModes = ["hueCircle", "timeToHex", "just_pink"],
		this.timeEncoding = "hueCircle",
		this.hue = 0,
		this.lightness = 50,
		this.gradient = false,
		this.clock = clock;
	}

	makeHue() {
		let timeEncoding = this.timeEncoding;
		let time = this.clock.getTime();
		switch (timeEncoding) {
			case 'hueCircle':
				//every hour has a 15° segment from the hue wheel
				//minutes determine point inside segment
				//.25 moves forward the position inside the hue wheel the same amount every minute
				//returns number between 0 and 360
				return time.hour * 15 + time.minutes * .25;
				break;

			case 'timeToHex':
				//formats current time into hex value
				//15:23:00 => #152300
				let hex = "#"  + this.clock.addZero(time.hour) + this.clock.addZero(time.minutes) + this.clock.addZero(time.seconds);
				console.log("hex color: " + hex)
				return hexToHue(hex);
				break;

			case 'just_pink':
				return 300;
			}
		}

	//not sure whether to leave generateGradient() for readability purposes or just insert the line directly (e.g. line 160)
	generateGradient() {
		return `linear-gradient(to right, hsl(${this.hue}, 50%, ${this.lightness}%) , hsl(${this.hue + 30}, 50%, ${this.lightness}%))`;
	}

	displayColor() {
		this.hue = this.makeHue();

		if (this.gradient) {
			document.querySelector('body').style.setProperty('--background', this.generateGradient());
		}

		else {
			document.querySelector('body').style.setProperty('--background', `hsl(${this.hue}, 50%, ${this.lightness}%)`);
		}

		console.log('current hue: ' + this.hue);
	}

	setLightness(value) {
		this.lightness = value;
	}
}

//https://stackoverflow.com/questions/46432335/hex-to-hsl-convert-javascript
function hexToHue(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  var r = parseInt(result[1], 16);
  var g = parseInt(result[2], 16);
  var b = parseInt(result[3], 16);

  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
      h = s = 0; // achromatic
  } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }

  h = Math.round(360*h);
  s = s*100;
  s = Math.round(s);
  l = l*100;
  l = Math.round(l);

  return h;
  //FOR NOW
}

function toggleOptions(event) {
	if (event.target.classList.contains('button')) {
		return;
	}

	this.classList.toggle('closed');
	if (this.classList.contains('closed')) {	
		document.querySelector('.menuButton').textContent = '<'
	}

	else {
		document.querySelector('.menuButton').textContent = '>'
	}
}

$(document).ready(function() {
	let clock = new Clock();
	clock.start()

	//OPEN/CLOSE MENU
	document.querySelector('#controls').addEventListener('click', toggleOptions);

	//LIGHTNESS SLIDER
	$("#lightnessSlider").on("input", function() {
		var lightness = $(this).val();
		clock.color.lightness = lightness;

		//changes the lightness value instantly (instead of waiting for next tick)
		if (clock.color.gradient) {
			document.querySelector('body').style.setProperty('--background', `linear-gradient(to right, hsl(${clock.color.hue}, 50%, ${lightness}%) , hsl(${clock.color.hue + 30}, 50%, ${lightness}%))`);
		}

		else {
			document.querySelector('body').style.setProperty('--background', `hsl(${clock.color.hue}, 50%, ${lightness}%)`);
		}

		$("#lightnessValue").text(lightness + "%");
	})

	//BACKGROUND STYLE SELECTOR
	$("#backgroundStyleToggle").on("click", function() {
		clock.color.gradient = !clock.color.gradient;
		clock.color.displayColor();
		this.textContent = clock.color.gradient ? 'Switch to solid color' : 'Switch to gradient';
	})

	//TIME ENCODING SELECTOR
	$("#timeEncodingToggle").on("click", function() {
		//try to simplify this, use only indices
		let encodings = clock.color.encodingModes;
		let currentEncoding = clock.color.timeEncoding;
		// moves through the array of time encoding modes
		let currentIndex = encodings.indexOf(currentEncoding);
		currentIndex++;
		if (currentIndex >= encodings.length) currentIndex = 0;
		clock.color.timeEncoding = encodings[currentIndex];

		clock.color.displayColor();

		$(this).text(`Current mode: ${clock.color.timeEncoding} - Change`)
	})

	// ? BUTTON (EXPLAINER)
	$("#explainerButton").on("click", function() {
		$("#explainer").toggle();
	})
})