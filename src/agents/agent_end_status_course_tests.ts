interface IError {
	code: number;
	message: string;
}

interface IActiveCourses {
	id: XmElem<number>;
	person_id: XmElem<number>;
	max_end_date: XmElem<string>;
	course_name: XmElem<string>;
	func_manager: XmElem<number>;
}

interface IActiveTests {
	id: XmElem<number>;
	person_id: XmElem<number>;
	max_end_date: XmElem<string>;
	assessment_name: XmElem<string>;
	func_manager: XmElem<number>;
}

const GLOBAL = {
	IS_DEBUG: tools_web.is_true(Param.IS_DEBUG),
	CLOSE_DATE: OptInt(Param.CLOSE_DATE),
	NOTIFF_DATE: OptInt(Param.NOTIFF_DATE),
	NOTIFF_TYPE: String(Param.NOTIFF_TYPE),
	NOTIFF_PERS: OptInt(Param.NOTIFF_PERS),
	NOTIFF_PERS_TEST: OptInt(Param.NOTIFF_PERS_TEST),
	NOTIFF_MNGR: OptInt(Param.NOTIFF_MNGR),
	NOTIFF_MNGR_TEST: OptInt(Param.NOTIFF_MNGR_TEST),
};

const logConfig = {
	code: "globex_log",
	type: "AGENT",
	agentId: "7243647854374254828",
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

function getCoursesAndSendNotif() {
	try {
		const activeCourse = selectAll<IActiveCourses>(`
            SELECT 
				al.id,
				al.person_id,
				al.max_end_date,
				al.course_name,
				fs.person_id AS func_manager
			FROM 
				dbo.active_learnings al
			JOIN 
				dbo.func_managers fs
			ON
				fs.object_id = al.person_id
			WHERE 
				al.max_end_date IS NOT NULL;
        `);

		for (const course of activeCourse) {
			const courseDoc = tools.open_doc<ActiveLearningDocument>(course.id.Value);
			const currDate = Date();
			const endDate = courseDoc.TopElem.max_end_date.Value;

			if (courseDoc !== undefined) {
				if (
					endDate <= DateOffset(currDate, GLOBAL.NOTIFF_DATE * 86400)
					|| currDate < endDate
				) {
					switch (GLOBAL.NOTIFF_TYPE) {
						case "0":
							tools.create_notification(
								GLOBAL.NOTIFF_PERS,
								course.person_id.Value,
								course.course_name.Value,
							);
							tools.create_notification(
								GLOBAL.NOTIFF_MNGR,
								course.func_manager.Value,
								course.course_name.Value,
							);
							break;

						case "1":
							tools.create_notification(
								GLOBAL.NOTIFF_PERS,
								course.person_id.Value,
								course.course_name.Value,
							);
							break;

						case "2":
							tools.create_notification(
								GLOBAL.NOTIFF_MNGR,
								course.func_manager.Value,
								course.course_name.Value,
							);
							break;
						default:
							break;
					}
				}

				if (
					currDate >= DateOffset(endDate, GLOBAL.CLOSE_DATE * 86400)
				) {
					tools.active_learning_finish(
						course.id.Value,
					);
				}
			}
		}
	} catch (e) {
		HttpError("getCoursesAndSendNotif", e);
	}
}

function getTestsAndSendNotif() {
	try {
		const activeTests = selectAll<IActiveTests>(`
            SELECT 
				atl.id,
				atl.person_id,
				atl.max_end_date,
				atl.assessment_name,
				fs.person_id AS func_manager
			FROM 
				dbo.active_test_learnings atl
			JOIN 
				dbo.func_managers fs
			ON 
				fs.object_id = atl.person_id
			WHERE 
				atl.max_end_date IS NOT NULL;

        `);

		for (const test of activeTests) {
			const testDoc = tools.open_doc<ActiveTestLearningDocument>(test.id.Value);
			const currDate = Date();
			const endDate = testDoc.TopElem.max_end_date.Value;

			if (testDoc !== undefined) {
				if (
					endDate <= DateOffset(currDate, GLOBAL.NOTIFF_DATE * 86400)
					|| currDate < endDate
				) {
					switch (GLOBAL.NOTIFF_TYPE) {
						case "0":
							tools.create_notification(
								GLOBAL.NOTIFF_PERS_TEST,
								test.person_id.Value,
								test.assessment_name.Value,
							);
							tools.create_notification(
								GLOBAL.NOTIFF_MNGR_TEST,
								test.func_manager.Value,
								test.assessment_name.Value,
							);
							break;

						case "1":
							tools.create_notification(
								GLOBAL.NOTIFF_PERS_TEST,
								test.person_id.Value,
								test.assessment_name.Value,
							);
							break;

						case "2":
							tools.create_notification(
								GLOBAL.NOTIFF_MNGR_TEST,
								test.func_manager.Value,
								test.assessment_name.Value,
							);
							break;
						default:
							break;
					}
				}

				if (
					currDate >= DateOffset(endDate, GLOBAL.CLOSE_DATE * 86400)
				) {
					tools.active_test_learning_finish(
						test.id.Value,
					);
					DeleteDoc(UrlFromDocID(test.id.Value));
				}
			}
		}
	} catch (e) {
		HttpError("getTestsAndSendNotif", e);
	}
}

function main() {
	try {
		getCoursesAndSendNotif();
		getTestsAndSendNotif();
	} catch (error) {
		log("Выполнение прервано из-за ошибки: main -> " + error.message, "error");
	}
}

log("--- Начало. Агент {#50930 Агент по переводу назначенных курсов в завершенные} ---");

main();

log("--- Конец. Агент {#50930 Агент по переводу назначенных курсов в завершенные} ---");

export {};
