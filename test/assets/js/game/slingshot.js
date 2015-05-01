var mobileClient = mobileClient || {};

mobileClient.slingshot = {
	init: function(client){
		// Creating slingshot
		var R = Raphael(0, 0, window.innerWidth, window.innerHeight);
		// Parameters
		var cWidth = 30;
		var cXpos = window.innerWidth/2;
		var cYpos = window.innerHeight*(1.07/2) - cWidth/2+10;
		var lYpos = window.innerHeight*(1.07/2);
		var lXpos = window.innerWidth;
		// Line
		var l = R.path("M0 "+lYpos+"L"+cXpos+" "+lYpos+"L"+lXpos+" "+lYpos);
		l.attr({
				stroke: client.hex,
				'stroke-width': 7
		});
		// Circle (draggable)
		var c = R.circle(cXpos, cYpos, cWidth).attr({
				fill: 'rgba(10,12,46,0.98)',
				stroke: client.hex,
				'stroke-width': 5
		});
		var move = function(dx, dy) {
				var x = cXpos + dx, y = cYpos + dy; 
				this.attr({cx: x, cy: y});
				l.attr({path: "M0 "+lYpos+"L"+x+" "+y+"L"+lXpos+" "+lYpos});
		}
		var start = function() {
				c.stop();
				l.stop();
				var data = {id: client.id, room: client.room};
				client.socket.emit('pull start', data);
		}
		var end = function() {
				var endY = this.getPointAtLength(0).y;
				var Ychange =  Math.abs((endY - cYpos)/(window.innerHeight - cYpos));
				this.animate({cx: cXpos, cy: cYpos}, 1000, "elastic");
				//this.animate({cx: cXpos, cy: -100}, 200);
				l.animate({path: "M0 "+lYpos+"L"+cXpos+" "+lYpos+"L"+lXpos+" "+lYpos},
								 1000, "elastic");
				var data = {id: client.id, dist: Ychange, room: client.room};
				console.log(Ychange);
				client.socket.emit('game fire', data);
		}
		c.drag(move, start, end);
	},
}