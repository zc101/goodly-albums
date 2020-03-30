// Visitor counter

const db = require('../manage/db');

async function bumpVisitors(ip) {
  if (ip) {
    // Use a regex match to be safe
    const ipExpr = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    let ipList = ip.match(ipExpr);

    if (ipList) {
      try {
        let ipAddr = ipList[0];

        let ipSearch = await db.select('visits_count').from('visitors').where('ip_addr', ipAddr);
        if (ipSearch && ipSearch.length) {
          // Found an existing entry; update it
          await db('visitors')
          .where('ip_addr', ipAddr)
          .update({visits_count: ipSearch[0].visits_count + 1});
        }
        else {
          // Insert a new IP entry
          let visitorRow = {
            ip_addr: ipAddr
          , visits_count: 1
          };
          await db('visitors').insert(visitorRow);
        }

        let results = await db('visitors').count('* as unique_visitors').sum('visits_count as total_visits');
        if (results && results.length) {
          let vals = {
            visitors: results[0].unique_visitors
          , visits: results[0].total_visits
          };

          return vals;
        }
      }
      catch(err) {
        console.error("getVisitors: Caught while running queries:");
        console.error(err);
      }
    }
    else // IP regex match failed
      console.error("getVisitors: Received bad IP '" + ip + "'");
  }
  else // !ip
    console.error("getVisitors: No IP given");

  return null;
}


// Route handler
module.exports = async function (req, res) {
  let vals = await bumpVisitors(req.ip);
  if(vals)
    res.send('This site has been viewed ' + vals.visits + ' times by ' + vals.visitors + ' visitors.');
  else
    res.status(400).send();
};
