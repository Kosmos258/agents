/* --- types --- */
interface IError {
	code: number;
	message: string;
}

/* --- system --- */
const GLOBAL = {
	IS_DEBUG: tools_web.is_true(Param.IS_DEBUG)
};

const logConfig = {
	code: "globex_log",
	type: "AGENT",
	agentId: "7216471226107953028"
};

EnableLog(logConfig.code, GLOBAL.IS_DEBUG);

/**
 * Вывод сообщения в журнал
 * @param {string} message - Сообщение
 * @param {string} type - Тип сообщения info/error
 */
function log(message: string, type?: string) {
	type = IsEmptyValue(type) ? "INFO" : StrUpperCase(type);

	if (ObjectType(message) === "JsObject" || ObjectType(message) === "JsArray" || ObjectType(message) === "XmLdsSeq") {
		message = tools.object_to_text(message, "json");
	}

	const log = `[${type}][${logConfig.type}][${logConfig.agentId}]: ${message}`;
	if (LdsIsServer) {
		LogEvent(logConfig.code, log);
	} else if (GLOBAL.IS_DEBUG) {
		// eslint-disable-next-line no-alert
		alert(log);
	}
}

/* --- utils --- */

/**
 * Создает поток ошибки с объектом error
 * @param {object} source - источник ошибки
 * @param {object} errorObject - объект ошибки
 */
function HttpError(source: string, errorObject: IError) {
	throw new Error(source + " -> " + errorObject.message);
}

/* --- logic --- */
function getBills(): any {
	try {
		const getBillsQuery =
			`for $elem in accounts where $elem/currency_type_id = 'ball' and $elem/status = 'active' return $elem`;

		const objArray = tools.xquery(getBillsQuery);

		return objArray;
	} catch (e) {
		HttpError("getBills", e);
	}
}

function closeBill() {
	try {
		const bills = getBills();

		for (const bill of bills) {
			const billDoc: AccountDocument = tools.open_doc(bill.id);

			const teBillDoc = billDoc.TopElem;

			teBillDoc.status.Value = "close";

			billDoc.Save();
		}
	} catch (e) {
		HttpError("closeBill", e);
	}
}

/* --- start point --- */
function main() {
	try {
		closeBill();
	} catch (error) {
		log("Выполнение прервано из-за ошибки: main -> " + error.message, "error");
	}
}

log("--- Начало. Агент {#58338 Агент по закрытию счетов} ---");

main();

log("--- Конец. Агент {#58338 Агент по закрытию счетов} ---");

export {};
