Utils =
  jsonp_request: (src, options) ->
    callback_name = options.callback || 'jsonp_callback'
    on_success = options.onSuccess || ->
    on_timeout = options.onTimeout || ->
    timeout = options.timeout || 10

    timeout_trigger = window.setTimeout ->
      window[callback_name] = ->
      on_timeout()
    , timeout * 1000

    window[callback_name] = (data) ->
      window.clearTimeout timeout_trigger
      on_success data

    delimeter = if src.indexOf("?") < 0 then '?' else '&'
    script = document.createElement('script')
    script.type = 'text/javascript'
    script.id = 'shareaholic_ajax'
    script.async = true
    script.src = src + delimeter + "callback=" + callback_name

    document.getElementsByTagName('head')[0].appendChild(script)