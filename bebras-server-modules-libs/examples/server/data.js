var tools = require('../../bebras_tools')
var jwt = require('jsonwebtoken')

var dataStore = tools.connect({
    host: 'http://localhost:3000'
}).dataStore({
    task: jwt.sign({
        platformName: 'test',
        itemUrl: 'http://localhost?taskID=test-server-modules',
        randomSeed: 0,
        hints_requested: [
            'test'
        ]
    }, 'buddy')
})

var key = 'test_key'


function dataWrite(callback) {
    console.log('dataStore.write')
    dataStore.write({
        key,
        value: 'test_value',
        duration: 0,
        success: (res) => {
            console.log('Done')
            callback && callback()
        },
        error: (error) => {
            console.error(error)
        }
    })
}


function dataRead(callback) {
    console.log('dataStore.read')
    dataStore.read({
        key,
        success: (res) => {
            console.log('Result', res)
            callback && callback()
        },
        error: (error) => {
            console.error(error)
        }
    })
}


function dataDelete(callback) {
    console.log('dataStore.delete')
    dataStore.delete({
        key,
        success: (res) => {
            console.log('Done')
            callback && callback()
        },
        error: (error) => {
            console.error(error)
        }
    })
}



dataWrite(() => {
    dataRead(() => {
        dataDelete(() => {
            dataRead()
        })
    })
})