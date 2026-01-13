import { readdirSync, readFileSync, statSync } from "fs";
import axios from "axios";
import { join, parse } from "path";
import chalk from "chalk";
import { BUILD_PATH } from "./consts";

function readdirRecursive(dir) {
	const files = [];
	const dirs = readdirSync(dir);

	dirs.forEach((file) => {
		const filePath = join(dir, file);
		const stats = statSync(filePath);

		if (stats.isDirectory()) {
			files.push(...readdirRecursive(filePath));
		} else {
			files.push(filePath);
		}
	});

	return files;
}

const getName = (content, type, objectName, code) => {
	if(type == "custom_web_template") {
		return content.split('\n')[1].replace("//","") ? objectName : `Шаблон Backend ${code}`
	} else {
		return content.split('\n')[0].includes("//") ? objectName : `${code}`
	}
}

export const sendFiles = async (path?: string) => {
	const { DEPLOYER_LOGIN, DEPLOYER_PASSWORD, DEPLOYER_HOST, HOOK_CODE, IS_FILE, START_AGENT_AFTER_SAVE, WEB_DIRECTORY, xAuthId } = process.env;

	const authorizationHeader = `Basic ${Buffer.from(
		`${DEPLOYER_LOGIN}:${DEPLOYER_PASSWORD}`
	).toString("base64")}`;

	let filesBuild = [];

	if(path) {
		filesBuild = [path];
	} else {
		filesBuild = readdirRecursive(BUILD_PATH);
	}

	console.log(chalk.yellowBright(`\n🔁 Found ${filesBuild.length} files for deploying`));

	let errors = 0

	for (const x of filesBuild) {
		const time = Number(new Date());

		console.log(chalk.yellowBright(`\n🕒 File ${x} deploying...`));

		const content = readFileSync(x, "utf-8");
		const templateType = process.env.WORK_MODE;
		const { name: code } = parse(x);

		let objectName = ""

		if(templateType == "custom_web_template") {
			objectName = content.split('\n')[1].replace("//","");
		} else {
			objectName = content.split('\n')[0].replace("//","");
		}

		await axios.put(`${DEPLOYER_HOST}/custom_web_template.html?object_code=${HOOK_CODE}`, {
				code: code,
				type: templateType,
				content: content,
				isFile: IS_FILE,
				name: getName(content, templateType, objectName, code),
				isStart: START_AGENT_AFTER_SAVE,
				directory: WEB_DIRECTORY,
			}, { headers: { Authorization: authorizationHeader, Cookie: `x-auth-id=${xAuthId}`,
				'Content-Type': 'application/json' } }
		)
		.then(({ data }) => {
			console.log(
				chalk.greenBright( `☑️  File ${x} deployed [${Number(new Date()) - time}ms]\n`)
			);

			console.log(chalk.greenBright(`✅ Server response: ${data} `));
		})
		.catch(({ response }) => {
			errors++;
			console.log(
				chalk.redBright( `❌ File ${x} deployed but server returns error [${Number(new Date()) - time}ms]:\n`)
			);
			console.error(chalk.redBright(response.data+"\n"));
		});
	};

	errors === 0 && console.log(
		chalk.greenBright(`✅ Deploy complete [${new Date().toLocaleTimeString()}] successfully\n`)
	);
	errors > 0 && console.log(
		chalk.yellowBright(`⚠️  Deploy complete with some errors(${errors}) [${new Date().toLocaleTimeString()}]\n`)
	);
};
