import { Outlet, useLoaderData, useParams } from "react-router-dom";
import {
  GeneralSectionSchema,
  WorkSchema,
} from "@jakubkanna/labguy-front-schema";

import { MediaRef } from "../utils/helpers";
import NotFoundPage from "./404";

export interface Work extends WorkSchema {
  general: GeneralSectionSchema;
  media?: MediaRef[];
}

export default function Works() {
  const data = (useLoaderData() as Work[]) || null;
  const { slug } = useParams();

  if (!data) return null;

  return <>{slug ? <Outlet /> : <NotFoundPage />}</>;
}
