import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true 
    });

    try {
        const dbDir = path.join(process.cwd(), '../database');
        const files = fs.readdirSync(dbDir).sort();

        for (const file of files) {
            if (!file.endsWith('.sql')) continue;

            const sql = fs.readFileSync(path.join(dbDir, file), 'utf8');
            
            if (sql.trim().length === 0) {
                console.log(`Skipping: ${file} (Empty file)`);
                continue;
            }

            console.log(`Executing: ${file}`);
            
            const queries = [];
            let currentDelimiter = ';'; 
            let currentQuery = '';

            const lines = sql.split('\n');
            for (let line of lines) {
                const trimmedLine = line.trim();

                if (!trimmedLine && !currentQuery.trim()) continue;

                if (trimmedLine.toUpperCase().startsWith('DELIMITER')) {
                    currentDelimiter = trimmedLine.split(/\s+/)[1];
                    continue; 
                }

                currentQuery += line + '\n';

                if (trimmedLine.endsWith(currentDelimiter)) {
                    let cleanQuery = currentQuery.trim();
                    
                    cleanQuery = cleanQuery.substring(0, cleanQuery.length - currentDelimiter.length);
                    
                    if (cleanQuery.trim()) {
                        queries.push(cleanQuery);
                    }
                    currentQuery = ''; 
                }
            }

            if (currentQuery.trim()) {
                queries.push(currentQuery.trim());
            }

            for (const q of queries) {
                try {
                    await connection.query(q);
                } catch (err) {
                    if (err.code !== 'ER_EMPTY_QUERY') {
                        console.error(`\nError in this SQL code block:\n${q}\n`);
                        throw err; 
                    }
                }
            }
        }
        console.log('\nDatabase and Triggers initialized successfully!');
    } catch (error) {
        console.error('\nError initializing database:', error.message);
    } finally {
        await connection.end();
        process.exit(); 
    }
}

runMigration();