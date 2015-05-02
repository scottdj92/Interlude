"use strict";

function Sound(artistFilePath, trackFilePathArray)
{
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	//audio variables
	
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
	//this.context.connect(this.gainNode);
	this.gainNode.connect(this.context.destination);

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

		this.bufferLoader = new BufferLoader(
			this.context,
			loaderArray,
			 //source path of all audio files in an array. this must be in this directory:
			// '/assets/audio/artistName/trackName.extension'
			this.finishedLoading
			);

		this.bufferLoader.load();
		var self = this;
		window.setInterval(self.getFrequencyData, 500);
		//window.setInterval(this.getByteFrequencyData, 500);
		//window.setInterval(this.getTimeDomainData, 500);
	};


	this.finishedLoading = function(bufferList)
	{
		//console.log(bufferList);
		//get sources and play them all together for a mix

		// for (var i = 0; i < bufferList.length; i++) {
		// 	console.log(this.sources[i]);
		// 	this.sources[i] = this.context.createBufferSource();
		// 	this.sources[i].buffer = bufferList[i];

		// 	this.sources[i].connect(this.context.destination); //connect to speakers
		// }

		// for (var i = 0; i < this.sources.length; i++) {
		// 	this.sources[i].start(0);
		// };


		var source1 = this.context.createBufferSource();
		var source2 = this.context.createBufferSource();
		var source3 = this.context.createBufferSource();
		var source4 = this.context.createBufferSource();
		var source5 = this.context.createBufferSource();
		var source6 = this.context.createBufferSource();

		source1.buffer = bufferList[0];
		source2.buffer = bufferList[1];
		source3.buffer = bufferList[2];
		source4.buffer = bufferList[3];
		source5.buffer = bufferList[4];
		source6.buffer = bufferList[5];

		source1.connect(this.context.destination);
		source2.connect(this.context.destination);
		source3.connect(this.context.destination);
		source4.connect(this.context.destination);
		source5.connect(this.context.destination);
		source6.connect(this.context.destination);

		source1.start(0);
		source2.start(0);
		source3.start(0);
		source4.start(0);
		source5.start(0);
		source6.start(0);
	};

	this.getFrequencyData = function()
	{
		//copies current analyzernode frequencyBinCount data onto Float32Array freqFloatData
		//this.freqFloatData = this.bufferLength;
		//return this.freqFloatData;
		console.log(Sound.analyzer);
		//this.analyzer.getFreqFloatData
		//console.log(this.freqFloatData);
	};

	this.getByteFrequencyData = function()
	{
		//copies current analyzerNode frequencyBinCount data onto Uint8Array freqByteData
		this.freqByteData = this.bufferLength;
		return this.freqByteData;
		console.log(this.freqByteData);
	};

	this.getTimeDomainData = function()
	{
		//copies current analyzer node frequencyBinCount onto UintArray timeDomainData
		this.timeDomainData = this.bufferLength;
		return this.timeDomainData;
		console.log(this.timeDomainData);
	};

	this.changeVolume = function(track, volume)
	{
		//volume is a number between 0-1 where 0 is the quietest possible volume and 1 is the loudest possible volume
		track.gain.value = volume;
	};
};