Example 7.24. Sharing Session Data between Express and socket.io

var io = require('socket.io');
var express = require('express');
var app = express.createServer();
var store = new express.session.MemoryStore;
var utils = require('connect').utils;
var Session = require('connect').middleware.session.Session;

app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.session({secret: 'secretKey', key: 'express.sid', store: store}));
  app.use(function(req, res) {
    var sess = req.session;
    res.render('socket.jade', {
      email: sess.email || ''
    });
  });
});

// Start the app
app.listen(8080);

var sio = io.listen(app);

sio.configure(function() {
  sio.set('authorization', function (data, accept ) {
    var cookies = utils.parseCookie(data.headers.cookie);
    data.sessionID = cookies['express.sid'];
    data.sessionStore = store;
    store.get(data.sessionID, function(err, session) {
      if ( err || !session ) {
        return accept("Invalid session", false);
      }
      data.session = new Session(data, session);
      accept(null,true);
    });
  });

  sio.sockets.on('connection', function(socket) {
    var session = socket.handshake.session;
    socket.join(socket.handshake.sessionId);
    socket.on('emailupdate', function(data) {
      session.email = data.email;
      session.save();
      sio.sockets.in(socket.handshake.sessionId).emit('emailchanged', {
        email: data.email
      });
    });
  });
});

This example uses Connect, a middleware framework that 
simplifies common tasks such as session management, working 
with cookies, authentication, caching, performance metrics, 
and more. In this example, the cookie and session tools are 
used to manipulate user data. socket.io is not aware of Express 
and vice-versa, so socket.io is not aware of sessions when 
the user connects. However, both components need to use the 
Session object to share data - this is an excellent demonstration 
of the Separation of Concerns[19] (SoC) programming paradigm.

This example demonstrates using socket.io's authorization even 
after connection to parse the user's headers. Since the session ID 
is passed to the server as a cookie, you can use this value to 
read Express's session ID.

This time, the Express setup include a line for session management. 
The arguments used to build the session manager are a secret key 
(used to prevent session tampering), the session key (used to store 
  the session ID in the web browser's cookie), and a store object 
(used to store session data for later retrieval). The store object is the most important; instead of letting Express create and manage the memory store, this example creates a variable and passes it into Express. Now the session store is available to the entire application, not just Express.

Next, a route is created for the default (/) web page. In previous 
socket.io examples, this function was used to output HTML directly 
to the web browser. This time Express will render the contents of 
views/socket.jade to the web browser. The second variable in render() 
is the email address stored in the session, which is interpreted and 
used as the default textfield value in the earlier client example.

The real action happens in socket.io's 'authorization' event. When 
the web browser connects to the server, socket.io performs an 
authentication reoutine to determine whether the connection should 
proceed. The criteria in this case is a valid session, which was 
provided by Express when the user loads the web page. Socket.io 
reads the session ID from the request headers using parseCookie 
(part of the Connect framework), loads the session from the memory 
store, and creates a Session object with the information it receives.

The data passed to the authorization event is stored in the socket's 
handshake property; therefore saving the session object into the data 
object makes it available later in the socket's lifecycle. When creating 
the Session object, use the memory store that was created and passed 
into Express; now both Express and socket.io are able to access the 
same session data—Express by manipulating the req.session object, and 
sockets by manipulating the socket.handshake.session object.

Assuming all goes well, calling accept() authenticates the socket and 
allows the connection to continue.

Now suppose the user accesses your site from more than one tab in 
their web browser. There would be two connections from the same session 
created; how would you handle events that need to update connected sockets? 
Socket.io provides support for rooms, or channels if you prefer. By initiating 
a join() command with sessionId as argument in the previous example, the 
socket transparently created a dedicated channel you can use to send messages 
to all connections currently in use by that user. Logging out is an obvious 
use for this technique: when the user logs out from one tab, the logout 
command will instantly transmit to all the others, leaving all of the 
user's views of the application in a consistent state

Warning
Always remember to execute session.save() after changing session data. 
Otherwise, the changes will not be reflected on subsequent requests.


