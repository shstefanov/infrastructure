# viewOptions = 
#   app:@app
#   router:@router
#   req:req
#   res:res
#   next:next


class View

  constructor: (options)->
    { @app, @router, @req, @res, @next, @send, @model, @collection, @parent } = options
    @nests = {}
    if @appendTo
      if Array.isArray(@appendTo)
        @createAppendCache(sel) for sel in @appendTo
      else
        @createAppendCache(@appendTo)
    return @

  createAppendCache: (selector)->
    if !@mainAppend
      @mainAppend = selector
    
    find = ""
    if selector.indexOf("#") == 0
      #is id selector
      identifier = selector.replace("#", "")
      find = 'id="'+identifier+'"'
    else if selector.indexOf(".") == 0
      #is class selector
      identifier = selector.replace(".", "")
      find = 'class="'+identifier+'"'
    else
      #is tag
      find = '<#{selector}"'

    @nests[selector] = {
      $dom: find
      queue: []
    } #initializes the appendTo options
    return @


  append: (sel, v)-> #appends view to apropriate queue
    if !view
      view = sel
    else
      view = v
    selector = @nests[sel] || @nests[view.toAppend] || @mainAppend
    view.parent = @
    @nests[selector].queue.push(view)
    return @

  get: (cb)->
    if @getter
      @getter (err)=>
        if err
          cb(err)
        else
          @getChilds(cb)
    else
      @getChilds(cb)

  getChilds: (cb)->
    try
      error = false
      l1counter = Object.keys(@nests).length
      if l1counter == 0 || Object.keys(@nests).length == 0
        cb()
        return
      l1ready = =>
        l1counter--
        cb() if l1counter < 1

      for i, selector of Object.keys @nests
        break if error

        value = @nests[selector]
        l2counter = value.queue.length
        if l2counter == 0
          l1ready()
          continue
        l2ready = =>
          l2counter--
          l1ready() if l2counter < 1
        for index, view of value.queue
          break if error
          view.get (err)=>
            if err
              error = true
              cb(err)
            else
              l2ready()
    catch err
      error = true
      cb err

  render: (cb)->
    try
      error = false
      layout_code = @template(@)
      l1counter = Object.keys(@nests).length
      if l1counter == 0
        cb null, layout_code
        return
      l1ready = =>
        l1counter--
        if l1counter == 0
          cb null, layout_code

      for index, selector of Object.keys @nests
        if error
          break
        value = @nests[selector]
        childs_code = ""
        l2counter = value.queue.length
        if l2counter == 0
          break
        l2ready = (rendered_code)=>
          l2counter--
          childs_code += rendered_code
          if l2counter == 0
            layout_code = @appendCode(value, layout_code, childs_code)
            l1ready()
        for i, view of value.queue
          if error
            break
          childs_code+= view.render (err, code)=>
            if err
              error = true
              cb err
            else
              l2ready(code)
    catch err
      cb {status:500,body:err.toString()}

  appendCode:(appending, layout, code)-> #returns
    length = appending.$dom.length
    pointer = layout.indexOf(appending.$dom)
    end = pointer+appending.$dom.length+1
    buff = ""
    throw new Error("Can't find node "+appending.$dom) if pointer < 0
    # for p in [pointer...length] by 1
    c = ""
    until c is ">"
      c = layout.charAt(pointer)
      buff +=c
      pointer++
    result = layout.replace(buff, buff+code)
    return result

module.exports = View
