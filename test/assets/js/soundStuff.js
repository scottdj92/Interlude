"use strict";

function Sound(artistFilePath, trackFilePathArray)
{
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	//audio variables
	var self = this;
	this.FFT = 85;
	this.assetsPath = '/assets/audio/';
	this.artistName = artistFilePath;
	this.tracks = trackFilePathArray;
	this.sources = [];
	
	this.context = new AudioContext();
	
	this.analyzer = this.context.createAnalyser();
	this.bufferLength = this.analyzer.frequencyBinCount;
	this.analyzer.minDecibels = -90;
	this.analyzer.maxDecibels = -10;
	this.analyzer.smoothingTimeConstant = 0.85;

	//this.source = this.context.createMediaStreamSource()

	this.freqFloatData = new Float32Array();
	this.freqByteData = new Uint8Array();
	this.timeDomainData = new Uint8Array();

	this.gainNode = this.context.createGain();

	this.bufferLoader = undefined;
	//console.log(this.tracks);

	this.init = function()
	{
		var loaderArray = new Array();

		//build all file paths
		for (var i = 0; i < this.tracks.length; i++) {
			this.src = this.assetsPath + this.artistName + '/' + this.tracks[i];
			loaderArray.push(this.src);
			//console.log(loaderArray);
		};
		//this.src = assetsPath + this.artistName + '/' + trackName;
		var self = this;
		this.bufferLoader = new BufferLoader(
			this.context,
			loaderArray,
			 //source path of all audio files in an array. this must be in this directory:
			//assets/audio/artistName/trackName.extension'
			this.finishedLoading
			);

		this.bufferLoader.load();
		
		window.setInterval(this.getFrequencyData(), 100);
		//window.setInterval(this.getByteFrequencyData(), 100);
		//window.setInterval(this.getTimeDomainData(), 100);
	};


	this.finishedLoading = function(bufferList)
	{
		console.log(bufferList);
		//get sources and play them all together for a mix
		console.log(self);
		for (var i = 0; i < bufferList.length; i++) {
			//console.log(this.sources[i]);
			self.sources.push(self.context.createBufferSource());
			self.sources[i].buffer = bufferList[i];

			self.sources[i].connect(this.context.destination); //connect to speakers
		}

		for (var i = 0; i < self.sources.length; i++) {
			self.sources[i].start(0);
		};


		// var source1 = this.context.createBufferSource();
		// var source2 = this.context.createBufferSource();
		// var source3 = this.context.createBufferSource();
		// var source4 = this.context.createBufferSource();
		// var source5 = this.context.createBufferSource();
		// //var source6 = this.context.createBufferSource();

		// source1.buffer = bufferList[0];
		// source2.buffer = bufferList[1];
		// source3.buffer = bufferList[2];
		// source4.buffer = bufferList[3];
		// source5.buffer = bufferList[4];
		// //source6.buffer = bufferList[5];

		// source1.connect(this.context.destination);
		// source2.connect(this.context.destination);
		// source3.connect(this.context.destination);
		// source4.connect(this.context.destination);
		// source5.connect(this.context.destination);
		// //source6.connect(this.context.destination);

		// source1.start(0);
		// source2.start(0);
		// source3.start(0);
		// source4.start(0);
		// source5.start(0);
		// //source6.start(0);
	};

	this.getFrequencyData = function()
	{
		//copies current analyzernode frequencyBinCount data onto Float32Array freqFloatData
		//self.freqFloatData = self.bufferLength;
		self.analyzer.getFloatFrequencyData(self.freqFloatData);
		console.log(self.freqFloatData);
		//console.log(this.freqFloatData);

		//return self.freqFloatData;
	};

	this.getByteFrequencyData = function()
	{
		//copies current analyzerNode frequencyBinCount data onto Uint8Array freqByteData
		self.freqByteData = self.bufferLength;
		return self.freqByteData;
		console.log(self.freqByteData);
	};

	this.getTimeDomainData = function()
	{
		//copies current analyzer node frequencyBinCount onto UintArray timeDomainData
		self.timeDomainData = self.bufferLength;
		return self.timeDomainData;
		console.log(self.timeDomainData);
	};

	this.changeVolume = function(track, volume)
	{
		//volume is a number between 0-1 where 0 is the quietest possible volume and 1 is the loudest possible volume
		track.gain.value = volume;
	};
};