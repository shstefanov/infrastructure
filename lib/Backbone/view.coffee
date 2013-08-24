selfClosingTags = [
  "area":       true
  "base":       true
  "basefont":   true
  "br":         true
  "hr":         true
  "input":      true
  "img":        true
  "link":       true
  "meta":       true
]


class View
  constructor: (options)->
    {@template} = options
    wrapper_tag = options.tagName || "div"
    `var wrapper_class = options.className? " class=\""+(options.className)+"\"" : ""`
    wrapper_attributes = options.attributes || {}
    attrs = ""
    Object.keys(wrapper_attributes).forEach (attrName)-> attrs+=" "+attrName+"=\""+wrapper_attributes[attrName]+"\""
    @wrapper_begin = "<#{wrapper_tag}#{wrapper_class}#{attrs}>"
    @wrapper_end = "</#{wrapper_tag}>"

  render: (data)->
    return @wrapper_begin+@template(data)+@wrapper_end

module.exports = View
