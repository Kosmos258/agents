import { task } from "gulp";
import { build } from "./tasks/build.task";
import { dev } from "./tasks/dev.task";
import { deploy } from "./tasks/deploy.task";
import { ping } from "./tasks/ping.task";

//Отслеживание файлов
task("dev", dev);

//Билд
task("build", build);

//Деплой папки билд
task("deploy", deploy);

//Проверка доступности сервера
task("ping", ping);
