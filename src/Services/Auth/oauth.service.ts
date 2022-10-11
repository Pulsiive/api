// import config from 'config';
import axios from 'axios';
import { cp } from 'fs';
import qs from 'qs';
import { ApiError } from '../../Errors/ApiError';

interface GoogleOauthToken {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

export const getGoogleOauthToken = async ({
  code
}: {
  code: string;
}): Promise<GoogleOauthToken> => {
  const rootURl = 'https://oauth2.googleapis.com/token';

  const options = {
    code,
    client_id: process.env.GOOGLE_APP_ID,
    client_secret: process.env.GOOGLE_APP_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  };
  try {
    const { data } = await axios.post<GoogleOauthToken>(rootURl, qs.stringify(options), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log(data);
    return data;
  } catch (err: any) {
    console.log(err);
    console.log('Failed to fetch Google Oauth Tokens');
    throw new ApiError("Can't fetch Google Oauth Tokens", 401);
  }
};

interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function getGoogleUser({
  id_token,
  access_token
}: {
  id_token: string;
  access_token: string;
}): Promise<GoogleUserResult> {
  try {
    const { data } = await axios.get<GoogleUserResult>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    );

    return data;
  } catch (err: any) {
    console.log(err);
    throw Error(err);
  }
}

// ? GitHub OAuth

type GitHubOauthToken = {
  access_token: string;
};

interface GitHubUser {
  login: string;
  id: string;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: null;
  email: string;
  hireable: boolean;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

export const getGithubOAuthToken = async ({
  code
}: {
  code: string;
}): Promise<GitHubOauthToken> => {
  const rootUrl = 'https://github.com/login/oauth/access_token';
  const options = {
    code,
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_SECRET
  };
  console.log(options);
  const queryString = qs.stringify(options);
  console.log(queryString);
  console.log('url ==> ', `${rootUrl}?${queryString}`);
  try {
    const { data } = await axios.post(`${rootUrl}?${queryString}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const decoded = qs.parse(data) as GitHubOauthToken;
    return decoded;
  } catch (err: any) {
    throw Error(err);
  }
};

export const getGithubUser = async ({
  access_token
}: {
  access_token: string;
}): Promise<GitHubUser> => {
  try {
    const { data } = await axios.get<GitHubUser>('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    return data;
  } catch (err: any) {
    throw Error(err);
  }
};
