import { Application, NextFunction, Request, Response } from "express";

export type ContextProcessor = (req: Request, ctx: { [key: string]: any }) => void;

export interface ExpressNunjucksConfiguration {
  autoescape?: boolean;
  filters?: { [name: string]: (...args: any[]) => any };
  globals?: { [name: string]: any };
  lstripBlocks?: boolean;
  loader?: any;
  noCache?: boolean;
  tags?: any;
  throwOnUndefined?: boolean;
  trimBlocks?: boolean;
  watch?: boolean;
}

export interface ExpressNunjucksResult {
  ctxProc: (ctxProcessors: ContextProcessor[]) => (req: Request, res: Response, next: NextFunction) => void;
  env: any;
}

export declare function expressNunjucks(
  apps?: Application | Application[],
  config?: ExpressNunjucksConfiguration,
): ExpressNunjucksResult;

export default expressNunjucks;
