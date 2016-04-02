$(document).ready(function(){
	
	var rectW = 30, rectL = 50, cc = 10, delayTime = 100, timerID = 0,
		xs = d3.scale.linear().domain([0,rectL]).range([0,rectL * cc]),
		ys = d3.scale.linear().domain([0,rectW]).range([0,rectW * cc]),
		grids = [];
	
	var stopped = false ;
		
	var Neighbour = {
		CLT: [[ 1, 0], [ 0, 1], [ 1, 1]],
		CT:  [[-1, 0], [ 1, 0], [-1, 1], [ 0, 1], [ 1, 1]],
		CRT: [[-1, 0], [-1, 1], [ 0, 1]],
		CL:  [[ 0,-1], [ 1,-1], [ 1, 0], [ 0, 1], [ 1, 1]],
		CR:  [[-1,-1], [ 0,-1], [-1, 0], [-1, 1], [ 0, 1]],
		CLB: [[ 0,-1], [ 1,-1], [ 1, 0]],
		CB:  [[-1,-1], [ 0,-1], [ 1,-1], [-1, 0], [ 1, 0]],
		CRB: [[-1,-1], [ 0,-1], [-1, 0]],
		C: [[-1,-1], [ 0,-1], [ 1,-1], [-1, 0], [ 1, 0], [-1, 1], [ 0, 1], [ 1, 1]]
	};
	
	var ctrl = d3.select("#Control")
		
		ctrl.append('button')
			.attr('class', 'new')
			.text('New')
			.on('click', function(){ return setNewGrid() });
		
		ctrl.append('button')
			.attr('class', 'start')
			.text('Stop')
			.on('click', startStop);
				
		ctrl.append('button')
			.attr('class', 'speedDown')
			.text('◄◄')
			.on('click', speedDown);
			
		ctrl.append('button')
			.attr('class', 'speedUp')
			.text('►►')
			.on('click', speedUp);
		
	function speedUp(){
		delayTime = delayTime / 2 ;
		console.log(delayTime);
		run();
	}
	
	function speedDown(){
		delayTime = delayTime * 2;
		console.log(delayTime);
		run();
	}
	
	var rects = d3.select("#Grids")
				.append("svg:svg")    
				.attr("stroke", "rgba(204, 204,204,0.2)")
				.attr("shape-rendering", "crispEdges")
				.attr("width",rectL*cc)
				.attr("height", rectW*cc);
		
		
	var initialize = function(){
		grids = [];
		d3.range(rectL).forEach(function(x){
			grids[x] = new Array();
			d3.range(rectW).forEach(function(y){	
				grids[x][y] = 0;
			});
		});
		var GliderGun =  [[24, 0],
                  [22, 1], [24, 1],
                  [12, 2], [13, 2], [20, 2], [21, 2], [34, 2], [35, 2],
                  [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3],
                  [0, 4], [1, 4], [10, 4], [16, 4], [20, 4], [21, 4],
                  [0, 5], [1, 5], [10, 5], [14, 5], [16, 5], [17, 5], [22, 5], [24, 5],
                  [10, 6], [16, 6], [24, 6],
                  [11, 7], [15, 7],
                  [12, 8], [13, 8]];
		for(var i in GliderGun){
			var _x = GliderGun[i][0]+5;
			var _y = GliderGun[i][1]+10;
			grids[_x][_y] = 1;
		}
		rects.selectAll("rect")
			.data(function(){ return setGrid()})
			.enter()
			.append("rect")
			.attr("x", function(d){ return xs(d.x)})
			.attr("y", function(d){ return ys(d.y)})
			.attr("width",cc)
			.attr("height",cc)
			.attr("fill", function(d){ return d.state? "black":"white";})
			.on('click', function(){ return toggleGrid(d3.mouse(this)) });
	};
	
	var toggleGrid = function(xy){
		console.log(xy);
		var pos = [scaleDown(xy[0]), scaleDown(xy[1])];	
		console.log(pos);
		grids[pos[0]][pos[1]] = grids[pos[0]][pos[1]]? 0: 1;
		function scaleDown(n){
			return Math.floor(n / cc);
		};
		displayGrid();
	}
	
	var setGrid = function (){
		var bits = [];
		for(var i= 0; i< rectL; i++){
			for(var j= 0; j< rectW; j++){
				bits.push({ "x": i, "y": j, "state": grids[i][j] });
			}
		}
		return bits;
	};
	
	var setNewGrid = function (){
		delayTime = 100;
		initialize();
		displayGrid();
	}
	
	var nextGen = function(){
		
		var getNeighbours = function(x,y){
			var nei = "C";
			if (x == 0) nei += "L";
			if (x == rectL-1) nei += "R";
			if (y == 0) nei += "T";
			if (y == rectW-1) nei += "B";
			return Neighbour[nei];
		};
		
		var _grids = [];
		
		for(var i= 0; i< rectL; i++){
			
			_grids[i] = [];
			
			for(var j= 0; j< rectW; j++){	
			
				var liveNei = 0, thisGrid = grids[i][j], newGrid;
				var Nei = getNeighbours(i,j);

				for(var k in Nei){
					liveNei += (grids[i+Nei[k][0]][j+Nei[k][1]]? 1: 0);
				}
				
				if(thisGrid){//alive
					newGrid = liveNei==2 || liveNei==3 ? 1: 0;
				}else{
					newGrid = liveNei ==3 ? 1: 0;
				} 
				
				_grids[i][j] = newGrid;
			}
		}
		grids = _grids;
	};

	var displayGrid = function(){	
		rects.selectAll("rect")
			.data(function(){ return setGrid()})
			.transition()
			.attr("fill", function(d) { return d.state ? "black" : "white" })
			.duration(0);
	}
	
	function startStop() {
			stopped = !stopped;
			d3.select('button.start')
				.text(function () { return stopped ? 'Start' : 'Stop';});
	}
	
	var run = function(){
		var aRound = function(){
			if (!stopped) {
				nextGen();
				displayGrid();
			}
		}				
		clearInterval(timerID);
		timerID = setInterval(function(){return aRound();},delayTime);
		console.log(timerID);
	}
	
	function firstRun(){
		initialize();
		run();
	};
	
	firstRun();
	
});