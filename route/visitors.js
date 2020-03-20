// Visitor counter

const db = require('../lib/db');

function bumpVisitors(ip, cb) {
  if (ip) {
    // Use a regex match to be safe
    const ipExpr = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    let ipList = ip.match(ipExpr);

    if (ipList) {
      let ip = db.escape(ipList[0]); // Some extra paranoia
      let qUpdate = ' \
        IF EXISTS(SELECT visitor_id FROM visitors WHERE ip_addr = ' + ip + ') THEN \
          UPDATE visitors \
            SET visits_count = visits_count + 1 \
            WHERE ip_addr = ' + ip + '; \
        ELSE \
          INSERT INTO visitors \
            (ip_addr, visits_count) \
          VALUES \
            (' + ip + ', 1); \
        END IF;';

      let qVisitors = 'SELECT COUNT(*) AS unique_visitors FROM visitors;';
      let qVisits = 'SELECT SUM(visits_count) AS total_visits FROM visitors;';

      // Cascade queries using a single connection
      db.getConnection(function(err, connection) {
        if (err) {
          console.error(error);
          cb(null);
          return;
        }

        try {
          connection.query(qUpdate, function (err, results, fields) {
            if (err) throw err;
            connection.query(qVisitors, function (err, results, fields) {
              if (err) throw err;
              let unique_visitors = results[0].unique_visitors;
              connection.query(qVisits, function (err, results, fields) {
                if (err) throw err;
                let vals = {
                  visitors: unique_visitors
                , visits: results[0].total_visits
                };

                connection.release();
                cb(vals);
              });
            });
          });
        }

        catch(err) {
          connection.release();
          console.error(error);
          cb(null);
          return;
        }
      });
    }
    else { // IP regex match failed
      console.error("getVisitors: Received bad IP '" + ip + "'");
      cb(null);
    }
  }
  else { // !ip
    console.error("getVisitors: No IP given");
    cb(null);
  }
}


// Route handler
module.exports = function (req, res) {
  bumpVisitors(req.ip, function(vals) {
    if(vals)
      res.send('This site has been viewed ' + vals.visits + ' times by ' + vals.visitors + ' visitors.');
    else
      res.status(400).send();
  });
};
