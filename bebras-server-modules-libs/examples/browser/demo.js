(function() {
    function init() {
        var tools = BebrasTools.connect({
            host: $('#host').val()
        })

        var token = signJWT({
            platformName: $('#platform_name').val(),
            itemUrl: $('#task_url').val(),
            randomSeed: $('#task_random_seed').val(),
        }, $('#token_key').val())

        assetsPublisher = tools.assetsPublisher({
            task: token
        })

        dataStore = tools.dataStore({
            task: token
        })
    }


    var result = {
        show: function(title, text, style) {
            $('#result').show()
            $('#result').attr('class', 'alert alert-' + style).show()
            $('#result strong').text(title)
            $('#result div').text(text)
        },

        hide: function() {
            $('#result').hide()
        },

        sending: function() {
            result.show('Sending...', '', 'info')
        },

        success: function(text) {
            result.show('Success', text, 'success')
        },

        error: function(text) {
            result.show('Error', text, 'danger')
        }
    }

    // UI
    $('[role=tablist]').find('a').click(function() {
        result.hide()
    })
    $(document).ready(function() {
        $('#init').click(init).trigger('click')
    })

    /*
    / assetsPublisher
    */
    $('#asset-action-add-send').click(function() {
        var input = $('#asset-action-add-file')[0]
        if(!input.files || !input.files[0]) {
            result.error('Select file')
            return
        }
        result.sending()
        assetsPublisher.add({
            key: $('#asset-action-add-key').val(),
            data: BebrasTools.dataReader(input.files[0]),
            success: result.success,
            error: result.error
        })
    })

    $('#asset-action-url-send').click(function() {
        result.sending()
        assetsPublisher.getUrl({
            key: $('#asset-action-url-key').val(),
            success: result.success,
            error: result.error
        })
    })

    $('#asset-action-delete-send').click(function() {
        result.sending()
        assetsPublisher.delete({
            key: $('#asset-action-delete-key').val(),
            success: result.success,
            error: result.error
        })
    })

    $('#asset-action-empty-send').click(function() {
        result.sending()
        assetsPublisher.empty({
            success: result.success,
            error: result.error
        })
    })


    /*
    / dataStore
    */
    $('#data-action-write-send').click(function() {
        result.sending()
        dataStore.write({
            key: $('#data-action-write-key').val(),
            value: $('#data-action-write-value').val(),
            duration: $('#data-action-write-duration').val(),
            success: result.success,
            error: result.error
        })
    })

    $('#data-action-read-send').click(function() {
        result.sending()
        dataStore.read({
            key: $('#data-action-read-key').val(),
            success: result.success,
            error: result.error
        })
    })

    $('#data-action-delete-send').click(function() {
        result.sending()
        dataStore.delete({
            key: $('#data-action-delete-key').val(),
            success: result.success,
            error: result.error
        })
    })

    $('#data-action-empty-send').click(function() {
        result.sending()
        dataStore.empty({
            success: result.success,
            error: result.error
        })
    })
})()