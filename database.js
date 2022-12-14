const sqlite = require('sqlite-async');

class Database {
	constructor(db_file) {
		this.db_file = db_file;
		this.db = undefined;
	}
	
	async connect() {
		this.db = await sqlite.open(this.db_file);
	}

	async migrate() {
		return this.db.exec(`
            DROP TABLE IF EXISTS wonderland;

            CREATE TABLE IF NOT EXISTS wonderland (
                id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                alice      VARCHAR(255) NOT NULL UNIQUE,
                size       INTEGER NOT NULL,
                shrinked   BOOLEAN NOT NULL
            );
        `);
	}

	async welcomeAlice(alice) {
		return new Promise(async (resolve, reject) => {
			try {
				let stmt = await this.db.prepare('INSERT INTO wonderland (alice, size, shrinked) VALUES ( ?, 1, 0)');
				resolve((await stmt.run(alice)));
			} catch(e) {
				reject(e);
			}
		});
	}

	async getAliceData(alice) {
		return new Promise(async (resolve, reject) => {
			try {
				let stmt = await this.db.prepare('SELECT * FROM wonderland WHERE alice = ?');
				resolve(await stmt.get(alice));
			} catch(e) {
				reject(e);
			}
		});
	}

	async setShrinked(alice) {
		return new Promise(async (resolve, reject) => {
			try {
				let stmt = await this.db.prepare('UPDATE wonderland SET shrinked = 1 WHERE alice = ?');
				resolve(await stmt.get(alice));
			} catch(e) {
				reject(e);
			}
		});
	}

	async makeSmall(alice) {
		return new Promise(async (resolve, reject) => {
			try {
				let stmt = await this.db.prepare('UPDATE wonderland SET size = size * 2 WHERE alice = ?');
				resolve(await stmt.get(alice));
			} catch(e) {
				reject(e);
			}
		});
	}
}

module.exports = Database;