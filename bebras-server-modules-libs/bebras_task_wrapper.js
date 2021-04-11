function BebrasTaskWrapper(task, options) {

    var taskInterface = BebrasTools.connect({
        host: options.host
    }).taskInterface()


    var task_token = {

        error_delay: 2000,
        token: null,
        timeout: null,
        callbacks: {},


        init: function(callback) {
            var query = document.location.search.replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
            if(query.sToken) {
                this.token = query.sToken
                //console.log(this.token)
                return callback(this.token)
            }
            console.error('sToken not found in query string')
        },


        get: function(success, error) {
            this.reset()
            if(this.token) {
                return success(this.token)
            }
            this.callbacks = {
                success: success,
                error: error
            }
            this.timeout = setTimeout((function() {
                this.callbacks.error && this.callbacks.error('Error, task token was not received')
                this.reset()
            }).bind(this), this.error_delay)
        },


        set: function(token) {
            this.callbacks.success && this.callbacks.success(token)
            this.token = token
            this.reset()
        },


        empty: function() {
            this.token = null
            this.reset()
        },


        reset: function() {
            clearTimeout(this.timeout)
            this.callbacks = {}
        }
    }




    function loadHint(token) {
        taskInterface.taskHintData({
            task: token,
            success: function(res) {
                task.onTaskHintData && task.onTaskHintData(res)
            },
            error: function(error) {
                task.onTaskHintError && task.onTaskHintError(error)
            }
        })
    }



    task.load = function(views, success, error) {
        task_token.init(function(token) {
            if(token) {
                task.onLoad && task.onLoad(views, success)
                taskInterface.taskData({
                    task: token,
                    success: function(res) {
                        task.onTaskData && task.onTaskData(res)
                        //success && success()
                    },
                    error: function(msg) {
                        console.error(msg)
                        error && error()
                    }
                })
            } else {
                error && error()
            }
        })
    }


    task.unload = function(success, error) {
        task_token.reset()
        task.onUnload ? task.onUnload(success, error) : success()
    }


    task.updateToken = function(token, callback)  {
        task_token.set(token)
        callback && callback()
    }


    task.askHint = function(hint_params) {
        task_token.empty()
        platform.askHint(
            hint_params,
            function() {
                task_token.get(
                    loadHint,
                    function(msg) {
                        console.error(msg)
                    }
                )
            },
            function() {
                console.error('platform.askHint error')
            }
        )
    }


    task.gradeAnswer = function(answer, answer_token, callback, error) {
        task_token.get(
            function(task_token) {
                platform.getTaskParams(null, null, function(taskParams) {
                    taskInterface.gradeAnswer({
                        task: task_token,
                        answer: answer_token,
                        min_score: taskParams.minScore,
                        max_score: taskParams.maxScore,
                        no_score: taskParams.noScore,
                        success: function(res) {
                            callback(res.score, res.message, res.token)
                        },
                        error: function(msg) {
                            console.error(msg)
                            error && error()
                        }
                    })
                })
            },
            function(msg) {
                console.error(msg)
                error && error()
            }
        )
    }


    task.getLevelGrade = function(answer, answerToken, callback, gradedLevel) {
        task.gradeAnswer(answer, answerToken, callback);
    }

}