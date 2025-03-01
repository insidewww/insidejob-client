import {
  ImageRefSchema,
  PreferencesSchema,
  UrlSchema,
  VideoRefSchema,
} from "@jakubkanna/labguy-front-schema";
import { createContext } from "react";

export interface Preferences extends PreferencesSchema {
  homepage_background_image?: ImageRefSchema[];
  homepage_background_video?: VideoRefSchema[];
  homepage_urls: UrlSchema[];
}

interface GeneralContextType {
  preferences: Preferences | null;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GeneralContext = createContext<GeneralContextType>({
  preferences: null,
  setPreferences: () => {},
  loading: true,
  setLoading: () => {},
});
