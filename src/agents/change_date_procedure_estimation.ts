/* --- types --- */
interface IError {
	code: number;
	message: string;
}

interface IQuestionnaires {
	id: XmElem<number>;
	period_start: XmlElem<Date>;
	period_end: XmlElem<Date>;
}

/* --- system --- */
const GLOBAL = {
	IS_DEBUG: tools_web.is_true(Param.IS_DEBUG),
	START_DATE: Date(Param.START_DATE),
	FINISH_DATE: Date(Param.FINISH_DATE),
	BUDGET_PERIOD_ID: OptInt(Param.BUDGET_PERIOD_ID),
};

const logConfig = {
	code: "globex_log",
	type: "AGENT",
	agentId: "7243328209649645181",
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
function getQuestionnairesAndUpdateDate(): IQuestionnaires[] {
	try {
		const questionnaires = selectAll<IQuestionnaires>(`
                SELECT 
                    ps.id,
                    ps.period_start,
                    ps.period_end
                FROM 
                    dbo.pas ps
                WHERE 
                    ps.budget_period_id = ${GLOBAL.BUDGET_PERIOD_ID}
                AND 
                    ps.assessment_appraise_type = 'staffrating';
        `);

		for (const quest of questionnaires) {
			const questionnaire = tools.open_doc<PaDocument>(quest.id.Value);
			if (questionnaire != undefined) {
				const teQuestionnaire = questionnaire.TopElem;
				teQuestionnaire.period_start.Value = GLOBAL.START_DATE;
				teQuestionnaire.period_end.Value = GLOBAL.FINISH_DATE;

				questionnaire.Save();
			} else {
				log("Карточек не найдено");
			}
		}

		return;
	} catch (e) {
		HttpError("getQuestionnairesAndUpdateDate", e);
	}
}

/* --- start point --- */
function main() {
	try {
		getQuestionnairesAndUpdateDate();
	} catch (error) {
		log("Выполнение прервано из-за ошибки: main -> " + error.message, "error");
	}
}

log("--- Начало. Агент {#58965 Агент изменения дат начала/завершения анкет процедуры оценки эффективности} ---");

main();

log("--- Конец. Агент {#58965 Агент изменения дат начала/завершения анкет процедуры оценки эффективности} ---");

export {};
