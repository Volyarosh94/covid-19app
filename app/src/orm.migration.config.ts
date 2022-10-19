import { ormConfig } from "./orm.config";

/**
 * required to export in this way, known issue
 * @see https://github.com/typeorm/typeorm/issues/4068
 */
export = ormConfig;
