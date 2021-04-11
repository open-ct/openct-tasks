function initTask() {
   var state = {};
   var level;
   var answer = null;
   var data = {
      easy: {
         paperWidth: 420,
         paperHeight: 350,
         initialGrid: [
            ['S', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', 'X', '.', '.', '.'],
            ['.', 'X', '.', '.', 'F', 'X', '.', '.'],
            ['.', '.', '.', '.', 'X', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', 'X', '.', '.', '.', '.']
         ],
         optimal: 3
      },
      medium: {
         paperWidth: 420,
         paperHeight: 350,
         initialGrid: [
            ['S', '.', '.', '.', '.', '.', '.', '.'],
            ['X', 'X', 'X', '.', 'X', 'X', 'X', 'X'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', 'X', '.', 'X', '.', 'X', '.'],
            ['.', 'X', '.', '.', 'X', '.', '.', 'X'],
            ['.', 'X', '.', 'X', '.', '.', '.', 'F']
         ],
         optimal: 3
      },
      hard: {
         paperWidth: 420,
         paperHeight: 350,
         initialGrid: [
            ['S', '.', 'X', '.', '.', '.', '.', '.'],
            ['.', '.', 'X', '.', '.', '.', '.', '.'],
            ['.', '.', 'X', '.', 'F', 'X', '.', '.'],
            ['.', '.', 'X', 'X', 'X', 'X', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.']
         ],
         optimal: 4
      }
      /*
      old_hard: {
         paperWidth: 420,
         paperHeight: 350,
         initialGrid: [
            ['S', '.', '.', '.', '.', 'X', '.', '.'],
            ['.', '.', '.', '.', '.', '.', 'X', '.'],
            ['.', '.', 'X', 'X', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', 'X', '.', '.'],
            ['.', '.', '.', '.', '.', 'X', '.', 'X'],
            ['.', '.', '.', 'X', '.', '.', '.', 'F']
         ],
         optimal: 6
      }
      */
   };

   var paper;
   var grid;
   var simulation;

   var gridParams = {
      xPad: 8,
      yPad: 8,
      cellWidth: 50,
      cellHeight: 50,
      defaultObstacle: {
         padding: 1,
         boxAttr: {
            fill: "black",
            "stroke-width": 1
         },
         crossAttr: {
            stroke: "#831313",
            "stroke-width": 4
         }
      },
      userObstacle: {
         padding: 1,
         boxAttr: {
            stroke: "#ffe6ad",
            fill: "#ffe6ad"
         },
         crossAttr: {
            stroke: "#831313",
            "stroke-width": 3
         }
      },
      lineAttr: {
         stroke: "#555555",
         "stroke-width": 1
      },
      exitRadius: 10,
      exitAttr: {
         fill: "#44FF44"
      },
      borderAttr: {
         stroke: "#555555",
         "stroke-width": 4
      }
   };

   var robotParams = {
      path: ["M", 0, 0, "L", 25, 10, 0, 20, "Z"],
      attr: {
         fill: "blue"
      },
      offset: {
         xPos: -10,
         yPos: -10
      }
   };
   var dirToAngle = {
      right: 0,
      down: 90,
      left: 180,
      up: 270
   };
   var dirIncrements = {
      right: [1, 0],
      down: [0, 1],
      left: [-1, 0],
      up: [0, -1]
   };
   var dirTurnRight = {
      right: "down",
      down: "left",
      left: "up",
      up: "right"
   };
   var maxLoops = 3;
   var animTime = 200;

   task.load = function(views, callback) {
      displayHelper.setupLevels();

      displayHelper.hideValidateButton = true;
      initHandlers();

      if (views.solutions) {
         $("#solution").show();
      }

      callback();
   };

   task.getDefaultStateObject = function() {
      return { level: "easy" };
   };

   task.getStateObject = function() {
      state.level = level;
      return state;
   };

   task.reloadStateObject = function(stateObj, display) {
      state = stateObj;
      level = state.level;

      if (display) {
         initPaper();
      }
   };

   task.reloadAnswerObject = function(answerObj) {
      killSimulation();
      answer = answerObj;
      resetGrid();
      resetRobot();
      $("#feedback").html("");
      setButtonState("stop", false);
      setButtonState("execute", true);
      setExecuteText(taskStrings.execute);
   };

   task.getAnswerObject = function() {
      return answer;
   };

   task.getDefaultAnswerObject = function() {
      var answer = {};
      for(var level in data) {
         answer[level] = Beav.Matrix.make(data[level].initialGrid.length, data[level].initialGrid[0].length, 0);
      }
      return answer;
   };

   task.unload = function(callback) {
      killSimulation();
      callback();
   };

   var initHandlers = function() {
      setButtonState("stop", false);
      $("#stop").click(clickStop);
      $("#execute").click(clickExecute);
   };

   var clickStop = function() {
      killSimulation();
      resetRobot();
      setButtonState("stop", false);
      setButtonState("execute", true);
      setExecuteText(taskStrings.execute);
   };

   var clickExecute = function() {
      if (!simulation) {
         resetRobot();
         simulation = new Simulation();
         simulate(simulation, answer[level], level);
         simulation.setAutoPlay(true);
         simulation.play();
         setExecuteText(taskStrings.pause);
         setButtonState("stop", true);
      }
      else if (simulation.isPlaying()) {
         simulation.stop();
         setExecuteText(taskStrings.resume);
      }
      else {
         simulation.setAutoPlay(true);
         simulation.play();
         setExecuteText(taskStrings.pause);
      }
   };

   var initPaper = function() {
      if (paper) {
         paper.remove();
      }
      if (grid) {
         grid.remove();
      }

      // $("#nb_optimal").html(data[level].optimal);
      // <span id="nb_optimal"></span>

      var paperWidth = data[level].initialGrid[0].length * gridParams.cellWidth + 2 * gridParams.xPad;
      var paperHeight = data[level].initialGrid.length * gridParams.cellHeight + 2 * gridParams.yPad;

      paper = Raphael("anim", paperWidth, paperHeight);
      var borderWidth = gridParams.borderAttr["stroke-width"]/2;
      paper.rect(gridParams.xPad-borderWidth, gridParams.yPad-borderWidth, data[level].initialGrid[0].length * gridParams.cellWidth +2*borderWidth, data[level].initialGrid.length * gridParams.cellHeight +2*borderWidth).attr(gridParams.borderAttr);
      grid = Grid.fromArray("anim", paper, data[level].initialGrid, cellFiller, gridParams.cellWidth, gridParams.cellHeight, gridParams.xPad, gridParams.yPad, gridParams.lineAttr);
      grid.clickCell(clickCell);
      robot = paper.path(robotParams.path).attr(robotParams.attr);
   };

   var getPositionOf = function(level, entry) {
      var resultRow, resultCol;
      Beav.Matrix.forEach(data[level].initialGrid, function(val, row, col, matrix) {
         if (val == entry) {
            resultRow = row;
            resultCol = col;
         }
      });
      return {
         row: resultRow,
         col: resultCol
      };
   };

   var resetRobot = function() {
      var startPosition = getPositionOf(level, 'S');
      transformRobot(startPosition.row, startPosition.col, "right");
   };
   
   var transformRobot = function(row, col, direction) {
      var cellCenter = grid.getCellCenter(row, col);
      var xPos = cellCenter.x + robotParams.offset.xPos;
      var yPos = cellCenter.y + robotParams.offset.yPos;
      robot.attr("path", Raphael.transformPath(robotParams.path, ["T", xPos, yPos, "R", dirToAngle[direction]]));
      robot.toFront();
   };

   var cellFiller = function(cellData, paper) {
      var dataEntry = data[level].initialGrid[cellData.row][cellData.col];
      if (dataEntry == 'X') {
         return drawObstacle(cellData.xPos, cellData.yPos, true);
      }
      if (dataEntry == 'F') {
         return drawExit(cellData.xPos, cellData.yPos);
      }
      var answerEntry = 0;
      if (answer) {
         answerEntry = answer[level][cellData.row][cellData.col];
      }
      if (answerEntry) {
         return drawObstacle(cellData.xPos, cellData.yPos, false);
      }
      return [];
   };

   var resetGrid = function() {
      Beav.Matrix.forEach(data[level].initialGrid, function(val, row, col, matrix) {
         grid.setCell(cellFiller, {
            row: row,
            col: col
         });
      });
   };

   var drawObstacle = function(xPos, yPos, fromData) {
      var params = gridParams.defaultObstacle;
      if (!fromData) {
         params = gridParams.userObstacle;
      }
      var left = xPos + params.padding;
      var right = xPos + gridParams.cellWidth - params.padding;
      var top = yPos + params.padding;
      var bottom = yPos + gridParams.cellHeight - params.padding;
      var box = paper.rect(left, top, right - left, bottom - top).attr(params.boxAttr);
      var cross1 = paper.path(["M", left, top, "L", right, bottom]).attr(params.crossAttr);
      var cross2 = paper.path(["M", right, top, "L", left, bottom]).attr(params.crossAttr);
      return [box, cross1, cross2];
   };

   var drawExit = function(xPos, yPos) {
      xPos += gridParams.cellWidth / 2;
      yPos += gridParams.cellHeight / 2;
      return [paper.circle(xPos, yPos, gridParams.exitRadius).attr(gridParams.exitAttr)];
   };

   var clickCell = function(event) {
      displayHelper.stopShowingResult();
      $("#feedback").html("");
      clickStop();
      var cellData = event.data;
      var row = cellData.row, col = cellData.col;
      var dataEntry = data[level].initialGrid[row][col];
      if (dataEntry == 'X') {
         $("#feedback").html(taskStrings.alreadyObstacle);
         return;
      }
      if (dataEntry != '.') {
         $("#feedback").html(taskStrings.refuseObstacle);
         return;
      }
      answer[level][row][col] = 1 - answer[level][row][col];
      grid.setCell(cellFiller, {
         row: row,
         col: col
      });
   };

   var simulate = function(simulation, userGrid, level) {
      simulation.clear();
      var visited = {};
      var startPosition = getPositionOf(level, 'S');
      var exitPosition = getPositionOf(level, 'F');
      var robotRow = startPosition.row;
      var robotCol = startPosition.col;
      var robotDir = "right";
      var dataGrid = data[level].initialGrid;
      var success = false;
      var userObstacleCount = Beav.Matrix.filterCount(userGrid, function(val) {
         return val;
      });

      var stepFunction = function(params) {
         transformRobot(params.row, params.col, params.dir);
      };

      while(true) {
         var visitedID = robotRow + "_" + robotCol + "_" + robotDir;
         if (visited[visitedID]) {
            visited[visitedID]++;
            if (visited[visitedID] >= maxLoops) {
               break;
            }
         }
         else {
            visited[visitedID] = 1;
         }
         var nextRow = robotRow + dirIncrements[robotDir][1];
         var nextCol = robotCol + dirIncrements[robotDir][0];
         if (nextRow < 0 || nextRow >= dataGrid.length || nextCol < 0 || nextCol >= dataGrid[0].length || userGrid[nextRow][nextCol] || dataGrid[nextRow][nextCol] == 'X') {
            robotDir = dirTurnRight[robotDir];
         }
         else {
            robotRow = nextRow;
            robotCol = nextCol;
         }
         var step = new SimulationStep();
         step.addEntry({
            name: "step",
            action: {
               onExec: stepFunction,
               params: {
                  row: robotRow,
                  col: robotCol,
                  dir: robotDir
               },
               duration: animTime,
               useTimeout: true
            }
         });
         simulation.addStep(step);
         if (robotRow === exitPosition.row && robotCol === exitPosition.col) {
            success = true;
            break;
         }
      }

      simulation.addStepWithEntry({
         name: "validate",
         action: {
            onExec: onSimulationFinish,
            params: {
               success: success,
               userObstacleCount: userObstacleCount,
               level: level
            }
         }
      });

      return {
         success: success,
         userObstacleCount: userObstacleCount
      };
   };

   var onSimulationFinish = function(params, duration, callback) {
      if (params.success) {
         //  && params.userObstacleCount <= data[params.level].optimal
         platform.validate("done");
      }
      else {
         displayHelper.validate("stay");
      }
      setExecuteText(taskStrings.execute);
      simulation = null;
      callback();
   };

   var setButtonState = function(id, enabled) {
      $("#" + id).attr("disabled", !enabled);
   };

   var setExecuteText = function(text) {
      $("#execute").val(text);
   };

   var stopExecution = function() {
      if (simulation) {
         simulation.stop();
      }
   };

   var killSimulation = function() {
      stopExecution();
      simulation = null;
   };

   var getResultAndMessage = function(answer, level) {
      var successAndCount = simulate(new Simulation(), answer[level], level);
      if (!successAndCount.success) {
         return {
            result: "error",
            message: taskStrings.errorLoop
         };
      }
      /* if (successAndCount.userObstacleCount > data[level].optimal) {
         return {
            result: "partial",
            message: taskStrings.successPartial(successAndCount.userObstacleCount, data[level].optimal)
         };
      } */ 
      return {
         result: "optimal"
      };
   };

   grader.gradeTask = function(strAnswer, token, callback) {
      task.getLevelGrade(strAnswer, token, callback, null);
   };

   task.getLevelGrade = function(strAnswer, token, callback, gradedLevel) {
      var taskParams = displayHelper.taskParams;
      var scores = {};
      var messages = {};
      var maxScores = displayHelper.getLevelsMaxScores();

      if (strAnswer === '') {
         callback(taskParams.minScore, '');
         return;
      }
      var answer = $.parseJSON(strAnswer);
      // clone the state to restore after grading.
      var oldState = $.extend({}, task.getStateObject());
      for (var curLevel in data) {
         state.level = curLevel;
         task.reloadStateObject(state, false);

         var resultAndMessage = getResultAndMessage(answer, curLevel);
         if (resultAndMessage.result == "optimal") {
            scores[curLevel] = maxScores[curLevel];
            messages[curLevel] = taskStrings.success;
         }
         /* else if (resultAndMessage.result == "partial"){
            scores[curLevel] = taskParams.noScore; // maxScores[curLevel] / 2;
            messages[curLevel] = resultAndMessage.message;
         } */
         else {
            scores[curLevel] = taskParams.noScore;
            messages[curLevel] = resultAndMessage.message;
         }
      }

      task.reloadStateObject(oldState, false);
      if (!gradedLevel) {
         displayHelper.sendBestScore(callback, scores, messages);
      } else {
         callback(scores[gradedLevel], messages[gradedLevel]);
      }
   };
}
initTask();

