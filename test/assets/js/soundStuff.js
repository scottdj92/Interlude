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
	
	this.analysers = [];
	this.bufferLength = 85/2;

	//this.source = this.context.createMediaStreamSource()

	this.freqFloatData = new Float32Array();
	this.freqByteData = new Uint8Array();
	this.timeDomainData = new Uint8Array();
	
	this.currentTime;
	this.freqFloatDataAvg;
	this.freqByteDataAvg = [];
	this.timeDomainDataAvg;

	this.duration;


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
		
		//window.setInterval(this.getFrequencyData, 100);
		//window.setInterval(this.getByteFrequencyData(), 100);
		//window.setInterval(this.getTimeDomainData(), 100);
	};


	this.finishedLoading = function(bufferList)
	{
		console.log(bufferList);
		//get sources and play them all together for a mix
		//console.log(self);
		self.duration = bufferList[0].duration;
		for (var i = 0; i < bufferList.length; i++) {
			//console.log(this.sources[i]);
			self.sources.push(self.context.createBufferSource());
			self.sources[i].buffer = bufferList[i];
			
			//create analysers
			self.analysers.push(self.context.createAnalyser());
			self.analysers[i].minDecibels = -90;
			self.analysers[i].maxDecibels = -10;
			self.analysers[i].smoothingTimeConstant = 0.85;
			console.log(self.analysers[i]);
			//self.sources[i].connect(this.context.destination); //connect to speakers
			self.sources[i].connect( self.analysers[i] );
			
			self.analysers[i].connect(this.context.destination);
		}
		//window.setInterval(self.getFrequencyData, 100);
		//window.setInterval(self.getByteFrequencyData, 100);
		//window.setInterval(self.getTimeDomainData, 100);
		window.setInterval(self.getCurrentTime, 100);
	};

	this.getFrequencyData = function()
	{
		//copies current analyzernode frequencyBinCount data onto Float32Array freqFloatData
		//console.log(self.bufferLength);
		self.freqFloatData = new Float32Array(self.bufferLength);
		//console.log(self.analysers);
		self.analysers[0].getFloatFrequencyData(self.freqFloatData);
		//console.log(self.freqFloatData);

		var sum = 0;
		for (var i = 0; i < self.freqFloatData.length; i++) {
			sum += self.freqFloatData[i];
		};
		var avg = sum/self.freqFloatData.length;
		//console.log(avg);
		//console.log(this.freqFloatData);
		self.freqFloatDataAvg = avg;

		return self.freqFloatData;
		//return self.freqFloatDataAvg;
	};

	this.getByteFrequencyData = function(track)
	{
		//copies current analyzerNode frequencyBinCount data onto Uint8Array freqByteData
		self.freqByteData = new Uint8Array(self.bufferLength);

		self.analysers[track].getByteFrequencyData(self.freqByteData);

		var sum = 0;
		for (var i = 0; i < self.freqByteData.length; i++) {
			sum += self.freqByteData[track];
		};
		var avg = sum/self.freqByteData.length;
		//console.log(avg);
		self.freqByteDataAvg.push(avg);
		//console.log(self.freqByteData);
		//return self.freqByteData;
		return self.freqByteDataAvg;
	};

	this.getTimeDomainData = function()
	{
		//copies current analyzer node frequencyBinCount onto UintArray timeDomainData
		self.timeDomainData = new Uint8Array(self.bufferLength);
		self.analysers[0].getFloatTimeDomainData(self.timeDomainData);

		var sum = 0;
		for (var i = 0; i < self.timeDomainData.length; i++) {
			sum += self.timeDomainData[i];
		};
		var avg = sum/self.timeDomainData.length;
		//console.log(avg);
		self.timeDomainDataAvg = avg;

		//return self.timeDomainData;
		return self.timeDomainDataAvg;
		//console.log(self.timeDomainData);
	};

	this.changeVolume = function(track, volume)
	{
		//volume is a number between 0-1 where 0 is the quietest possible volume and 1 is the loudest possible volume
		track.gain.value = volume;
	};

	this.getCurrentTime = function()
	{
		this.currentTime = self.context.currentTime;
		//console.log(this.currentTime);
		return this.currentTime;
	};
	
	this.startPlayback = function(track)
	{
		self.sources[track].start(0);
	};

	this.stopPlayback = function()
	{
		for (var i = 0; i < self.sources.length; i++) {
			self.sources[i].disconnect();
		};
	}
};