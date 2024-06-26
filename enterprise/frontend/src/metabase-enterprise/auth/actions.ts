import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSetting } from "metabase/selectors/settings";
import { State } from "metabase-types/store";
import { trackLoginSSO } from "./analytics";
import { getSSOUrl } from "./utils";

interface ThunkConfig {
  state: State;
}

export const LOGIN_SSO = "metabase-enterprise/auth/LOGIN_SSO";
export const loginSSO = createAsyncThunk<void, string | undefined, ThunkConfig>(
  LOGIN_SSO,
  (redirectUrl: string | undefined, { getState }) => {
    trackLoginSSO();

    const siteUrl = getSetting(getState(), "site-url");
    window.location.href = getSSOUrl(siteUrl, redirectUrl);
  },
);
