"use strict";

function Audio(artist, track)
{
	/** CREDIT TO http://www.createjs.com/Demos/SoundJS/MusicVisualizer **/
	/** CONSTANTS **/
	this.FFTSIZE = 32; //number of samples for Fourier Transform
	this.TICK_FREQ = 80; //how often to run tick, in ms
	/** VARIABLES 

	//THIS FILE PATH MUST BE HARD CODED TO FUNCTION IN A LOCAL ENVIRONMENT
	//assetsPath : '/scottjones/Desktop/Interlude/test/assets/audio/', //folder path
	*/
	this.assetsPath = '/assets/audio/';
	this.artistName = artist;
	this.trackName = track;
	this.src = undefined; //select single item to load
	
	this.soundInstance = undefined; //sound instance we create
	this.analyzerNode = undefined; //allows us to visualize the audio
	this.freqFloatData = undefined; 
	this.freqByteData = undefined; 
	this.timeByteData = undefined; //arrays to retrieve data from analyzerNode
	this.dataAverage = [42, 42, 42, 42]; //array recording data for the 4 most recent ticks
	//console.log('audio.js loaded');

	this.init = function(){
		this.src = this.assetsPath + this.artistName + '/' + this.trackName;
		//console.log('audio.js loaded');
		//web audio handler. if this fails, show a message
		if (!createjs.Sound.registerPlugins([createjs.WebAudioPlugin])) {
			document.getElementById("#area").style.display = 'block';
			console.log('sound failed');
			return;
		};
		
		createjs.Sound.registerSound(this.src, 'sound'); //register sound
		createjs.Sound.addEventListener("fileload", createjs.proxy(this.handleLoad, this)); //add event listener for when load is completed
		//console.log('audio init fired');
	};

	this.handleLoad = function(evt)
	{
		//console.log('handleLoad fired');

		//play audio before everything else
		
		//get context. NOTE: to connect to existing nodes, we need to work in the same context

		var context = createjs.Sound.activePlugin.context;
		//console.log(context);

		//create analyzer node
		//console.log(this);
		this.analyzerNode = context.createAnalyser();
		this.analyzerNode.fftSize = this.FFTSIZE; //Fast Fourier Transform size
		this.analyzerNode.smoothingTimeConstant = 0.85; //a value between 0->1 where 0 represents no time average with the last "frame"
		this.analyzerNode.connect(context.destination); //connects to the destination, which is our output
		console.log(this.analyzerNode);
		//console.log(context);

		//attach visualizer node to existing dynamicsCompressorNode, which exists in destination
		var dynamicsNode = createjs.Sound.activePlugin.dynamicsCompressorNode;
		dynamicsNode.disconnect(); //disconnect from destination
		dynamicsNode.connect(this.analyzerNode);

		//set up arrays that we use to retrieve analyzerNode data
		this.freqFloatData = new Float32Array(this.analyzerNode.frequencyBinCount);
		this.freqByteData = new Uint8Array(this.analyzerNode.frequencyBinCount);
		this.timeByteData = new Uint8Array(this.analyzerNode.frequencyBinCount);

		//console.log(this.freqFloatData);

		this.startPlayback();
		//return this.analyzerNode;
		
	};

	this.changeVolume = function(float)
	{
		//volume is a set range between 0-1 where 0 is no sound and 1 is the loudest.
		this.setVolume(float);
	};

	this.stopPlayback = function()
	{
		createjs.Sound.stop();
		createjs.Ticker.removeEventListener('tick', this.tick);
	};

	this.startPlayback = function()
	{
		//console.log('audio startPlayback');

		//start playing the sound we loaded,
		this.soundInstance = createjs.Sound.play(this.src, {loop: 1}); //we can change loop to 1 to play only once.


		//start tick function so we can "move" before updating the stage
		createjs.Ticker.addEventListener('tick',  createjs.proxy(this.tick, this));
		createjs.Ticker.setInterval(this.TICK_FREQ);

		if (this.soundInstance) {
			return;
		} //if this is defined, we've started playing. 

		else if (this.soundInstance.playState == 'playFailed')
		{
			console.log('audio did not play');
			return;
		}

		else if (this.soundInstance.playState == 'playSucceeded')
		{
			console.log('audio is playing');
			return;
		}

		//console.log(this.analyzerNode);

	};

	this.tick = function(evt)
	{
		//console.log(this.analyzerNode);
		this.analyzerNode.getFloatFrequencyData(this.freqFloatData); //gives us dB
		this.analyzerNode.getByteFrequencyData(this.freqByteData); //gives us frequency
		this.analyzerNode.getByteTimeDomainData(this.timeByteData); //gives us waveform

		//console.log(this.freqByteData);
		//console.log(this.freqByteDataArray);
		//console.log(this.timeByteDataArray);

		//update dataAverage, by popping first element and pushing
		this.dataAverage.shift();
		this.dataAverage.push(this.freqFloatData[0]);
		console.log(this.dataAverage);

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
	};
};