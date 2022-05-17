const express = require('express')
const bodyParser = require("body-parser");
const config = require("./config.json");
const app = express()
const port = config.port;
const lca = require("./lca");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});

app.get(`${config.api_path}/directory/:uuid`, (req, res) => {
	const uuid = req.params.uuid;
	let personal1 = req.query.personal1;
	let personal2 = req.query.personal2;

	if (personal1 > personal2) {
		const tmp = personal1;
		personal1 = personal2;
		personal2 = tmp;
	}

	const result = lca.find(uuid, personal1, personal2);

	if (result) {
		res.send({
			success: true,
			data: {
				common_manager_id: result,
			},
		});
	}
	else {
		res.status(404).send({
			success: false,
			error: "Not Found!"
		});
	}
});

app.post(`${config.api_path}/directory`, (req, res) => {
	const data = req.body;
	const uuid = lca.build(data.relations);
	res.send({
		success: true,
		data: {
			uuid: uuid,
		},
	});
});