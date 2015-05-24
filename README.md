Log
===
    env.do("log.info",    ["subject", "message"], [callback] );
    env.do("log.sys",     ["subject", "message"], [callback] );
    env.do("log.warning", ["subject", "message"], [callback] );
    env.do("log.notice",  ["subject", "message"], [callback] );
    env.do("log.error",   ["subject", "message"], [callback] );
    // Outputs:
    [info]  [2015-05-23 22:18:12][subject].......................... message          
    [sys]   [2015-05-23 22:18:12][subject].......................... message
    [warn]  [2015-05-23 22:18:12][subject].......................... message
    [notice][2015-05-23 22:18:13][subject].......................... message
    [error] [2015-05-23 22:18:13][subject].......................... message
