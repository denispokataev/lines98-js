'use strict';
var ssGameApp = angular.module('ssGameApp', []);

function ssBoardCtrl($scope, $timeout) {
	$scope.startGame = function() {
		var tiles = [];
		for (var i = 0; i < 9; i ++) {
			tiles[i] = [];
			for (var j = 0; j < 9; j++) {
				tiles[i][j] = {x: j, y: i, c: 0, n: 0};
			}
		}
		$scope.gameover = 0;
		$scope.points = 0;
		$scope.ballsRemoved = 0;
		$scope.tiles = tiles;
		$scope.emptyTiles = 81;
		$scope.selectedIndex = -1;
		$scope.colors = ['', 'blackball','redball', 'blueball', 'greenball', 'yellowball', 'magentaball', 'cyanball'];
		$scope.drawTriple($scope.getTriple());
		$scope.nextMove = $scope.getTriple();
		$scope.drawTriple($scope.nextMove, 1);
	};
	$scope.newMove = function(){
		$scope.drawTriple($scope.nextMove, 0, 1);
		// Check for board filled
		if ($scope.gameover) { return; }
		$scope.nextMove = $scope.getTriple();
		$scope.drawTriple($scope.nextMove, 1);
	};
	$scope.drawTriple = function(triple, nextMove, upgrade){
		for (var i = 0; i < triple.length; i ++) {
			$scope.tiles[triple[i].y][triple[i].x].c = triple[i].c;
			if (nextMove) {
				$scope.tiles[triple[i].y][triple[i].x].n = 1;
			}
			else {
				$scope.tiles[triple[i].y][triple[i].x].n = 0;
				$scope.checkLines($scope.tiles[triple[i].y][triple[i].x]);
			}
		}
		if (!upgrade) { // NOTE Should we really consider next move as non-empty?
			$scope.emptyTiles-=triple.length;
		}
		else {
			if ($scope.emptyTiles <= 0) {
				$scope.gameover = 1;
			}
		}
	};
	$scope.getTriple = function(){
		// Add check for no more empty places
		var triple = [], t = [], ok = 0;
		if ($scope.emptyTiles > 0) {
			t[0] = Math.floor($scope.emptyTiles * Math.random());
		}
		if ($scope.emptyTiles > 1) {
			while (!ok) {
				t[1] = Math.floor($scope.emptyTiles * Math.random());
				if (t[1] != t[0]) { ok = 1; }
			}
		}
		if ($scope.emptyTiles > 2) {
			ok = 0;
			while (!ok) {
				t[2] = Math.floor($scope.emptyTiles * Math.random());
				if (t[2] != t[1] && t[2] != t[0]) { ok = 1; }
			}
		}
		t.sort(function(a,b){return a-b});
		var tidx = 0, emptyCount = -1;
		for (var i = 0; i < 81 && tidx < t.length; i++) {
			if ($scope.tiles[Math.floor(i/9)][i%9].c == 0) { emptyCount++; }
			if (emptyCount == t[tidx]) {
				triple.push({x: i%9, y: Math.floor(i/9), c: Math.floor(7 * Math.random()) + 1});
				tidx++;
				//if (tidx == 3) { break; }
			}
		}
		return triple;
	};
	$scope.tileClick = function(tile) {
		if ($scope.gameover || $scope.animation) { return; }
		if ($scope.selectedIndex != -1 && (tile.c == 0 || tile.n == 1)) { // move
			// Check for path exists
			var opened = [], closed = [];
			var target = $scope.tiles[Math.floor($scope.selectedIndex/9)][$scope.selectedIndex%9];
			opened.push({x: tile.x, y: tile.y, cost: 0});
			var ok = 0;
			var testCoord = function(ty,tx){
					if (ty < 0 || ty > 8 || tx < 0 || tx > 8) { return 1; }
					if (ty == target.y && tx == target.x) { ok = 1; return 0; }
					var n = ty*9+tx;
					if (($scope.tiles[ty][tx].c == 0 || $scope.tiles[ty][tx].n == 1)
						&& closed[n] == null || closed[n] > cur.cost + 1) {
						opened.push({x: tx, y: ty, cost: cur.cost+1});
					}
					return 1;
			};
			var getLowestNeighbour = function(path){
				var vertex = path[path.length-1];
				if (Math.abs(vertex.x - tile.x) == 1 && vertex.y == tile.y) { path.push(tile); return 1; }
				if (Math.abs(vertex.y - tile.y) == 1 && vertex.x == tile.x) { path.push(tile); return 1; }
				var x = vertex.x - 1,
					y = vertex.y,
					cost = closed[x+y*9],
					lowestCost = {cost: 81};
				if (vertex.x > 0 && cost) { lowestCost = {x: x, y: y, cost: cost}; }
				if (vertex.x < 8) {
					x = vertex.x + 1; y = vertex.y; cost = closed[x+y*9];
					if (cost < lowestCost.cost) { lowestCost = {x: x, y: y, cost: cost}; }
				}
				if (vertex.y > 0) {
					x = vertex.x; y = vertex.y - 1; cost = closed[x+y*9];
					if (cost < lowestCost.cost) { lowestCost = {x: x, y: y, cost: cost}; }
				}
				if (vertex.y < 8) {
					x = vertex.x; y = vertex.y + 1; cost = closed[x+y*9];
					if (cost < lowestCost.cost) { lowestCost = {x: x, y: y, cost: cost}; }
				}
				path.push(lowestCost);
				return 0;
			};
			while (!ok) {
				if (opened.length == 0) { break; }
				var cur = opened.shift();
				closed[cur.y*9+cur.x] = cur.cost;
				if (testCoord(cur.y,cur.x-1) == 0) { break; }
				if (testCoord(cur.y,cur.x+1) == 0) { break; }
				if (testCoord(cur.y-1,cur.x) == 0) { break; }
				if (testCoord(cur.y+1,cur.x) == 0) { break; }
			}
			if (ok) {
				// Remove selection
				$scope.selectedIndex = -1;
				// Animate path move
				var path = [];
				path.push(target);
				var counter = 0;
				while (1) {
					if (getLowestNeighbour(path)) { break; }
					counter++;					
					if (counter > 100) { alert("Bailing out"); break; }
				}
				var prev_color = tile.n ? tile.c : 0;
				// timeouted animation through path
				$scope.animation = {path: path, tile: tile, prev_color: prev_color};
				$timeout(function(){$scope.makeMove()}, 50, 1);
			}
			// Else - do nothing // TODO "no path" reaction
		}
		else if (tile.c != 0 && tile.n == 0) {
			if ($scope.selectedIndex == tile.y*9+tile.x) {
				$scope.selectedIndex = -1;
			}
			else {
				$scope.selectedIndex = tile.y*9+tile.x;
			}
		}
	};
	$scope.makeMove = function(){
		var path = $scope.animation.path,
			preserve = 0;
		if ($scope.tiles[path[1].y][path[1].x].n == 1) {
			preserve = $scope.tiles[path[1].y][path[1].x].c;
		}
		$scope.tiles[path[1].y][path[1].x].c = $scope.tiles[path[0].y][path[0].x].c;
		$scope.tiles[path[1].y][path[1].x].n = 0;
		if ($scope.preserve) {
			$scope.tiles[path[0].y][path[0].x].c = $scope.preserve;
			$scope.tiles[path[0].y][path[0].x].n = 1;
			$scope.preserve = 0;
		}
		else {
			$scope.tiles[path[0].y][path[0].x].c = 0;
		}
		$scope.preserve = preserve;
		if (path.length > 2) {
			path.shift();
			$timeout(function(){$scope.makeMove()}, 50, 1);
		}
		else {
			$scope.finalizeMove($scope.animation.tile, $scope.animation.prev_color);
		}
	};
	$scope.finalizeMove = function(tile, prev_color){
		var newMoveNeeded = 0;
		// Check for completed lines
		if (!$scope.checkLines(tile) || $scope.emptyTiles == 78) {
			// make new move
			newMoveNeeded = 1;
		}
		// Reappear nextMove if it was it
		if (prev_color) { //tile.n == 1) {
			if (tile.c == 0) { // line was removed already
				tile.c = prev_color;
				tile.n = 1;
			}
			else {
				var t = Math.floor($scope.emptyTiles * Math.random());
				var emptyCount = -1;
				for (var i = 0; i < 81; i++) {
					if ($scope.tiles[Math.floor(i/9)][i%9].c == 0) { emptyCount++; }
					if (emptyCount == t) {
						for (var j = 0; j < 3; j++ ) {
							if ($scope.nextMove[j].x == tile.x && $scope.nextMove[j].y == tile.y) {
								$scope.nextMove[j].x = i%9;
								$scope.nextMove[j].y = Math.floor(i/9);
								$scope.tiles[$scope.nextMove[j].y][$scope.nextMove[j].x].c = $scope.nextMove[j].c;
								$scope.tiles[$scope.nextMove[j].y][$scope.nextMove[j].x].n = 1;
								tile.n = 0;
								// Bail out
								j = 3;
								i = 81;
							}
						}
					}
				}
			}
		}
		if (newMoveNeeded) {
			$scope.newMove();
		}
		// cleanup
		$scope.preserve = 0;
		$scope.animation = 0;
	};
	$scope.checkLines = function(tile){
		var totalCount = 1,
			toClear = []
		;
		for (var dir = 1; dir <= 4; dir++) {
			var dirCount = 0,
				testTiles = [],
				t = {x: tile.x, y: tile.y}
			;
			if (stepTile(t,dir,1) != 0) {
				while ($scope.tiles[t.y][t.x].c == tile.c && $scope.tiles[t.y][t.x].n == 0) { dirCount++; testTiles.push({x: t.x, y: t.y}); if (stepTile(t,dir,1) == 0) { break; } }
			}
			t = {x: tile.x, y: tile.y};
			if (stepTile(t,dir,-1) != 0) {
				while ($scope.tiles[t.y][t.x].c == tile.c && $scope.tiles[t.y][t.x].n == 0) { dirCount++; testTiles.push({x: t.x, y: t.y}); if (stepTile(t,dir,-1) == 0) { break; } }
			}
			if (dirCount >= 4) { totalCount += dirCount; toClear = toClear.concat(testTiles); }
		}
		if (totalCount > 1) {
			toClear.push(tile);
			// clear toClear;
			for (var i = 0; i < toClear.length; i++) {
				$scope.tiles[toClear[i].y][toClear[i].x].c = 0;
			}
			$scope.emptyTiles += toClear.length;
			// add points for totalCount
			$scope.ballsRemoved += totalCount;
			$scope.points += 5 * Math.pow(2, (totalCount-5)); // XXX Requires attention
			return 1;
		}
		return 0;
	};
}

function stepTile(t,direction,reverse) {
	if (!reverse) { reverse = 1; }
	if (reverse != 1 && reverse != -1) { alert('Wrong reverse in stepTile call!') }
	if (direction == 1) { t.x += reverse; }
	else if (direction == 2) { t.y += reverse; }
	else if (direction == 3) { t.x += reverse; t.y += reverse; }
	else if (direction == 4) { t.x += reverse; t.y -= reverse; }
	else { alert('Invalid direction in stepTile call!') }
	if (t.x < 0 || t.x > 8 || t.y < 0 || t.y > 8) { return 0; }
	return 1;
}