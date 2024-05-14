const neo4j = require('neo4j-driver');
require('dotenv').config();

async function createSession() {
    const uri = process.env.NEO4J_URL;
    
    // Create a Neo4j driver instance
    const driver = neo4j.driver(uri, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS));

    // Create a session
    const session = driver.session({ database: 'study' });

    return { session, driver };
}
module.exports = createSession;
