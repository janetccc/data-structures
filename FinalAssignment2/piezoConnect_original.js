var http = require('http');
var pg = require('pg');

// supply connection string through an environment variable
var conString = "postgres://janet:newyorkny@data-structures.ceea2ymizbfi.us-west-2.rds.amazonaws.com:5432/postgres";
// var conString = process.env.DBHOST;

//postgres://janet:newyorkny@data-structures-janet.clvorhidqxm5.us-east-1.rds.amazonaws.com:5432/postgres

var server = http.createServer(function(req, res) {

    // get a pg client from the connection pool
    pg.connect(conString, function(err, client, done) {

        var handleError = function(err) {
            // no error occurred, continue with the request
            if (!err) return false;

            // An error occurred, remove the client from the connection pool.
            // A truthy value passed to done will remove the connection from the pool
            // instead of simply returning it to be reused.
            // In this case, if we have successfully received a client (truthy)
            // then it will be removed from the pool.
            if (client) {
                done(client);
            }
            res.writeHead(500, {'content-type': 'text/plain'});
            res.end('An error occurred');
            return true;
        };

        // handle an error from the connection
        if (handleError(err)) return;

        // get the total number of visits today (including the current visit)
        // client.query('SELECT COUNT(*) AS count FROM buttondata;', function(err, result) {
        client.query('SELECT * FROM sensor;', function(err, result) {

            // handle an error from the query
            if (handleError(err)) return;

            // return the client to the connection pool for other requests to reuse
            done();
            res.writeHead(200, {'content-type': 'text/html'});
            
            var allData = JSON.stringify(result.rows);
            
            for (var i = 0; i < allData.length; i++) { 
                var sensor = JSON.stringify(result.rows[i].sensorval);
                var time = JSON.stringify(result.rows[i].datetime);
                res.write('<div style="height: 20px; width: 20px;">' + sensor + '</div>');
                res.write('<p>' +time + '</p>');
            }
            // // res.write('<h1>The button has been pressed ' + time + ' times.</h1>');
            // res.write('<h1>The button has been pressed ' + result.rows.length + ' times.</h1>');
            res.end();
        });
    });
});

server.listen(process.env.PORT);