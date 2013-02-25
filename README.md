Service definition:
Asuming the file name is my_service.js
The service name will be the name of file, just without the .js extencion

    module.exports = {
      auth:function(data){ //Check authorization here
        //Accessible objects:
        //this.socket
        //this.app
        //this.session
        //this.db
        //this.models - node.js orm models

        //this.emit(data) - function 
        //this.next(data)

        //If you want to return error, set data.meta = "error" and data.body = {field:"detected error"} or {error:"some error"}

        //If you want to return success, set data.meta = "success" and data.body = object_to_be_returned

        //It also have this.service_index() for internal use
      },

      custom_method: function(data){
        //Do your staff here and return the data to the client
        this.emit({
          action:"custom_method", 
          body:your_data, 
          meta:"success/error or custom",
          reqId:data.reqId
        });
      }
    }

Clientside usage of the service will look like:

    app.services.my_service.custom_method(data); //Sending data without callback

    app.services.my_service.custom_method(data, function(err, data){ //With callback
      //Do your staff with your data here
    });

    app.services.my_service.custom_method(function(err, data){ //Passing only function will set eventlistener - client can listen if server streams some data for this action
      //Do your staff with your data here
    });
