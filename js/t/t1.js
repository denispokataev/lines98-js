'use strict';
var $scope,$timeout;

//beforeEach(module('ssGameApp'));
beforeEach(inject(function($rootScope,$controller,$injector){
	if (!$timeout) {
		$scope = $rootScope.$new();
		$timeout = $injector.get('$timeout');
		ssBoardCtrl($scope,$timeout);
		$scope.startGame();
	}
	//$controller('ssBoardCtrl', ['$scope,$timeout']);

}));

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
		runs(function() {
			// make a move
			$scope.tileClick($scope.tiles[0][3]);
			$scope.tileClick($scope.tiles[0][2]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
			// check that ball moved
			expect($scope.tiles[0][3].c == 0 || $scope.tiles[0][3].n == 1).toEqual(true);
			expect($scope.tiles[0][2].c).toEqual(1);
			expect($scope.emptyTiles).toEqual(72);
		});
	});
	it("should remove lines", function(){
		generateBoard($scope, "RRRR0R", 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[0][5]);
			$scope.tileClick($scope.tiles[0][4]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
			// check no balls in line left
			if ($scope.tiles[0][0].n == 0) {
				expect($scope.tiles[0][0].c).toEqual(0);
			}
			expect($scope.emptyTiles).toEqual(75);
			expect(validateBoard($scope)).toEqual(1);
			expect($scope.ballsRemoved).toEqual(5);
			expect($scope.points).toEqual(5);
		});
	});
	// Test for multiline
	it("should remove long lines", function(){
		var spec = "RRRR0RRRR" + "R";
		generateBoard($scope, spec, 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[1][0]);
			$scope.tileClick($scope.tiles[0][4]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
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
		});
	})
	it("should remove multilines", function(){
		var spec = 
			"RRRR0000R" + 
			"0000R0000" +
			"0000R0000" +
			"0000R0000" +
			"0000R0000";
		generateBoard($scope, spec, 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[0][8]);
			$scope.tileClick($scope.tiles[0][4]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
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
		});
	});
	// Test for completing line by next-turn upgrade
	it("should clear line by next-turn upgrade", function(){
		var spec = "RRRr0R";
		generateBoard($scope, spec, 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[0][5]);
			$scope.tileClick($scope.tiles[0][4]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
			expect($scope.tiles[0][3].c == 0 || $scope.tiles[0][3].n == 1).toEqual(true);
			expect($scope.tiles[0][4].c == 0 || $scope.tiles[0][4].n == 1).toEqual(true);
			expect($scope.tiles[0][5].c == 0 || $scope.tiles[0][5].n == 1).toEqual(true);
			expect($scope.emptyTiles).toEqual(76);
			expect(validateBoard($scope)).toEqual(1);
			expect($scope.ballsRemoved).toEqual(5);
		});
	});
	// Test for moving on next-turn
	it("should move on next-turn ball", function(){
		var spec = "RRRbbRb";
		generateBoard($scope, spec, 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[0][5]);
			$scope.tileClick($scope.tiles[0][4]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
			expect($scope.tiles[0][4].c).toEqual(1);
			expect($scope.tiles[0][4].n).toEqual(0);
			expect($scope.tiles[0][3].c).toEqual(2);
			expect($scope.tiles[0][6].c).toEqual(2);
			expect($scope.tiles[0][3].n).toEqual(0);
			expect($scope.tiles[0][6].n).toEqual(0);
			expect($scope.nextMove.length).toEqual(3);
			var ok = 0;
			if ($scope.tiles[0][5].c == 2 && $scope.tiles[0][5].n == 0) { ok = 1 }
			if(!ok) {
				for (var i = 7; i < 81; i++) {
					if ($scope.tiles[Math.floor(i/9)][i%9].n == 0 && $scope.tiles[Math.floor(i/9)][i%9].c == 2) { ok = 1 }
				}
			}
			expect(ok).toEqual(1);
			expect($scope.emptyTiles).toEqual(71);
			expect(validateBoard($scope)).toEqual(1);
			expect($scope.ballsRemoved).toEqual(0);
		});
	});
	// Test for moving on next-turn and completing line
	it("should move on next-turn ball and complete line", function(){
		var spec = "RRRRb000R" + "BBB";
		generateBoard($scope, spec, 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[0][8]);
			$scope.tileClick($scope.tiles[0][4]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
			// check no balls in line left
			expect($scope.tiles[0][0].c).toEqual(0);
			expect($scope.tiles[0][8].c).toEqual(0);
			expect($scope.tiles[0][4].c).toEqual(2);
			expect($scope.tiles[0][4].n).toEqual(1);
			expect($scope.emptyTiles).toEqual(75);
			expect(validateBoard($scope)).toEqual(1);
			expect($scope.ballsRemoved).toEqual(5);
		});
	})	
	// Test for moving through next-turn
	it("should move through next-turn ball", function(){
		var spec = 
			"RRR0b0R00" + 
			"bb00R0000";
		generateBoard($scope, spec, 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[0][6]);
			$scope.tileClick($scope.tiles[0][3]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
			// check no balls in line left
			expect($scope.tiles[0][3].c).toEqual(1);
			expect($scope.tiles[0][4].c).toEqual(2);
			expect($scope.tiles[0][4].n).toEqual(0);
			expect($scope.tiles[1][0].c).toEqual(2);
			expect($scope.tiles[1][0].n).toEqual(0);
			expect($scope.tiles[1][1].c).toEqual(2);
			expect($scope.tiles[1][1].n).toEqual(0);
			expect($scope.tiles[0][6].c == 0 || $scope.tiles[0][6].n == 1).toEqual(true);
			expect($scope.emptyTiles).toEqual(70);
			expect(validateBoard($scope)).toEqual(1);
			expect($scope.ballsRemoved).toEqual(0);
		});
	})	
	// Test for moving next to next-turn
	it("should move next to next-turn ball", function(){
		var spec = 
			"RRRR00b0R" + 
			"0000R0000";
		generateBoard($scope, spec, 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[1][4]);
			$scope.tileClick($scope.tiles[1][6]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
			expect($scope.tiles[0][6].c).toEqual(2);
			expect($scope.tiles[0][6].n).toEqual(0);
			expect($scope.emptyTiles).toEqual(69);
			expect(validateBoard($scope)).toEqual(1);
			expect($scope.ballsRemoved).toEqual(0);
		});
	})	
	// Test for filling whole board
	it("should gameover on board filled", function(){
		var spec = 
			"RBRBRBRBR" + 
			"BRBRBRBRB" +
			"BRBRBRBRB" +
			"RBRBRBRBR" +
			"RBRBRBRBR" +
			"BRBRBRBRB" +
			"BRBRBRBRB" +
			"RBRBRBRBR" +
			"RBRBRBrbr";
		generateBoard($scope, spec, 0);
		runs(function(){
			// make a move
			$scope.tileClick($scope.tiles[8][5]);
			$scope.tileClick($scope.tiles[8][6]);
		});
		waitsFor(function(){ $timeout.flush(); return $scope.animation == 0}, "Should finish animation", 500);
		runs(function(){
			expect($scope.tiles[8][5].c).toEqual(1);
			expect($scope.tiles[8][5].n).toEqual(0);
			expect($scope.tiles[8][6].c).toEqual(2);
			expect($scope.tiles[8][6].n).toEqual(0);
			expect($scope.tiles[8][7].c).toEqual(2);
			expect($scope.tiles[8][7].n).toEqual(0);
			expect($scope.tiles[8][8].c).toEqual(1);
			expect($scope.tiles[8][8].n).toEqual(0);
			expect($scope.emptyTiles).toEqual(0);
			expect($scope.gameover).toEqual(1);
		});
	});
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
		switch (spec[j]) {
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
				next.push({x: i%9, y: Math.floor(i/9), c: 1});
				empty--;
				i++;
				break;
			case 'b':
				scope.tiles[Math.floor(i/9)][i%9].c = 2;
				scope.tiles[Math.floor(i/9)][i%9].n = 1;
				next.push({x: i%9, y: Math.floor(i/9), c: 2});
				empty--;
				i++;
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
	scope.animation = null;
	scope.preserve = 0;
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