'use strict';
var $scope = {};

ssBoardCtrl($scope);
$scope.startGame();

describe("Test grid", function(){
	it("should be 81 tiles", function(){
		expect($scope.tiles.length).toEqual(9);
		for (var i =0; i < 9; i ++) {
			expect($scope.tiles[i].length).toEqual(9);
		}
	});
	it("should have 75 empty tiles", function(){
		expect($scope.emptyTiles).toEqual(75);
	});
	it("should really have 75 empty tiles", function(){
		var realEmpty = countEmpty($scope);
		expect(realEmpty).toEqual(75);
	});
	it("should be valid 1", function(){
		var valid = validateBoard($scope);
		expect(valid).toEqual(1);
	});
	describe("Making move", function(){
		it("actually", function() {
			$scope.newMove();			
		});
		it("should have 72 empty tiles", function(){
			expect($scope.emptyTiles).toEqual(72);
		});
		it("should really have 72 empty tiles", function(){
			var realEmpty = countEmpty($scope);			
			expect(realEmpty).toEqual(72);
		});
		it("should be valid 2", function(){
			var valid = validateBoard($scope);
			expect(valid).toEqual(1);
		})
	});
});

describe("Moves", function(){
	it("should be done", function(){
		generateBoard($scope, "RR0R");
		// make a move
		$scope.tileClick($scope.tiles[0][3]);
		$scope.tileClick($scope.tiles[0][2]);
		// check that ball moved
		expect($scope.tiles[0][3].c).toEqual(0);
		expect($scope.tiles[0][2].c).toEqual(1);
		expect($scope.emptyTiles).toEqual(72);
	});
	it("should remove lines", function(){
		generateBoard($scope, "RRRR0R", 0);
		// make a move
		$scope.tileClick($scope.tiles[0][5]);
		$scope.tileClick($scope.tiles[0][4]);
		// check no balls in line left
		if ($scope.tiles[0][0].n == 0) {
			expect($scope.tiles[0][0].c).toEqual(0);
		}
		expect($scope.emptyTiles).toEqual(75);
		expect(validateBoard($scope)).toEqual(1);
		expect($scope.ballsRemoved).toEqual(5);
		expect($scope.points).toEqual(5);
	});
	// Test for multiline
	it("should remove long lines", function(){
		var spec = "RRRR0RRRR" + "R";
		generateBoard($scope, spec, 0);
		// make a move
		$scope.tileClick($scope.tiles[1][0]);
		$scope.tileClick($scope.tiles[0][4]);
		// check no balls in line left
		if ($scope.tiles[0][0].n == 0) {
			expect($scope.tiles[0][0].c).toEqual(0);
		}
		if ($scope.tiles[0][8].n == 0) {
			expect($scope.tiles[0][8].c).toEqual(0);
		}
		expect($scope.emptyTiles).toEqual(75);
		expect(validateBoard($scope)).toEqual(1);
		expect($scope.ballsRemoved).toEqual(9);
		expect($scope.points).toEqual(80);
	})
	it("should remove multilines", function(){
		var spec = 
			"RRRR0000R" + 
			"0000R0000" +
			"0000R0000" +
			"0000R0000" +
			"0000R0000";
		generateBoard($scope, spec, 0);
		// make a move
		$scope.tileClick($scope.tiles[0][8]);
		$scope.tileClick($scope.tiles[0][4]);
		// check no balls in line left
		if ($scope.tiles[0][0].n == 0) {
			expect($scope.tiles[0][0].c).toEqual(0);
		}
		if ($scope.tiles[4][4].n == 0) {
			expect($scope.tiles[4][4].c).toEqual(0);
		}
		expect($scope.emptyTiles).toEqual(75);
		expect(validateBoard($scope)).toEqual(1);
		expect($scope.ballsRemoved).toEqual(9);
		expect($scope.points).toEqual(80);
	})
	// TODO Test for moving on next-turn
	// TODO Test for moving on next-turn and completing line
	// TODO Test for filling whole board
});

// spec: string of 0 to 81 char
// R - ball (red)
// B - ball (blue)
// r - next move ball red
// b - next move ball blue
// 0 - empty cell
function generateBoard(scope, spec, score){
	var empty = 81,
		next = [],
		i = 0;
	for (var j = 0; j < spec.length; j++) {
		switch (spec[i]) {
			case 'R':
				scope.tiles[Math.floor(i/9)][i%9].c = 1;
				scope.tiles[Math.floor(i/9)][i%9].n = 0;
				empty--;
				i++;
				break;
			case 'B':
				scope.tiles[Math.floor(i/9)][i%9].c = 2;
				scope.tiles[Math.floor(i/9)][i%9].n = 0;
				empty--;
				i++;
				break;
			case 'r':
				scope.tiles[Math.floor(i/9)][i%9].c = 1;
				scope.tiles[Math.floor(i/9)][i%9].n = 1;
				empty--;
				i++;
				next.push({x: i%9, y: Math.floor(i/9), c: 1});
				break;
			case 'b':
				scope.tiles[Math.floor(i/9)][i%9].c = 2;
				scope.tiles[Math.floor(i/9)][i%9].n = 1;
				empty--;
				i++;
				next.push({x: i%9, y: Math.floor(i/9), c: 2});
				break;
			case '0':
				scope.tiles[Math.floor(i/9)][i%9].c = 0;
				scope.tiles[Math.floor(i/9)][i%9].n = 0;
				i++;
				break;
			default:
				break;
		}
	};
	while (next.length < 3) {
		scope.tiles[Math.floor(i/9)][i%9].c = 2;
		scope.tiles[Math.floor(i/9)][i%9].n = 1;
		empty--;
		next.push({x: i%9, y: Math.floor(i/9), c: 2});
		i++;
	}
	while (i < 81) {
		scope.tiles[Math.floor(i/9)][i%9].c = 0;
		scope.tiles[Math.floor(i/9)][i%9].n = 0;
		i++;		
	}
	scope.nextMove = next;
	scope.emptyTiles = empty;
	if (score != undefined) {
		scope.ballsRemoved = score;
		scope.points = score;
	}
}

function countEmpty(scope) {
	var empty = 0;
	for (var i=0; i<9; i++){
		for (var j=0; j<9; j++) {
			if (scope.tiles[i][j].c == 0) { empty++ };
		}
	}
	return empty;
}
function validateBoard(scope) {
	var next = 0;
	for (var i=0; i<9; i++){
		for (var j=0; j<9; j++) {
			if (scope.tiles[i][j].n == 1) { next++ };
		}
	}
	if (next == 3) { return 1}
	return 0;
}