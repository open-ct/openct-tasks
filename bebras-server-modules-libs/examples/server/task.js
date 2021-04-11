var tools = require('../../bebras_tools')
var jwt = require('jsonwebtoken')

var taskInterface = tools.connect({
    host: 'http://localhost:3000'
}).taskInterface({
    task: jwt.sign({
        platformName: 'test',
        itemUrl: 'http://localhost?taskID=test-server-modules',
        randomSeed: 0,
        hints_requested: [
            'test'
        ]
    }, 'buddy')
})


function taskData(callback) {
    console.log('taskInterface.taskData')
    taskInterface.taskData({
        success: (res) => {
            console.log('Result', res)
            callback && callback()
        },
        error: (error) => {
            console.error(error)
        }
    })
}


function taskHintData(callback) {
    console.log('taskInterface.taskHintData')
    taskInterface.taskHintData({
        success: (res) => {
            console.log('Result', res)
            callback && callback()
        },
        error: (error) => {
            console.error(error)
        }
    })
}


function gradeAnswer(callback) {
    console.log('taskInterface.gradeAnswer')
    var answer = {
        platformName: 'test',
        itemUrl: 'http://localhost?taskID=test-server-modules',
        randomSeed: 0,
        sAnswer: 'answer'
    }
    taskInterface.gradeAnswer({
        answer: jwt.sign(answer, 'buddy'),
        min_score: 1,
        max_score: 100,
        no_score: 0,
        success: (res) => {
            console.log('Result', res)
            callback && callback()
        },
        error: (error) => {
            console.error(error)
        }
    })
}



taskData(() => {
    taskHintData(() => {
        gradeAnswer()
    })
})