const fs             = require('fs');
const express        = require('express');
const router         = express.Router();
const AuthMiddleware = require('../middleware/AuthMiddleware');

let db;

router.get('/', (req, res) => {
	return res.render('index.html');
});

const checkAlice = async (req, alice) => {
	if (alice === undefined) {
		await db.welcomeAlice(req.data.alice);
		alice = { alice: req.data.alice, size: 1, shrinked: 0 };
	}
	return alice;
}

router.post('/api/useKey', AuthMiddleware, async (req, res) => {
	let aliceData = await db.getAliceData(req.data.alice);
	aliceData = await checkAlice(req, aliceData);
	if (aliceData.size < 16) return res.status(403).send("Too big!");
	let flag = fs.readFileSync('flag').toString();
	res.status(200).send(`You may enter! Your size is ${aliceData.size}. Flag: ${flag}`);
});

router.post('/api/drink', AuthMiddleware, async (req, res) => {
	let aliceData = await db.getAliceData(req.data.alice);
	aliceData = await checkAlice(req, aliceData);
	if (aliceData.shrinked) { 
		return res.status(401).send("Can't drink again!");
	}
	try {
		await db.makeSmall(aliceData.alice);
		await db.setShrinked(aliceData.alice);
		aliceData = await db.getAliceData(req.data.alice);
		res.status(200).send("Alice shrinked!");
	} catch (e) {
		res.status(500).send("Failed to shrink!");
	}
});

router.get('/api/getsize', AuthMiddleware, async (req, res) => {
	let aliceData = await db.getAliceData(req.data.alice);
	aliceData = await checkAlice(req, aliceData);
	return res.status(200).send({ "size":aliceData.size, "shrinked":aliceData.shrinked});
});

router.get('/api/reset', async (req, res) => {
	res.clearCookie('session');
	res.status(200).send("Session was reset");
});

module.exports = database => {
	db = database;
	return router;
};
