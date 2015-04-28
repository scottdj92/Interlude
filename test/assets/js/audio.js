"use strict";

var audio = {
	/** CREDIT TO http://www.createjs.com/Demos/SoundJS/MusicVisualizer **/
	/** CONSTANTS **/
	FFTSIZE : 32, //number of samples for Fourier Transform
	TICK_FREQ : 1000, //how often to run tick, in ms
	CIRCLES : 8, //number of circles to draw. this is also the amount to break the files into. so FFTSIZE/2 has to be even.
	RADIUS_FACTOR : 40, //radius of circles
	MIN_RADIUS : 1, //minumum radii
	HUE_VARIANCE : 120, //hue variance
	COLOR_CHANGE_THRESHOLD : 15, //amount of change before we effect change
	WAVE_EMIT_THRESHOLD: 15, //amount of positive change before we effect change
	WAVE_SCALE : 0.03, //amount to scale wave per tick
	WAVE_RADIUS : 180, //waves will be drawn with this radius.

	/** VARIABLES 
	var stage; //canvas we draw everything to
	var h, w; //width and height of canvas
	var centerX, centerY; //holds the center point
	var messageField; //message display
	*/

	//THIS FILE PATH MUST BE HARD CODED TO FUNCTION IN A LOCAL ENVIRONMENT
	//assetsPath : '/scottjones/Desktop/Interlude/test/assets/audio/', //folder path
	assetsPath : '/../audio/',
	songName : 'The Clash-Rock The Casbah/',
	trackName : 'Keys.mp3',
	src : assetsPath + songName + trackName, //select single item to load
	
	soundInstance : null, //sound instance we create
	analyzerNode : null, //allows us to visualize the audio
	freqFloatData : null, 
	freqByteData : null, 
	timeByteData : null, //arrays to retrieve data from analyzerNode
	/* SAMPLE TESTING VARS
	circles : {}, //object has of circle shapes
	circleHue : 300, //base color hue
	//var waves = new createjs.Container(); //container used to store waves when we draw them
	circleFreqChunk, //chunk of freqByteData array that is computed per circle
	*/
	dataAverage : [42, 42, 42, 42], //array recording data for the 4 most recent ticks
	/*
	var waveImg = []; //array of wave images with varying stroke thickness
	*/
	//console.log('audio.js loaded');

	init: function(){
		//console.log('audio.js loaded');
		//web audio handler. if this fails, show a message
		if (!createjs.Sound.registerPlugins([createjs.WebAudioPlugin])) {
			document.getElementById("#area").style.display = 'block';
			console.log('sound failed');

			
			return;
		};

		createjs.Sound.addEventListener("fileload", createjs.proxy(this.handleLoad, this)); //add event listener for when load is completed
		createjs.Sound.registerSound(this.src); //register sound
	},

	handleLoad: function(evt)
	{
		//console.log('handleLoad fired');

		//play audio before everything else
		//audio.startPlayback();
		//get context. NOTE: to connect to existing nodes, we need to work in the same context

		var context = createjs.Sound.activePlugin.context;

		//create analyzer node
		this.analyzerNode = context.createAnalyser();
		this.analyzerNode.fftSize = this.FFTSIZE; //Fast Fourier Transform size
		this.analyzerNode.smoothingTimeConstant = 0.85; //a value between 0->1 where 0 represents no time average with the last "frame"
		this.analyzerNode.connect(context.destination); //connects to the destination, which is our output

		//attach visualizer node to existing dynamicsCompressorNode, which exists in destination
		var dynamicsNode = createjs.Sound.activePlugin.dynamicsCompressorNode;
		dynamicsNode.disconnect(); //disconnect from destination
		dynamicsNode.connect(this.analyzerNode);

		//set up arrays that we use to retrieve analyzerNode data
		audio.freqFloatData = new Float32Array(this.analyzerNode.frequencyBinCount);
		audio.freqByteData = new Uint8Array(this.analyzerNode.frequencyBinCount);
		audio.timeByteData = new Uint8Array(this.analyzerNode.frequencyBinCount);
		//console.log('bytedata created');

		//calculate number of array elements
		this.circleFreqChunk = this.analyzerNode.frequencyBinCount / this.CIRCLES;

		//enable touch if supported
		/*
		if (createjs.Touch.enable(stage)){
			messageField.text = 'Touch to Start';
		} else {
			messageField.text = "Click to start";
		}
		stage.update(); //update to show text
		*/

		//wrap our sound player in a click event, so it can play on mobile
		//stage.addEventListener("stagemousedown", this.startPlayback);
		
	},

	changeVolume: function(float)
	{
		//volume is a set range between 0-1 where 0 is no sound and 1 is the loudest.
		audio.setVolume(float);
	},

	//start playback in response to user click
	startPlayback: function(evt)
	{
		//we will start the song once, so remove the listener
		//this prevents accidental reptition
		//stage.removeEventListener('stagemousedown', startPlayback);

		if (audio.soundInstance) {
			return;
		} //if this is defined, we've started playing. 

		//starting, so we can remove the message
		//stage.removeChild(messageField);

		//start playing the sound we loaded, looping.
		audio.soundInstance = createjs.Sound.play(this.src, {loop: 1}); //we can change loop to 1 to play only once.

		// test function that allows quick stop
		/*stage.addEventListener('stagemousedown', function(){
			createjs.Ticker.removeEventListener('tick', tick);
			createjs.Sound.stop();
		}); */
		

		/* CREATE VISUAL OBJECTS HERE */
		/*
		//create circles so they are persistent
		for (var i = 0; i < CIRCLES.length; i++) {
			var circle = CIRCLES[i] = new createjs.Shape();
			//set composite operation so image colors can be blended
			circle.compositeOperation = 'lighter';
			stage.addChild(circle);
		}

		//add waves container to stage
		stage.addChild(waves);
		*/

		//start tick function so we can "move" before updating the stage
		createjs.Ticker.addEventListener('tick', this.tick);
		createjs.Ticker.setInterval(this.TICK_FREQ);
	},

	tick:function(evt)
	{
		this.analyzerNode.getFloatFrequencyData(audio.freqFloatData); //gives us dB
		this.analyzerNode.getByteFrequencyData(audio.freqByteData); //gives us frequency
		this.analyzerNode.getByteTimeDomainData(audio.timeByteData); //gives us waveform

		
		console.log(this.freqFloatData);
		console.log(this.freqByteData);
		console.log(this.timeByteData);

		//update dataAverage, by popping first element and pushing
		this.dataAverage.shift();
		this.dataAverage.push(lastRadius);

		//get average data for the last 3 ticks
		var dataSum = 0;
		for (var i = this.dataAverage.length - 1; i; i--)
		{
			dataSum += this.dataAverage[i - 1];
		}
		dataSum = dataSum / (this.dataAverage.length - 1);

		//calculate latest change
		var dataDiff = this.dataAverage[audio.dataAverage.length - 1] - dataSum;

		//change color (not necessary unless we want to implement this)
		/*if (dataDiff > COLOR_CHANGE_THRESHOLD || dataDiff < COLOR_CHANGE_THRESHOLD)
		{
			circleHue = circleHue + dataDiff;
		}*/

		//console.log(audio.dataAverage);

		//update stage
		//$('#area').update();
	}
}