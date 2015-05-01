"use strict";

function Sound()
{
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	//audio variables
	
	this.FFT = 85;
	this.assetsPath = '/assets/audio/';
	//this.artistName = artist;
	//this.tracks = trackArray;
	this.sources = [];
	this.context = new AudioContext();

	this.analyzer = this.context.createAnalyser();
	this.freqFloatData = new Float32Array();
	this.freqByteData = new Uint8Array();
	this.timeDomainData = new Uint8Array();

	this.volume = this.context.createGain();

	this.bufferLoader = undefined;

	this.init = function()
	{
		//this.src = assetsPath + this.artistName + '/' + trackName;

		this.bufferLoader = new BufferLoader(
			this.context,
			[
				'/assets/audio/The_Clash-Rock_the_Casbah/Keys.mp3',
				'/assets/audio/The_Clash-Rock_the_Casbah/Guitar.mp3',
				'/assets/audio/The_Clash-Rock_the_Casbah/Bass.mp3',
				'/assets/audio/The_Clash-Rock_the_Casbah/Percussion.mp3',
				'/assets/audio/The_Clash-Rock_the_Casbah/Drums.mp3',
				'/assets/audio/The_Clash-Rock_the_Casbah/Vocals.mp3',
			],
			//this.trackArray, //source path of all audio files in an array. this must be in this directory:
			// '/assets/audio/artistName/trackName.extension'
			this.finishedLoading
			);

		this.bufferLoader.load();

		window.setInterval(this.getFreqFloatData, 500);
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

		//connect analyzer node
		source1.connect(this.analyzer);
	};

	this.getFreqFloatData = function()
	{
		//copies current analyzernode frequencyBinCount data onto Float32Array freqFloatData
		var bufferLength = this.analyzer(this.analyzer.frequencyBinCount);
		this.freqFloatData = bufferLength;
		return this.freqFloatData;
		console.log(this.freqFloatData);
	};

	this.getByteFrequencyData = function()
	{
		//copies current analyzerNode frequencyBinCount data onto Uint8Array freqByteData
		var bufferLength = this.analyzer(this.analyzer.frequencyBinCount);
		this.freqByteData = bufferLength;
		return this.freqByteData;
		console.log(this.freqByteData);
	};

	this.getTimeDomainData = function()
	{
		//copies current analyzer node frequencyBinCount onto UintArray timeDomainData
		var bufferLength =  this.analyzer(this.analyzer.frequencyBinCount);
		this.timeDomainData = bufferLength;
		return this.timeDomainData;
		console.log(this.timeDomainData);
	};
};