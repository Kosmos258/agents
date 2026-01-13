import axios from "axios";
import chalk from "chalk";

const { DEPLOYER_LOGIN, DEPLOYER_PASSWORD, DEPLOYER_HOST, HOOK_CODE, xAuthId } = process.env;

const authorizationHeader = `Basic ${Buffer.from(
	`${DEPLOYER_LOGIN}:${DEPLOYER_PASSWORD}`
).toString("base64")}`;

export const ping = async () => {
	const time = Number(new Date());

	await axios.put(`${DEPLOYER_HOST}/custom_web_template.html?object_code=${HOOK_CODE}`, {
		method: "ping",
	}, { headers: { Authorization: authorizationHeader, Cookie: `x-auth-id=${xAuthId}` } })
	.then(({ data }) => {
		console.log(
			chalk.greenBright( `☑️  Success send [${Number(new Date()) - time}ms]\n`)
		);

		if(data != "Server available") {
			console.log(chalk.redBright(`❌ Server response: ${data} \n`));
			console.log(chalk.redBright(`if data contains "<script>" check auth settings \n`));
		} else {
			console.log(chalk.greenBright(`✅ Server response: ${data} \n`));
		}
	})
	.catch((e) => {
		console.log(
			chalk.redBright( `❌ Server Error [${Number(new Date()) - time}ms]:\n`)
		);
		console.error(chalk.redBright(`Request URL: ${e.config.url}`));
		console.error(chalk.redBright(`Headers: ${JSON.stringify(e.config.headers)}`));
		console.error(chalk.redBright("Reponse code: " + e.code+"\n"));
		"data" in e && console.error(chalk.redBright(e.data+"\n"));
	});
}