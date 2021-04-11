(function(exports){

    exports.connect = function(config) {


        function post(url, data, success, error) {
            if(typeof require !== 'undefined') {
                var fetch = require('isomorphic-fetch')
            }
            if(typeof fetch !== 'undefined') {
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then(function(response) {
                    return response.json()
                }).then(function(json) {
                    success(json)
                }).catch(function(ex) {
                    error(ex)
                })
            } else if(typeof $ !== 'undefined') {
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: data,
                    success: success,
                    error: error,
                    dataType: 'json'
                })
            } else {
                console.error('isomorphic-fetch or jQuery not found')
            }
        }


        function prepareRequestParams(service_data, params, callback) {
            var res = {
                callbacks: {
                    done: function(res) {
                        console.log('BebrasServer response', res)
                    },
                    error: function(res) {
                        console.error('BebrasServer error', res)
                    }
                },
                data: service_data
            }

            var data_key = false
            for(var k in params) {
                if(params[k] instanceof Base64Reader) {
                    var data_key = k
                } else if(typeof params[k] == 'function') {
                    res.callbacks[k] = params[k]
                } else {
                    res.data[k] = '' + params[k]
                }
            }

            if(data_key) {
                params[data_key].read(function(data) {
                    res.data[data_key] = data
                    callback(res)
                })
            } else {
                callback(res)
            }
        }


        function createRequest(service, action, options) {
            options = options || {}
            return function(params) {
                prepareRequestParams(
                    {
                        action: action,
                        task: params.task || options.task
                    },
                    params,
                    function(req) {
                        post(
                            config.host + '/' + service,
                            req.data,
                            function(res) {
                                if(res && res.success) {
                                    req.callbacks.success(res.data)
                                } else {
                                    req.callbacks.error(res.error)
                                }
                            },
                            function(res) {
                                req.callbacks.error('Server not responding')
                            }
                        )
                    }
                )
            }
        }



        var DataStore = function(options) {
            this.write = createRequest('data', 'write', options)
            this.read = createRequest('data', 'read', options)
            this.delete = createRequest('data', 'delete', options)
            this.empty = createRequest('data', 'empty', options)
        }

        var AssetsPublisher = function(options) {
            this.add = createRequest('assets', 'add', options)
            this.getUrl = createRequest('assets', 'url', options)
            this.delete = createRequest('assets', 'delete', options)
            this.empty = createRequest('assets', 'empty', options)
        }

        var TaskInterface = function(options) {
            this.taskData = createRequest('tasks', 'taskData', options)
            this.taskHintData = createRequest('tasks', 'taskHintData', options)
            this.gradeAnswer = createRequest('tasks', 'gradeAnswer', options)
        }



        return {
            taskInterface: function(options) {
                return new TaskInterface(options)
            },

            assetsPublisher: function(options) {
                return new AssetsPublisher(options)
            },

            dataStore: function(options) {
                return new DataStore(options)
            }
        }

    }




    function Base64Reader(file) {

        function browserReader(callback) {
            var reader  = new FileReader()
            reader.onloadend = function() {
                callback(reader.result)
            }
            reader.readAsDataURL(file)
        }

        function serverReader(callback) {
            var fs = require('fs')
            var mime = require('mime')
            fs.readFile(file, { encoding: 'base64'}, function(error, content) {
                if(error) {
                    return console.error(error)
                }
                var content_type = mime.getType(file)
                callback('data:' + content_type + ';base64,' + content)
            })
        }

        this.read = typeof window !== 'undefined' ? browserReader : serverReader;
    }


    exports.dataReader = function(file) {
        return new Base64Reader(file)
    }


})(typeof exports === 'undefined' ? this['BebrasTools'] = {} : exports)