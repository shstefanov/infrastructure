# Serverside view prototype for view tree module
# Imitates serverside Backbone View 

class View

  constructor: (options)->
    # options is backbone view prototype hashmap
    {@template, @appendTo, @options, @router, @getter, @javascripts, @styles} = options
    @initWrapper options
    @initContainer options if @appendTo

  extendData: (data)->
    data = data || {}
    for key, val of @
      if !data.hasOwnProperty(key)
        data[key] = val
    return data
    
  render: (data, cb)->
    data = @extendData()
    if typeof @getter == "function"
      @getter data, (async_data)=> 
        cb null, @wrapper_begin+@template(async_data)+@wrapper_end
    else
      cb null, @wrapper_begin+@template(data)+@wrapper_end

  append: (html, child_html)->
    throw new Error "Can't append - view don't have container." if !@appendTo
    return html.replace @container_begin+@container_end, @container_begin+child_html+@container_end

  # Initializing appendTo container
  initContainer: (options)->
    
    tagName = @appendTo.match(/(^[a-z]+)/i)
    `tagName = tagName? tagName[1] : "div"`
   
    tagId = @appendTo.match(/^#([a-zA-Z0-9\-_]+)/)
    `tagId = tagId? " id=\""+tagId[1]+"\"" : ""`

    className = @appendTo.match(/\.([a-zA-Z0-9\-_]+)/g)
    
    if Array.isArray className
      classes = []
      className.forEach (class_with_dot)->
        classes.push class_with_dot.replace(".", "")
      className = classes
    `className = className? " class=\""+className.join(" ")+"\"" : ""`

    @container_begin = "<#{tagName}#{tagId}#{className}>"
    @container_end = "</#{tagName}>"

  # Wrapper imitates Backbone view main DOM element
  initWrapper: (options)->
    if options.nowrap == true
      @wrapper_begin = @wrapper_end = ""
    else
      wrapper_tag = options.tagName || "div"
      `var wrapper_class = options.className? " class=\""+(options.className)+"\"" : ""`
      wrapper_attributes = options.attributes || {}
      attrs = ""
      Object.keys(wrapper_attributes).forEach (attrName)-> attrs+=" "+attrName+"=\""+wrapper_attributes[attrName]+"\""
      @wrapper_begin = "<#{wrapper_tag}#{wrapper_class}#{attrs}>"
      @wrapper_end = "</#{wrapper_tag}>"

module.exports = View
