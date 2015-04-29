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

	//THIS FILE PATH MUST BE HARD CODED TO FUNCTION IN A LOCAL ENVIRONMENT
	//assetsPath : '/scottjones/Desktop/Interlude/test/assets/audio/', //folder path
	*/
	assetsPath : '/assets/audio/',
	songName : 'Anthony_Constantino-Songs/',
	trackName : 'Loop.wav',
	src : undefined, //select single item to load
	
	soundInstance : undefined, //sound instance we create
	analyzerNode : undefined, //allows us to visualize the audio
	freqFloatData : undefined, 
	freqByteData : undefined, 
	timeByteData : undefined, //arrays to retrieve data from analyzerNode
	dataAverage : [42, 42, 42, 42], //array recording data for the 4 most recent ticks
	//console.log('audio.js loaded');

	init: function(){
		this.src = this.assetsPath + this.songName + this.trackName;
		//console.log('audio.js loaded');
		//web audio handler. if this fails, show a message
		if (!createjs.Sound.registerPlugins([createjs.WebAudioPlugin])) {
			document.getElementById("#area").style.display = 'block';
			console.log('sound failed');
			return;
		};

		createjs.Sound.addEventListener("fileload", createjs.proxy(this.handleLoad, this)); //add event listener for when load is completed
		createjs.Sound.registerSound(audio.src); //register sound
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
		this.freqFloatData = new Float32Array(this.analyzerNode.frequencyBinCount);
		this.freqByteData = new Uint8Array(this.analyzerNode.frequencyBinCount);
		this.timeByteData = new Uint8Array(this.analyzerNode.frequencyBinCount);

		console.log(this.freqFloatData);
		//console.log('bytedata created');

		//calculate number of array elements
		//this.circleFreqChunk = this.analyzerNode.frequencyBinCount / this.CIRCLES;

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
		this.setVolume(float);
	},

	stopPlayback: function()
	{
		createjs.Sound.stop();
	},

	//start playback in response to user click
	startPlayback: function(evt)
	{
		if (this.soundInstance) {
			return;
		} //if this is defined, we've started playing. 

		//start playing the sound we loaded,
		this.soundInstance = createjs.Sound.play(this.src, {loop: 1}); //we can change loop to 1 to play only once.

		//start tick function so we can "move" before updating the stage
		createjs.Ticker.addEventListener('tick', this.tick.bind(this));
		createjs.Ticker.setInterval(this.TICK_FREQ);
	},

	tick: function(evt)
	{
		this.analyzerNode.getFloatFrequencyData(this.freqFloatData); //gives us dB
		this.analyzerNode.getByteFrequencyData(this.freqByteData); //gives us frequency
		this.analyzerNode.getByteTimeDomainData(this.timeByteData); //gives us waveform

		console.log(audio.freqFloatDataArray);
		//console.log(this.freqByteDataArray);
		//console.log(this.timeByteDataArray);

		//update dataAverage, by popping first element and pushing
		this.dataAverage.shift();
		//this.dataAverage.push(lastRadius);

		//get average data for the last 3 ticks
		var dataSum = 0;
		for (var i = this.dataAverage.length - 1; i > 0; i--)
		{
			dataSum += this.dataAverage[i - 1];
		}
		dataSum = dataSum / (this.dataAverage.length - 1);

		//calculate latest change
		var dataDiff = this.dataAverage[this.dataAverage.length - 1] - dataSum;

		//console.log(audio.dataAverage);

		//update stage
		//$('#area').update();
	},
}