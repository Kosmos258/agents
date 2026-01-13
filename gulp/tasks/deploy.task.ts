import { sendFiles } from "../sendFiles";

export const deploy = async (done) => {
	await sendFiles()
	done();
};
