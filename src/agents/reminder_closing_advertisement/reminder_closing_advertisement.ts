/* --- types --- */
interface IError {
	code: number;
	message: string;
}

interface IAdvertisement {
	id: XmElem<number>;
	owner_advertisement: XmElem<number>;
	advert_plan_closed_date: XmElem<string>;
	name_advertisement: XmElem<string>;
}

/* --- system --- */
const GLOBAL = {
	IS_DEBUG: tools_web.is_true(Param.IS_DEBUG),
	ID_NOTIF_CURRENT_DATE: OptInt(Param.ID_NOTIF_CURRENT_DATE),
	ID_NOTIF_CURRENT_DATE_1: OptInt(Param.ID_NOTIF_CURRENT_DATE_1)
};

const logConfig = {
	code: "globex_log",
	type: "AGENT",
	agentId: "7243267096545508247"
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
 * Выбирает все записи sql запроса
 * @param {string} query - sql-выражение
 */
function selectAll<T>(query: string) {
	return ArraySelectAll<T>(tools.xquery(`sql: ${query}`));
}

/**
 * Создает поток ошибки с объектом error
 * @param {object} source - источник ошибки
 * @param {object} errorObject - объект ошибки
 */
function HttpError(source: string, errorObject: IError) {
	throw new Error(source + " -> " + errorObject.message);
}

/* --- logic --- */
function formatDateUsingStringMethods(isoDate: string): string {
	const dateParts = isoDate.split("T")[0].split("-");
	const year = dateParts[0];
	const month = dateParts[1];
	const day = dateParts[2];

	return `${day}.${month}.${year}`;
}

function getAdvertisementAndSendNotif(): IAdvertisement[] {
	try {
		const advertisements = selectAll<IAdvertisement>(`
            SELECT
				dt.id,
				(xpath('//custom_elems/custom_elem[name=''advert_plan_closed_date'']/value/text()', dt.data))[1]::text AS advert_plan_closed_date,
				(xpath('/document/doc_info/creation/user_id/text()', dt.data))[1]::text AS owner_advertisement,
				(xpath('/document/name/text()', dt.data))[1]::text AS name_advertisement,
				(xpath('//custom_elems/custom_elem[name=''advert_status'']/value/text()', dt.data))[1]::text AS status
			FROM dbo.document dt
			WHERE
				(xpath('//custom_elems/custom_elem[name=''advert_status'']/value/text()', dt.data))[1]::text = 'Открыто'
			AND (
				((xpath('//custom_elems/custom_elem[name=''advert_plan_closed_date'']/value/text()', dt.data))[1]::text)::date = CURRENT_DATE + INTERVAL '1 day'
				OR
				((xpath('//custom_elems/custom_elem[name=''advert_plan_closed_date'']/value/text()', dt.data))[1]::text)::date = CURRENT_DATE
			)
        `);

		const today = StrDate(Date(), false, false);
		const tomorrow = StrDate(DateOffset(Date(), 86400), false, false);

		for (const advert of advertisements) {
			const formattedDate = formatDateUsingStringMethods(advert.advert_plan_closed_date.Value);

			if (formattedDate === today) {
				tools.create_notification(
					GLOBAL.ID_NOTIF_CURRENT_DATE,
					advert.owner_advertisement.Value,
					advert.name_advertisement.Value,
					advert.id.Value
				);
			} else if (formattedDate === tomorrow) {
				tools.create_notification(
					GLOBAL.ID_NOTIF_CURRENT_DATE_1,
					advert.owner_advertisement.Value,
					advert.name_advertisement.Value,
					advert.id.Value
				);
			}
		}

		return;
	} catch (e) {
		HttpError("getAdvertisementAndSendNotif", e);
	}
}

/* --- start point --- */
function main() {
	try {
		getAdvertisementAndSendNotif();
	} catch (error) {
		log("Выполнение прервано из-за ошибки: main -> " + error.message, "error");
	}
}

log("--- Начало. Агент {#47168 Агент по напоминанию о закрытии объявления} ---");

main();

log("--- Конец. Агент {#47168 Агент по напоминанию о закрытии объявления} ---");

export {};
